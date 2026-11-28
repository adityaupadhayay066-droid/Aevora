import React, { useState } from 'react';
import { 
  Sparkles, Bot, Send, ArrowRight, Train, 
  MapPin, Clock, ShieldCheck, CheckCircle2, ChevronRight 
} from 'lucide-react';
import Container from '../ui/Container';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';

export default function AIConciergePreview() {
  const samplePrompts = [
    {
      id: 'kashmir',
      label: '4-Day Scenic Rail to Kashmir',
      query: 'Plan a 4-day scenic rail journey from Delhi to Kashmir with heritage stops.',
      response: {
        title: 'Alpine Corridor Itinerary: Delhi ➔ Jammu ➔ Srinagar',
        duration: '4 Days / 3 Nights',
        highlights: [
          'Vande Bharat Express (NDLS ➔ JAT) departing 06:00, arrival 14:00 (AC Chair Car: ₹1,630).',
          'Scenic transfer along the Chenab Rail Arch Bridge — the world’s highest railway crossing.',
          'Overnight heritage stay on Dal Lake with shikara sunset traverse.',
          'Day excursion to Gulmarg cedar forests via high-altitude gondola.',
        ],
        fareEstimate: '₹4,850 per traveler (Rail + Scenic Transfers)',
        confidence: '99.8% Grounded IRCTC Timetable Verification',
      },
    },
    {
      id: 'bengaluru',
      label: 'Tatanagar ➔ Bengaluru (Friday)',
      query: 'What is the verified direct train from Tatanagar to Bengaluru on Friday?',
      response: {
        title: 'Weekly Superfast Express: TATA ➔ SMVB',
        duration: '33h 30m Direct Transit',
        highlights: [
          'Train #12889 (TATA SMVB SF Express) departs Tatanagar on Friday at 17:45.',
          'Traverses Rourkela, Jharsuguda, Rayagada, and Vijayawada corridors without change of train.',
          'Arrives at Sir M. Visvesvaraya Terminal (SMVB) Bengaluru on Sunday at 03:15.',
          'Authentic telescopic fare tiers: Sleeper ₹900, 3E ₹2,515, 3A ₹2,730, 2A ₹3,930.',
        ],
        fareEstimate: '₹900 – ₹2,730 (Authoritative IRCTC Fares)',
        confidence: 'Zero Hallucination Database Verification',
      },
    },
    {
      id: 'goa',
      label: 'Coastal Rail & Ferry to Goa',
      query: 'Best coastal multimodal train and ferry connection to South Goa beaches.',
      response: {
        title: 'Arabian Coastal Synthesis: Mumbai ➔ Mandwa ➔ Madgaon',
        duration: '2 Days Coastal Passage',
        highlights: [
          'Ro-Pax Ferry from Bhaucha Dhakka to Mandwa (1h coastal cruise across Mumbai harbor).',
          'Vande Bharat or Tejas Express along scenic Konkan Railway through Western Ghat tunnels.',
          'Direct arrival into Madgaon Jn (MAO) with rental e-bike connectivity to coastal cliffs.',
        ],
        fareEstimate: '₹2,420 (Integrated Multimodal Fare)',
        confidence: 'Verified Multi-Provider Adapter',
      },
    },
  ];

  const [activePrompt, setActivePrompt] = useState(samplePrompts[0]);
  const [isTyping, setIsTyping] = useState(false);

  const handlePromptClick = (p) => {
    if (p.id === activePrompt.id) return;
    setIsTyping(true);
    setTimeout(() => {
      setActivePrompt(p);
      setIsTyping(false);
    }, 280);
  };

  return (
    <section className="py-24 sm:py-32 bg-[#0B100D] relative border-b border-white/5">
      <Container>
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17221A] border border-white/10 text-xs font-semibold text-[#91B39A] uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#C4A77D]" />
            <span>AI Travel Intelligence</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-[#F1F3ED] tracking-tight">
            Conversational concierge, <span className="font-editorial italic font-normal text-[#C4A77D]">grounded</span>.
          </h2>
          <p className="text-[#A6B1A7] text-base sm:text-lg mt-3 font-light">
            Ask complex travel queries in plain words. TravelIQ cross-references official transit tables, dynamic fares, and layovers with zero hallucination.
          </p>
        </div>

        {/* Interactive Glass Chat Card Mockup */}
        <div className="max-w-4xl mx-auto">
          {/* Prompt Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
            <span className="text-xs uppercase tracking-wider text-[#6F8D76] font-mono mr-1 hidden sm:inline">
              Try Prompt:
            </span>
            {samplePrompts.map((p) => {
              const isSelected = p.id === activePrompt.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePromptClick(p)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#315B40] text-[#F1F3ED] border border-[#91B39A]/40 shadow-sm'
                      : 'bg-[#17221A] text-[#A6B1A7] hover:text-[#F1F3ED] hover:bg-[#1D2A21] border border-white/5'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Frosted Glass Chat Window */}
          <GlassCard elevated className="p-6 sm:p-9 border border-white/12 shadow-2xl">
            {/* Top Bar of Chat Window */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#315B40] border border-[#91B39A]/40 flex items-center justify-center text-[#F1F3ED]">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-[#F1F3ED] flex items-center gap-1.5">
                    <span>Aevora AI Concierge</span>
                    <span className="w-2 h-2 rounded-full bg-[#91B39A]" />
                  </h4>
                  <span className="text-[11px] text-[#A6B1A7]">RAG Transit Intelligence Pipeline</span>
                </div>
              </div>

              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-[#C4A77D] border border-white/10 hidden sm:inline">
                FastAPI / PyTorch Engine
              </span>
            </div>

            {/* User Message Bubble */}
            <div className="flex justify-end mb-6">
              <div className="max-w-lg rounded-2xl rounded-tr-sm bg-[#1D2A21] border border-white/10 p-4 text-sm text-[#F1F3ED] font-medium shadow-md">
                {activePrompt.query}
              </div>
            </div>

            {/* AI Response Card */}
            <div className="flex items-start gap-3.5 mb-8">
              <div className="w-7 h-7 rounded-lg bg-[#C4A77D]/15 border border-[#C4A77D]/30 flex items-center justify-center text-[#C4A77D] shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>

              <div className="flex-1 rounded-2xl rounded-tl-sm bg-[#111A14]/90 border border-white/10 p-5 sm:p-6 shadow-inner">
                {isTyping ? (
                  <div className="flex items-center gap-2 text-xs text-[#A6B1A7] py-4">
                    <div className="w-2 h-2 rounded-full bg-[#C4A77D] animate-ping" />
                    <span>Synthesizing railway schedules and multimodal fares...</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-white/10">
                      <h5 className="font-display font-bold text-base sm:text-lg text-[#F1F3ED]">
                        {activePrompt.response.title}
                      </h5>
                      <span className="text-xs font-mono text-[#C4A77D] bg-[#17221A] px-2.5 py-1 rounded-md border border-white/5">
                        {activePrompt.response.duration}
                      </span>
                    </div>

                    <ul className="space-y-2.5 mb-5">
                      {activePrompt.response.highlights.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#A6B1A7] font-light leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-[#91B39A] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="text-[#91B39A]">
                        <span className="text-[#A6B1A7] block text-[10px] uppercase">Fare Estimation</span>
                        <span className="font-semibold text-sm text-[#F1F3ED]">{activePrompt.response.fareEstimate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#6F8D76]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#C4A77D]" />
                        <span>{activePrompt.response.confidence}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Input Bar with CTA to full assistant */}
            <div className="flex items-center gap-3 pt-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ask Aevora anything about trains, flights, transfers or stays..."
                  className="glass-input w-full pl-4 pr-10 py-3 rounded-xl text-xs sm:text-sm"
                  readOnly
                  onClick={() => window.location.href = '/ai-assistant'}
                />
                <button
                  type="button"
                  onClick={() => window.location.href = '/ai-assistant'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#315B40] text-white hover:bg-[#3b6d4d] transition-colors"
                  aria-label="Send query"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <Button
                to="/ai-assistant"
                variant="forest"
                size="md"
                icon={ArrowRight}
                iconPosition="right"
                className="whitespace-nowrap hidden sm:inline-flex"
              >
                Open Full Concierge
              </Button>
            </div>
          </GlassCard>
        </div>
      </Container>
    </section>
  );
}
