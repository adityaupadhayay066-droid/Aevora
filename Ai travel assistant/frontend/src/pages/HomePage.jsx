import React from 'react';
import HeroSection from '../components/home/HeroSection';
import DestinationSection from '../components/home/DestinationSection';
import Globe3DSection from '../components/3d/Globe3DSection';
import AIConciergePreview from '../components/home/AIConciergePreview';
import FeaturesSection from '../components/home/FeaturesSection';
import CTASection from '../components/home/CTASection';

export default function HomePage() {
  const handleSelectDestination = (dest) => {
    // Smooth scroll back to search bar and pre-fill destination
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="w-full bg-[#0B100D] overflow-x-hidden">
      {/* 1. Full-Viewport Seamless 3D Hero + Fixed Search Bar Proportions */}
      <HeroSection />

      {/* 2. Curated Destinations with 3D Spring-Physics Perspective Tilt Cards */}
      <DestinationSection onSelectDestination={handleSelectDestination} />

      {/* 3. Interactive 3D Multimodal Globe Section with Live Transit Telemetry */}
      <Globe3DSection />

      {/* 4. Aevora AI Concierge Interactive Chat Preview */}
      <AIConciergePreview />

      {/* 5. Core Platform Architecture Capabilities */}
      <FeaturesSection />

      {/* 6. Closing Call to Action Section */}
      <CTASection />
    </main>
  );
}
