import React from 'react';
import { 
  Compass, Train, GitFork, Sparkles, ShieldCheck, 
  Layers, Cpu, Zap 
} from 'lucide-react';
import Container from '../ui/Container';
import GlassCard from '../ui/GlassCard';

export default function FeaturesSection() {
  const features = [
    {
      icon: Compass,
      title: 'Intelligent Journey Planning',
      description: 'Discover travel options through an intelligent planning experience that evaluates speed, budget, and connections.',
      tag: 'Autonomous Routing',
    },
    {
      icon: Train,
      title: 'Multiple Transport Options',
      description: 'Explore train, bus, flight and ferry journeys within a unified interface without opening multiple tabs.',
      tag: 'Multimodal Corridors',
    },
    {
      icon: GitFork,
      title: 'Smarter Route Discovery',
      description: 'Understand routes and available travel alternatives across regional hubs, express trains, and local transfers.',
      tag: 'Hub Interconnects',
    },
    {
      icon: Sparkles,
      title: 'AI Travel Assistance',
      description: 'Get assistance with journey planning and destination discovery through an authentic, grounded travel assistant.',
      tag: 'Grounded Intelligence',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#111A14] relative border-t border-b border-white/5">
      <Container>
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17221A] border border-white/10 text-xs font-semibold text-[#91B39A] uppercase tracking-wider mb-4">
            <Cpu className="w-3.5 h-3.5 text-[#C4A77D]" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-[#F1F3ED] tracking-tight">
            Travel planning, <span className="font-editorial italic font-normal text-[#C4A77D]">reimagined</span>.
          </h2>
          <p className="text-[#A6B1A7] text-base sm:text-lg mt-3 font-light">
            Engineered from ground up with authoritative transit schedules, dynamic fare mathematics, and AI concierges.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <GlassCard 
                key={feat.title}
                interactive
                className="flex flex-col justify-between"
              >
                <div>
                  {/* Icon Emblem */}
                  <div className="w-12 h-12 rounded-2xl bg-[#1D2A21] border border-white/10 flex items-center justify-center text-[#C4A77D] mb-6 shadow-md group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#91B39A] font-semibold block mb-2">
                    {feat.tag}
                  </span>

                  <h3 className="font-display font-bold text-xl text-[#F1F3ED] mb-3">
                    {feat.title}
                  </h3>

                  <p className="text-sm text-[#A6B1A7] font-light leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#6F8D76]">
                  <span>Module 0{index + 1}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#315B40]" />
                </div>
              </GlassCard>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
