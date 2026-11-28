import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 1. MASSIVE GRANITE PEAKS & VALLEY FORMATIONS
 * Generates realistic craggy granite rock faces and alpine slopes
 * ════════════════════════════════════════════════════════════════════════════
 */
function GraniteMountainPeaks() {
  const meshRef = useRef();

  const { geometry } = useMemo(() => {
    const width = 170;
    const height = 95;
    const geom = new THREE.PlaneGeometry(width, height, 90, 60);
    geom.rotateX(-Math.PI / 2.38);

    const pos = geom.attributes.position;
    const colors = [];
    const color = new THREE.Color();

    // Natural stone, forest and snow color tokens
    const cDeepShadow = new THREE.Color('#0B100D');
    const cPineSlope = new THREE.Color('#142219');
    const cForestMid = new THREE.Color('#1D3325');
    const cGraniteRock = new THREE.Color('#3A4B3F');
    const cSunlitRim = new THREE.Color('#C4A77D');

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Multi-frequency harmonic terrain synthesis (peaks, ridges, valleys)
      const p1 = Math.sin(x * 0.042) * Math.cos(y * 0.052) * 12.5;
      const p2 = Math.sin(x * 0.095 + 1.4) * Math.sin(y * 0.11) * 6.2;
      const p3 = Math.cos(x * 0.19) * Math.sin(y * 0.22) * 2.8;
      const p4 = Math.sin(x * 0.4) * 0.9;
      const mountain = Math.max(0, p1 + p2 + p3 + p4);

      // Carve a deep central glacial valley pass (like Yosemite)
      const valleyTrough = Math.min(1, Math.pow(Math.abs(x) * 0.035, 1.3));
      const elevation = mountain * (0.28 + valleyTrough * 0.72);

      pos.setZ(i, elevation);

      // Natural elevation-based shading
      const normH = Math.min(1, Math.max(0, elevation / 18));
      if (normH < 0.22) {
        color.lerpColors(cDeepShadow, cPineSlope, normH / 0.22);
      } else if (normH < 0.55) {
        color.lerpColors(cPineSlope, cForestMid, (normH - 0.22) / 0.33);
      } else if (normH < 0.82) {
        color.lerpColors(cForestMid, cGraniteRock, (normH - 0.55) / 0.27);
      } else {
        color.lerpColors(cGraniteRock, cSunlitRim, (normH - 0.82) / 0.18);
      }

      colors.push(color.r, color.g, color.b);
    }

    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.computeVertexNormals();
    return { geometry: geom };
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -6.5, -28]}>
      <meshStandardMaterial
        vertexColors
        roughness={0.86}
        metalness={0.14}
        flatShading={true}
      />
    </mesh>
  );
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 2. FOREGROUND PINE FOREST SILHOUETTE
 * Creates the organic tree-canopy frame along the bottom of the viewport
 * ════════════════════════════════════════════════════════════════════════════
 */
function ForegroundPineCanopy() {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(130, 36, 60, 20);
    geom.rotateX(-Math.PI / 2.45);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const pinePeaks = (Math.sin(x * 0.45) + Math.cos(x * 0.9 + 0.8) + Math.sin(x * 1.8) * 0.5) * 2.2;
      pos.setZ(i, Math.max(0, pinePeaks));
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -10.5, -16]}>
      <meshStandardMaterial
        color="#080F0B"
        roughness={0.98}
        metalness={0.02}
        flatShading={true}
      />
    </mesh>
  );
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 3. GLOWING 3D MOUNTAIN ROUTE TRAIL (SENTINEL DOME CORRIDOR)
 * Weaves along the mountain slope with glowing waypoints & transit light
 * ════════════════════════════════════════════════════════════════════════════
 */
function MountainRouteTrail() {
  const pulseRef = useRef();
  const ringRef1 = useRef();
  const ringRef2 = useRef();

  // 3D spline trail ascending the valley ridge
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-26, -5.0, -18),
      new THREE.Vector3(-14, -1.8, -15),
      new THREE.Vector3(-2, 1.2, -13),
      new THREE.Vector3(8, -0.6, -11),
      new THREE.Vector3(19, 2.6, -14),
      new THREE.Vector3(28, 0.4, -19),
    ]);
  }, []);

  const tubeGeom = useMemo(() => {
    return new THREE.TubeGeometry(curve, 80, 0.10, 8, false);
  }, [curve]);

  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.14) % 1;
    if (pulseRef.current) {
      const pt = curve.getPointAt(t);
      pulseRef.current.position.copy(pt);
    }
    if (ringRef1.current) ringRef1.current.rotation.z += 0.02;
    if (ringRef2.current) ringRef2.current.rotation.z -= 0.018;
  });

  return (
    <group position={[0, -5.5, -24]}>
      {/* Golden Glowing Trail Line */}
      <mesh geometry={tubeGeom}>
        <meshBasicMaterial color="#C4A77D" transparent opacity={0.85} />
      </mesh>

      {/* Moving Transit Light Pulse */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
        <pointLight color="#C4A77D" intensity={2.6} distance={9} />
      </mesh>

      {/* Waypoint 1: Valley Portal Beacon */}
      <group position={[-26, -5.0, -18]}>
        <mesh>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshBasicMaterial color="#91B39A" />
        </mesh>
        <mesh ref={ringRef1} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.75, 24]} />
          <meshBasicMaterial color="#91B39A" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Waypoint 2: Summit Sanctuary Beacon */}
      <group position={[28, 0.4, -19]}>
        <mesh>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color="#C4A77D" />
        </mesh>
        <mesh ref={ringRef2} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.85, 24]} />
          <meshBasicMaterial color="#C4A77D" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 4. DISTANT HIGH-ALTITUDE AIRCRAFT & CONTRAIL
 * Gently glides across the distant upper alpine sky
 * ════════════════════════════════════════════════════════════════════════════
 */
function DistantAircraft() {
  const planeRef = useRef();

  useFrame((state) => {
    if (!planeRef.current) return;
    const t = state.clock.elapsedTime * 0.08;
    // Slow left-to-right traverse high in the sky
    const x = -40 + ((t * 12) % 90);
    const y = 14 + Math.sin(t * 0.4) * 0.6;
    planeRef.current.position.set(x, y, -42);
  });

  return (
    <group ref={planeRef}>
      {/* Aircraft Fuselage */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.15, 0.08, 2.2, 8]} />
        <meshBasicMaterial color="#F1F3ED" />
      </mesh>
      {/* Wings */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.2, 0.04, 0.5]} />
        <meshBasicMaterial color="#F1F3ED" />
      </mesh>
      {/* Faint Contrail */}
      <mesh position={[-3.5, 0, 0]}>
        <boxGeometry args={[6.5, 0.08, 0.15]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 5. DISTANT SOARING MOUNTAIN BIRDS
 * Gliding in circular thermals over the valley
 * ════════════════════════════════════════════════════════════════════════════
 */
function SoaringBirds() {
  const birdsGroup = useRef();

  useFrame((state) => {
    if (!birdsGroup.current) return;
    const t = state.clock.elapsedTime * 0.25;
    // Circular thermal drift
    birdsGroup.current.position.x = 8 + Math.cos(t) * 10;
    birdsGroup.current.position.z = -32 + Math.sin(t) * 6;
    birdsGroup.current.position.y = 8 + Math.sin(t * 0.5) * 1.5;
    birdsGroup.current.rotation.y = -t + Math.PI / 2;
  });

  return (
    <group ref={birdsGroup}>
      {/* Bird 1 */}
      <mesh position={[0, 0, 0]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.8, 0.04, 0.2]} />
        <meshBasicMaterial color="#223326" />
      </mesh>
      {/* Bird 2 */}
      <mesh position={[1.4, 0.3, -1.2]} rotation={[0.08, 0.1, 0]}>
        <boxGeometry args={[0.6, 0.04, 0.18]} />
        <meshBasicMaterial color="#223326" />
      </mesh>
      {/* Bird 3 */}
      <mesh position={[-1.2, -0.2, -0.8]} rotation={[0.12, -0.1, 0]}>
        <boxGeometry args={[0.65, 0.04, 0.18]} />
        <meshBasicMaterial color="#223326" />
      </mesh>
    </group>
  );
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 6. MULTI-LAYER DRIFTING VALLEY MIST & ATMOSPHERIC FOG
 * ════════════════════════════════════════════════════════════════════════════
 */
function ValleyFogLayers() {
  const fog1 = useRef();
  const fog2 = useRef();
  const fog3 = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (fog1.current) {
      fog1.current.position.x = Math.sin(t * 0.06) * 5;
      fog1.current.material.opacity = 0.16 + Math.sin(t * 0.18) * 0.04;
    }
    if (fog2.current) {
      fog2.current.position.x = Math.cos(t * 0.04) * 6;
      fog2.current.material.opacity = 0.13 + Math.cos(t * 0.14) * 0.03;
    }
    if (fog3.current) {
      fog3.current.position.x = -Math.sin(t * 0.05) * 4;
      fog3.current.material.opacity = 0.10 + Math.sin(t * 0.12) * 0.03;
    }
  });

  return (
    <group position={[0, -4.5, -22]}>
      {/* Mid-valley alpine mist */}
      <mesh ref={fog1} position={[0, 2.5, 0]}>
        <planeGeometry args={[130, 26]} />
        <meshBasicMaterial
          color="#91B39A"
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Lower evergreen valley fog */}
      <mesh ref={fog2} position={[0, -1.8, 5]}>
        <planeGeometry args={[150, 30]} />
        <meshBasicMaterial
          color="#315B40"
          transparent
          opacity={0.13}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Sunlit golden mountain pass haze */}
      <mesh ref={fog3} position={[15, 6, -6]}>
        <planeGeometry args={[90, 24]} />
        <meshBasicMaterial
          color="#C4A77D"
          transparent
          opacity={0.10}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 7. CINEMATIC CAMERA CHOREOGRAPHY WITH PARALLAX & DOLLY
 * ════════════════════════════════════════════════════════════════════════════
 */
function CinematicCameraRig() {
  useFrame((state) => {
    const { pointer, camera, clock } = state;
    const t = clock.elapsedTime;

    // Slow cinematic forward breathing dolly
    const baseZ = 10.5 - Math.sin(t * 0.06) * 0.8;

    // Smooth weighted mouse parallax lerp
    const targetX = pointer.x * 2.8;
    const targetY = 1.2 + pointer.y * 1.2;

    camera.position.x += (targetX - camera.position.x) * 0.028;
    camera.position.y += (targetY - camera.position.y) * 0.028;
    camera.position.z += (baseZ - camera.position.z) * 0.025;

    camera.lookAt(0, -1.8, -26);
  });

  return null;
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * MAIN 3D SCENE EXPORT: TravelHeroScene
 * Combines 3D WebGL geometry, volumetric lighting, atmospheric haze,
 * and high-resolution Yosemite-inspired backing depth.
 * ════════════════════════════════════════════════════════════════════════════
 */
export default function TravelHeroScene({ bgImage }) {
  const [webGlAvailable, setWebGlAvailable] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Default to stunning high-resolution Yosemite Valley daylight panorama
  const activeBg = bgImage || 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=2560&q=90';

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
      {/* 1. High-Resolution Yosemite Valley Photographic Depth Backing Layer (Crisp Daylight Atmosphere) */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000 scale-105"
        style={{
          backgroundImage: `url('${activeBg}')`,
          opacity: 0.88,
          filter: 'saturate(1.05) brightness(0.92)'
        }}
        aria-hidden="true"
      />

      {/* 2. Interactive 3D WebGL Canvas Viewport */}
      {webGlAvailable && !reducedMotion && (
        <div className="absolute inset-0 w-full h-full pointer-events-auto">
          <Canvas
            camera={{ position: [0, 1.2, 10.5], fov: 46, near: 0.1, far: 220 }}
            dpr={[1, 1.5]}
            gl={{ 
              antialias: true, 
              alpha: true,
              powerPreference: 'high-performance',
              stencil: false,
              depth: true
            }}
          >
            {/* Gentle atmospheric depth fog */}
            <fog attach="fog" args={['#0B100D', 24, 75]} />

            {/* Natural Alpine Daylight Ambient Lighting */}
            <ambientLight intensity={0.75} color="#E6F0E8" />

            {/* Warm Golden Sunlight Passing Between Mountain Clouds */}
            <directionalLight
              position={[28, 24, 16]}
              intensity={2.6}
              color="#FFF2D6"
            />

            {/* Cool Alpine Fill Light */}
            <directionalLight
              position={[-22, 14, -8]}
              intensity={0.9}
              color="#B8D5C2"
            />

            <CinematicCameraRig />

            <Suspense fallback={null}>
              <GraniteMountainPeaks />
              <ForegroundPineCanopy />
              <MountainRouteTrail />
              <DistantAircraft />
              <SoaringBirds />
              <ValleyFogLayers />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* 3. Soft Subtle Vignette (preserves bright mountain and daylight sky clarity) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, transparent 40%, rgba(11, 16, 13, 0.45) 80%, rgba(11, 16, 13, 0.8) 100%)'
        }}
      />
      <div 
        className="absolute bottom-0 inset-x-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #0B100D 20%, rgba(11, 16, 13, 0.4) 60%, transparent 100%)'
        }}
      />
    </div>
  );
}
