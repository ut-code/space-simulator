import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import { button, useControls } from "leva";
import * as THREE from "three";
import type { Planet } from "@/types/planet";
import { earth } from "@/data/planets";
import "./index.css";

interface PlanetMeshProps {
  planet: Planet;
}

function PlanetMesh({ planet }: PlanetMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Load the texture (you can use any public Earth texture URL)
  const [colorMap] = useTexture([planet.texturePath]);

  // This hook runs every frame (approx 60fps)
  useFrame((_state, delta) => {
    if (meshRef.current) {
      // Rotate the planet on its Y-axis
      meshRef.current.rotation.y += delta * planet.rotationSpeedY;
    }
  });

  return (
    <mesh ref={meshRef} position={[planet.position.x, planet.position.y, planet.position.z]}>
      {/* args: [radius, widthSegments, heightSegments]
        Higher segments = smoother sphere
      */}
      <sphereGeometry args={[planet.radius, planet.width, planet.height]} />
      <meshStandardMaterial map={colorMap} />
    </mesh>
  );
}

interface PreviewPlanetProps {
  radius: number;
  position: [number, number, number];
}
// 惑星の配置プレビュー用の半透明の球体を描画するコンポーネント
function PreviewPlanet({ radius, position }: PreviewPlanetProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshBasicMaterial color="#6ee7ff" wireframe opacity={0.6} transparent />
    </mesh>
  );
}

interface PlacementSurfaceProps {
  enabled: boolean;
  yLevel: number;
  onPlace: (position: [number, number, number]) => void;
}
// 惑星の配置を行うための透明な平面を描画するコンポーネント
function PlacementSurface({ enabled, yLevel, onPlace }: PlacementSurfaceProps) {
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!enabled) {
      return;
    }

    event.stopPropagation();
    const { x, y, z } = event.point;
    const step = 0.2;
    const round = (value: number) => Math.round(value / step) * step;
    onPlace([round(x), round(y), round(z)]);
  };

  return (
    <mesh
      position={[0, yLevel, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerDown={handlePointerDown}
    >
      <planeGeometry args={[400, 400]} />
      <meshBasicMaterial
        color="#6ee7ff"
        opacity={enabled ? 0.14 : 0}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function Page() {
  const [planets, setPlanets] = useState<Planet[]>([earth]);

  const [placementMode, setPlacementMode] = useState(false);
  const [placementPanelOpen, setPlacementPanelOpen] = useState(true);

  const [planetControls, setPlanetControls, getPlanetControl] = useControls("New Planet", () => ({
    radius: { value: 1.2, min: 0.2, max: 6, step: 0.1 },
    posX: { value: 0, min: -200, max: 200, step: 0.2 },
    posY: { value: 0, min: -200, max: 200, step: 0.2 },
    posZ: { value: 0, min: -200, max: 200, step: 0.2 },
    rotationSpeedY: { value: 0.6, min: 0, max: 10, step: 0.1 },
  }));

  useControls("New Planet", {
    addPlanet: button(() => {
      const settings = {
        radius: getPlanetControl("radius"),
        posX: getPlanetControl("posX"),
        posY: getPlanetControl("posY"),
        posZ: getPlanetControl("posZ"),
        rotationSpeedY: getPlanetControl("rotationSpeedY"),
      };

      setPlanets((prev) => [
        ...prev,
        {
          texturePath: earth.texturePath,
          rotationSpeedY: settings.rotationSpeedY,
          radius: settings.radius,
          width: 64,
          height: 64,
          position: new THREE.Vector3(settings.posX, settings.posY, settings.posZ),
        },
      ]);
    }),
  });

  const { showGrid, showAxes, showPreview } = useControls("Helpers", {
    showGrid: true,
    showAxes: true,
    showPreview: true,
  });

  const previewPosition = useMemo<[number, number, number]>(
    () => [planetControls.posX, planetControls.posY, planetControls.posZ],
    [planetControls.posX, planetControls.posY, planetControls.posZ]
  );

  const handlePlacement = (position: [number, number, number]) => {
    setPlanetControls({ posX: position[0], posY: position[1], posZ: position[2] });
  };

  const removePlanet = (planetIndex: number) => {
    setPlanets((prev) => prev.filter((_, index) => index !== planetIndex));
  };

  return (
    <div className="simulation-page">
      <Canvas
        camera={{ position: [0, 0, 220], fov: 60 }}
        onCreated={({ gl }) => {
          gl.setClearColor("#000000", 1);
        }}
        style={{ width: "100vw", height: "100vh" }}
      >
        {/* Adds ambient and directional light so we can see the 3D shape */}
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={3} />

        {planets.map((planet, index) => (
          <PlanetMesh key={`planet-${index}`} planet={planet} />
        ))}

        <PlacementSurface
          enabled={placementMode}
          yLevel={planetControls.posY}
          onPlace={handlePlacement}
        />

        {showPreview && <PreviewPlanet radius={planetControls.radius} position={previewPosition} />}
        {showGrid && <gridHelper args={[200, 50, "#1f2937", "#0f172a"]} />}
        {showAxes && <axesHelper args={[20]} />}

        {/* Optional background and controls */}
        <Stars radius={600} depth={300} count={8000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls enableZoom={true} />
      </Canvas>

      <div className="simulation-panel">
        <div className="simulation-panel__header">
          <strong>クリック配置</strong>
          <div className="simulation-panel__actions">
            <label className="simulation-panel__toggle">
              <input
                type="checkbox"
                checked={placementMode}
                onChange={(event) => setPlacementMode(event.target.checked)}
              />
              ON
            </label>
            <button
              type="button"
              onClick={() => setPlacementPanelOpen((prev) => !prev)}
              className="simulation-panel__button"
            >
              {placementPanelOpen ? "たたむ" : "ひらく"}
            </button>
          </div>
        </div>
        {placementPanelOpen && (
          <>
            <p className="simulation-panel__hint">
              ONの間は水色の面をクリックすると、座標が自動入力されます。
            </p>

            <strong>追加済み惑星 ({planets.length})</strong>
            <ul className="simulation-panel__list">
              {planets.map((planet, index) => (
                <li
                  key={`planet-item-${index}`}
                  className="simulation-panel__item"
                >
                  <div>
                    <div>#{index + 1}</div>
                    <div className="simulation-panel__meta">
                      r={planet.radius.toFixed(1)} / (
                      {planet.position.x.toFixed(1)}, {planet.position.y.toFixed(1)},
                      {planet.position.z.toFixed(1)})
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePlanet(index)}
                    className="simulation-panel__delete"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
