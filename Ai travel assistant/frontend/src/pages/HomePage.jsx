import React, { useState } from 'react';
import HeroSection from '../components/home/HeroSection';
import JourneySearch from '../components/home/JourneySearch';
import DestinationSection from '../components/home/DestinationSection';
import Globe3DSection from '../components/3d/Globe3DSection';
import AIConciergePreview from '../components/home/AIConciergePreview';
import FeaturesSection from '../components/home/FeaturesSection';
import CTASection from '../components/home/CTASection';
import Container from '../components/ui/Container';

export default function HomePage() {
  const [selectedDest, setSelectedDest] = useState('');

  const handleSelectDestination = (dest) => {
    setSelectedDest(dest.title || dest);
    const el = document.getElementById('search-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="w-full bg-[#0B100D] overflow-x-hidden">
      {/* 1. Luminous 3D Alpine Hero Floating Frame (Yosemite Reference) */}
      <HeroSection onSearchSelect={handleSelectDestination} />

      {/* 2. Precision Multimodal Search Section */}
      <section id="search-section" className="py-12 sm:py-16 bg-[#0B100D] relative z-10 border-t border-white/5">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#91B39A]">
                TravelIQ Multimodal Engine
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
                Plan Your Synchronized Journey
              </h2>
            </div>
            <JourneySearch initialDestination={selectedDest} />
          </div>
        </Container>
      </section>

      {/* 3. Curated Destinations with 3D Spring-Physics Perspective Tilt Cards */}
      <DestinationSection onSelectDestination={handleSelectDestination} />

      {/* 4. Interactive 3D Multimodal Globe Section with Live Transit Telemetry */}
      <Globe3DSection />

      {/* 5. TravelIQ AI Concierge Interactive Chat Preview */}
      <AIConciergePreview />

      {/* 6. Core Platform Architecture Capabilities */}
      <FeaturesSection />

      {/* 7. Closing Call to Action Section */}
      <CTASection />
    </main>
  );
}
