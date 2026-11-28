import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ════════════════════════════════════════════════════════════════════════════
 * PROCEDURAL MOUNTAIN RIDGE GEOMETRIES
 * ════════════════════════════════════════════════════════════════════════════
 */

// Distant Alpine Peaks Silhouette (High Amplitude, Sharp Crests)
function DistantAlpinePeaks() {
  const meshRef = useRef();

  const { geometry } = useMemo(() => {
    const geom = new THREE.PlaneGeometry(160, 80, 80, 60);
    geom.rotateX(-Math.PI / 2.35);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Multi-octave sharp ridge noise
      const ridge1 = Math.abs(Math.sin(x * 0.05) * Math.cos(y * 0.04)) * 14;
      const ridge2 = Math.sin(x * 0.12 + 0.8) * Math.sin(y * 0.1 + 0.4) * 5;
      const micro = Math.cos(x * 0.25) * Math.sin(y * 0.2) * 1.8;
      
      // Elevate back peaks
      const depthBias = Math.max(0, (y + 40) / 70) * 12;
      const z = (ridge1 + ridge2 + micro) + depthBias - 10;
      pos.setZ(i, z);
    }
    geom.computeVertexNormals();
    return { geometry: geom };
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 6, -38]} receiveShadow>
      <meshStandardMaterial
        color="#17221A"
        roughness={0.82}
        metalness={0.18}
        flatShading={false}
      />
    </mesh>
  );
}

// Midground Forest Ridges & Rolling Valley
function MidgroundForestRidges() {
  const meshRef = useRef();

  const { geometry, treePositions } = useMemo(() => {
    const geom = new THREE.PlaneGeometry(120, 70, 70, 50);
    geom.rotateX(-Math.PI / 2.3);

    const pos = geom.attributes.position;
    const trees = [];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      const wave1 = Math.sin(x * 0.08) * Math.cos(y * 0.07) * 4.2;
      const wave2 = Math.cos(x * 0.15 + 1.2) * Math.sin(y * 0.12) * 2.1;
      const z = (wave1 + wave2) - 3.5;
      pos.setZ(i, z);

      // Sample ridge crests for evergreen pine placement
      if (i % 28 === 0 && Math.abs(x) < 45 && y > -20 && y < 25) {
        trees.push({
          x,
          y: z - 3.0,
          z: y - 18.0,
          scale: 0.7 + Math.random() * 0.9,
          rotY: Math.random() * Math.PI
        });
      }
    }
    geom.computeVertexNormals();
    return { geometry: geom, treePositions: trees };
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = -6.5 + Math.sin(clock.getElapsedTime() * 0.25) * 0.15;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry} position={[0, -6.5, -18]} receiveShadow>
        <meshStandardMaterial
          color="#111A14"
          roughness={0.9}
          metalness={0.1}
          flatShading={false}
        />
      </mesh>

      {/* Evergreen Pine Tree Silhouettes */}
      <PineTreeCanopy trees={treePositions} />
    </group>
  );
}

// Evergreen Pine Trees along Alpine Ridges
function PineTreeCanopy({ trees }) {
  const groupRef = useRef();

  return (
    <group ref={groupRef}>
      {trees.slice(0, 48).map((t, idx) => (
        <group key={idx} position={[t.x, t.y, t.z]} rotation={[0, t.rotY, 0]} scale={t.scale}>
          {/* Lower Pine Tier */}
          <mesh position={[0, 1.2, 0]}>
            <coneGeometry args={[1.1, 2.4, 5]} />
            <meshStandardMaterial color="#0E1611" roughness={0.95} />
          </mesh>
          {/* Upper Pine Tier */}
          <mesh position={[0, 2.5, 0]}>
            <coneGeometry args={[0.8, 2.0, 5]} />
            <meshStandardMaterial color="#17221A" roughness={0.9} />
          </mesh>
          {/* Summit Tip with Rim Catch */}
          <mesh position={[0, 3.6, 0]}>
            <coneGeometry args={[0.5, 1.6, 5]} />
            <meshStandardMaterial color="#315B40" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * VOLUMETRIC-STYLE ATMOSPHERIC MIST & GLOW PARTICLES
 * ════════════════════════════════════════════════════════════════════════════
 */
function DriftingMistPlanes() {
  const mist1 = useRef();
  const mist2 = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mist1.current) {
      mist1.current.position.x = Math.sin(t * 0.08) * 4;
      mist1.current.position.y = -3 + Math.sin(t * 0.15) * 0.4;
    }
    if (mist2.current) {
      mist2.current.position.x = Math.cos(t * 0.06) * 5;
      mist2.current.position.y = 1 + Math.cos(t * 0.12) * 0.5;
    }
  });

  return (
    <group>
      {/* Lower Valley Mist Layer */}
      <mesh ref={mist1} position={[0, -3, -14]} rotation={[-Math.PI / 2.3, 0, 0]}>
        <planeGeometry args={[90, 40]} />
        <meshBasicMaterial
          color="#1D2A21"
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>

      {/* High Ridge Horizon Mist Layer */}
      <mesh ref={mist2} position={[0, 2, -28]} rotation={[-Math.PI / 2.35, 0, 0]}>
        <planeGeometry args={[120, 50]} />
        <meshBasicMaterial
          color="#111A14"
          transparent
          opacity={0.45}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>
    </group>
  );
}

// Ambient Floating Forest Dust / Golden Motes
function AmbientPollenMotes() {
  const count = 42;
  const meshRef = useRef();

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 55,
        y: Math.random() * 12 - 4,
        z: (Math.random() - 0.5) * 35 - 5,
        scale: Math.random() * 0.4 + 0.2,
        speed: Math.random() * 0.25 + 0.1,
        color: Math.random() > 0.4 ? '#C4A77D' : '#91B39A'
      });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.children.forEach((child, i) => {
      const p = particles[i];
      child.position.y = p.y + Math.sin(t * p.speed + i) * 0.6;
      child.position.x = p.x + Math.cos(t * p.speed * 0.5 + i) * 0.4;
      child.rotation.y = t * 0.1 + i;
    });
  });

  return (
    <group ref={meshRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} scale={p.scale}>
          <octahedronGeometry args={[0.8, 0]} />
          <meshBasicMaterial
            color={p.color}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Camera Parallax Rig with Smooth Mouse Interpolation
 */
function CameraRig() {
  useFrame(({ camera, pointer }) => {
    // Subtle mouse tracking with heavy damping for silky smooth luxury feel
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 2.8, 0.035);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 4.2 + pointer.y * 1.8, 0.035);
    camera.lookAt(0, 1.2, -14);
  });
  return null;
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * EXPORT: CINEMATIC 3D HERO COMPONENT
 * ════════════════════════════════════════════════════════════════════════════
 */
export default function CinematicHero3D() {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      
      {/* 
        AUTHENTIC SEAMLESS ALPINE FOREST FALLBACK LAYER:
        Always mounted underneath. Ensures the hero never renders as a sparse dark void
        while 3D canvas compiles or on mobile/low-power/WebGL disabled devices.
      */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none transition-opacity duration-1000"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(11, 16, 13, 0.4) 0%, rgba(11, 16, 13, 0.7) 60%, #0B100D 100%),
            radial-gradient(ellipse at 50% 20%, rgba(49, 91, 64, 0.35) 0%, rgba(17, 26, 20, 0.8) 65%, #0B100D 100%),
            url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=85')
          `,
          opacity: 0.65
        }}
      />

      {/* Live Three.js / React Three Fiber Scene */}
      {hasWebGL && (
        <div className="absolute inset-0 z-10">
          <Canvas
            shadows
            camera={{ position: [0, 4.2, 16], fov: 46 }}
            gl={{ 
              antialias: true, 
              alpha: true, 
              powerPreference: 'high-performance' 
            }}
            dpr={[1, 1.5]}
          >
            <color attach="background" args={['transparent']} />
            <fog attach="fog" args={['#0B100D', 12, 58]} />

            {/* Lighting: Golden Hour Rim Light + Emerald/Sage Ambient Fill */}
            <ambientLight intensity={0.75} color="#A6B1A7" />
            <directionalLight
              position={[26, 35, 20]}
              intensity={2.4}
              color="#C4A77D"
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <pointLight position={[-18, 12, -8]} intensity={1.5} color="#315B40" />
            <pointLight position={[15, -2, 6]} intensity={0.8} color="#91B39A" />

            {/* Distant Alpine Starfield */}
            <Stars radius={50} depth={35} count={800} factor={2.2} saturation={0.1} fade speed={0.5} />

            <CameraRig />
            <Suspense fallback={null}>
              <DistantAlpinePeaks />
              <MidgroundForestRidges />
              <DriftingMistPlanes />
              <AmbientPollenMotes />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Atmospheric Vignette & Contrast Control Gradient Overlays */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, transparent 30%, rgba(11, 16, 13, 0.7) 80%, #0B100D 100%)'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 h-48 z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #0B100D 25%, transparent 100%)'
        }}
      />
    </div>
  );
}
