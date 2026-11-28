import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, Menu, X, Compass, ArrowRight, ShieldCheck, 
  MapPin, Calendar, Train, ArrowUpRight 
} from 'lucide-react';
import { useScrollState } from '../../hooks/useScrollState';
import Container from '../ui/Container';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isScrolled } = useScrollState(20);
  const location = useLocation();

  // Close mobile drawer on route change or Escape key
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { name: 'Explore', path: '/explore' },
    { name: 'Destinations', path: '/destinations' },
    { name: 'Plan Journey', path: '/plan' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3' : 'py-5'
      }`}
    >
      <Container>
        <nav 
          aria-label="Main Navigation"
          className={`flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300 ${
            isScrolled 
              ? 'glass-panel-topbar-scrolled' 
              : 'glass-panel-topbar'
          }`}
        >
          {/* Left: Brand Emblem & Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A77D] rounded-lg"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#17221A] to-[#0B100D] border border-white/15 flex items-center justify-center shadow-md group-hover:border-[#C4A77D]/60 transition-colors">
              <svg 
                className="w-5 h-5 text-[#C4A77D] transition-transform duration-300 group-hover:scale-110" 
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
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-[#F1F3ED] tracking-tight group-hover:text-white transition-colors">
                Travel<span className="text-[#C4A77D]">IQ</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#91B39A] font-semibold -mt-1 hidden sm:block">
                Intelligence
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                    active 
                      ? 'text-[#F1F3ED] bg-white/5 shadow-inner' 
                      : 'text-[#A6B1A7] hover:text-[#F1F3ED] hover:bg-white/5'
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C4A77D]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Actions (AI Assistant, Login, Get Started) */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#17221A]/70 hover:bg-[#1D2A21] text-[#91B39A] hover:text-[#F1F3ED] border border-white/10 hover:border-[#91B39A]/40 transition-all duration-200 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C4A77D]" />
              <span>AI Assistant</span>
            </Link>

            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-[#A6B1A7] hover:text-[#F1F3ED] hover:bg-white/5 transition-all"
            >
              Login
            </Link>

            <Link
              to="/plan"
              className="btn-forest inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold tracking-wide"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile: Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/ai-assistant"
              className="p-2 rounded-xl bg-[#17221A] border border-white/10 text-[#C4A77D]"
              aria-label="AI Assistant"
            >
              <Sparkles className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#F1F3ED] hover:bg-white/10 transition-colors"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </Container>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 top-[72px] z-40 bg-[#0B100D]/90 backdrop-blur-2xl md:hidden px-4 py-6 border-t border-white/10 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6F8D76] px-3 mb-1">
              Navigation
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#17221A]/60 border border-white/5 text-base font-medium text-[#F1F3ED] hover:bg-[#1D2A21] hover:border-white/10 transition-colors"
              >
                <span>{link.name}</span>
                <ArrowUpRight className="w-4 h-4 text-[#A6B1A7]" />
              </Link>
            ))}

            <div className="h-[1px] bg-white/10 my-2" />

            <Link
              to="/ai-assistant"
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#17221A] border border-[#C4A77D]/30 text-base font-medium text-[#F1F3ED]"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C4A77D]" />
                TravelIQ AI Concierge
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-[#C4A77D]/15 text-[#C4A77D] font-mono">
                Active
              </span>
            </Link>

            <Link
              to="/login"
              className="btn-ghost-glass text-center py-3 rounded-xl text-sm font-medium mt-2"
            >
              Login to TravelIQ
            </Link>

            <Link
              to="/plan"
              className="btn-forest text-center py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
