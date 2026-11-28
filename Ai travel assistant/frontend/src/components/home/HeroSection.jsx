import React, { useState, useEffect } from 'react';
import { 
  MapPin, Clock, Search, SunMedium, Compass, 
  ArrowRight, Instagram, ChevronRight, X, ShieldCheck, 
  Sparkles, Activity, CheckCircle2 
} from 'lucide-react';
import TravelHeroScene from '../../scenes/TravelHeroScene';
import JourneySearch from './JourneySearch';
import { api } from '../../services/api';

/**
 * Geographically authentic, verified corridors
 */
const heroDestinations = [
  {
    index: '01',
    title1: 'YOSEMITE',
    title2: 'VALLEY',
    location: 'Sentinel Dome, California',
    stationCode: 'YOS',
    waypoint1: 'Valley Floor',
    waypoint1Sub: '1,220m • Valley Gateway',
    waypoint2: 'Sentinel Dome',
    waypoint2Sub: '2,470m • Glacier Ridge',
    distanceMetrics: '1,250m Ascent • 14.8 km Trail Corridor',
    transitType: 'Shuttle & Alpine Trail',
    bgImage: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=2560&q=90',
    mission: 'Autonomous Multimodal Routing harmonizing rail, air, and alpine road corridors with zero hallucination.',
    vision: 'AI-driven real-time concierge with dynamic weather adaptation, smart layovers, and instant rerouting.',
  },
  {
    index: '02',
    title1: 'ZERMATT',
    title2: 'PEAKS',
    location: 'Gornergrat Crest, Swiss Alps',
    stationCode: 'ZMT',
    waypoint1: 'Täsch Terminal',
    waypoint1Sub: '1,449m • Matterhorn Gotthard',
    waypoint2: 'Gornergrat Crest',
    waypoint2Sub: '3,089m • Matterhorn Pass',
    distanceMetrics: '1,640m Ascent • Cogwheel Rail Sync',
    transitType: 'Glacier Express & Funicular',
    bgImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=2560&q=90',
    mission: 'Grounded Glacier Express synchronization connecting Zurich rail velocity with mountain funiculars.',
    vision: 'Zero-latency transit intelligence adjusting mountain transfers for high-altitude weather shifts.',
  },
  {
    index: '03',
    title1: 'BANFF',
    title2: 'ROCKIES',
    location: 'Lake Louise, Canadian Rockies',
    stationCode: 'BNF',
    waypoint1: 'Bow Valley',
    waypoint1Sub: '1,384m • Trans-Canada Pass',
    waypoint2: 'Sentinel Pass',
    waypoint2Sub: '2,611m • Larch Valley Crest',
    distanceMetrics: '1,227m Ascent • National Park Transit',
    transitType: 'Regional Rail & Alpine Coach',
    bgImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=90',
    mission: 'Trans-continental route optimization weaving passenger rail, mountain coaches, and alpine trails.',
    vision: 'Adaptive expedition itineraries with automatic park pass telemetry and live trail conditions.',
  },
  {
    index: '04',
    title1: 'ROHTANG',
    title2: 'HIMALAYAS',
    location: 'Solang & Rohtang Pass, Himachal',
    stationCode: 'KLK',
    waypoint1: 'Manali Gateway',
    waypoint1Sub: '2,050m • Solang Entrance',
    waypoint2: 'Rohtang Crest',
    waypoint2Sub: '3,978m • Pir Panjal Pass',
    distanceMetrics: '1,928m Ascent • 51 km Scenic Highway',
    transitType: 'UNESCO Rail + Mountain Coach',
    bgImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=90',
    mission: 'Synchronized high-altitude railway timetables paired with verified mountain transport networks.',
    vision: 'Autonomous weather re-routing around monsoon corridors with instant verified ground transfers.',
  },
];

export default function HeroSection({ onSearchSelect }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const currentDest = heroDestinations[activeIdx];

  // Fetch real weather telemetry from backend API
  useEffect(() => {
    let isMounted = true;
    setLoadingWeather(true);

    api.get(`/user/weather?stationCode=${currentDest.stationCode}`)
      .then((res) => {
        if (isMounted && res.data) {
          setWeatherData(res.data);
        }
      })
      .catch(() => {
        // Fallback gracefully without fake hardcoded stats
        if (isMounted) {
          setWeatherData(null);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingWeather(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentDest.stationCode]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-[#0B100D] pt-20 pb-8 sm:py-8 select-none">
      {/* 1. Cinematic 3D Aerial Mountain Valley Scene (Peaks, Mist, Aircraft, Birds, Glowing Route) */}
      <TravelHeroScene bgImage={currentDest.bgImage} />

      {/* 2. MASTER FLOATING TRANSLUCENT GLASS VIEWPORT FRAME */}
      <div className="relative z-10 w-full max-w-[1360px] px-3 sm:px-6 my-auto">
        <div className="luminous-viewport-frame w-full min-h-[600px] lg:h-[84vh] max-h-[840px] p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden transition-all duration-700">
          
          {/* TOP TELEMETRY ROW INSIDE CARD (No duplicate navbar links) */}
          <div className="flex flex-wrap items-center justify-between w-full relative z-20 pb-3 border-b border-white/10 gap-3">
            {/* Left: Active Corridor Verification Eyebrow */}
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#C4A77D] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-mono font-semibold tracking-widest text-[#91B39A] uppercase">
                SPATIAL EXPEDITION CORRIDOR • {currentDest.index} OF 04
              </span>
            </div>

            {/* Right: Authoritative Verification Badges */}
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-[#A6B1A7]">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C4A77D]" />
                <span className="text-[11px]">ZERO HALLUCINATION</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <Activity className="w-3.5 h-3.5 text-[#91B39A]" />
                <span className="text-[11px]">{currentDest.transitType}</span>
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

              {/* Subtitle Pin with Authentic Location */}
              <div className="flex items-center gap-2 mt-4 text-xs sm:text-sm text-white/90 font-medium tracking-wide drop-shadow">
                <MapPin className="w-4 h-4 text-[#C4A77D]" />
                <span>{currentDest.location}</span>
                <span className="text-white/40">•</span>
                <span className="text-[#91B39A] font-mono text-xs">{currentDest.distanceMetrics}</span>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="px-5 py-2.5 rounded-full bg-[#315B40] hover:bg-[#3b6d4d] border border-[#91B39A]/40 text-xs sm:text-sm font-semibold text-white tracking-wider uppercase transition-all shadow-[0_8px_20px_rgba(49,91,64,0.45)] flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-[#C4A77D]" />
                  <span>{isSearchOpen ? 'Hide Search Drawer' : 'Plan Your Journey'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('destinations-section')}
                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-xs sm:text-sm font-medium text-white/90 hover:text-white transition-all backdrop-blur-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>Explore All Tours</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                </button>
              </div>
            </div>

            {/* Center-Slope Mountain Waypoint Route Spline (Authentic Waypoints) */}
            <div className="hidden lg:block absolute left-[54%] top-[42%] -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
              {/* Waypoint 1: Starting Ridge */}
              <div className="absolute -left-16 -top-12 flex flex-col items-center">
                <span className="text-[11px] font-mono font-semibold text-white tracking-wider drop-shadow-md whitespace-nowrap">
                  {currentDest.waypoint1}
                </span>
                <span className="text-[9px] font-mono text-white/80 whitespace-nowrap">
                  {currentDest.waypoint1Sub}
                </span>
                <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#C4A77D] mt-1 shadow-[0_0_12px_#FFF]" />
              </div>

              {/* Smooth Curved Spline Trailing Across Mountain Face */}
              <svg width="230" height="100" viewBox="0 0 230 100" fill="none" className="overflow-visible">
                <path
                  d="M 12 28 Q 75 -10, 135 42 T 215 76"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                  className="drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
                />
                {/* Moving Transit Pulse Beacon */}
                <circle r="3.5" fill="#FFFFFF" className="animate-pulse">
                  <animateMotion
                    path="M 12 28 Q 75 -10, 135 42 T 215 76"
                    dur="4.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>

              {/* Waypoint 2: Destination Peak */}
              <div className="absolute right-0 top-18 translate-x-1/2 flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C4A77D] border-2 border-white mb-1 shadow-[0_0_12px_#C4A77D]" />
                <span className="text-[11px] font-mono font-semibold text-white tracking-wider drop-shadow-md whitespace-nowrap">
                  {currentDest.waypoint2}
                </span>
                <span className="text-[9px] font-mono text-white/80 whitespace-nowrap">
                  {currentDest.waypoint2Sub}
                </span>
              </div>
            </div>

            {/* Right: Live Telemetry From Real API */}
            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 text-right drop-shadow-md">
              {/* Weather Telemetry */}
              {loadingWeather ? (
                <div className="flex items-center gap-2 text-white/60 text-xs font-mono">
                  <span className="w-3 h-3 rounded-full border-2 border-[#C4A77D] border-t-transparent animate-spin" />
                  <span>Syncing Telemetry...</span>
                </div>
              ) : weatherData ? (
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 text-white">
                    <SunMedium className="w-6 h-6 text-[#C4A77D]" />
                    <span className="text-2xl lg:text-3xl font-bold font-mono tracking-tight">{weatherData.temp}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#91B39A] mt-0.5">
                    {weatherData.condition} • {weatherData.station} Corridor
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white/70 text-xs font-mono">
                  <Activity className="w-4 h-4 text-[#91B39A]" />
                  <span>Live Corridor Active</span>
                </div>
              )}

              {/* Corridor Route Specification */}
              <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm font-mono mt-1">
                <Clock className="w-4 h-4 text-white/80" />
                <span>Verified Transit Graph</span>
              </div>
            </div>
          </div>

          {/* EXPANDABLE PRECISION JOURNEY SEARCH DRAWER */}
          {isSearchOpen && (
            <div className="relative z-30 my-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1611]/95 backdrop-blur-2xl border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#91B39A]">
                    <Compass className="w-4 h-4 text-[#C4A77D]" />
                    <span>Multimodal Journey Planning • TravelIQ Routing</span>
                  </div>
                  <button
                    type="button"
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

          {/* BOTTOM ROW (Stepper + Dual Editorial Columns without clipping) */}
          <div className="relative z-20 flex flex-col sm:flex-row items-start sm:items-end justify-between w-full pt-4 border-t border-white/15 gap-6">
            {/* Left: 01 —— 02  03  04 Interactive Carousel Stepper */}
            <div className="flex items-center gap-3.5 text-xs sm:text-sm font-mono font-semibold text-white select-none">
              {heroDestinations.map((dest, i) => {
                const isActive = activeIdx === i;
                return (
                  <React.Fragment key={dest.index}>
                    <button
                      type="button"
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

            {/* Right: Dual Editorial Columns (Full text, NO line-clamp cutoffs) */}
            <div className="hidden md:grid grid-cols-2 gap-8 max-w-xl text-left">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C4A77D] mb-1.5 font-sans">
                  Mission
                </h4>
                <p className="text-xs leading-relaxed text-white/80">
                  {currentDest.mission}
                </p>
              </div>
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#91B39A] mb-1.5 font-sans">
                  Vision
                </h4>
                <p className="text-xs leading-relaxed text-white/80">
                  {currentDest.vision}
                </p>
              </div>
            </div>
          </div>

          {/* Far Right Vertical Social Media Strip */}
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

      {/* 3. SOFT ATMOSPHERIC MIST TRANSITION (Replaces sharp zig-zag triangle strip with natural soft terrain fade) */}
      <div 
        className="absolute bottom-0 inset-x-0 h-44 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(to top, #0B100D 10%, rgba(11, 16, 13, 0.85) 45%, rgba(11, 16, 13, 0.3) 75%, transparent 100%)'
        }}
      />
    </section>
  );
}
