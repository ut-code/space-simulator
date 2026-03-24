import { useFrame } from "@react-three/fiber";
import type { Planet } from "@/types/planet";

type MergeControllerProps = {
	mergeQueue: { obsoleteIdA: string; obsoleteIdB: string; newData: Planet };
	onAdd: (newData: Planet) => void;
	onDelete: (planetId: string) => void;
	onComplete: (idA: string, idB: string) => void;
};

export function MergeController({
	mergeQueue,
	onAdd,
	onDelete,
	onComplete,
}: MergeControllerProps) {
	useFrame(() => {
		onAdd(mergeQueue.newData);
		onDelete(mergeQueue.obsoleteIdA);
		onDelete(mergeQueue.obsoleteIdB);
		onComplete(mergeQueue.obsoleteIdA, mergeQueue.obsoleteIdB);
	}, 1);

	return null;
}
