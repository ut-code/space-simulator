interface Props {
  color: string;
}

export default function Scene(props: Props) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color={props.color} />
      </mesh>
    </>
  );
}
