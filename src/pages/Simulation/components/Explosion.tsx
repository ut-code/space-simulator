import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { ExplosionData } from "@/types/Explosion";

type ExplosionProps = {
	explosion: ExplosionData;
	onComplete?: () => void;
};

// --- Rocky sphere: SphereGeometry with gentle per-vertex displacement for organic look
function createChunkGeometry(size: number): THREE.BufferGeometry {
	// Use moderate segments so curvature stays smooth
	const geo = new THREE.SphereGeometry(size, 10, 10);
	const pos = geo.attributes.position as THREE.BufferAttribute;
	for (let i = 0; i < pos.count; i++) {
		// Subtle ±15% displacement – lumpy but not jagged
		const jitter = 0.87 + Math.random() * 0.26;
		pos.setXYZ(
			i,
			pos.getX(i) * jitter,
			pos.getY(i) * jitter,
			pos.getZ(i) * jitter,
		);
	}
	pos.needsUpdate = true;
	geo.computeVertexNormals();
	return geo;
}

// --- Fire billboard sprite (circular disc always facing camera)
function createFireSprite(size: number, color: number): THREE.Mesh {
	// CircleGeometry → no visible square edges; 24 segments is plenty for this size
	const geo = new THREE.CircleGeometry(size * 0.5, 24);
	const mat = new THREE.MeshBasicMaterial({
		color,
		transparent: true,
		opacity: 1.0,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
		side: THREE.DoubleSide,
	});
	const mesh = new THREE.Mesh(geo, mat);
	return mesh;
}

type Chunk = {
	mesh: THREE.Mesh;
	velocity: THREE.Vector3;
	rotationAxis: THREE.Vector3;
	rotationSpeed: number;
	lifetime: number;
	maxLifetime: number;
	fireSprite: THREE.Mesh; // trailing fire attached to chunk
};

type FirePuff = {
	mesh: THREE.Mesh;
	velocity: THREE.Vector3;
	lifetime: number;
	maxLifetime: number;
	growSpeed: number;
};

type ShockRing = {
	mesh: THREE.Mesh;
	expandSpeed: number;
	lifetime: number;
	maxLifetime: number;
};

export function Explosion({ explosion, onComplete }: ExplosionProps) {
	const groupRef = useRef<THREE.Group | null>(null);

	// All mutable state stored in refs to avoid React re-renders every frame
	const chunksRef = useRef<Chunk[]>([]);
	const firePuffsRef = useRef<FirePuff[]>([]);
	const shockRingsRef = useRef<ShockRing[]>([]);
	const fireballRef = useRef<THREE.Mesh | null>(null);
	const fireballMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
	const glowRef = useRef<THREE.Mesh | null>(null);
	const glowMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
	const lightRef = useRef<THREE.PointLight | null>(null);
	const elapsedRef = useRef(0);
	const completedRef = useRef(false);

	useEffect(() => {
		const group = groupRef.current;
		if (!group) return;

		const r = explosion.radius;
		elapsedRef.current = 0;
		completedRef.current = false;
		const isExplosion = explosion.kind !== "spark";

		// ── 1. PLANET CHUNKS (rocky spheres) ───────────────────────────
		const chunks: Chunk[] = [];
		const chunkCount = isExplosion ? 14 : 6;
		// Rocky earthy palette: grays, browns, ochres
		const rockyColors = [
			0x8b7355, 0x6b5a45, 0x9e8866, 0x7a6a55, 0xb09070, 0x5a4a3a, 0xa08060,
			0x4a3a2a,
		];
		for (let i = 0; i < chunkCount; i++) {
			const size = (Math.random() * 0.2 + 0.08) * r;
			const geo = createChunkGeometry(size);

			// Rocky color, slight orange-glow at start that fades to plain rock
			const baseColor =
				rockyColors[Math.floor(Math.random() * rockyColors.length)];
			const mat = new THREE.MeshStandardMaterial({
				color: baseColor,
				emissive: new THREE.Color(0xff4400),
				emissiveIntensity: 2.0,
				roughness: 1.0,
				metalness: 0.0,
			});
			const mesh = new THREE.Mesh(geo, mat);
			mesh.position.copy(explosion.position);
			group.add(mesh);

			// Radially outward, moderate speed
			const dir = new THREE.Vector3(
				Math.random() - 0.5,
				Math.random() - 0.5,
				Math.random() - 0.5,
			).normalize();
			const speed = (Math.random() * 0.6 + 0.9) * r * (isExplosion ? 5 : 3);
			const velocity = dir.clone().multiplyScalar(speed);

			// Small fire sprite – dims quickly to show plain rocky sphere
			const fireSprite = createFireSprite(size * 1.8, 0xff6600);
			mesh.add(fireSprite);
			fireSprite.position.set(0, 0, 0);

			chunks.push({
				mesh,
				velocity,
				rotationAxis: new THREE.Vector3(
					Math.random(),
					Math.random(),
					Math.random(),
				).normalize(),
				rotationSpeed: Math.random() * 3 + 1,
				lifetime: Math.random() * 1.5 + 1.0,
				maxLifetime: 2.5,
				fireSprite,
			});
		}
		chunksRef.current = chunks;

		// ── 2. FIRE PUFFS ─────────────────────────────────────────────
		const puffs: FirePuff[] = [];
		const puffCount = isExplosion ? 40 : 15;
		const puffColors = [0xff8800, 0xff5500, 0xffaa00, 0xff3300];
		for (let i = 0; i < puffCount; i++) {
			const spriteSize = (Math.random() * 0.35 + 0.15) * r;
			const color = puffColors[Math.floor(Math.random() * puffColors.length)];
			const mesh = createFireSprite(spriteSize, color);

			// Small scatter around center
			const offset = new THREE.Vector3(
				(Math.random() - 0.5) * r * 0.3,
				(Math.random() - 0.5) * r * 0.3,
				(Math.random() - 0.5) * r * 0.3,
			);
			mesh.position.copy(explosion.position).add(offset);
			group.add(mesh);

			const speed = Math.random() * r * 1.5 + r * 0.8;
			const velocity = new THREE.Vector3(
				Math.random() - 0.5,
				Math.random() - 0.5,
				Math.random() - 0.5,
			)
				.normalize()
				.multiplyScalar(speed);

			const lifetime = Math.random() * 0.8 + 0.4;
			puffs.push({
				mesh,
				velocity,
				lifetime,
				maxLifetime: lifetime,
				growSpeed: Math.random() * 2 + 1,
			});
		}
		firePuffsRef.current = puffs;

		// ── 3. SHOCKWAVE RINGS (2, more subtle) ──────────────────────
		const rings: ShockRing[] = [];
		const ringOrientations = [
			new THREE.Euler(0, 0, 0),
			new THREE.Euler(Math.PI / 2, 0, 0),
		];
		for (const euler of ringOrientations) {
			const geo = new THREE.RingGeometry(r * 0.05, r * 0.25, 64);
			const mat = new THREE.MeshBasicMaterial({
				color: 0xffcc88,
				transparent: true,
				opacity: 0.7,
				side: THREE.DoubleSide,
				blending: THREE.AdditiveBlending,
				depthWrite: false,
			});
			const mesh = new THREE.Mesh(geo, mat);
			mesh.rotation.copy(euler);
			mesh.position.copy(explosion.position);
			mesh.scale.set(0.05, 0.05, 0.05);
			group.add(mesh);
			rings.push({
				mesh,
				expandSpeed: Math.random() * 3 + 5,
				lifetime: 0.6,
				maxLifetime: 0.6,
			});
		}
		shockRingsRef.current = rings;

		// ── 4. CORE FIREBALL (smaller, ~0.6r) ────────────────────────
		const fbGeo = new THREE.SphereGeometry(r * 0.6, 32, 32);
		const fbMat = new THREE.MeshBasicMaterial({
			color: 0xffee88,
			transparent: true,
			opacity: 1.0,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
		});
		const fireball = new THREE.Mesh(fbGeo, fbMat);
		fireball.position.copy(explosion.position);
		fireball.scale.set(0.01, 0.01, 0.01);
		group.add(fireball);
		fireballRef.current = fireball;
		fireballMatRef.current = fbMat;

		// ── 5. OUTER GLOW (smaller) ────────────────────────────────────
		const glowGeo = new THREE.SphereGeometry(r * 0.8, 32, 32);
		const glowMat = new THREE.MeshBasicMaterial({
			color: 0xff8800,
			transparent: true,
			opacity: 0.5,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
		});
		const glow = new THREE.Mesh(glowGeo, glowMat);
		glow.position.copy(explosion.position);
		glow.scale.set(0.01, 0.01, 0.01);
		group.add(glow);
		glowRef.current = glow;
		glowMatRef.current = glowMat;

		// ── 6. FLASH LIGHT (smaller range) ────────────────────────────
		const light = new THREE.PointLight(0xffcc66, 80, r * 30, 1.5);
		light.position.copy(explosion.position);
		group.add(light);
		lightRef.current = light;

		// Cleanup
		return () => {
			for (const c of chunksRef.current) {
				group.remove(c.mesh);
				c.mesh.geometry.dispose();
				(c.mesh.material as THREE.Material).dispose();
				c.fireSprite.geometry.dispose();
				(c.fireSprite.material as THREE.Material).dispose();
			}
			for (const p of firePuffsRef.current) {
				group.remove(p.mesh);
				p.mesh.geometry.dispose();
				(p.mesh.material as THREE.Material).dispose();
			}
			for (const ring of shockRingsRef.current) {
				group.remove(ring.mesh);
				ring.mesh.geometry.dispose();
				(ring.mesh.material as THREE.Material).dispose();
			}
			if (fireballRef.current) {
				group.remove(fireballRef.current);
				fireballRef.current.geometry.dispose();
				fireballMatRef.current?.dispose();
				fireballRef.current = null;
			}
			if (glowRef.current) {
				group.remove(glowRef.current);
				glowRef.current.geometry.dispose();
				glowMatRef.current?.dispose();
				glowRef.current = null;
			}
			if (lightRef.current) {
				group.remove(lightRef.current);
				lightRef.current.dispose();
				lightRef.current = null;
			}
			chunksRef.current = [];
			firePuffsRef.current = [];
			shockRingsRef.current = [];
			completedRef.current = false;
		};
	}, [explosion]);

	useFrame((state, delta) => {
		elapsedRef.current += delta;
		const t = elapsedRef.current;

		// ── Update fireball core ───────────────────────────────────────
		const fireball = fireballRef.current;
		const fbMat = fireballMatRef.current;
		if (fireball && fbMat) {
			// Expand to planet size in ~0.3s, then slowly fade
			const targetScale = Math.min(1.0, t / 0.2);
			fireball.scale.setScalar(targetScale);
			fbMat.opacity = Math.max(0, 1.0 - t * 1.2);
			if (t < 0.15) fbMat.color.setHex(0xffffff);
			else if (t < 0.3) fbMat.color.setHex(0xffee88);
			else if (t < 0.6) fbMat.color.setHex(0xff8800);
			else fbMat.color.setHex(0xff3300);

			if (fbMat.opacity <= 0.01) {
				fireball.parent?.remove(fireball);
				fireball.geometry.dispose();
				fbMat.dispose();
				fireballRef.current = null;
				fireballMatRef.current = null;
			}
		}

		// ── Update outer glow ──────────────────────────────────────────
		const glow = glowRef.current;
		const glowMat = glowMatRef.current;
		if (glow && glowMat) {
			const targetScale = Math.min(1.0, t / 0.35);
			glow.scale.setScalar(targetScale);
			glowMat.opacity = Math.max(0, 0.7 - t * 0.5);
			if (t > 0.5) {
				glow.parent?.remove(glow);
				glow.geometry.dispose();
				glowMat.dispose();
				glowRef.current = null;
				glowMatRef.current = null;
			}
		}

		// ── Update point light ─────────────────────────────────────────
		const light = lightRef.current;
		if (light) {
			light.intensity = Math.max(0, 200 - t * 500);
			if (light.intensity <= 0) {
				light.parent?.remove(light);
				light.dispose();
				lightRef.current = null;
			}
		}

		// ── Update shockwave rings ─────────────────────────────────────
		shockRingsRef.current = shockRingsRef.current.filter((ring) => {
			ring.lifetime -= delta;
			if (ring.lifetime <= 0) {
				ring.mesh.parent?.remove(ring.mesh);
				ring.mesh.geometry.dispose();
				(ring.mesh.material as THREE.Material).dispose();
				return false;
			}
			const lifeRatio = ring.lifetime / ring.maxLifetime;
			ring.mesh.scale.multiplyScalar(1 + ring.expandSpeed * delta);
			const mat = ring.mesh.material as THREE.MeshBasicMaterial;
			mat.opacity = Math.max(0, lifeRatio * 0.9);
			// Color shift from white to aqua/blue fringe
			const c = lifeRatio;
			mat.color.setRGB(c, c, 1.0);
			return true;
		});

		// ── Update fire puffs ─────────────────────────────────────────
		firePuffsRef.current = firePuffsRef.current.filter((puff) => {
			puff.lifetime -= delta;
			if (puff.lifetime <= 0) {
				puff.mesh.parent?.remove(puff.mesh);
				puff.mesh.geometry.dispose();
				(puff.mesh.material as THREE.Material).dispose();
				return false;
			}
			const lr = puff.lifetime / puff.maxLifetime;

			// Keep billboard facing camera
			puff.mesh.quaternion.copy(state.camera.quaternion);

			// Move outward
			puff.mesh.position.addScaledVector(puff.velocity, delta);

			// Grow as it expands
			puff.mesh.scale.multiplyScalar(1 + puff.growSpeed * delta);
			puff.velocity.multiplyScalar(0.92); // drag

			const mat = puff.mesh.material as THREE.MeshBasicMaterial;
			// Bright fire -> deep orange -> dark smoke
			if (lr > 0.6) mat.color.setHex(0xffcc44);
			else if (lr > 0.3) mat.color.setHex(0xff5500);
			else {
				mat.color.setHex(0x331100);
				mat.blending = THREE.NormalBlending;
			}
			mat.opacity = Math.max(0, lr * (lr < 0.3 ? 0.5 : 0.85));
			return true;
		});

		// ── Update planet chunks ────────────────────────────────────────
		chunksRef.current = chunksRef.current.filter((chunk) => {
			chunk.lifetime -= delta;
			if (chunk.lifetime <= 0) {
				chunk.mesh.parent?.remove(chunk.mesh);
				chunk.mesh.geometry.dispose();
				(chunk.mesh.material as THREE.Material).dispose();
				chunk.fireSprite.geometry.dispose();
				(chunk.fireSprite.material as THREE.Material).dispose();
				return false;
			}
			const lr = chunk.lifetime / chunk.maxLifetime;

			// Move chunk
			chunk.mesh.position.addScaledVector(chunk.velocity, delta);
			chunk.velocity.multiplyScalar(0.97); // gentle drag

			// Tumble
			chunk.mesh.rotateOnAxis(chunk.rotationAxis, chunk.rotationSpeed * delta);

			// Material cool-down
			const mat = chunk.mesh.material as THREE.MeshStandardMaterial;
			if (lr > 0.7) {
				mat.emissive.setHex(0xff6600);
				mat.emissiveIntensity = 5.0;
			} else if (lr > 0.4) {
				mat.emissive.setHex(0xff2200);
				mat.emissiveIntensity = 2.0;
			} else if (lr > 0.15) {
				mat.emissive.setHex(0x440000);
				mat.emissiveIntensity = 0.5;
			} else {
				mat.emissiveIntensity = 0;
				mat.color.setHex(0x111111); // burnt rock
			}
			mat.transparent = true;
			mat.opacity = Math.min(1.0, lr * 4.0); // quick fade at end

			// Fire sprite billboard
			const sprite = chunk.fireSprite;
			sprite.quaternion.copy(state.camera.quaternion);
			const spriteMat = sprite.material as THREE.MeshBasicMaterial;
			spriteMat.opacity = Math.max(0, lr * 1.2);
			if (lr < 0.4) spriteMat.opacity = 0; // fire dies out
			sprite.scale.setScalar(1.0 + (1 - lr) * 2.0); // grows as it cools

			return true;
		});

		// ── Done check ─────────────────────────────────────────────────
		if (
			!completedRef.current &&
			chunksRef.current.length === 0 &&
			firePuffsRef.current.length === 0 &&
			shockRingsRef.current.length === 0 &&
			!fireballRef.current
		) {
			completedRef.current = true;
			onComplete?.();
		}
	});

	return <group ref={groupRef} />;
}
