import React from 'react';
import { Compass, Train, GitFork, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import Container from '../ui/Container';
import GlassCard from '../ui/GlassCard';

export default function FeaturesSection() {
  const capabilities = [
    {
      icon: Compass,
      title: 'Intelligent Journey Planning',
      description: 'Algorithmically evaluates timetable connections, optimal layover buffers, and journey comfort across national transit networks.',
      tag: 'Autonomous Engine',
    },
    {
      icon: Train,
      title: 'Multimodal Travel Discovery',
      description: 'Unified transit discovery across high-speed trains, regional coaches, domestic airlines, and maritime ferries in one cohesive interface.',
      tag: 'Unified Corridors',
    },
    {
      icon: GitFork,
      title: 'Smart Route Exploration',
      description: 'Intelligently calculates authoritative railway telescopic fares, transfers between multi-station metro clusters, and verified alternatives.',
      tag: 'Telescopic Routing',
    },
    {
      icon: Sparkles,
      title: 'AI Travel Assistance',
      description: 'Conversational travel concierges powered by grounded RAG pipelines with zero hallucination guarantee against official timetables.',
      tag: 'Grounded Intelligence',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#111A14] relative border-t border-b border-white/6">
      <Container>
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17221A] border border-white/10 text-xs font-semibold text-[#91B39A] uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5 text-[#C4A77D]" />
            <span>Why TravelIQ</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-[#F1F3ED] tracking-tight">
            Travel planning, <span className="font-editorial italic font-normal text-[#C4A77D]">reimagined</span>.
          </h2>
          <p className="text-[#A6B1A7] text-base sm:text-lg mt-3 font-light">
            Engineered with verified railway schedules, dynamic fare mathematics, and spatial intelligence.
          </p>
        </div>

        {/* 4 Clean Glass Capability Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <GlassCard
                key={cap.title}
                interactive
                className="flex flex-col justify-between p-7"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#1D2A21] border border-white/10 flex items-center justify-center text-[#C4A77D] mb-6 shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#91B39A] font-semibold block mb-2">
                    {cap.tag}
                  </span>

                  <h3 className="font-display font-bold text-xl text-[#F1F3ED] mb-3">
                    {cap.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#A6B1A7] font-light leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#6F8D76]">
                  <span>Capability 0{idx + 1}</span>
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
