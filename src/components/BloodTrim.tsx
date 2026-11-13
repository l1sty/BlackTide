"use client";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Shape, PMREMGenerator } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

function Drips() {
  const { viewport, gl, scene, invalidate } = useThree();
  const shape = useMemo(() => {
    const s = new Shape(),
      w = viewport.width,
      h = viewport.height;
    s.moveTo(-w / 2, h / 2 + 0.12);
    s.lineTo(w / 2, h / 2 + 0.12);
    s.lineTo(w / 2, h / 2 - 0.08);
    const drops = [
      [0.96, 0.34],
      [0.88, 0.62],
      [0.79, 0.25],
      [0.68, 0.48],
      [0.59, 0.31],
      [0.49, 0.7],
      [0.42, 0.36],
      [0.32, 0.2],
      [0.23, 0.28],
      [0.13, 0.65],
      [0.055, 0.4],
    ];
    for (const [position, length] of drops) {
      const x = (position - 0.5) * w,
        y = h / 2 - 0.08;
      s.lineTo(x + 0.13, y);
      s.bezierCurveTo(
        x + 0.045,
        y,
        x + 0.06,
        y - length * 0.55,
        x + 0.065,
        y - length + 0.08,
      );
      s.bezierCurveTo(
        x + 0.08,
        y - length - 0.04,
        x - 0.08,
        y - length - 0.04,
        x - 0.065,
        y - length + 0.08,
      );
      s.bezierCurveTo(x - 0.06, y - length * 0.55, x - 0.045, y, x - 0.13, y);
    }
    s.lineTo(-w / 2, h / 2 - 0.08);
    s.closePath();
    return s;
  }, [viewport.width, viewport.height]);
  useEffect(() => {
    const generator = new PMREMGenerator(gl),
      room = new RoomEnvironment();
    const env = generator.fromScene(room, 0.06);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.65;
    room.dispose();
    generator.dispose();
    invalidate();
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene, invalidate]);
  return (
    <mesh>
      <extrudeGeometry
        args={[
          shape,
          {
            depth: 0.08,
            bevelEnabled: true,
            bevelThickness: 0.04,
            bevelSize: 0.025,
            bevelSegments: 5,
            curveSegments: 24,
          },
        ]}
      />
      <meshPhysicalMaterial
        color="#7d0d06"
        metalness={0.15}
        roughness={0.22}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

export default function BloodTrim() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    setSupported(Boolean(gl));
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="blood-trim" aria-hidden="true">
      <img src="/images/blood-trim.webp" alt="" />
      {visible && supported && (
        <Canvas
          orthographic
          camera={{ position: [0, 0, 10], zoom: 60 }}
          dpr={[1, 2]}
          frameloop="demand"
          gl={{ alpha: true, antialias: true }}
          onCreated={() => ref.current?.setAttribute("data-rendered", "")}
        >
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[-4, 6, 5]}
            intensity={3}
            color="#fff5ed"
          />
          <directionalLight position={[5, 1, 3]} intensity={1.3} />
          <Drips />
        </Canvas>
      )}
    </div>
  );
}
