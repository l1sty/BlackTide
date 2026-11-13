"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  Group,
  SRGBColorSpace,
  Shape,
  Path,
  PMREMGenerator,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useEffect, useMemo, useRef, type RefObject } from "react";

// A stamped denim button: circular brushing, recessed lettering and a rolled rim.
function stampedFace() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(256, 256);
  ctx.fillStyle = "#9e9178";
  ctx.fillRect(-256, -256, 512, 512);
  for (let r = 1; r < 256; r++) {
    ctx.strokeStyle = r % 3 === 0 ? "#e1d9c430" : "#49453719";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, 2 * Math.PI);
    ctx.stroke();
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#35332d";
  ctx.font = "bold 38px Arial";
  const letters = "BLACK TIDE";
  Array.from(letters).forEach((char, i) => {
    ctx.save();
    ctx.rotate((i - (letters.length - 1) / 2) * 0.23);
    ctx.fillText(char, 0, -181);
    ctx.restore();
  });
  ctx.font = "bold 125px Georgia";
  ctx.fillText("BT", 0, 12);
  ctx.font = "30px monospace";
  ctx.fillText("•  01  •", 0, 165);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function StudioReflections() {
  const { gl, scene, invalidate } = useThree();
  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = generator.fromScene(room, 0.035);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.65;
    room.dispose();
    generator.dispose();
    invalidate();
    return () => {
      scene.environment = null;
      target.dispose();
    };
  }, [gl, scene, invalidate]);
  return null;
}

function roundedLoop(path: Path, width: number, height: number, r: number) {
  const x = width / 2,
    y = height / 2;
  path.moveTo(-x + r, -y);
  path.lineTo(x - r, -y);
  path.quadraticCurveTo(x, -y, x, -y + r);
  path.lineTo(x, y - r);
  path.quadraticCurveTo(x, y, x - r, y);
  path.lineTo(-x + r, y);
  path.quadraticCurveTo(-x, y, -x, y - r);
  path.lineTo(-x, -y + r);
  path.quadraticCurveTo(-x, -y, -x + r, -y);
  return path;
}

function Buckle() {
  const frame = useMemo(() => {
    const shape = new Shape();
    roundedLoop(shape, 1.7, 1.32, 0.24);
    shape.holes.push(roundedLoop(new Path(), 1.39, 1.01, 0.15));
    return shape;
  }, []);
  const steel = { color: "#bcc4c7", metalness: 0.95, roughness: 0.23 };
  return (
    <group rotation={[0.16, -0.23, 0.25]}>
      <mesh>
        <extrudeGeometry
          args={[
            frame,
            {
              depth: 0.11,
              bevelSize: 0.045,
              bevelThickness: 0.045,
              bevelSegments: 4,
            },
          ]}
        />
        <meshStandardMaterial {...steel} />
      </mesh>
      <mesh position={[0, 0, 0.05]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.054, 0.054, 1.6, 24]} />
        <meshStandardMaterial {...steel} />
      </mesh>
      <mesh position={[0.04, 0.31, 0.145]} rotation-z={-0.11}>
        <capsuleGeometry args={[0.055, 0.61, 6, 20]} />
        <meshStandardMaterial {...steel} />
      </mesh>
      <mesh position={[0, 0, 0.065]} rotation-y={Math.PI / 2}>
        <torusGeometry args={[0.089, 0.034, 12, 32]} />
        <meshStandardMaterial {...steel} />
      </mesh>
    </group>
  );
}

function Snap() {
  const brass = { color: "#caa170", metalness: 0.88, roughness: 0.26 };
  return (
    <group rotation={[0.2, -0.21, -0.34]}>
      <group position={[-0.35, 0.32, -0.12]} rotation-y={-0.26}>
        <mesh scale={[0.59, 0.59, 0.17]}>
          <sphereGeometry args={[1, 48, 28]} />
          <meshStandardMaterial {...brass} />
        </mesh>
        <mesh position-z={0.065}>
          <torusGeometry args={[0.53, 0.045, 12, 54]} />
          <meshStandardMaterial {...brass} />
        </mesh>
      </group>
      <group position={[0.32, -0.33, 0.12]} rotation-y={0.32}>
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.49, 0.45, 0.1, 54]} />
          <meshStandardMaterial {...brass} />
        </mesh>
        {[0.43, 0.24].map((r) => (
          <mesh key={r} position-z={0.07}>
            <torusGeometry args={[r, 0.05, 14, 54]} />
            <meshStandardMaterial {...brass} />
          </mesh>
        ))}
        <mesh position-z={0.16} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.135, 0.17, 0.21, 32]} />
          <meshStandardMaterial {...brass} />
        </mesh>
      </group>
    </group>
  );
}

function Hardware({
  host,
  slide,
}: {
  host: RefObject<HTMLDivElement | null>;
  slide: number;
}) {
  const mesh = useRef<Group>(null);
  const target = useRef({ x: 0.12, y: -0.2 });
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const hero = host.current?.closest("section");
    if (!hero) return;
    function reset() {
      target.current = { x: 0.12, y: -0.2 };
      invalidate();
    }
    function track(event: PointerEvent) {
      const bounds = hero!.getBoundingClientRect();
      target.current.x =
        ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.78;
      target.current.y =
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 1.25;
      invalidate();
    }
    hero.addEventListener("pointermove", track);
    hero.addEventListener("pointerdown", track);
    hero.addEventListener("pointerleave", reset);
    hero.addEventListener("pointercancel", reset);
    return () => {
      hero.removeEventListener("pointermove", track);
      hero.removeEventListener("pointerdown", track);
      hero.removeEventListener("pointerleave", reset);
      hero.removeEventListener("pointercancel", reset);
    };
  }, [host, invalidate]);
  useFrame((_, dt) => {
    if (!mesh.current) return;
    if (host.current && !host.current.hasAttribute("data-rendered")) {
      host.current.setAttribute("data-rendered", "");
    }
    const rotation = mesh.current.rotation;
    const a = 1 - Math.exp(-14 * Math.min(dt, 0.05));
    rotation.x += (target.current.x - rotation.x) * a;
    rotation.y += (target.current.y - rotation.y) * a;
    if (
      Math.abs(target.current.x - rotation.x) +
        Math.abs(target.current.y - rotation.y) >
      0.001
    )
      invalidate();
  });
  return (
    <group ref={mesh} rotation={[0.45, -1.1, -0.18]}>
      {slide === 0 ? (
        <>
          <group position={[-0.09, 0.04, 0]} scale={0.71}>
            <DenimButton />
          </group>
          <group position={[0.66, 0.63, -0.23]} scale={0.37}>
            <Buckle />
          </group>
          <group position={[0.52, -0.7, 0.08]} scale={0.33}>
            <Snap />
          </group>
        </>
      ) : slide === 1 ? (
        <Buckle />
      ) : (
        <Snap />
      )}
    </group>
  );
}

function DenimButton() {
  const face = useMemo(stampedFace, []);
  useEffect(() => () => face.dispose(), [face]);
  return (
    <>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 0.18, 80]} />
        <meshStandardMaterial
          color="#8f8069"
          metalness={0.5}
          roughness={0.42}
        />
      </mesh>
      <mesh position-z={0.095}>
        <circleGeometry args={[0.98, 80]} />
        <meshStandardMaterial
          map={face}
          bumpMap={face}
          bumpScale={0.022}
          metalness={0.35}
          roughness={0.48}
        />
      </mesh>
      {[0.95, 0.55].map((radius) => (
        <mesh key={radius} position-z={0.102}>
          <torusGeometry
            args={[radius, radius > 0.9 ? 0.047 : 0.012, 12, 80]}
          />
          <meshStandardMaterial
            color="#c4b89c"
            metalness={0.65}
            roughness={0.28}
          />
        </mesh>
      ))}
    </>
  );
}

export default function HardwareScene({ slide }: { slide: number }) {
  const host = useRef<HTMLDivElement>(null);
  return (
    <div className="hero-rivet" aria-hidden="true" ref={host}>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        fallback={null}
        camera={{ position: [0, 0, 3.6], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
      >
        <StudioReflections />
        <hemisphereLight args={["#d9e8ff", "#493a2d", 0.7]} />
        <directionalLight
          color="#fff0db"
          position={[-2, 3, 3]}
          intensity={2.8}
        />
        <directionalLight color="#ceddff" position={[3, 1, -1]} intensity={3} />
        <Hardware key={slide} host={host} slide={slide} />
      </Canvas>
    </div>
  );
}
