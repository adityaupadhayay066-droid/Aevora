import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * ════════════════════════════════════════════════════════════════════════════
 * PROCEDURAL ALPINE MOUNTAIN RIDGES
 * ════════════════════════════════════════════════════════════════════════════
 */

// Background Alpine Peaks with Jagged Mountain Crests
function DistantAlpineRange() {
  const meshRef = useRef();

  const { geometry } = useMemo(() => {
    const geom = new THREE.PlaneGeometry(160, 90, 80, 60);
    geom.rotateX(-Math.PI / 2.38);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Jagged mountain ridges
      const r1 = Math.abs(Math.sin(x * 0.055) * Math.cos(y * 0.045)) * 16;
      const r2 = Math.sin(x * 0.14 + 1.2) * Math.sin(y * 0.12) * 5.5;
      const micro = Math.cos(x * 0.28) * Math.sin(y * 0.22) * 2.0;
      const depthRise = Math.max(0, (y + 45) / 80) * 14;

      pos.setZ(i, (r1 + r2 + micro) + depthRise - 12);
    }
    geom.computeVertexNormals();
    return { geometry: geom };
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 8, -42]} receiveShadow>
      <meshStandardMaterial
        color="#17221A"
        roughness={0.8}
        metalness={0.2}
        flatShading={false}
      />
    </mesh>
  );
}

// Midground Forest Slope & Valley
function MidgroundValleySlope() {
  const meshRef = useRef();

  const { geometry, treePositions } = useMemo(() => {
    const geom = new THREE.PlaneGeometry(130, 80, 70, 50);
    geom.rotateX(-Math.PI / 2.3);

    const pos = geom.attributes.position;
    const trees = [];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      const wave1 = Math.sin(x * 0.075) * Math.cos(y * 0.065) * 5.0;
      const wave2 = Math.cos(x * 0.16 + 0.8) * Math.sin(y * 0.13) * 2.4;
      const z = (wave1 + wave2) - 4.5;
      pos.setZ(i, z);

      // Distribute pine trees on ridges
      if (i % 24 === 0 && Math.abs(x) < 55 && y > -25 && y < 30) {
        trees.push({
          x,
          y: z - 3.2,
          z: y - 20.0,
          scale: 0.65 + Math.random() * 0.9,
          rotY: Math.random() * Math.PI
        });
      }
    }
    geom.computeVertexNormals();
    return { geometry: geom, treePositions: trees };
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = -7.0 + Math.sin(clock.getElapsedTime() * 0.2) * 0.18;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry} position={[0, -7.0, -20]} receiveShadow>
        <meshStandardMaterial
          color="#111A14"
          roughness={0.92}
          metalness={0.08}
          flatShading={false}
        />
      </mesh>

      {/* Evergreen Pine Canopies */}
      {treePositions.slice(0, 50).map((t, i) => (
        <group key={i} position={[t.x, t.y, t.z]} rotation={[0, t.rotY, 0]} scale={t.scale}>
          <mesh position={[0, 1.2, 0]}>
            <coneGeometry args={[1.2, 2.6, 5]} />
            <meshStandardMaterial color="#0B100D" roughness={0.98} />
          </mesh>
          <mesh position={[0, 2.6, 0]}>
            <coneGeometry args={[0.9, 2.2, 5]} />
            <meshStandardMaterial color="#17221A" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.8, 0]}>
            <coneGeometry args={[0.55, 1.8, 5]} />
            <meshStandardMaterial color="#315B40" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * VOLUMETRIC DRIFTING MIST & DUST MOTES
 * ════════════════════════════════════════════════════════════════════════════
 */
function AtmosphericMistPlanes() {
  const mistA = useRef();
  const mistB = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mistA.current) {
      mistA.current.position.x = Math.sin(t * 0.07) * 4.5;
      mistA.current.position.y = -3.5 + Math.sin(t * 0.12) * 0.4;
    }
    if (mistB.current) {
      mistB.current.position.x = Math.cos(t * 0.05) * 6;
      mistB.current.position.y = 1.5 + Math.cos(t * 0.1) * 0.5;
    }
  });

  return (
    <group>
      {/* Valley Mist */}
      <mesh ref={mistA} position={[0, -3.5, -16]} rotation={[-Math.PI / 2.3, 0, 0]}>
        <planeGeometry args={[100, 45]} />
        <meshBasicMaterial
          color="#1D2A21"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Horizon Ridge Mist */}
      <mesh ref={mistB} position={[0, 1.5, -30]} rotation={[-Math.PI / 2.35, 0, 0]}>
        <planeGeometry args={[130, 55]} />
        <meshBasicMaterial
          color="#111A14"
          transparent
          opacity={0.48}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Camera Parallax Rig with Pointer & GSAP Scroll Sync
 */
function CameraRig() {
  const camRef = useRef();

  useFrame(({ pointer }) => {
    if (camRef.current) {
      camRef.current.position.x = THREE.MathUtils.lerp(camRef.current.position.x, pointer.x * 2.6, 0.035);
      camRef.current.position.y = THREE.MathUtils.lerp(camRef.current.position.y, 4.4 + pointer.y * 1.6, 0.035);
      camRef.current.lookAt(0, 1.2, -15);
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (camRef.current && scrollY < 1200) {
        gsap.to(camRef.current.position, {
          z: 16 + scrollY * 0.008,
          duration: 0.4,
          ease: 'power1.out'
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <PerspectiveCamera
      ref={camRef}
      makeDefault
      position={[0, 4.4, 16]}
      fov={48}
      near={0.1}
      far={100}
    />
  );
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * EXPORT: HERO SCENE 3D
 * ════════════════════════════════════════════════════════════════════════════
 */
export default function HeroScene3D() {
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
        AUTHENTIC SEAMLESS HIGH-RESOLUTION ALPINE MOUNTAIN FALLBACK:
        Always active underneath, ensuring the hero NEVER renders as an empty black void.
      */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(11, 16, 13, 0.35) 0%, rgba(11, 16, 13, 0.65) 55%, #0B100D 100%),
            radial-gradient(ellipse at 50% 25%, rgba(49, 91, 64, 0.30) 0%, rgba(17, 26, 20, 0.75) 65%, #0B100D 100%),
            url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=85')
          `,
          opacity: 0.70
        }}
      />

      {/* 3D WebGL Scene */}
      {hasWebGL && (
        <div className="absolute inset-0 z-10">
          <Canvas
            shadows
            gl={{ 
              antialias: true, 
              alpha: true, 
              powerPreference: 'high-performance' 
            }}
            dpr={[1, 1.5]}
          >
            <color attach="background" args={['transparent']} />
            <fog attach="fog" args={['#0B100D', 14, 60]} />

            {/* Natural Alpine Mountain Lighting */}
            <ambientLight intensity={0.8} color="#A6B1A7" />
            <directionalLight
              position={[28, 38, 22]}
              intensity={2.6}
              color="#C4A77D"
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <pointLight position={[-20, 14, -8]} intensity={1.6} color="#315B40" />
            <pointLight position={[16, -2, 6]} intensity={0.9} color="#91B39A" />

            {/* Subtle Golden Dust Motes */}
            <Sparkles count={55} scale={25} size={2.2} speed={0.35} color="#C4A77D" opacity={0.5} />
            <Sparkles count={35} scale={20} size={1.8} speed={0.25} color="#91B39A" opacity={0.4} />

            <CameraRig />
            <Suspense fallback={null}>
              <DistantAlpineRange />
              <MidgroundValleySlope />
              <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.3}>
                <AtmosphericMistPlanes />
              </Float>
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Radial Vignette & Smooth Contrast Gradients for Content Readability */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, transparent 28%, rgba(11, 16, 13, 0.72) 78%, #0B100D 100%)'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 h-44 z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #0B100D 20%, transparent 100%)'
        }}
      />
    </div>
  );
}
