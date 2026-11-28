import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Compass, ArrowLeft, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';

export default function PlaceholderPage({ title, description }) {
  const location = useLocation();

  const routeTitles = {
    '/explore': {
      title: 'Multimodal Route Explorer',
      desc: 'Browse comprehensive transit corridors across Indian Railways, domestic air networks, interstate bus routes, and Ro-Pax ferries.',
      tag: 'Discovery Module',
    },
    '/destinations': {
      title: 'Curated Destinations Directory',
      desc: 'Discover secluded mountain retreats, coastal cliff trails, ancient biosphere reserves, and heritage sanctuaries.',
      tag: 'Destination Index',
    },
    '/plan': {
      title: 'Autonomous Journey Planner',
      desc: 'Plan end-to-end itineraries with calculated telescopic fares, cluster transfers, and optimal connection windows.',
      tag: 'Phase 2 Architecture',
    },
    '/about': {
      title: 'About TravelIQ Architecture',
      desc: 'Learn about our zero-hallucination routing engine, IRCTC verified timetable graph, and AI travel concierges.',
      tag: 'Platform Architecture',
    },
    '/ai-assistant': {
      title: 'TravelIQ AI Concierge',
      desc: 'Chat with our grounded transit assistant powered by FastAPI and PyTorch RAG pipelines for real-time travel intelligence.',
      tag: 'AI Intelligence',
    },
    '/login': {
      title: 'TravelIQ Member Access',
      desc: 'Sign in to access saved itineraries, verified e-tickets, and personalized journey recommendations.',
      tag: 'Authentication & Security',
    },
  };

  const meta = routeTitles[location.pathname] || {
    title: title || 'TravelIQ Platform Module',
    desc: description || 'This module is scheduled for full deployment in upcoming phases.',
    tag: 'Roadmap Milestone',
  };

  return (
    <div className="min-h-[85vh] pt-32 pb-20 flex items-center justify-center bg-[#0B100D] relative">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80')`
        }}
      />

      <Container className="relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17221A] border border-white/10 text-xs font-semibold text-[#C4A77D] uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{meta.tag}</span>
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F1F3ED] tracking-tight mb-4">
            {meta.title}
          </h1>

          <p className="text-[#A6B1A7] text-base sm:text-lg font-light leading-relaxed mb-8">
            {meta.desc}
          </p>

          <GlassCard className="p-6 mb-8 text-left border border-white/10 bg-[#111A14]/70">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#91B39A] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#F1F3ED] mb-1">
                  Phase 1 Scope: Landing Page & Global Navigation
                </h4>
                <p className="text-xs text-[#A6B1A7] font-light leading-relaxed">
                  You are currently exploring the Phase 1 Foundation of TravelIQ. Full dashboard routing, interactive bookings, and member profiles will unlock in Phase 2.
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              to="/"
              variant="forest"
              size="md"
              icon={ArrowLeft}
              iconPosition="left"
            >
              Return to Homepage
            </Button>
            <Button
              to="/#destinations-section"
              variant="ghost"
              size="md"
            >
              Explore Destinations
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
