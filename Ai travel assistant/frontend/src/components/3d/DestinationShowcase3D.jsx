import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, ChevronLeft, ChevronRight, Compass, Sparkles, Train, Plane } from 'lucide-react';

const FEATURED_DESTINATIONS = [
  {
    id: 'kashmir',
    name: 'Kashmir Valley',
    subTitle: 'Shikara Waters & Snow Peaks',
    tagline: 'Snow-capped Zabarwan peaks, Dal Lake houseboats, and saffron valleys.',
    image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=85',
    startingFare: '₹1,450',
    bestTime: 'Apr – Oct',
    mode: 'Vande Bharat / Air',
    slug: 'Kashmir',
    source: 'NDLS',
    dest: 'SINA'
  },
  {
    id: 'manali',
    name: 'Manali & Solang',
    subTitle: 'Alpine Forests & Solang Valley',
    tagline: 'Rohtang mountain pass, misty pine forests, and high-altitude Himalayan serenity.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=85',
    startingFare: '₹850',
    bestTime: 'Oct – Jun',
    mode: 'Express / Volvo Bus',
    slug: 'Manali',
    source: 'NDLS',
    dest: 'CDG'
  },
  {
    id: 'goa',
    name: 'Goa Coast',
    subTitle: 'Arabian Sea Shoreline',
    tagline: 'Portuguese colonial architecture, serene white-sand beaches, and spice trails.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85',
    startingFare: '₹780',
    bestTime: 'Nov – Feb',
    mode: 'Tejas Express / Coastal Rail',
    slug: 'Goa',
    source: 'CSMT',
    dest: 'MAO'
  },
  {
    id: 'udaipur',
    name: 'Udaipur Palaces',
    subTitle: 'City of Lakes & Regal Forts',
    tagline: 'Lake Pichola sunset cruises, Rajput courtyards, and heritage luxury retreats.',
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=85',
    startingFare: '₹620',
    bestTime: 'Oct – Mar',
    mode: 'Superfast Express',
    slug: 'Udaipur',
    source: 'NDLS',
    dest: 'UDZ'
  },
  {
    id: 'darjeeling',
    name: 'Darjeeling Hills',
    subTitle: 'Kanchenjunga & Tea Terraces',
    tagline: 'UNESCO Himalayan Toy Train, sunrise over Mt. Kanchenjunga, and emerald estates.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=85',
    startingFare: '₹920',
    bestTime: 'Mar – May & Sep – Nov',
    mode: 'Toy Train / Express',
    slug: 'Darjeeling',
    source: 'HWH',
    dest: 'NJP'
  }
];

export default function DestinationShowcase3D({ onSelectDestination }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % FEATURED_DESTINATIONS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + FEATURED_DESTINATIONS.length) % FEATURED_DESTINATIONS.length);
  };

  const current = FEATURED_DESTINATIONS[activeIndex];

  const handleExplore = (dest) => {
    if (onSelectDestination) {
      onSelectDestination(dest);
    } else {
      navigate('/dashboard', {
        state: {
          dest: { station_name: dest.name, station_code: dest.dest },
          source: { station_name: 'New Delhi', station_code: dest.source }
        }
      });
    }
  };

  return (
    <div className="relative w-full">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17221A] border border-white/10 text-xs font-semibold text-[#91B39A] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C4A77D]" />
            <span>CURATED LUXURY EXPEDITIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F1F3ED] font-heading tracking-tight">
            Journey to <span className="font-editorial italic font-normal text-[#C4A77D]">Extraordinary</span> Vistas.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#D0D7D1] max-w-2xl font-sans">
            Hand-selected alpine valleys, heritage waterways, and coastal sanctuaries with verified multimodal connections.
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-xl bg-[#17221A] hover:bg-[#1D2A21] border border-white/10 text-[#F1F3ED] flex items-center justify-center transition-all cursor-pointer hover:border-[#C4A77D]/40"
            aria-label="Previous Destination"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-xl bg-[#17221A] hover:bg-[#1D2A21] border border-white/10 text-[#F1F3ED] flex items-center justify-center transition-all cursor-pointer hover:border-[#C4A77D]/40"
            aria-label="Next Destination"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Showcase Grid: Featured Large Card + Right Multi-Tier Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Main Heroic Destination Feature Card */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-white/14 shadow-2xl group min-h-[420px] sm:min-h-[480px] flex flex-col justify-end p-6 sm:p-10">
          
          {/* Photographic Background */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${current.image})` }}
          />

          {/* Luxury Frosted Shadow Overlay */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, #0B100D 10%, rgba(11, 16, 13, 0.7) 45%, rgba(11, 16, 13, 0.2) 80%, transparent 100%)'
            }}
          />

          {/* Foreground Card Info */}
          <div className="relative z-20 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111A14]/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-[#91B39A]">
                <MapPin className="w-3.5 h-3.5 text-[#C4A77D]" />
                <span>{current.subTitle}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-[#315B40]/80 backdrop-blur-md border border-[#91B39A]/20 text-xs font-bold text-[#F1F3ED]">
                Fares from {current.startingFare}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#17221A]/70 text-[11px] text-[#A6B1A7] border border-white/5">
                Season: {current.bestTime}
              </span>
            </div>

            <h3 className="text-3xl sm:text-5xl font-extrabold text-[#F1F3ED] font-editorial tracking-tight">
              {current.name}
            </h3>

            <p className="text-sm sm:text-base text-[#D0D7D1] max-w-xl leading-relaxed font-sans">
              {current.tagline}
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => handleExplore(current)}
                className="btn-forest px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer font-bold text-sm tracking-wide shadow-lg"
              >
                <span>Explore Multimodal Corridors</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Vertical Carousel Preview Deck */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          {FEATURED_DESTINATIONS.map((dest, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <div
                key={dest.id}
                onClick={() => setActiveIndex(idx)}
                className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-4 ${
                  isSelected
                    ? 'bg-[#1D2A21] border-[#C4A77D]/45 shadow-xl -translate-y-0.5'
                    : 'bg-[#17221A]/60 border-white/8 hover:bg-[#17221A] hover:border-white/20'
                }`}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl object-cover shrink-0 border border-white/10"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#C4A77D] tracking-wider uppercase">
                      {dest.mode}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#F1F3ED]">
                      {dest.startingFare}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-[#F1F3ED] font-heading truncate">
                    {dest.name}
                  </h4>
                  <p className="text-[11px] text-[#A6B1A7] truncate">
                    {dest.subTitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
