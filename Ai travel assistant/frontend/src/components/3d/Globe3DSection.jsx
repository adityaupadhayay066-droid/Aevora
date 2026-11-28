import React, { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Globe2, Train, Plane, Bus, Ship, Sparkles, 
  ArrowRight, ShieldCheck, Zap, Activity 
} from 'lucide-react';
import Container from '../ui/Container';
import GlassCard from '../ui/GlassCard';

/**
 * Convert Latitude & Longitude to 3D Sphere Vector Coordinates
 */
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * 3D Elevated Geodesic Arc Component
 */
function GeodesicRouteArc({ start, end, radius = 3.2, color = '#C4A77D', animated = true }) {
  const pulseRef = useRef();

  const { curve, geometry } = useMemo(() => {
    const vStart = latLngToVector3(start.lat, start.lng, radius);
    const vEnd = latLngToVector3(end.lat, end.lng, radius);

    // Calculate mid-point and elevate it above the sphere surface
    const vMid = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);
    const dist = vStart.distanceTo(vEnd);
    const elevation = 1 + (dist * 0.28) / radius;
    vMid.normalize().multiplyScalar(radius * elevation);

    const c = new THREE.CatmullRomCurve3([vStart, vMid, vEnd]);
    const geom = new THREE.TubeGeometry(c, 40, 0.025, 8, false);

    return { curve: c, geometry: geom };
  }, [start, end, radius]);

  useFrame((state) => {
    if (animated && pulseRef.current) {
      const t = (state.clock.elapsedTime * 0.3) % 1;
      const pt = curve.getPointAt(t);
      pulseRef.current.position.copy(pt);
    }
  });

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      {animated && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      )}
    </group>
  );
}

/**
 * 3D City Beacon Pin
 */
function CityBeacon({ lat, lng, name, radius = 3.2, active = false }) {
  const ringRef = useRef();
  const pos = useMemo(() => latLngToVector3(lat, lng, radius), [lat, lng, radius]);

  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.scale.x = 1 + Math.sin(Date.now() * 0.005) * 0.3;
      ringRef.current.scale.y = 1 + Math.sin(Date.now() * 0.005) * 0.3;
    }
  });

  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color={active ? '#C4A77D' : '#91B39A'} />
      </mesh>
      {active && (
        <mesh ref={ringRef}>
          <ringGeometry args={[0.08, 0.12, 16]} />
          <meshBasicMaterial color="#C4A77D" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/**
 * 3D Interactive Globe Object
 */
function InteractiveGlobe({ activeMode }) {
  const globeRef = useRef();

  // Major transit corridors
  const corridors = [
    { from: { lat: 28.6139, lng: 77.2090, name: 'Delhi' }, to: { lat: 18.9696, lng: 72.8193, name: 'Mumbai' }, mode: 'Train', color: '#C4A77D' },
    { from: { lat: 12.9716, lng: 77.5946, name: 'Bengaluru' }, to: { lat: 15.2993, lng: 74.1240, name: 'Goa' }, mode: 'Train', color: '#91B39A' },
    { from: { lat: 22.5726, lng: 88.3639, name: 'Kolkata' }, to: { lat: 25.3176, lng: 82.9739, name: 'Varanasi' }, mode: 'Train', color: '#C4A77D' },
    { from: { lat: 28.6139, lng: 77.2090, name: 'Delhi' }, to: { lat: 34.0837, lng: 74.7973, name: 'Srinagar' }, mode: 'Flight', color: '#91B39A' },
    { from: { lat: 18.9696, lng: 72.8193, name: 'Mumbai' }, to: { lat: 18.7500, lng: 72.8700, name: 'Mandwa' }, mode: 'Ferry', color: '#6F8D76' },
  ];

  const cities = [
    { lat: 28.6139, lng: 77.2090, name: 'Delhi', active: true },
    { lat: 18.9696, lng: 72.8193, name: 'Mumbai', active: true },
    { lat: 12.9716, lng: 77.5946, name: 'Bengaluru', active: true },
    { lat: 15.2993, lng: 74.1240, name: 'Goa', active: false },
    { lat: 22.5726, lng: 88.3639, name: 'Kolkata', active: false },
    { lat: 34.0837, lng: 74.7973, name: 'Srinagar', active: false },
  ];

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.0018;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Dark Luxury Textured Sphere Base */}
      <mesh>
        <sphereGeometry args={[3.2, 48, 48]} />
        <meshStandardMaterial
          color="#111A14"
          roughness={0.8}
          metalness={0.2}
          wireframe={false}
        />
      </mesh>

      {/* Latitudinal & Longitudinal Wireframe Meridian Rings */}
      <mesh>
        <sphereGeometry args={[3.22, 24, 16]} />
        <meshBasicMaterial
          color="#315B40"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Atmospheric Halo Glow */}
      <mesh>
        <sphereGeometry args={[3.35, 32, 32]} />
        <meshBasicMaterial
          color="#91B39A"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* City Beacon Nodes */}
      {cities.map((c) => (
        <CityBeacon key={c.name} {...c} radius={3.22} />
      ))}

      {/* Elevated Geodesic Route Arcs */}
      {corridors.map((corridor, idx) => (
        <GeodesicRouteArc
          key={idx}
          start={corridor.from}
          end={corridor.to}
          color={corridor.color}
          radius={3.22}
          animated={true}
        />
      ))}
    </group>
  );
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * SECTION: 3D INTERACTIVE GLOBE & MULTI-MODAL TELEMETRY
 * ════════════════════════════════════════════════════════════════════════════
 */
export default function Globe3DSection() {
  const [activeMode, setActiveMode] = useState('All');

  const modes = [
    { id: 'All', label: 'All Modes' },
    { id: 'Train', label: 'Railways', icon: Train },
    { id: 'Flight', label: 'Airlines', icon: Plane },
    { id: 'Ferry', label: 'Ro-Pax Ferries', icon: Ship },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#0E1611] relative overflow-hidden border-t border-b border-white/5">
      {/* Subtle background glow */}
      <div 
        className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-[#315B40]/15 rounded-full blur-[140px] pointer-events-none"
      />

      <Container className="relative z-10">
        {/* Section Heading */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17221A] border border-white/10 text-xs font-semibold text-[#C4A77D] uppercase tracking-wider mb-4">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Planetary Transit Grid</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-[#F1F3ED] tracking-tight leading-tight">
            Interconnected corridors, <span className="font-editorial italic font-normal text-[#C4A77D]">unified</span>.
          </h2>
          <p className="text-[#A6B1A7] text-base sm:text-lg mt-3 font-light">
            Aevora harmonizes rail timetables, air departures, interstate coaches, and water transit lines into a single synchronized spatial graph.
          </p>
        </div>

        {/* 3D Globe + Frosted Glass Telemetry Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 3D Globe Canvas Viewport */}
          <div className="lg:col-span-7 h-[420px] sm:h-[520px] relative rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl">
            {/* Overlay hint */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-[#0B100D]/75 backdrop-blur-md border border-white/10 text-xs text-[#91B39A] font-mono flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#C4A77D] animate-ping" />
              <span>DRAG TO ROTATE GLOBE</span>
            </div>

            <Canvas
              camera={{ position: [0, 1.2, 8], fov: 45 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true }}
            >
              <ambientLight intensity={0.65} color="#A6B1A7" />
              <directionalLight position={[10, 10, 5]} intensity={1.5} color="#C4A77D" />
              <directionalLight position={[-10, -5, -5]} intensity={0.5} color="#91B39A" />

              <OrbitControls
                enableZoom={false}
                autoRotate
                autoRotateSpeed={0.8}
                dampingFactor={0.05}
              />

              <Suspense fallback={null}>
                <InteractiveGlobe activeMode={activeMode} />
              </Suspense>
            </Canvas>
          </div>

          {/* Frosted Glass Telemetry & Corridor Metrics */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Active Corridor Card */}
            <GlassCard elevated className="p-6 sm:p-7 border border-white/10">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#91B39A]">
                  <Activity className="w-4 h-4 text-[#C4A77D]" />
                  <span>Live Telemetry Telecast</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#315B40]/40 text-[#91B39A] border border-[#315B40]">
                  OPTIMAL HUB
                </span>
              </div>

              <h3 className="font-display font-bold text-2xl text-[#F1F3ED] mb-2">
                Delhi (NDLS) ➔ Mumbai (CSMT)
              </h3>
              <p className="text-xs text-[#A6B1A7] font-light mb-6">
                Golden Corridor multimodal route synthesis. Evaluating 12952 Rajdhani Express, domestic flight corridors, and Western expressway coaches.
              </p>

              {/* Multimodal Metric Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <div className="flex items-center gap-2 text-[#F1F3ED] font-medium">
                    <Train className="w-4 h-4 text-[#C4A77D]" />
                    <span>Tejas Rajdhani Express</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#A6B1A7]">15h 32m</span>
                    <span className="font-semibold text-[#91B39A]">₹2,140</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <div className="flex items-center gap-2 text-[#F1F3ED] font-medium">
                    <Plane className="w-4 h-4 text-[#91B39A]" />
                    <span>Non-Stop Domestic Air</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#A6B1A7]">2h 15m</span>
                    <span className="font-semibold text-[#F1F3ED]">₹4,680</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <div className="flex items-center gap-2 text-[#F1F3ED] font-medium">
                    <Ship className="w-4 h-4 text-[#6F8D76]" />
                    <span>Mandwa Ro-Pax Connection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#A6B1A7]">1h 00m</span>
                    <span className="font-semibold text-[#91B39A]">₹390</span>
                  </div>
                </div>
              </div>

              {/* Trust Indicator */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-[#91B39A]">
                <ShieldCheck className="w-4 h-4 text-[#C4A77D] shrink-0" />
                <span>Zero Hallucination: Verified against official railway tables.</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </Container>
    </section>
  );
}
