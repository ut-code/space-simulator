import { Canvas } from "@react-three/fiber";

type Props = {
	children: React.ReactNode;
};

export default function ThreeCanvas(props: Props) {
	return (
		<Canvas camera={{ position: [0, 2, 5], fov: 60 }} shadows>
			<color attach="background" args={["black"]} />
			{props.children}
		</Canvas>
	);
}
