import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Train, Plane, Bus, ArrowRight, ShieldCheck, Sparkles, Navigation } from 'lucide-react';

// Real Indian Transit Coordinates for Multi-Modal Hubs
const HUBS = [
  { id: 'DEL', name: 'New Delhi (NDLS)', lat: 28.6139, lon: 77.2090, type: 'Rail/Air Hub' },
  { id: 'BOM', name: 'Mumbai (CSMT/BCT)', lat: 18.9400, lon: 72.8353, type: 'Coastal Rail/Air' },
  { id: 'BLR', name: 'Bengaluru (SBC/SMVB)', lat: 12.9780, lon: 77.5683, type: 'Tech & High-Speed Rail' },
  { id: 'TATA', name: 'Tatanagar (TATA)', lat: 22.7719, lon: 86.2029, type: 'Industrial Rail Junction' },
  { id: 'CCU', name: 'Kolkata (HWH/SDAH)', lat: 22.5839, lon: 88.3426, type: 'Eastern Rail Gateway' },
  { id: 'GOI', name: 'Goa (Madgaon/MAO)', lat: 15.2736, lon: 73.9580, type: 'Coastal & Ro-Pax Hub' },
  { id: 'BSB', name: 'Varanasi (BSB/DDU)', lat: 25.3283, lon: 82.9866, type: 'Heritage Vande Bharat' }
];

const CORRIDORS = [
  { from: 'DEL', to: 'BOM', name: 'Delhi – Mumbai Corridor', mode: 'Tejas Rajdhani / Air', dist: '1,384 km', dur: '15h 32m', fare: '₹2,410' },
  { from: 'TATA', to: 'BLR', name: 'Tatanagar – Bengaluru', mode: 'TATA SMVB SF Express', dist: '1,880 km', dur: '33h 30m', fare: '₹785' },
  { from: 'BLR', to: 'GOI', name: 'Bengaluru – Goa Escape', mode: 'Rail + Coastal Bus', dist: '560 km', dur: '11h 15m', fare: '₹950' },
  { from: 'DEL', to: 'BSB', name: 'Vande Bharat Express', mode: 'High-Speed Vande Bharat', dist: '755 km', dur: '8h 00m', fare: '₹1,750' },
  { from: 'CCU', to: 'DEL', name: 'Howrah – Delhi Corridor', mode: 'Kolkata Rajdhani', dist: '1,447 km', dur: '17h 05m', fare: '₹2,530' }
];

const GLOBE_RADIUS = 3.6;

const latLonToVector3 = (lat, lon, radius = GLOBE_RADIUS) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  return new THREE.Vector3(x, y, z);
};

// Animated pulse particle moving along corridor curve
function TransitPulse({ curve, color = '#C4A77D', speed = 0.35 }) {
  const meshRef = useRef();
  const progress = useRef(Math.random());

  useFrame((_, delta) => {
    progress.current += delta * speed;
    if (progress.current > 1) progress.current = 0;
    if (meshRef.current) {
      const pos = curve.getPoint(progress.current);
      meshRef.current.position.copy(pos);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// 3D Corridor Arcs connecting Indian transit hubs
function CorridorArc({ start, end, active }) {
  const curve = useMemo(() => {
    const v1 = latLonToVector3(start.lat, start.lon);
    const v2 = latLonToVector3(end.lat, end.lon);
    const mid = v1.clone().lerp(v2, 0.5);
    const dist = v1.distanceTo(v2);
    mid.normalize().multiplyScalar(GLOBE_RADIUS + dist * 0.28);
    return new THREE.QuadraticBezierCurve3(v1, mid, v2);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(40), [curve]);

  return (
    <group>
      <Line
        points={points}
        color={active ? '#C4A77D' : '#315B40'}
        lineWidth={active ? 2.5 : 1.5}
        transparent
        opacity={active ? 0.9 : 0.5}
      />
      <TransitPulse curve={curve} color={active ? '#C4A77D' : '#91B39A'} speed={active ? 0.45 : 0.25} />
    </group>
  );
}

// Rotating Holographic Transit Globe
function TransitGlobe({ activeIndex }) {
  const globeRef = useRef();

  // Subtle auto-rotation around Indian subcontinent
  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.08;
    }
  });

  // Dotted particle field representing regional topography
  const gridPositions = useMemo(() => {
    const pts = [];
    for (let lat = 8; lat <= 36; lat += 2.0) {
      for (let lon = 68; lon <= 96; lon += 2.0) {
        pts.push(latLonToVector3(lat, lon, GLOBE_RADIUS));
      }
    }
    const arr = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => {
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    });
    return arr;
  }, []);

  return (
    <group ref={globeRef} rotation={[0.3, -1.8, 0]}>
      {/* Dark Luxury Glass Globe Sphere */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 36, 36]} />
        <meshStandardMaterial
          color="#111A14"
          roughness={0.7}
          metalness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Indian Subcontinent Dotted Matrix */}
      <Points positions={gridPositions}>
        <PointMaterial color="#315B40" size={0.035} transparent opacity={0.65} sizeAttenuation />
      </Points>

      {/* Station Hub Pins */}
      {HUBS.map((hub) => {
        const pos = latLonToVector3(hub.lat, hub.lon, GLOBE_RADIUS + 0.04);
        return (
          <group key={hub.id} position={pos}>
            <mesh>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshBasicMaterial color="#C4A77D" />
            </mesh>
          </group>
        );
      })}

      {/* Multi-Modal Transit Arcs */}
      {CORRIDORS.map((c, i) => {
        const start = HUBS.find(h => h.id === c.from);
        const end = HUBS.find(h => h.id === c.to);
        if (!start || !end) return null;
        return (
          <CorridorArc
            key={i}
            start={start}
            end={end}
            active={i === activeIndex}
          />
        );
      })}
    </group>
  );
}

/**
 * Interactive Corridor Telemetry & 3D Route Preview Component
 */
export default function RouteCorridor3D() {
  const [activeCorridor, setActiveCorridor] = useState(1); // Default to Tatanagar -> Bengaluru
  const current = CORRIDORS[activeCorridor];

  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#111A14]/80 backdrop-blur-xl p-6 sm:p-8 overflow-hidden shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: 3D Interactive Canvas */}
        <div className="lg:col-span-7 h-[360px] sm:h-[440px] relative rounded-2xl bg-[#0B100D]/90 border border-white/5 overflow-hidden">
          <Canvas
            camera={{ position: [0, 0, 8.5], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 1.5]}
          >
            <ambientLight intensity={0.8} color="#91B39A" />
            <directionalLight position={[10, 15, 10]} intensity={1.8} color="#C4A77D" />
            <pointLight position={[-10, -5, -5]} intensity={0.6} color="#315B40" />

            <TransitGlobe activeIndex={activeCorridor} />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
          </Canvas>

          {/* Overlay Status Badge */}
          <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#17221A]/85 border border-white/10 text-xs text-[#91B39A] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#C4A77D] animate-ping" />
            <span>Multi-Modal Telemetry Engine</span>
          </div>

          <div className="absolute bottom-4 right-4 text-[10px] text-[#A6B1A7] bg-[#111A14]/80 px-2.5 py-1 rounded-md border border-white/5">
            Drag to inspect transit arcs
          </div>
        </div>

        {/* Right: Real-time Telemetry & Corridor Selector */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C4A77D] tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Algorithmic Corridor Discovery</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F1F3ED] mt-1 font-heading">
              {current.name}
            </h3>
            <p className="text-xs text-[#A6B1A7] mt-1 font-sans">
              Live multi-station transit calculations with verified railway timetables, seat quotas, and connecting road transfers.
            </p>
          </div>

          {/* Active Corridor Telemetry Glass Card */}
          <div className="p-4 rounded-xl bg-[#17221A] border border-white/10 space-y-3 shadow-lg">
            <div className="grid grid-cols-3 gap-2 text-center border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6F8D76] block">Distance</span>
                <span className="text-sm sm:text-base font-extrabold text-[#F1F3ED] font-heading">{current.dist}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6F8D76] block">Duration</span>
                <span className="text-sm sm:text-base font-extrabold text-[#F1F3ED] font-heading">{current.dur}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6F8D76] block">Starting At</span>
                <span className="text-sm sm:text-base font-extrabold text-[#C4A77D] font-heading">{current.fare}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#91B39A]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#315B40]" />
                <span className="font-semibold">{current.mode}</span>
              </span>
              <span className="text-[11px] text-[#A6B1A7] bg-[#111A14] px-2 py-0.5 rounded border border-white/5">
                IRCTC Telescopic
              </span>
            </div>
          </div>

          {/* Corridor Selection Pills */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F8D76]">Select Route Corridor</span>
            <div className="space-y-1.5">
              {CORRIDORS.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCorridor(idx)}
                  className={`w-full p-2.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${
                    activeCorridor === idx
                      ? 'bg-[#1D2A21] border-[#C4A77D]/40 text-[#F1F3ED] font-bold shadow-md'
                      : 'bg-[#17221A]/60 border-white/5 text-[#A6B1A7] hover:bg-[#17221A] hover:text-[#F1F3ED]'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[#C4A77D] font-mono">{c.fare}</span>
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${activeCorridor === idx ? 'text-[#C4A77D] translate-x-0.5' : 'text-[#6F8D76]'}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
