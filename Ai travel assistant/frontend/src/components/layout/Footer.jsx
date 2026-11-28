import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';
import Container from '../ui/Container';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { name: 'Train Routes', path: '/explore' },
      { name: 'Domestic Flights', path: '/explore' },
      { name: 'Interstate Buses', path: '/explore' },
      { name: 'Ro-Pax Ferry Lines', path: '/explore' },
      { name: 'Transit Hub Connectors', path: '/explore' },
    ],
    destinations: [
      { name: 'Himalayan Peaks', path: '/destinations' },
      { name: 'Konkan Coastline', path: '/destinations' },
      { name: 'Western Ghats Forests', path: '/destinations' },
      { name: 'Royal Heritage Sanctuaries', path: '/destinations' },
    ],
    platform: [
      { name: 'AI Travel Concierge', path: '/ai-assistant' },
      { name: 'Authoritative Timetables', path: '/plan' },
      { name: 'Dynamic Fares Engine', path: '/plan' },
      { name: 'About TravelIQ', path: '/about' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/about' },
      { name: 'Terms of Service', path: '/about' },
      { name: 'Security Architecture', path: '/about' },
    ],
  };

  return (
    <footer className="bg-[#0B100D] border-t border-white/10 pt-16 pb-12 text-[#A6B1A7] text-sm">
      <Container>
        {/* Main Footer Columns */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* Brand Info Column */}
          <div className="col-span-2 md:col-span-4 flex flex-col justify-between">
            <div>
              <Link to="/" className="flex items-center gap-3 mb-4 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#17221A] to-[#0B100D] border border-white/15 flex items-center justify-center">
                  <svg 
                    className="w-4 h-4 text-[#C4A77D]" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 19 21 12 17 5 21 12 2" fill="rgba(196, 167, 125, 0.15)" />
                    <circle cx="12" cy="11" r="1.5" fill="#91B39A" stroke="none" />
                  </svg>
                </div>
                <span className="font-display font-bold text-xl text-[#F1F3ED] tracking-tight">
                  Travel<span className="text-[#C4A77D]">IQ</span>
                </span>
              </Link>
              <p className="text-sm text-[#A6B1A7] font-light leading-relaxed max-w-sm mb-6">
                TravelIQ is an AI-powered travel intelligence platform delivering authoritative route planning, multimodal connections, and extraordinary destination discovery.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-[#6F8D76]">
              <span className="w-2 h-2 rounded-full bg-[#315B40] animate-pulse" />
              <span>Systems Authoritative • Phase 1 Core</span>
            </div>
          </div>

          {/* Column: Explore */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-[#F1F3ED] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-[#F1F3ED] transition-colors text-xs sm:text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Destinations */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-[#F1F3ED] mb-4">
              Destinations
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.destinations.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-[#F1F3ED] transition-colors text-xs sm:text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Platform */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-[#F1F3ED] mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-[#F1F3ED] transition-colors text-xs sm:text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Legal */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-[#F1F3ED] mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-[#F1F3ED] transition-colors text-xs sm:text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6F8D76]">
          <div>
            &copy; {currentYear} TravelIQ Platform Inc. All rights reserved. "Explore Beyond Routes."
          </div>
          <div className="flex items-center gap-6">
            <span>Built with React 19 & Three.js</span>
            <span className="text-[#315B40]">•</span>
            <span>Zero Hallucination Routing</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
