import { useCallback, useEffect, useMemo, useState } from "react";
import { earth } from "@/data/planets";
import { PhysicsEngine } from "../core/PhysicsEngine";
import { PlanetRegistry } from "../core/PlanetRegistry";
import { SimulationWorld } from "../core/SimulationWorld";

export function useSimulation() {
	const planetRegistry = useMemo(() => {
		const registry = new PlanetRegistry();
		registry.register(earth.id, earth);
		return registry;
	}, []);

	const simulationWorld = useMemo(() => new SimulationWorld([earth]), []);

	const physicsEngine = useMemo(() => {
		return new PhysicsEngine(planetRegistry, {
			fixedTimestep: 1 / 60,
			maxSubSteps: 5,
			autoStart: true,
		});
	}, [planetRegistry]);

	const [worldState, setWorldState] = useState(() =>
		simulationWorld.getSnapshot(),
	);

	const syncWorld = useCallback(() => {
		setWorldState(simulationWorld.getSnapshot());
	}, [simulationWorld]);

	useEffect(() => {
		const unsubscribe = physicsEngine.on((event) => {
			if (event.type === "collision:merge") {
				// 古い惑星を即座に物理エンジンから削除
				planetRegistry.unregister(event.idA);
				planetRegistry.unregister(event.idB);
				// SimulationWorld からも削除
				simulationWorld.removePlanet(event.idA);
				simulationWorld.removePlanet(event.idB);
				// 新しい合体惑星を即座に追加
				planetRegistry.register(event.newPlanet.id, event.newPlanet);
				simulationWorld.addPlanet(event.newPlanet);
				// 合体時に小さなオレンジのスパークエフェクト
				simulationWorld.registerSpark(event.position, event.radius * 0.8, 10);
				syncWorld();
			} else if (event.type === "collision:repulse") {
				// 反発時はオレンジのスパークのみ。惑星は削除しない
				simulationWorld.registerSpark(event.position, event.radius, 8);
				syncWorld();
			} else if (event.type === "collision:explode") {
				planetRegistry.unregister(event.idA);
				planetRegistry.unregister(event.idB);
				simulationWorld.registerExplosion(
					event.idA,
					event.idB,
					event.position,
					event.radius,
				);
				syncWorld();
			}
		});

		return () => {
			unsubscribe();
			physicsEngine.destroy();
		};
	}, [physicsEngine, simulationWorld, syncWorld, planetRegistry]);

	const removePlanet = useCallback(
		(planetId: string) => {
			planetRegistry.unregister(planetId);
			simulationWorld.removePlanet(planetId);
			syncWorld();
		},
		[planetRegistry, simulationWorld, syncWorld],
	);

	return {
		planetRegistry,
		simulationWorld,
		worldState,
		syncWorld,
		removePlanet,
	};
}
