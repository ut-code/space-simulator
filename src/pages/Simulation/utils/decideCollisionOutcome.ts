import * as THREE from "three";
import { G } from "./gravityUtils";

// Debug helper: set `window.__DEBUG_FORCE_EXPLODE = true` in the browser console
// to force all collisions to be treated as explosions for quick visual testing.
declare global {
	interface Window {
		__DEBUG_FORCE_EXPLODE?: boolean;
	}
}

export const CollisionType = {
	Explode: "explode",
	Merge: "merge",
} as const;
//経験的係数
const kFactor = 0.5;

export function decideCollisionOutcome(
	massA: number,
	radA: number,
	posA: THREE.Vector3,
	velA: THREE.Vector3,
	massB: number,
	radB: number,
	posB: THREE.Vector3,
	velB: THREE.Vector3,
): string {
	// Debug override
	if (typeof window !== "undefined" && window.__DEBUG_FORCE_EXPLODE) {
		return CollisionType.Explode;
	}

	//脱出速度vEsc
	const vEsc = Math.sqrt((2 * G * (massA + massB)) / (radA + radB));

	//相対速度及び相対位置
	const vRel = new THREE.Vector3().subVectors(velB, velA);
	const pRel = new THREE.Vector3().subVectors(posB, posA);

	//衝突角補正
	const distance = pRel.length();
	const angleFactor =
		distance > 0 ? Math.abs(vRel.dot(pRel) / (vRel.length() * distance)) : 1;
	//質量比補正
	const massFactor = massA > massB ? massB / massA : massA / massB;

	//臨界速度vCrit
	const vCrit = vEsc * (1 + kFactor * (1 - massFactor)) * angleFactor;

	const vRelLen = vRel.length();
	if (vRelLen < vCrit) {
		return CollisionType.Merge;
	} else {
		return CollisionType.Explode;
	}
}
