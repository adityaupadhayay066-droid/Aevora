import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, ArrowUpRight } from 'lucide-react';
import Container from '../ui/Container';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { name: 'Train Corridors', path: '/explore' },
      { name: 'Domestic Air Routes', path: '/explore' },
      { name: 'Interstate Coach Lines', path: '/explore' },
      { name: 'Ro-Pax Ferry Transfers', path: '/explore' },
    ],
    destinations: [
      { name: 'Himalayan Sanctuaries', path: '/destinations' },
      { name: 'Konkan Coastline', path: '/destinations' },
      { name: 'Kerala Backwaters', path: '/destinations' },
      { name: 'Kyoto Heritage Trails', path: '/destinations' },
    ],
    platform: [
      { name: 'Aevora AI Concierge', path: '/ai-assistant' },
      { name: 'Multimodal Routing Engine', path: '/plan' },
      { name: 'Dynamic Fares Telemetry', path: '/plan' },
      { name: 'About Aevora Architecture', path: '/about' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/about' },
      { name: 'Terms of Service', path: '/about' },
      { name: 'Security Disclosures', path: '/about' },
    ],
  };

  return (
    <footer className="bg-[#0B100D] border-t border-white/8 pt-16 pb-12 text-[#A6B1A7] text-sm">
      <Container>
        {/* Main 4-Column Footer */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* Brand Info Column */}
          <div className="col-span-2 md:col-span-4 flex flex-col justify-between">
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-4 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#17221A] to-[#0B100D] border border-white/15 flex items-center justify-center">
                  <svg 
                    className="w-4 h-4 text-[#C4A77D]" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 19 21 12 17 5 21 12 2" fill="rgba(196, 167, 125, 0.18)" />
                    <circle cx="12" cy="11" r="1.5" fill="#91B39A" stroke="none" />
                  </svg>
                </div>
                <span className="font-display font-extrabold text-xl text-[#F1F3ED] tracking-tight">
                  Aevora
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-[#A6B1A7] font-light leading-relaxed max-w-sm mb-6">
                Aevora is an AI-powered travel intelligence platform delivering authoritative multimodal route discovery, verified timetable synthesis, and luxury spatial planning.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-[#6F8D76]">
              <span className="w-2 h-2 rounded-full bg-[#315B40] animate-pulse" />
              <span>Grounded Intelligence • 100% Verified Telemetry</span>
            </div>
          </div>

          {/* Column: Corridors */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-[#F1F3ED] mb-4">
              Corridors
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
            &copy; {currentYear} Aevora Inc. All rights reserved. "Explore Beyond Routes."
          </div>
          <div className="flex items-center gap-6">
            <span>Built with React 19 & Three.js</span>
            <span className="text-[#315B40]">•</span>
            <span>Zero Hallucination Guaranteed</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
