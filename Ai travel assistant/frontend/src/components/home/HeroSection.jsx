import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import Terrain3D from '../3d/Terrain3D';
import JourneySearch from './JourneySearch';

export default function HeroSection({ onSearchSelect }) {
  const handleScrollToDestinations = () => {
    const el = document.getElementById('destinations-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-32 sm:pt-36 pb-16 overflow-hidden bg-[#0B100D]">
      {/* 3D Atmospheric Topographic Mountain & Valley Terrain with Glowing Spline */}
      <Terrain3D />

      {/* Foreground Hero Content */}
      <div className="relative z-10 w-full my-auto px-4 sm:px-6">
        <Container>
          {/* Hero Editorial Headlines */}
          <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-14">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#17221A]/80 border border-white/10 backdrop-blur-md mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4A77D] animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#91B39A]">
                YOUR WORLD. YOUR JOURNEY.
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-[#F1F3ED] leading-[1.08] mb-6">
              Explore <span className="font-editorial italic font-normal text-[#C4A77D]">Beyond</span> Routes.
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-[#A6B1A7] max-w-2xl mx-auto font-sans font-light leading-relaxed mb-8">
              Discover extraordinary destinations, compare journeys and experience a smarter way to travel.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                to="/plan"
                variant="forest"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                className="shadow-xl"
              >
                Plan Your Journey
              </Button>
              <Button
                onClick={handleScrollToDestinations}
                variant="ghost"
                size="lg"
              >
                Explore Destinations
              </Button>
            </div>
          </div>

          {/* Floating Frosted Glass Search Panel with Perfectly Aligned Proportions */}
          <JourneySearch />
        </Container>
      </div>

      {/* Subtle Scroll Indicator */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center mt-8 pointer-events-none">
        <button
          onClick={handleScrollToDestinations}
          className="pointer-events-auto flex flex-col items-center gap-2 text-xs uppercase tracking-widest text-[#6F8D76] hover:text-[#91B39A] transition-colors cursor-pointer group"
        >
          <span>Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1 group-hover:border-[#C4A77D]/60 transition-colors">
            <div className="w-1 h-2 rounded-full bg-[#C4A77D] animate-bounce" />
          </div>
        </button>
      </div>
    </section>
  );
}
