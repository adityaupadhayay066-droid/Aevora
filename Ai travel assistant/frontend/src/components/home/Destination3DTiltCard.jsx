import React, { useRef, useState } from 'react';
import { ArrowUpRight, MapPin, Train, Plane, Sparkles } from 'lucide-react';

export default function Destination3DTiltCard({ destination, onSelect }) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-10deg to +10deg)
    const rX = -((y - centerY) / centerY) * 8.5;
    const rY = ((x - centerX) / centerX) * 8.5;

    setRotateX(rX);
    setRotateY(rY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect && onSelect(destination)}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`,
        transition: rotateX === 0 ? 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.08s ease-out',
      }}
      className="group relative rounded-3xl overflow-hidden glass-card border border-white/10 hover:border-[#91B39A]/40 min-h-[440px] sm:min-h-[480px] flex flex-col justify-between p-6 sm:p-8 cursor-pointer select-none shadow-2xl"
    >
      {/* High-Resolution Scenic Photography */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-108"
        style={{ backgroundImage: `url('${destination.image}')` }}
      />

      {/* Dark Contrast Vignette Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0B100D] via-[#0B100D]/55 to-[#0B100D]/20 opacity-90 group-hover:opacity-85 transition-opacity"
      />

      {/* Specular Glare Overlay Tracking Cursor */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}), transparent 60%)`,
        }}
      />

      {/* Top Header Information */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111A14]/80 backdrop-blur-md border border-white/10 text-xs text-[#91B39A] font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#C4A77D]" />
          <span>{destination.region}</span>
        </div>

        <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg">
          <ArrowUpRight className="w-4 h-4 text-[#C4A77D]" />
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 flex flex-col pt-24">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#C4A77D] font-semibold mb-1.5">
          {destination.tagline}
        </span>

        <h3 className="font-editorial italic text-3xl sm:text-4xl text-[#F1F3ED] mb-2 leading-tight group-hover:text-white transition-colors">
          {destination.title}
        </h3>

        <p className="text-xs sm:text-sm text-[#A6B1A7] font-light leading-relaxed line-clamp-2 mb-4">
          {destination.description}
        </p>

        {/* Fares & Route Preview Footer */}
        <div className="pt-3.5 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#A6B1A7]">
            <span className="text-[11px] uppercase tracking-wider text-[#6F8D76]">Direct Corridor</span>
            <span className="text-[#F1F3ED] font-medium">{destination.startingRoute}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#A6B1A7] block leading-none">Starting from</span>
            <span className="font-display font-bold text-base sm:text-lg text-[#91B39A]">
              {destination.startingFare}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
