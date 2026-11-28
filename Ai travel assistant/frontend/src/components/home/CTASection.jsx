import React from 'react';
import { ArrowRight, Compass } from 'lucide-react';
import Container from '../ui/Container';
import Button from '../ui/Button';

export default function CTASection() {
  return (
    <section className="py-24 sm:py-32 bg-[#0B100D] relative overflow-hidden">
      {/* Immersive Natural Mountain Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=2400&q=85')`,
          filter: 'brightness(0.55) saturate(0.85)'
        }}
      />
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#0B100D] via-transparent to-[#0B100D]"
      />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto rounded-[32px] bg-[#111A14]/75 backdrop-blur-2xl p-8 sm:p-14 text-center border border-white/12 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17221A] border border-white/10 text-xs font-semibold text-[#C4A77D] uppercase tracking-wider mb-6">
            <Compass className="w-3.5 h-3.5" />
            <span>Embark on Your Journey</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#F1F3ED] tracking-tight leading-tight mb-4">
            Your next adventure <span className="font-editorial italic font-normal text-[#C4A77D]">starts here</span>.
          </h2>

          <p className="text-base sm:text-xl text-[#A6B1A7] font-light max-w-xl mx-auto mb-8">
            Discover a better way to explore the world with TravelIQ.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              to="/plan"
              variant="forest"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              className="px-8 shadow-xl"
            >
              Start Exploring
            </Button>
            <Button
              to="/destinations"
              variant="ghost"
              size="lg"
            >
              Browse Destinations
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
