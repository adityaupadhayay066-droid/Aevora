import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ════════════════════════════════════════════════════════════════════════════
 * PROCEDURAL ALPINE MOUNTAIN & VALLEY TERRAIN
 * ════════════════════════════════════════════════════════════════════════════
 */
function MountainValleyMesh() {
  const meshRef = useRef();

  const { geometry } = useMemo(() => {
    const width = 160;
    const height = 90;
    const geom = new THREE.PlaneGeometry(width, height, 90, 60);
    geom.rotateX(-Math.PI / 2.35);

    const pos = geom.attributes.position;
    const colors = [];
    const color = new THREE.Color();

    // Natural color stops
    const cValley = new THREE.Color('#0B100D');
    const cPine = new THREE.Color('#17221A');
    const cForest = new THREE.Color('#315B40');
    const cRidge = new THREE.Color('#6F8D76');
    const cCrest = new THREE.Color('#91B39A');

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Multi-octave natural terrain noise
      const n1 = Math.sin(x * 0.05) * Math.cos(y * 0.06) * 11;
      const n2 = Math.sin(x * 0.11 + 1.2) * Math.sin(y * 0.13) * 5.5;
      const n3 = Math.cos(x * 0.22) * Math.sin(y * 0.25) * 2.2;
      const mountain = Math.max(0, n1 + n2 + n3);

      // Carve a central valley pass where the spline route travels
      const valleyMask = Math.min(1, Math.abs(x) * 0.038);
      const elevation = mountain * (0.35 + valleyMask * 0.65);

      pos.setZ(i, elevation);

      // Vertex color grading by altitude
      const normH = Math.min(1, Math.max(0, elevation / 16));
      if (normH < 0.25) {
        color.lerpColors(cValley, cPine, normH / 0.25);
      } else if (normH < 0.6) {
        color.lerpColors(cPine, cForest, (normH - 0.25) / 0.35);
      } else if (normH < 0.85) {
        color.lerpColors(cForest, cRidge, (normH - 0.6) / 0.25);
      } else {
        color.lerpColors(cRidge, cCrest, (normH - 0.85) / 0.15);
      }

      colors.push(color.r, color.g, color.b);
    }

    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.computeVertexNormals();
    return { geometry: geom };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Gentle environmental breathing
    meshRef.current.position.y = -7 + Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -7, -26]}>
      <meshStandardMaterial
        vertexColors
        roughness={0.88}
        metalness={0.12}
        flatShading={true}
      />
    </mesh>
  );
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * GLOWING 3D SPLINE ROUTE ARC & TRANSIT PULSES
 * ════════════════════════════════════════════════════════════════════════════
 */
function SplineTransitRoute() {
  const pulseRef = useRef();
  const ringRef1 = useRef();
  const ringRef2 = useRef();

  // Define 3D spline curve weaving through alpine peaks and passes
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-32, -4.5, -20),
      new THREE.Vector3(-20, -1.0, -16),
      new THREE.Vector3(-8, 2.2, -14),
      new THREE.Vector3(4, -0.5, -12),
      new THREE.Vector3(18, 3.0, -15),
      new THREE.Vector3(32, -2.5, -22),
    ]);
  }, []);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 90, 0.12, 8, false);
  }, [curve]);

  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.12) % 1;
    if (pulseRef.current) {
      const pt = curve.getPointAt(t);
      pulseRef.current.position.copy(pt);
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.z += 0.02;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z -= 0.018;
    }
  });

  return (
    <group position={[0, -6, -26]}>
      {/* Golden Glowing Spline Line */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial color="#C4A77D" transparent opacity={0.85} />
      </mesh>

      {/* Moving Light Pulse along the Spline */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#F1F3ED" />
        <pointLight color="#C4A77D" intensity={2.5} distance={10} />
      </mesh>

      {/* Waypoint 1: Origin Beacon */}
      <group position={[-32, -4.5, -20]}>
        <mesh>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color="#91B39A" />
        </mesh>
        <mesh ref={ringRef1} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.85, 24]} />
          <meshBasicMaterial color="#91B39A" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Waypoint 2: Destination Beacon */}
      <group position={[32, -2.5, -22]}>
        <mesh>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshBasicMaterial color="#C4A77D" />
        </mesh>
        <mesh ref={ringRef2} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 0.95, 24]} />
          <meshBasicMaterial color="#C4A77D" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * VOLUMETRIC DRIFTING MIST PLANES
 * ════════════════════════════════════════════════════════════════════════════
 */
function DriftingAlpineMist() {
  const mist1 = useRef();
  const mist2 = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (mist1.current) {
      mist1.current.position.x = Math.sin(t * 0.07) * 4;
      mist1.current.material.opacity = 0.16 + Math.sin(t * 0.2) * 0.04;
    }
    if (mist2.current) {
      mist2.current.position.x = Math.cos(t * 0.05) * 5;
      mist2.current.material.opacity = 0.12 + Math.cos(t * 0.16) * 0.03;
    }
  });

  return (
    <group position={[0, -5, -20]}>
      <mesh ref={mist1} position={[0, 2, 0]}>
        <planeGeometry args={[120, 24]} />
        <meshBasicMaterial
          color="#91B39A"
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={mist2} position={[0, -2, 4]}>
        <planeGeometry args={[140, 28]} />
        <meshBasicMaterial
          color="#315B40"
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * CAMERA PARALLAX RIG WITH DAMPED MOUSE LERP
 * ════════════════════════════════════════════════════════════════════════════
 */
function CameraParallaxRig() {
  useFrame((state) => {
    const { pointer, camera } = state;
    // Damped lerp mouse movement for weighty, human feel
    const targetX = pointer.x * 2.4;
    const targetY = 1.2 + pointer.y * 1.0;

    camera.position.x += (targetX - camera.position.x) * 0.032;
    camera.position.y += (targetY - camera.position.y) * 0.032;
    camera.lookAt(0, -2, -26);
  });

  return null;
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * MAIN EXPORT: TERRAIN3D
 * Seamless 100vh canvas with zero hard horizontal splits
 * ════════════════════════════════════════════════════════════════════════════
 */
export default function Terrain3D() {
  const [webGlAvailable, setWebGlAvailable] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGlAvailable(false);
    } catch (_e) {
      setWebGlAvailable(false);
    }

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none bg-[#0B100D]">
      {/* 1. High-Resolution Alpine Mountain Backdrop (No hard borders, seamless scale) */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=85')`,
          opacity: 0.35,
          filter: 'saturate(0.85) brightness(0.60)'
        }}
        aria-hidden="true"
      />

      {/* 2. Interactive 3D WebGL Canvas */}
      {webGlAvailable && !reducedMotion && (
        <div className="absolute inset-0 w-full h-full pointer-events-auto">
          <Canvas
            camera={{ position: [0, 1.2, 10], fov: 46, near: 0.1, far: 200 }}
            dpr={[1, 1.5]}
            gl={{ 
              antialias: true, 
              alpha: true,
              powerPreference: 'high-performance',
              stencil: false,
              depth: true
            }}
          >
            {/* Exponential atmospheric fog in deep dark green */}
            <fog attach="fog" args={['#0B100D', 10, 36]} />

            {/* Ambient & Natural Lights */}
            <ambientLight intensity={0.5} color="#A6B1A7" />

            {/* Warm Golden Rim Light */}
            <directionalLight
              position={[24, 18, 10]}
              intensity={2.0}
              color="#C4A77D"
            />

            {/* Cool Alpine Fill Light */}
            <directionalLight
              position={[-20, 10, -6]}
              intensity={0.7}
              color="#91B39A"
            />

            {/* Distant Subtle Stars */}
            <Stars radius={50} depth={30} count={500} factor={2} saturation={0.1} fade speed={0.3} />

            <CameraParallaxRig />

            <Suspense fallback={null}>
              <MountainValleyMesh />
              <SplineTransitRoute />
              <DriftingAlpineMist />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* 3. Vignette Overlays ensuring 100% seamless blending into #0B100D with zero horizontal split */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 32%, transparent 22%, rgba(11, 16, 13, 0.70) 72%, #0B100D 100%)'
        }}
      />
      <div 
        className="absolute bottom-0 inset-x-0 h-56 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #0B100D 40%, rgba(11, 16, 13, 0.7) 70%, transparent 100%)'
        }}
      />
    </div>
  );
}
