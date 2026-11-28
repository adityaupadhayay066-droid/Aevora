import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, Menu, X, ArrowRight, ArrowUpRight, 
  ChevronDown, LogOut, User as UserIcon, Compass 
} from 'lucide-react';
import { useScrollState } from '../../hooks/useScrollState';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const { isScrolled } = useScrollState(16);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
      }
    };
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { name: 'Explore', path: '/explore' },
    { name: 'Destinations', path: '/destinations' },
    { name: 'Route Explorer', path: '/explore' },
    { name: 'AI Concierge', path: '/ai-assistant' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none">
      {/* Floating Centered Pill Navigation Surface (Single unified topbar across app) */}
      <div className="max-w-6xl mx-auto mt-3 sm:mt-4 pointer-events-auto">
        <nav
          aria-label="TravelIQ Navigation"
          className={`rounded-full transition-all duration-300 px-5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border ${
            isScrolled
              ? 'bg-[#111A14]/95 backdrop-blur-2xl border-white/14 shadow-[0_16px_36px_-10px_rgba(0,0,0,0.85)]'
              : 'bg-[#111A14]/80 backdrop-blur-xl border-white/10 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* Left: TravelIQ Logo & Custom Brand Symbol */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A77D] rounded-full"
          >
            {/* Custom Brand Symbol: Mountain Peak with Golden Meridian Node */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#17221A] to-[#0B100D] border border-white/15 flex items-center justify-center shadow-md group-hover:border-[#C4A77D]/60 transition-colors">
              <svg
                className="w-4.5 h-4.5 text-[#C4A77D] transition-transform duration-300 group-hover:scale-110"
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

            {/* TravelIQ Wordmark */}
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg text-[#F1F3ED] tracking-tight group-hover:text-white transition-colors">
                Travel<span className="text-[#C4A77D]">IQ</span>
              </span>
            </div>
          </Link>

          {/* Center: Clean Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 relative ${
                    active
                      ? 'text-[#F1F3ED] bg-white/8 shadow-inner'
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

          {/* Right: Actions (AI Assistant + Real Auth State) */}
          <div className="hidden md:flex items-center gap-3">
            {/* AI Assistant Pill */}
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#17221A]/70 hover:bg-[#1D2A21] text-[#91B39A] hover:text-[#F1F3ED] border border-white/10 hover:border-[#91B39A]/40 transition-all duration-200 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C4A77D]" />
              <span>AI Assistant</span>
            </Link>

            {/* Real Logged-In User State */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#17221A] hover:bg-[#1D2A21] border border-white/12 hover:border-[#C4A77D]/40 transition-all text-xs font-medium cursor-pointer"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-[#315B40] text-[#F1F3ED] font-bold text-[11px] flex items-center justify-center border border-white/20">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-[#F1F3ED] max-w-[100px] truncate">{user.name || user.email}</span>
                  <ChevronDown className="w-3 h-3 text-[#A6B1A7]" />
                </button>

                {/* Real User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#111A14]/95 backdrop-blur-2xl border border-white/15 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-white/10 mb-2">
                      <p className="text-xs font-semibold text-[#F1F3ED] truncate">{user.name || 'Member'}</p>
                      <p className="text-[11px] text-[#A6B1A7] truncate font-mono">{user.email}</p>
                      {user.role && (
                        <span className="inline-block mt-1.5 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#C4A77D] font-mono">
                          {user.role}
                        </span>
                      )}
                    </div>
                    <Link
                      to="/plan"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#A6B1A7] hover:text-[#F1F3ED] hover:bg-white/5 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#91B39A]" />
                      <span>My Itineraries</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors mt-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Real Log In Link */}
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium text-[#A6B1A7] hover:text-[#F1F3ED] hover:bg-white/5 transition-colors"
                >
                  Log In
                </Link>

                {/* Real Get Started Button */}
                <Link
                  to="/login?mode=register"
                  className="btn-forest inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs lg:text-sm font-semibold tracking-wide shadow-md hover:shadow-lg"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/ai-assistant"
              className="p-2 rounded-full bg-[#17221A] border border-white/10 text-[#C4A77D]"
              aria-label="AI Concierge"
            >
              <Sparkles className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-[#F1F3ED] hover:bg-white/10 transition-colors"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[70px] z-40 bg-[#0B100D]/95 backdrop-blur-2xl md:hidden px-4 py-6 border-t border-white/10 overflow-y-auto animate-in fade-in duration-200 pointer-events-auto">
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            {isAuthenticated && user && (
              <div className="p-4 rounded-2xl bg-[#17221A] border border-white/10 mb-2">
                <p className="text-sm font-semibold text-[#F1F3ED]">{user.name}</p>
                <p className="text-xs text-[#A6B1A7] font-mono">{user.email}</p>
                <span className="inline-block mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-[#C4A77D]">
                  {user.role || 'Member'}
                </span>
              </div>
            )}

            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6F8D76] px-3 mb-1">
              TravelIQ Navigation
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#17221A]/60 border border-white/5 text-sm font-medium text-[#F1F3ED] hover:bg-[#1D2A21] hover:border-white/10 transition-colors"
              >
                <span>{link.name}</span>
                <ArrowUpRight className="w-4 h-4 text-[#A6B1A7]" />
              </Link>
            ))}

            <div className="h-[1px] bg-white/10 my-2" />

            <Link
              to="/ai-assistant"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#17221A] border border-[#C4A77D]/30 text-sm font-medium text-[#F1F3ED]"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C4A77D]" />
                AI Travel Concierge
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C4A77D]/15 text-[#C4A77D]">
                Active
              </span>
            </Link>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-center py-3 rounded-full text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 mt-2 cursor-pointer"
              >
                Log Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-ghost-glass text-center py-3 rounded-full text-xs font-medium mt-2"
                >
                  Log In
                </Link>

                <Link
                  to="/login?mode=register"
                  className="btn-forest text-center py-3 rounded-full text-xs font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
