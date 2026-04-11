import { useFrame } from "@react-three/fiber";
import type { Planet } from "@/types/planet";

type MergeControllerProps = {
	queueData: { obsoleteIdA: string; obsoleteIdB: string; newData: Planet };
	onAdd: (newData: Planet) => void;
	onDelete: (planetId: string) => void;
	onComplete: (idA: string, idB: string) => void;
};

export function MergeController({
	queueData,
	onAdd,
	onDelete,
	onComplete,
}: MergeControllerProps) {
	useFrame(() => {
		onAdd(queueData.newData);
		onDelete(queueData.obsoleteIdA);
		onDelete(queueData.obsoleteIdB);
		onComplete(queueData.obsoleteIdA, queueData.obsoleteIdB);
	}, 1);

	return null;
}
