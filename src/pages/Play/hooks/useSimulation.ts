import { useCallback, useEffect, useState } from "react";
import { templates } from "@/data/templates";
import { defaultTemplate } from "@/data/templates/default";
import { PhysicsEngine } from "../core/PhysicsEngine";
import { PlanetRegistry } from "../core/PlanetRegistry";
import { SimulationWorld } from "../core/SimulationWorld";

// Reactのライフサイクル外で、モジュールレベルのシングルトンとして管理する
const planetRegistry = new PlanetRegistry();
//planetRegistry.register(earth.id, earth);

const simulationWorld = new SimulationWorld([]);

const physicsEngine = new PhysicsEngine(planetRegistry, {
	fixedTimestep: 1 / 60,
	maxSubSteps: 5,
	autoStart: true,
});

export function useSimulation(templateId: string | null) {
	const initialPlanets =
		templates.get(templateId ?? "default")?.planets ?? defaultTemplate.planets;

	const [worldState, setWorldState] = useState(() => {
		planetRegistry.clear();
		simulationWorld.clear();
		initialPlanets.forEach((p) => {
			planetRegistry.register(p.id, p);
			simulationWorld.addPlanet(p);
		});
		return simulationWorld.getSnapshot();
	});

	const syncWorld = useCallback(() => {
		setWorldState(simulationWorld.getSnapshot());
	}, []);

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
		};
	}, [syncWorld]);

	// Hookのアンマウント時にエンジンを止めることはしない
	// （もしページ遷移時などにエンジンを止めたい場合は別コンテキストでの制御が必要）

	const removePlanet = useCallback(
		(planetId: string) => {
			planetRegistry.unregister(planetId);
			simulationWorld.removePlanet(planetId);
			syncWorld();
		},
		[syncWorld],
	);

	const setAutoKindAssignment = useCallback((enabled: boolean) => {
		physicsEngine.setAutoKindAssignment(enabled);
	}, []);

	const updatePlanetRadius = useCallback(
		(planetId: string, radius: number) => {
			const updated = planetRegistry.updateRadius(planetId, radius);
			if (!updated) return;
			simulationWorld.refreshSnapshot();
			syncWorld();
		},
		[syncWorld],
	);

	return {
		planetRegistry,
		simulationWorld,
		worldState,
		syncWorld,
		removePlanet,
		setAutoKindAssignment,
		updatePlanetRadius,
	};
}
