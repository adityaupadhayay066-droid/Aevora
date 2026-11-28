import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Procedural Alpine Mountain Ridge
 * Generates layered alpine crests with natural displacement and slope shading.
 */
function AlpineMountainRidge() {
  const meshRef = useRef();

  const { geometry } = useMemo(() => {
    const geom = new THREE.PlaneGeometry(160, 80, 70, 50);
    geom.rotateX(-Math.PI / 2.3);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Multi-frequency harmonic noise for natural craggy peaks
      const d1 = Math.sin(x * 0.045) * Math.cos(y * 0.055) * 11;
      const d2 = Math.sin(x * 0.09 + 1.2) * Math.sin(y * 0.11) * 5.5;
      const d3 = Math.cos(x * 0.22) * 2.2;
      const ridge = Math.abs(d1 + d2 + d3);

      // Taper down at foreground edges
      const edgeFalloff = Math.sin((y + 40) / 80 * Math.PI);
      pos.setZ(i, ridge * Math.max(0, edgeFalloff));
    }

    geom.computeVertexNormals();
    return { geometry: geom };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Ultra-subtle environmental breathing
    meshRef.current.position.y = -6 + Math.sin(state.clock.elapsedTime * 0.25) * 0.2;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -6, -30]}>
      <meshStandardMaterial
        color="#111A14"
        roughness={0.88}
        metalness={0.12}
        flatShading={true}
      />
    </mesh>
  );
}

/**
 * Midground Forest Canopy Layer
 */
function MidgroundForestCanopy() {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(140, 50, 50, 30);
    geom.rotateX(-Math.PI / 2.45);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const treeNoise = (Math.sin(x * 0.3) + Math.cos(x * 0.6 + 0.5)) * 2.5;
      pos.setZ(i, Math.max(0, treeNoise));
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -10, -18]}>
      <meshStandardMaterial
        color="#0E1611"
        roughness={0.95}
        metalness={0.05}
        flatShading={true}
      />
    </mesh>
  );
}

/**
 * Drifting Atmospheric Mist / Volumetric Fog Planes
 */
function AtmosphericMist() {
  const mist1 = useRef();
  const mist2 = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (mist1.current) {
      mist1.current.position.x = Math.sin(t * 0.08) * 4;
      mist1.current.material.opacity = 0.16 + Math.sin(t * 0.2) * 0.04;
    }
    if (mist2.current) {
      mist2.current.position.x = Math.cos(t * 0.06) * 5;
      mist2.current.material.opacity = 0.12 + Math.cos(t * 0.18) * 0.03;
    }
  });

  return (
    <group position={[0, -2, -15]}>
      <mesh ref={mist1} position={[0, 1, 0]}>
        <planeGeometry args={[110, 22]} />
        <meshBasicMaterial
          color="#91B39A"
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={mist2} position={[0, -2, 5]}>
        <planeGeometry args={[130, 26]} />
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
 * Camera Parallax Rig responding gently to mouse movement
 */
function CameraRig() {
  useFrame((state) => {
    const { pointer, camera } = state;
    // Gentle mouse parallax lerping (clamped to prevent jarring angles)
    const targetX = pointer.x * 2.2;
    const targetY = pointer.y * 1.2;

    camera.position.x += (targetX - camera.position.x) * 0.035;
    camera.position.y += (targetY - camera.position.y) * 0.035;
    camera.lookAt(0, 0, -25);
  });

  return null;
}

export default function TravelHeroScene() {
  const [webGlAvailable, setWebGlAvailable] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Detect WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGlAvailable(false);
    } catch (_e) {
      setWebGlAvailable(false);
    }

    // Detect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none bg-[#0B100D]">
      {/* 1. High-Resolution Photographic Alpine Mountain Fallback & Depth Backing Layer */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=85')`,
          opacity: 0.38,
          filter: 'saturate(0.85) brightness(0.65)'
        }}
        aria-hidden="true"
      />

      {/* 2. Interactive 3D WebGL Mountain Scene (Rendered if supported & motion allowed) */}
      {webGlAvailable && !prefersReducedMotion && (
        <div className="absolute inset-0 w-full h-full pointer-events-auto">
          <Canvas
            camera={{ position: [0, 1.5, 12], fov: 48, near: 0.1, far: 200 }}
            dpr={[1, 1.5]}
            gl={{ 
              antialias: true, 
              alpha: true,
              powerPreference: 'high-performance',
              stencil: false,
              depth: true
            }}
          >
            {/* Natural Alpine Lighting */}
            <ambientLight intensity={0.55} color="#A6B1A7" />
            
            {/* Warm Golden-Hour Rim Light */}
            <directionalLight
              position={[25, 18, 12]}
              intensity={1.8}
              color="#C4A77D"
            />

            {/* Cool Alpine Fill Light */}
            <directionalLight
              position={[-20, 10, -5]}
              intensity={0.65}
              color="#91B39A"
            />

            {/* Distant Star Motes */}
            <Stars radius={50} depth={30} count={600} factor={2} saturation={0.1} fade speed={0.4} />

            <CameraRig />
            <Suspense fallback={null}>
              <AlpineMountainRidge />
              <MidgroundForestCanopy />
              <AtmosphericMist />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* 3. Contrast & Vignette Overlays ensuring white/cream text readability */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, transparent 25%, rgba(11, 16, 13, 0.72) 75%, #0B100D 100%)'
        }}
      />
      
      {/* Bottom fade into the destination discovery section */}
      <div 
        className="absolute bottom-0 inset-x-0 h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #0B100D 30%, transparent 100%)'
        }}
      />
    </div>
  );
}
