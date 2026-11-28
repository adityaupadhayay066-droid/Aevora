import React, { useState, useEffect } from 'react';
import { 
  MapPin, Clock, Search, SunMedium, Compass, 
  ArrowRight, Instagram, ChevronRight, X 
} from 'lucide-react';
import TravelHeroScene from '../../scenes/TravelHeroScene';
import JourneySearch from './JourneySearch';

/**
 * Curated destinations for the interactive 01-04 stepper
 */
const heroDestinations = [
  {
    index: '01',
    title1: 'YOSEMITE',
    title2: 'VALLEY',
    location: 'Sentinel Dome, California',
    waypoint1: 'Bettmerhorn',
    waypoint1Sub: 'Alpine Ridge',
    waypoint2: 'Yosemite Valley',
    waypoint2Sub: 'Sentinel Dome',
    temp: '27°',
    duration: '3d 16h 32min',
    bgImage: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=2560&q=90',
    mission: 'Autonomous Multimodal Routing harmonizing rail, air, and alpine road corridors with zero hallucination.',
    vision: 'AI-driven real-time concierge with dynamic weather adaptation, smart layovers, and instant rerouting.',
  },
  {
    index: '02',
    title1: 'ZERMATT',
    title2: 'PEAKS',
    location: 'Gornergrat Crest, Swiss Alps',
    waypoint1: 'Täsch Terminal',
    waypoint1Sub: 'Glacier Rail',
    waypoint2: 'Matterhorn Peak',
    waypoint2Sub: 'Hörnli Ridge',
    temp: '14°',
    duration: '2d 08h 15min',
    bgImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=2560&q=90',
    mission: 'Grounded Glacier Express synchronization connecting Zurich rail velocity with mountain funiculars.',
    vision: 'Zero-latency transit intelligence adjusting mountain transfers for high-altitude snow squalls.',
  },
  {
    index: '03',
    title1: 'BANFF',
    title2: 'ROCKIES',
    location: 'Lake Louise, Canadian Rockies',
    waypoint1: 'Bow Valley',
    waypoint1Sub: 'Scenic Pass',
    waypoint2: 'Sentinel Pass',
    waypoint2Sub: 'Larch Valley',
    temp: '18°',
    duration: '4d 12h 45min',
    bgImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=90',
    mission: 'Trans-continental route optimization weaving passenger rail, mountain coaches, and alpine trails.',
    vision: 'Adaptive expedition itineraries with automatic park pass telemetry and live trail conditions.',
  },
  {
    index: '04',
    title1: 'MANALI',
    title2: 'CREST',
    location: 'Solang & Rohtang Pass, Himalayas',
    waypoint1: 'Kalka Junction',
    waypoint1Sub: 'Toy Train Rail',
    waypoint2: 'Rohtang Pass',
    waypoint2Sub: '3,978m Summit',
    temp: '16°',
    duration: '1d 22h 10min',
    bgImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=90',
    mission: 'Synchronized high-altitude railway timetables paired with verified mountain transport networks.',
    vision: 'Autonomous weather re-routing around monsoon corridors with instant verified ground transfers.',
  },
];

export default function HeroSection({ onSearchSelect }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const currentDest = heroDestinations[activeIdx];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-[#0B100D] py-4 sm:py-6 lg:py-8 select-none">
      {/* 1. Cinematic 3D Aerial Mountain Valley Scene (Peaks, Mist, Aircraft, Birds, Glowing Route) */}
      <TravelHeroScene bgImage={currentDest.bgImage} />

      {/* 2. MASTER FLOATING TRANSLUCENT GLASS VIEWPORT FRAME (Exact Yosemite Reference Match) */}
      <div className="relative z-10 w-full max-w-[1360px] px-3 sm:px-6 my-auto">
        <div className="luminous-viewport-frame w-full min-h-[640px] lg:h-[84vh] max-h-[840px] p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden transition-all duration-700">
          
          {/* TOP BAR INSIDE THE FLOATING CARD */}
          <div className="flex items-center justify-between w-full relative z-20">
            {/* Left: Framed Brand Box Logo (Exact Reference Match) */}
            <div className="border border-white/80 px-2 sm:px-2.5 py-1 sm:py-1.5 flex flex-col items-center justify-center leading-none tracking-widest bg-black/15 backdrop-blur-md shadow-sm">
              <span className="text-[10px] sm:text-[11px] font-black tracking-[0.24em] text-white">TRAVEL</span>
              <span className="text-[10px] sm:text-[11px] font-black tracking-[0.24em] text-white mt-0.5">IQ</span>
            </div>

            {/* Center: Upper Spaced Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-[11px] lg:text-xs font-semibold tracking-[0.24em] uppercase text-white/80">
              <button 
                onClick={() => scrollToSection('features-section')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                ABOUT US
              </button>
              <button 
                onClick={() => scrollToSection('destinations-section')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                TOURS
              </button>
              <button 
                onClick={() => scrollToSection('destinations-section')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                LOCATIONS
              </button>
              <button 
                onClick={() => scrollToSection('footer-section')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                CONTACT US
              </button>
            </nav>

            {/* Right: Search Toggle & User Profile Avatar */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center cursor-pointer backdrop-blur-md ${
                  isSearchOpen 
                    ? 'bg-[#C4A77D] text-[#0B100D] border-[#C4A77D]' 
                    : 'bg-white/10 hover:bg-white/20 border-white/30 text-white'
                }`}
                title={isSearchOpen ? 'Close Search Bar' : 'Open Search Bar'}
                aria-label="Toggle Route Search"
              >
                {isSearchOpen ? <X className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
              </button>

              <div 
                onClick={() => scrollToSection('features-section')}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-white/70 shadow-md cursor-pointer hover:border-white transition-colors"
                title="Profile & Settings"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Traveler Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* MAIN HERO CONTENT ROW */}
          <div className="relative z-20 flex flex-col lg:flex-row items-start lg:items-center justify-between w-full my-auto gap-6 pt-4">
            {/* Left: Giant Bold Editorial Title & Location */}
            <div className="max-w-xl text-left">
              <h1 className="font-condensed font-bold text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white uppercase leading-[0.90] drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]">
                {currentDest.title1}
                <br />
                {currentDest.title2}
              </h1>

              {/* Subtitle Pin */}
              <div className="flex items-center gap-2 mt-4 text-xs sm:text-sm text-white/90 font-medium tracking-wide drop-shadow">
                <MapPin className="w-4 h-4 text-white fill-white/20" />
                <span>{currentDest.location}</span>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="px-5 py-2.5 rounded-full bg-[#315B40] hover:bg-[#3b6d4d] border border-[#91B39A]/40 text-xs sm:text-sm font-semibold text-white tracking-wider uppercase transition-all shadow-[0_8px_20px_rgba(49,91,64,0.45)] flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-[#C4A77D]" />
                  <span>{isSearchOpen ? 'Hide Search' : 'Find My Journey'}</span>
                </button>

                <button
                  onClick={() => scrollToSection('destinations-section')}
                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-xs sm:text-sm font-medium text-white/90 hover:text-white transition-all backdrop-blur-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>Explore Tours</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                </button>
              </div>
            </div>

            {/* Center-Slope Mountain Waypoint Route Spline (Reference Feature) */}
            <div className="hidden lg:block absolute left-[54%] top-[40%] -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
              {/* Waypoint 1: Starting Ridge */}
              <div className="absolute -left-14 -top-10 flex flex-col items-center">
                <span className="text-[11px] font-mono font-semibold text-white tracking-wider drop-shadow-md whitespace-nowrap">
                  {currentDest.waypoint1}
                </span>
                <span className="text-[9px] font-mono text-white/75 whitespace-nowrap">
                  {currentDest.waypoint1Sub}
                </span>
                <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#C4A77D] mt-1 shadow-[0_0_12px_#FFF]" />
              </div>

              {/* Smooth Spline Trailing Across Mountain Face */}
              <svg width="220" height="95" viewBox="0 0 220 95" fill="none" className="overflow-visible">
                <path
                  d="M 12 24 Q 70 -12, 130 38 T 210 70"
                  stroke="rgba(255, 255, 255, 0.75)"
                  strokeWidth="1.6"
                  strokeDasharray="4 4"
                  className="drop-shadow-[0_0_8px_rgba(255,255,255,0.85)]"
                />
                {/* Moving Transit Pulse Beacon */}
                <circle r="3.5" fill="#FFFFFF" className="animate-pulse">
                  <animateMotion
                    path="M 12 24 Q 70 -12, 130 38 T 210 70"
                    dur="4.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>

              {/* Waypoint 2: Destination Peak */}
              <div className="absolute right-0 top-16 translate-x-1/2 flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C4A77D] border-2 border-white mb-1 shadow-[0_0_12px_#C4A77D]" />
                <span className="text-[11px] font-mono font-semibold text-white tracking-wider drop-shadow-md whitespace-nowrap">
                  {currentDest.waypoint2}
                </span>
                <span className="text-[9px] font-mono text-white/75 whitespace-nowrap">
                  {currentDest.waypoint2Sub}
                </span>
              </div>
            </div>

            {/* Right: Alpine Weather & Duration Telemetry */}
            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 text-right drop-shadow-md">
              {/* Weather Telemetry */}
              <div className="flex items-center gap-2.5 text-white">
                <SunMedium className="w-6 h-6 text-[#C4A77D]" />
                <span className="text-2xl lg:text-3xl font-bold font-mono tracking-tight">{currentDest.temp}</span>
              </div>

              {/* Duration Telemetry */}
              <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm font-mono">
                <Clock className="w-4 h-4 text-white/80" />
                <span>{currentDest.duration}</span>
              </div>
            </div>
          </div>

          {/* EXPANDABLE PRECISION JOURNEY SEARCH DRAWER */}
          {isSearchOpen && (
            <div className="relative z-30 my-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1611]/90 backdrop-blur-2xl border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#91B39A]">
                    <Compass className="w-4 h-4 text-[#C4A77D]" />
                    <span>Multimodal Journey Planning • TravelIQ Routing</span>
                  </div>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="text-xs text-white/70 hover:text-white cursor-pointer px-2 py-1 rounded-md bg-white/5 hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>
                <JourneySearch />
              </div>
            </div>
          )}

          {/* BOTTOM ROW (Stepper + Dual Editorial Columns) */}
          <div className="relative z-20 flex flex-col sm:flex-row items-start sm:items-end justify-between w-full pt-4 border-t border-white/15 gap-6">
            {/* Left: 01 —— 02  03  04 Interactive Carousel Stepper (Exact Match) */}
            <div className="flex items-center gap-3.5 text-xs sm:text-sm font-mono font-semibold text-white select-none">
              {heroDestinations.map((dest, i) => {
                const isActive = activeIdx === i;
                return (
                  <React.Fragment key={dest.index}>
                    <button
                      onClick={() => setActiveIdx(i)}
                      className={`transition-all duration-300 cursor-pointer ${
                        isActive 
                          ? 'text-white scale-110 font-bold drop-shadow-[0_0_8px_#FFF]' 
                          : 'text-white/45 hover:text-white/80'
                      }`}
                      aria-label={`Switch to destination ${dest.index}`}
                    >
                      {dest.index}
                    </button>
                    {isActive && (
                      <div className="w-12 sm:w-16 h-[2px] bg-white rounded-full transition-all duration-500 shadow-[0_0_8px_#FFF]" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Right: Dual Editorial Columns (Mission & Vision) */}
            <div className="hidden md:grid grid-cols-2 gap-8 max-w-xl text-left">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-1.5 font-sans">
                  Mission
                </h4>
                <p className="text-[11px] leading-relaxed text-white/75 line-clamp-2">
                  {currentDest.mission}
                </p>
              </div>
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-1.5 font-sans">
                  Vision
                </h4>
                <p className="text-[11px] leading-relaxed text-white/75 line-clamp-2">
                  {currentDest.vision}
                </p>
              </div>
            </div>
          </div>

          {/* Far Right Vertical Social Media Strip (Reference Feature) */}
          <div className="hidden xl:flex flex-col items-center gap-5 text-white/70 absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white hover:scale-120 transition-all text-xs font-bold font-serif" 
              title="Facebook"
            >
              f
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white hover:scale-120 transition-all" 
              title="Instagram"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white hover:scale-120 transition-all text-xs font-bold" 
              title="Twitter / X"
            >
              𝕏
            </a>
          </div>
        </div>
      </div>

      {/* 3. FOREGROUND PINE TREE OVERLAY (Overlaps the bottom glowing card border for authentic physical depth) */}
      <div className="absolute -bottom-2 inset-x-0 h-28 sm:h-36 pointer-events-none z-20 overflow-hidden select-none">
        <svg
          viewBox="0 0 1440 220"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Back evergreen silhouette layer */}
          <path
            d="M0,220 L0,120 L40,80 L70,110 L110,60 L150,110 L200,50 L250,120 L310,40 L370,130 L440,70 L510,140 L580,50 L640,110 L720,40 L790,120 L860,60 L930,130 L1010,50 L1080,120 L1150,40 L1220,110 L1290,60 L1360,120 L1440,50 L1440,220 Z"
            fill="#09140D"
            opacity="0.85"
          />
          {/* Foreground evergreen canopy overlapping the glowing glass frame */}
          <path
            d="M0,220 L0,140 L50,90 L90,135 L140,75 L180,130 L230,85 L280,145 L340,70 L400,150 L470,95 L530,155 L600,80 L670,140 L740,65 L810,145 L880,90 L950,150 L1030,80 L1100,140 L1170,75 L1240,135 L1310,85 L1380,140 L1440,80 L1440,220 Z"
            fill="#050C07"
          />
        </svg>
      </div>
    </section>
  );
}
