import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Procedural Cinematic Mountain Landscape
 * Generates realistic undulating terrain, atmospheric forest fog, and alpine peaks.
 */
function MountainTerrain() {
  const meshRef = useRef();

  // Generate continuous mountain ridge geometry with noise displacement
  const { geometry } = useMemo(() => {
    const geom = new THREE.PlaneGeometry(120, 100, 96, 96);
    geom.rotateX(-Math.PI / 2.3);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      
      // Ridge waves + micro topography simulating mountain forest ridges
      const d1 = Math.sin(x * 0.08) * Math.cos(y * 0.07) * 4.5;
      const d2 = Math.sin(x * 0.16 + 1.2) * Math.sin(y * 0.14) * 2.2;
      const d3 = Math.cos(x * 0.32) * Math.sin(y * 0.28) * 0.8;
      const distanceFactor = Math.min(1.0, (Math.abs(y) + Math.abs(x * 0.5)) / 40);

      // Elevated background mountain peaks
      const z = (d1 + d2 + d3) * (0.8 + distanceFactor * 1.5) - 4;
      pos.setZ(i, z);
    }
    geom.computeVertexNormals();
    return { geometry: geom };
  }, []);

  // Subtle breathing environmental oscillation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = -8 + Math.sin(clock.getElapsedTime() * 0.3) * 0.25;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -8, -12]} receiveShadow>
      <meshStandardMaterial
        color="#17221A"
        roughness={0.88}
        metalness={0.12}
        flatShading={false}
      />
    </mesh>
  );
}

/**
 * Floating Alpine Forest Canopy & Misty Particles
 */
function FloatingMist() {
  const count = 36;
  const meshRef = useRef();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 60;
      const y = Math.random() * 8 - 4;
      const z = (Math.random() - 0.5) * 40 - 5;
      const scale = Math.random() * 0.6 + 0.3;
      temp.push({ x, y, z, scale, speed: Math.random() * 0.2 + 0.1 });
    }
    return temp;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.children.forEach((child, i) => {
      const p = particles[i];
      child.position.y = p.y + Math.sin(t * p.speed + i) * 0.5;
      child.rotation.y = t * 0.05 + i;
    });
  });

  return (
    <group ref={meshRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} scale={p.scale}>
          <octahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial
            color="#315B40"
            emissive="#1D2A21"
            roughness={0.7}
            transparent
            opacity={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Camera Parallax Rig
 */
function CameraRig() {
  useFrame(({ camera, pointer }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 2.5, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 4 + pointer.y * 1.5, 0.04);
    camera.lookAt(0, 0, -10);
  });
  return null;
}

/**
 * Cinematic 3D Scene Wrapper with WebGL Error Boundary
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

  if (!hasWebGL) {
    return (
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 20%, #1D2A21 0%, #111A14 50%, #0B100D 100%)'
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      <Canvas
        shadows
        camera={{ position: [0, 4, 16], fov: 48 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#0B100D']} />
        <fog attach="fog" args={['#0B100D', 14, 55]} />

        {/* Natural Alpine Mountain Lighting */}
        <ambientLight intensity={0.7} color="#A6B1A7" />
        <directionalLight
          position={[16, 24, 18]}
          intensity={1.8}
          color="#C4A77D"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-14, 8, -6]} intensity={1.2} color="#315B40" />
        <pointLight position={[12, -4, 4]} intensity={0.6} color="#91B39A" />

        {/* Starry Mist & Deep Space Atmosphere */}
        <Stars radius={45} depth={30} count={900} factor={2.5} saturation={0.15} fade speed={0.6} />

        <CameraRig />
        <MountainTerrain />
        <FloatingMist />
      </Canvas>

      {/* Atmospheric Vignette & Natural Contrast Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(11, 16, 13, 0.75) 85%, #0B100D 100%)'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #0B100D 30%, transparent 100%)'
        }}
      />
    </div>
  );
}
