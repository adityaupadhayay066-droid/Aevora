import React from 'react';
import HeroSection from '../components/home/HeroSection';
import DestinationSection from '../components/home/DestinationSection';
import FeaturesSection from '../components/home/FeaturesSection';
import CTASection from '../components/home/CTASection';

export default function HomePage() {
  return (
    <main className="w-full">
      <HeroSection />
      <DestinationSection />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}
