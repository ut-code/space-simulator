import * as THREE from "three";
import type { Planet } from "@/types/planet";
import {
	CollisionType,
	decideCollisionOutcome,
} from "../utils/decideCollisionOutcome";
import { mergePlanets } from "../utils/mergePlanets";
import { applyKindAndTexture } from "../utils/planetKind";
import { GravitySystem } from "./GravitySystem";
import type { PlanetRegistry } from "./PlanetRegistry";

/**
 * Event types emitted by the PhysicsEngine
 */
export type PhysicsEvent =
	| {
			type: "collision:merge";
			idA: string;
			idB: string;
			newPlanet: Planet;
			position: THREE.Vector3;
			radius: number;
	  }
	| {
			type: "collision:explode";
			idA: string;
			idB: string;
			position: THREE.Vector3;
			radius: number;
	  }
	| {
			type: "collision:repulse";
			idA: string;
			idB: string;
			position: THREE.Vector3;
			radius: number;
	  }
	| { type: "update"; timestamp: number };

export type PhysicsEventListener = (event: PhysicsEvent) => void;

/**
 * Configuration for the PhysicsEngine
 */
export type PhysicsEngineConfig = {
	/** Fixed timestep for physics updates in seconds (default: 1/60 = ~16.67ms) */
	fixedTimestep?: number;
	/** Maximum number of physics steps per frame to prevent spiral of death (default: 5) */
	maxSubSteps?: number;
	/** Whether the engine should start running immediately (default: true) */
	autoStart?: boolean;
};

/**
 * Standalone physics engine that runs independently of React.
 * Handles all physics calculations with a fixed timestep for deterministic simulation.
 *
 * Key features:
 * - Fixed timestep physics loop (default 60Hz)
 * - Centralized gravity and collision calculations
 * - Event-based communication with rendering layer
 * - No React dependencies - fully testable
 */
export class PhysicsEngine {
	private planetRegistry: PlanetRegistry;
	private gravitySystem: GravitySystem;
	private listeners: PhysicsEventListener[] = [];
	private running = false;
	private lastTime = 0;
	private accumulator = 0;

	// Configuration
	private readonly fixedTimestep: number;
	private readonly maxSubSteps: number;

	// Temporary vectors for calculations (reused to avoid GC pressure)
	private readonly forceAccumulator = new THREE.Vector3();
	private readonly positionVec = new THREE.Vector3();
	private readonly velocityVec = new THREE.Vector3();

	// Animation frame handle for cleanup
	private animationFrameId: number | null = null;

	constructor(
		planetRegistry: PlanetRegistry,
		config: PhysicsEngineConfig = {},
	) {
		this.planetRegistry = planetRegistry;
		this.gravitySystem = new GravitySystem();

		this.fixedTimestep = config.fixedTimestep ?? 1 / 60;
		this.maxSubSteps = config.maxSubSteps ?? 5;

		if (config.autoStart !== false) {
			this.start();
		}
	}

	/**
	 * Start the physics loop
	 */
	public start(): void {
		if (this.running) return;
		this.running = true;
		this.lastTime = performance.now() / 1000;
		this.accumulator = 0;
		this.tick();
	}

	/**
	 * Stop the physics loop
	 */
	public stop(): void {
		this.running = false;
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	/**
	 * Subscribe to physics events
	 */
	public on(listener: PhysicsEventListener): () => void {
		this.listeners.push(listener);
		// Return unsubscribe function
		return () => {
			const index = this.listeners.indexOf(listener);
			if (index !== -1) {
				this.listeners.splice(index, 1);
			}
		};
	}

	/**
	 * Kept for API compatibility. Kind assignment for merged planets is always applied.
	 */
	public setAutoKindAssignment(enabled: boolean): void {
		void enabled;
	}

	/**
	 * Emit an event to all listeners
	 */
	private emit(event: PhysicsEvent): void {
		for (const listener of this.listeners) {
			listener(event);
		}
	}

	/**
	 * Main physics loop with fixed timestep
	 * Uses the "semi-fixed timestep" pattern to prevent spiral of death
	 */
	private tick = (): void => {
		if (!this.running) return;

		const currentTime = performance.now() / 1000;
		let deltaTime = currentTime - this.lastTime;
		this.lastTime = currentTime;

		// Prevent spiral of death: cap the maximum deltaTime
		if (deltaTime > this.fixedTimestep * this.maxSubSteps) {
			deltaTime = this.fixedTimestep * this.maxSubSteps;
		}

		this.accumulator += deltaTime;

		// Process physics in fixed timesteps
		let steps = 0;
		while (this.accumulator >= this.fixedTimestep && steps < this.maxSubSteps) {
			this.step(this.fixedTimestep);
			this.accumulator -= this.fixedTimestep;
			steps++;
		}

		// Emit update event after all physics steps
		this.emit({ type: "update", timestamp: currentTime });

		// Schedule next tick
		this.animationFrameId = requestAnimationFrame(this.tick);
	};

	/**
	 * Execute a single physics step
	 */
	private step(delta: number): void {
		// 1. Calculate forces and update all planet positions/velocities
		this.updatePlanets(delta);

		// 2. Detect and resolve collisions
		this.detectCollisions();
	}

	/**
	 * Update all planets: calculate gravity forces and integrate motion
	 */
	private updatePlanets(delta: number): void {
		for (const [planetId, planet] of this.planetRegistry) {
			// Validate planet data to prevent NaN propagation
			if (!planet.mass || planet.mass <= 0) {
				console.warn(`Planet ${planetId} has invalid mass: ${planet.mass}`);
				continue;
			}
			if (!planet.radius || planet.radius <= 0) {
				console.warn(`Planet ${planetId} has invalid radius: ${planet.radius}`);
				continue;
			}
			if (
				!Number.isFinite(planet.position.x) ||
				!Number.isFinite(planet.position.y) ||
				!Number.isFinite(planet.position.z)
			) {
				console.warn(`Planet ${planetId} has NaN position`, planet.position);
				continue;
			}

			// Reset force accumulator
			this.forceAccumulator.set(0, 0, 0);

			// Calculate gravitational forces from all other planets
			this.gravitySystem.accumulateForPlanet({
				planetId,
				targetMass: planet.mass,
				targetRadius: planet.radius,
				targetPosition: planet.position,
				planetRegistry: this.planetRegistry,
				outForce: this.forceAccumulator,
			});

			// Calculate acceleration (F = ma → a = F/m)
			const acceleration = this.forceAccumulator
				.clone()
				.divideScalar(planet.mass);

			// Validate acceleration before updating
			if (
				!Number.isFinite(acceleration.x) ||
				!Number.isFinite(acceleration.y) ||
				!Number.isFinite(acceleration.z)
			) {
				console.warn(
					`Planet ${planetId} calculated NaN acceleration`,
					acceleration,
				);
				continue;
			}

			// Update velocity and position using Euler integration
			this.planetRegistry.update(planetId, acceleration, delta);
		}
	}

	/**
	 * Detect collisions between all planets and emit events
	 */
	private detectCollisions(): void {
		const planetIds: string[] = [];

		// Collect all planet IDs
		for (const [id] of this.planetRegistry) {
			planetIds.push(id);
		}

		// Check all pairs of planets (i < j to avoid duplicates)
		for (let i = 0; i < planetIds.length; i++) {
			const idA = planetIds[i];
			const planetA = this.planetRegistry.get(idA);
			if (!planetA) continue;

			// Get fresh position/velocity after physics update
			this.positionVec.copy(planetA.position);
			this.velocityVec.copy(planetA.velocity);

			for (let j = i + 1; j < planetIds.length; j++) {
				const idB = planetIds[j];
				const planetB = this.planetRegistry.get(idB);
				if (!planetB) continue;

				// Calculate distance between planets
				const dx = planetB.position.x - this.positionVec.x;
				const dy = planetB.position.y - this.positionVec.y;
				const dz = planetB.position.z - this.positionVec.z;
				const distSq = dx * dx + dy * dy + dz * dz;

				const minDist = planetA.radius + planetB.radius;

				// Check if planets are colliding
				if (distSq <= minDist * minDist) {
					// Decide collision outcome based on physics
					const outcome = decideCollisionOutcome(
						planetA.mass,
						planetA.radius,
						this.positionVec.clone(),
						this.velocityVec.clone(),
						planetB.mass,
						planetB.radius,
						planetB.position.clone(),
						planetB.velocity.clone(),
					);

					if (outcome === CollisionType.Merge) {
						// Calculate merged planet properties
						const mergedPlanet = mergePlanets(
							planetA.mass,
							planetA.radius,
							this.positionVec.clone(),
							this.velocityVec.clone(),
							planetA.rotationSpeedY,
							planetB.mass,
							planetB.radius,
							planetB.position.clone(),
							planetB.velocity.clone(),
							planetB.rotationSpeedY,
						);
						const newPlanet = applyKindAndTexture(mergedPlanet);

						const collisionPoint = this.positionVec.clone();

						// Emit merge event
						this.emit({
							type: "collision:merge",
							idA,
							idB,
							newPlanet,
							position: collisionPoint,
							radius: minDist,
						});
					} else {
						// Calculate collision point for explosion
						const collisionPoint = this.positionVec.clone();

						// Emit explosion event
						this.emit({
							type: "collision:explode",
							idA,
							idB,
							position: collisionPoint,
							radius: minDist,
						});
					}

					// Skip checking this pair further (collision handled)
					break;
				}
			}
		}
	}

	/**
	 * Check if the engine is currently running
	 */
	public isRunning(): boolean {
		return this.running;
	}

	/**
	 * Get the current fixed timestep
	 */
	public getFixedTimestep(): number {
		return this.fixedTimestep;
	}

	/**
	 * Destroy the engine and clean up resources
	 */
	public destroy(): void {
		this.stop();
		this.listeners = [];
	}
}
