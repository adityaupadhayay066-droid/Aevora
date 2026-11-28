import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, Settings, LogOut, Menu, X, Sparkles, Train, 
  Compass, Utensils, MapPin, Building2, Navigation, Leaf, Brain, 
  Bot, Mic, Globe2, BarChart3, Network, Cpu, ChevronDown, ChevronRight, 
  Search, Bell, ArrowRight, Check, Shield, ShieldAlert, HelpCircle, Key, Plane, Bus,
  CalendarDays, Ticket, Briefcase, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from './brand/Logo';
import EmergencySOSModal from './EmergencySOSModal';

/* ==========================================================================
   PRIMARY TRAVEL CATEGORIES (MakeMyTrip / Skyscanner inspired, TravelIQ identity)
   ========================================================================== */
const TRAVEL_CATEGORIES = [
  { id: 'flights', label: 'Flights', icon: Plane, path: '/?tab=flights' },
  { id: 'trains', label: 'Trains', icon: Train, path: '/?tab=trains' },
  { id: 'buses', label: 'Buses', icon: Bus, path: '/?tab=buses' },
  { id: 'hotels', label: 'Hotels', icon: Building2, path: '/hotels' },
  { id: 'ai-features', label: 'AI Studio', icon: Sparkles, path: '/dashboard/ai-workspace' },
  { id: 'explore', label: 'Explore', icon: Compass, path: '/destinations' },
  { id: 'trips', label: 'My Trips', icon: CalendarDays, path: '/dashboard/my-trips' }
];

const AI_STUDIO_ITEMS = [
  {
    title: 'Agentic Planner',
    desc: 'Autonomous multi-agent trip planning across routes, stays & food',
    to: '/dashboard/agentic-planner',
    icon: Cpu
  },
  {
    title: 'RAG Copilot & Search',
    desc: 'Transit AI copilot answering queries using verified Indian rail data',
    to: '/dashboard/rag',
    icon: Brain
  },
  {
    title: 'Delay & Fare Predictions',
    desc: 'Deep learning forecasts for train delays, platform crowds & fares',
    to: '/dashboard/ai-predictions',
    icon: BarChart3
  },
  {
    title: 'Voice Assistant',
    desc: 'Hands-free multilingual voice booking & train platform inquiries',
    to: '/dashboard/voice-assistant',
    icon: Mic
  },
  {
    title: 'Knowledge Graph',
    desc: 'Interactive 3D graph connecting transit hubs, cities & corridors',
    to: '/dashboard/knowledge-graph',
    icon: Network
  },
  {
    title: '3D Travel Globe',
    desc: 'Interactive 3D globe visualizing air corridors & regional routes',
    to: '/dashboard/3d-globe',
    icon: Globe2
  }
];

const EXPLORE_MENU_ITEMS = [
  {
    title: 'Popular Destinations',
    desc: 'Curated travel guides, seasonal weather & budgets for 50+ cities',
    to: '/destinations',
    icon: MapPin
  },
  {
    title: 'Multimodal Route Planner',
    desc: 'Compare trains, domestic flights, and interstate buses side-by-side',
    to: '/dashboard',
    icon: Compass
  },
  {
    title: 'Live Train GPS Tracker',
    desc: 'Real-time delay tracking, current platform and station locator',
    to: '/dashboard/track',
    icon: Navigation
  },
  {
    title: 'Station Food Delivery',
    desc: 'Hygienic meals from IRCTC vendors delivered right to your berth',
    to: '/dashboard/food',
    icon: Utensils
  },
  {
    title: '3D Station Navigation',
    desc: 'Digital twin interactive map of station platforms, halls & exits',
    to: '/dashboard/station-3d',
    icon: Building2
  },
  {
    title: 'Eco Carbon Footprint',
    desc: 'Calculate transit carbon footprint and earn eco travel badges',
    to: '/dashboard/eco',
    icon: Leaf
  },
  {
    title: 'B2B Developer Hub',
    desc: 'API keys, AI endpoints, telemetry & developer pricing plans',
    to: '/dashboard/developer',
    icon: Key
  }
];

const SEARCHABLE_ITEMS = [
  { title: 'Emergency SOS & Helpline Dispatch', category: 'Safety', to: '#sos', icon: ShieldAlert },
  { title: 'Search Flights, Trains & Buses', category: 'Booking', to: '/dashboard', icon: Compass },
  { title: 'Agentic Autonomous Planner', category: 'AI Tools', to: '/dashboard/agentic-planner', icon: Cpu },
  { title: 'RAG Copilot & Intelligent Search', category: 'AI Tools', to: '/dashboard/rag', icon: Brain },
  { title: 'AI Delay & Fare Predictions', category: 'AI Tools', to: '/dashboard/ai-predictions', icon: BarChart3 },
  { title: 'TravelIQ Voice Assistant', category: 'AI Tools', to: '/dashboard/voice-assistant', icon: Mic },
  { title: 'Interactive 3D Travel Globe', category: 'AI Tools', to: '/dashboard/3d-globe', icon: Globe2 },
  { title: 'Knowledge Graph Visualization', category: 'AI Tools', to: '/dashboard/knowledge-graph', icon: Network },
  { title: 'AI Workspace Command Center', category: 'AI Tools', to: '/dashboard/ai-workspace', icon: Sparkles },
  { title: 'Hotel Recommendations & Stays', category: 'Hotels', to: '/hotels', icon: Building2 },
  { title: 'Explore 50+ Indian Destinations', category: 'Destinations', to: '/destinations', icon: MapPin },
  { title: 'Live GPS Train Tracking', category: 'Live Status', to: '/dashboard/track', icon: Navigation },
  { title: 'Station Food & Meal Delivery', category: 'Food', to: '/dashboard/food', icon: Utensils },
  { title: 'B2B Developer Hub & API Keys', category: 'Developers', to: '/dashboard/developer', icon: Key },
  { title: 'My Booked Trips & Tickets', category: 'Account', to: '/dashboard/my-trips', icon: CalendarDays },
  { title: 'Account Security & Biometrics', category: 'Security', to: '/dashboard/security', icon: Shield },
  { title: '3D Railway Station Twin', category: 'Visual Tools', to: '/dashboard/station-3d', icon: Building2 },
  { title: 'Customer Support & Helpdesk', category: 'Support', to: '/support', icon: HelpCircle }
];

const NOTIFICATIONS = [
  { id: 1, title: 'Train 12002 on time', desc: 'Shatabdi Express platform 1 announced at New Delhi (NDLS)', time: '10m ago' },
  { id: 2, title: 'Smart Route Tip', desc: 'Direct Vande Bharat available tomorrow with 42 AC Chair seats', time: '1h ago' }
];

export default function Navbar() {
  const { user, logout, openAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation state
  const [activeDropdown, setActiveDropdown] = useState(null); // 'explore' | 'profile' | 'notif' | null
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navContainerRef = useRef(null);
  const commandInputRef = useRef(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click-outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setIsCommandOpen(false);
        setIsMobileMenuOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus command palette
  useEffect(() => {
    if (isCommandOpen && commandInputRef.current) {
      setTimeout(() => commandInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isCommandOpen]);

  // Close menus on route change
  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    setIsCommandOpen(false);
  }, [location.pathname, location.search]);

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const handleLogout = () => {
    logout();
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleCategoryClick = (category) => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);

    if (category.id === 'trips') {
      if (user) {
        navigate('/dashboard/my-trips');
      } else {
        openAuthModal('login');
      }
      return;
    }

    if (category.id === 'explore') {
      navigate('/destinations');
      return;
    }

    if (category.id === 'ai-features') {
      navigate('/dashboard/ai-workspace');
      return;
    }

    // Flights, Trains, Buses, Hotels
    setSelectedHomeTab(category.id);
    if (location.pathname === '/') {
      // Dispatch category event so LandingPage switches tab and scrolls
      window.dispatchEvent(new CustomEvent('traveliq:set-tab', { detail: { tab: category.id } }));
      const elem = document.getElementById('search-booking-panel') || document.getElementById('trip-planner-section');
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/?tab=${category.id}`, { state: { initialTab: category.id } });
    }
  };

  // State to track home tab when on homepage
  const [selectedHomeTab, setSelectedHomeTab] = useState(() => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get('tab') || 'trains';
  });

  useEffect(() => {
    const handleTab = (e) => {
      if (e.detail?.tab) setSelectedHomeTab(e.detail.tab);
    };
    window.addEventListener('traveliq:set-tab', handleTab);
    return () => window.removeEventListener('traveliq:set-tab', handleTab);
  }, []);

  // Determine active category based on URL or current page
  const getActiveCategoryId = () => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (location.pathname === '/destinations' || location.pathname.startsWith('/destinations/')) {
      return 'explore';
    }
    if (
      location.pathname === '/dashboard/ai-workspace' || 
      location.pathname === '/dashboard/rag' || 
      location.pathname === '/dashboard/voice-assistant' || 
      location.pathname === '/dashboard/3d-globe' || 
      location.pathname === '/dashboard/knowledge-graph' || 
      location.pathname === '/dashboard/agentic-planner' || 
      location.pathname === '/dashboard/ai-predictions'
    ) {
      return 'ai-features';
    }
    if (location.pathname === '/dashboard/my-trips') {
      return 'trips';
    }
    if (tabParam && ['flights', 'trains', 'buses', 'hotels'].includes(tabParam)) {
      return tabParam;
    }
    if (location.pathname === '/dashboard') {
      return 'trains'; // default multimodal
    }
    if (location.pathname === '/') {
      return selectedHomeTab;
    }
    return null;
  };

  const activeCategory = getActiveCategoryId();

  // Only show 'My Trips' if user is logged in
  const visibleCategories = TRAVEL_CATEGORIES.filter((cat) => {
    if (cat.id === 'trips' && !user) return false;
    return true;
  });

  const filteredSearchItems = (searchQuery.trim() === '' 
    ? SEARCHABLE_ITEMS.slice(0, 7)
    : SEARCHABLE_ITEMS.filter((item) => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
  ).filter((item) => {
    if (item.to === '/dashboard/my-trips' && !user) return false;
    return true;
  });

  return (
    <>
      {/* ====================================================================
          STICKY MAIN NAVIGATION BAR
          ==================================================================== */}
      <header 
        ref={navContainerRef}
        className={`sticky top-0 z-50 w-full transition-all duration-200 bg-[#0B100D]/85 backdrop-blur-xl border-b border-white/10 ${
          isScrolled 
            ? 'shadow-2xl shadow-black/40' 
            : ''
        }`}
      >
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between gap-3 sm:gap-6">
          
          {/* LEFT: TRAVELIQ BRAND LOGO */}
          <div className="flex items-center gap-3 shrink-0">
            <Logo size="md" withTagline={true} />
          </div>

          {/* CENTER: TRAVEL CATEGORY TABS (MakeMyTrip / Skyscanner layout - Accessible across pages) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 h-full whitespace-nowrap">
            {visibleCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              if (cat.id === 'ai-features') {
                return (
                  <div key={cat.id} className="relative h-full flex items-center">
                    <button
                      onClick={() => toggleDropdown('ai-features')}
                      className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer border ${
                        isActive || activeDropdown === 'ai-features'
                          ? 'bg-[#1D2A21] text-[#F1F3ED] border-white/10'
                          : 'bg-transparent text-[#A6B1A7] border-transparent hover:bg-white/5 hover:text-[#F1F3ED]'
                      }`}
                      aria-expanded={activeDropdown === 'ai-features'}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive || activeDropdown === 'ai-features' ? 'text-[#C4A77D]' : 'text-[#91B39A]'}`} />
                      <span>{cat.label}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 text-[#6F8D76] ${activeDropdown === 'ai-features' ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === 'ai-features' && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.99 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.99 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-[56px] w-[580px] sm:w-[620px] p-3.5 rounded-2xl bg-[#111A14]/95 border border-white/10 shadow-2xl backdrop-blur-2xl z-50 text-[#F1F3ED]"
                        >
                          <div className="flex items-center justify-between px-2.5 pb-2 mb-2 border-b border-white/10">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C4A77D]">
                              AI Travel Intelligence
                            </span>
                            <span className="text-[10px] font-medium text-[#A6B1A7]">
                              Autonomous Coordination & Forecasts
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            {AI_STUDIO_ITEMS.map((item, idx) => (
                              <Link
                                key={idx}
                                to={item.to}
                                onClick={() => setActiveDropdown(null)}
                                className="p-2.5 rounded-xl hover:bg-[#F7F8FA] dark:hover:bg-[#141C24] transition-all flex items-start gap-3 group border border-transparent hover:border-[#E3E7EA] dark:hover:border-[#283747]"
                              >
                                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white dark:group-hover:bg-sky-500 dark:group-hover:text-white transition-all shadow-2xs">
                                  <item.icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-xs font-semibold text-[#202A32] dark:text-[#F0F4F7] group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors block leading-tight">
                                    {item.title}
                                  </span>
                                  <p className="text-[11px] leading-relaxed text-[#66737D] dark:text-[#9CAAB5] mt-0.5 line-clamp-2">
                                    {item.desc}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>

                          <div className="mt-2.5 pt-2.5 border-t border-[#E3E7EA] dark:border-[#263544] flex items-center justify-between px-2.5">
                            <Link
                              to="/dashboard/ai-workspace"
                              onClick={() => setActiveDropdown(null)}
                              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1.5 transition-colors group"
                            >
                              <span>Open AI Workspace Hub</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#89939B] dark:text-[#7A8895]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Neural Core Online</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              if (cat.id === 'explore') {
                return (
                  <div key={cat.id} className="relative h-full flex items-center">
                    <button
                      onClick={() => toggleDropdown('explore')}
                      className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer border ${
                        isActive || activeDropdown === 'explore'
                          ? 'bg-[#EAF0F4] dark:bg-[#233240] text-[#244C66] dark:text-[#75A4C4] border-[#E3E7EA] dark:border-[#293644]'
                          : 'bg-transparent text-[#66737D] dark:text-[#9CAAB5] border-transparent hover:bg-[#EEF2F4] dark:hover:bg-[#162029] hover:text-[#202A32] dark:hover:text-[#F0F4F7]'
                      }`}
                      aria-expanded={activeDropdown === 'explore'}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive || activeDropdown === 'explore' ? 'text-[#244C66] dark:text-[#75A4C4]' : 'text-[#66737D] dark:text-[#9CAAB5]'}`} />
                      <span>{cat.label}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 text-[#89939B] ${activeDropdown === 'explore' ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === 'explore' && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.99 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.99 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-[56px] w-[580px] sm:w-[620px] p-3.5 rounded-2xl bg-white dark:bg-[#18222D] border border-[#E3E7EA] dark:border-[#283545] shadow-2xl z-50"
                        >
                          <div className="flex items-center justify-between px-2.5 pb-2 mb-2 border-b border-[#E3E7EA] dark:border-[#263544]">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#244C66] dark:text-[#75A4C4]">
                              Travel Discovery & Utilities
                            </span>
                            <span className="text-[10px] font-medium text-[#89939B] dark:text-[#7A8895]">
                              Real-Time Transit Tools
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            {EXPLORE_MENU_ITEMS.map((item, idx) => (
                              <Link
                                key={idx}
                                to={item.to}
                                onClick={() => setActiveDropdown(null)}
                                className="p-2.5 rounded-xl hover:bg-[#F7F8FA] dark:hover:bg-[#141C24] transition-all flex items-start gap-3 group border border-transparent hover:border-[#E3E7EA] dark:hover:border-[#283747]"
                              >
                                <div className="w-8 h-8 rounded-lg bg-[#EEF2F4] dark:bg-[#233240] text-[#244C66] dark:text-[#75A4C4] flex items-center justify-center shrink-0 group-hover:bg-[#244C66] group-hover:text-white dark:group-hover:bg-[#75A4C4] dark:group-hover:text-[#18222D] transition-all shadow-2xs">
                                  <item.icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-xs font-semibold text-[#202A32] dark:text-[#F0F4F7] group-hover:text-[#244C66] dark:group-hover:text-[#75A4C4] transition-colors block leading-tight">
                                    {item.title}
                                  </span>
                                  <p className="text-[11px] leading-relaxed text-[#66737D] dark:text-[#9CAAB5] mt-0.5 line-clamp-2">
                                    {item.desc}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>

                          <div className="mt-2.5 pt-2.5 border-t border-[#E3E7EA] dark:border-[#263544] flex items-center justify-between px-2.5">
                            <Link
                              to="/destinations"
                              onClick={() => setActiveDropdown(null)}
                              className="text-xs font-semibold text-[#244C66] dark:text-[#75A4C4] hover:underline flex items-center gap-1.5 transition-colors group"
                            >
                              <span>Explore All 50+ Destinations</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <Link
                              to="/dashboard/track"
                              onClick={() => setActiveDropdown(null)}
                              className="text-xs font-semibold text-[#66737D] dark:text-[#9CAAB5] hover:text-[#244C66] dark:hover:text-[#75A4C4] flex items-center gap-1 transition-colors"
                            >
                              Live Train GPS Tracker
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#EAF0F4] dark:bg-[#233240] text-[#244C66] dark:text-[#75A4C4] border-[#E3E7EA] dark:border-[#293644] font-semibold'
                      : 'bg-transparent text-[#66737D] dark:text-[#9CAAB5] border-transparent hover:bg-[#EEF2F4] dark:hover:bg-[#162029] hover:text-[#202A32] dark:hover:text-[#F0F4F7]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#244C66] dark:text-[#75A4C4]' : 'text-[#66737D] dark:text-[#9CAAB5]'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </nav>

          {/* RIGHT: CONTROLS & USER ACCOUNT ACTIONS */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Command search trigger (Cmd+K) - Visible only after login/signup */}
            {user && (
              <button
                onClick={() => setIsCommandOpen(true)}
                className="hidden md:flex items-center gap-2 h-8.5 px-2.5 rounded-lg border border-[#E3E7EA] dark:border-[#293644] bg-[#F7F8FA] dark:bg-[#162029] text-xs text-[#66737D] dark:text-[#9CAAB5] hover:border-[#CAD3DA] hover:bg-white dark:hover:bg-[#1B242E] transition-colors cursor-pointer"
                title="Search routes & destinations (⌘K)"
              >
                <Search className="w-3.5 h-3.5 text-[#89939B]" />
                <span className="font-medium hidden xl:inline text-[#66737D] dark:text-[#9CAAB5]">Search...</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-white dark:bg-[#1B242E] border border-[#E3E7EA] dark:border-[#293644] rounded text-[#89939B]">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Notifications Popover (if user logged in) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('notif')}
                  className="w-8.5 h-8.5 flex items-center justify-center rounded-lg text-[#66737D] dark:text-[#9CAAB5] hover:bg-[#EEF2F4] dark:hover:bg-[#162029] transition-colors relative cursor-pointer"
                  title="Travel Updates"
                  aria-expanded={activeDropdown === 'notif'}
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#244C66] ring-2 ring-white dark:ring-[#1B242E]" />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'notif' && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.99 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-[44px] w-80 p-2.5 rounded-xl bg-white dark:bg-[#1B242E] border border-[#E3E7EA] dark:border-[#293644] shadow-lg z-50 text-xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#E3E7EA] dark:border-[#293644] mb-2">
                        <span className="font-bold text-[#202A32] dark:text-[#F0F4F7]">Live Updates</span>
                        <span className="text-[10px] font-semibold text-[#244C66] bg-[#EAF0F4] dark:bg-[#233240] px-2 py-0.5 rounded">New</span>
                      </div>
                      <div className="space-y-1">
                        {NOTIFICATIONS.map((n) => (
                          <div key={n.id} className="p-2 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#162029] transition-colors">
                            <p className="font-semibold text-[#202A32] dark:text-[#F0F4F7]">{n.title}</p>
                            <p className="text-[11px] text-[#66737D] dark:text-[#9CAAB5] mt-0.5">{n.desc}</p>
                            <span className="text-[10px] text-[#89939B] mt-1 block">{n.time}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Emergency SOS Button */}
            <button
              onClick={() => setIsSosOpen(true)}
              className="h-8.5 px-2.5 sm:px-3 flex items-center gap-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-all cursor-pointer font-bold text-xs shrink-0"
              title="Emergency SOS Dispatch (RPF & Police)"
            >
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="tracking-wide font-extrabold">SOS</span>
            </button>

            {/* Profile Dropdown OR Guest Login/Signup */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('profile')}
                  className="h-8.5 flex items-center gap-2 px-2.5 rounded-lg border border-[#E3E7EA] dark:border-[#293644] hover:bg-[#F7F8FA] dark:hover:bg-[#162029] transition-colors cursor-pointer"
                  aria-expanded={activeDropdown === 'profile'}
                >
                  <div className="w-5.5 h-5.5 rounded-md bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-[#202A32] dark:text-[#F0F4F7] max-w-[110px] truncate hidden sm:inline">
                    {user.name || 'Account'}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-[#89939B] transition-transform ${activeDropdown === 'profile' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'profile' && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.99 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-[44px] w-64 p-2 rounded-xl bg-white dark:bg-[#1B242E] border border-[#E3E7EA] dark:border-[#293644] shadow-lg z-50 text-xs"
                    >
                      <div className="px-3 py-2 border-b border-[#E3E7EA] dark:border-[#293644] mb-1">
                        <p className="font-bold text-sm text-[#202A32] dark:text-[#F0F4F7] truncate">{user.name}</p>
                        <p className="text-[11px] text-[#66737D] dark:text-[#9CAAB5] truncate">{user.email}</p>
                      </div>

                      <div className="space-y-0.5">
                        {user.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EAF0F4] dark:bg-[#233240] text-[#244C66] dark:text-[#75A4C4] font-semibold mb-1"
                          >
                            <Shield className="w-3.5 h-3.5 text-[#244C66]" />
                            <span>Admin Portal</span>
                            <span className="ml-auto text-[9px] font-bold px-1.5 py-0.2 bg-[#244C66] text-white rounded">ADMIN</span>
                          </Link>
                        )}
                        <Link
                          to="/dashboard/my-trips"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#162029] text-[#202A32] dark:text-[#F0F4F7] transition-colors font-medium"
                        >
                          <CalendarDays className="w-3.5 h-3.5 text-[#89939B]" />
                          <span>My Trips & Tickets</span>
                        </Link>
                        <Link
                          to="/dashboard/ai-workspace"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#162029] text-[#202A32] dark:text-[#F0F4F7] transition-colors font-medium"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                          <span>AI Studio & Models</span>
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded">AI</span>
                        </Link>
                        <Link
                          to="/dashboard/profile"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#162029] text-[#202A32] dark:text-[#F0F4F7] transition-colors font-medium"
                        >
                          <User className="w-3.5 h-3.5 text-[#89939B]" />
                          <span>Profile & Account</span>
                        </Link>
                        <Link
                          to="/dashboard/developer"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#162029] text-[#202A32] dark:text-[#F0F4F7] transition-colors font-medium"
                        >
                          <Key className="w-3.5 h-3.5 text-[#89939B]" />
                          <span>Developer Hub & API Keys</span>
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 bg-[#EAF0F4] dark:bg-[#233240] text-[#244C66] dark:text-[#75A4C4] rounded">B2B</span>
                        </Link>
                        <Link
                          to="/dashboard/security"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#162029] text-[#202A32] dark:text-[#F0F4F7] transition-colors font-medium"
                        >
                          <Shield className="w-3.5 h-3.5 text-[#89939B]" />
                          <span>Security Center</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => { setActiveDropdown(null); setIsSosOpen(true); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition-colors font-semibold text-left cursor-pointer"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          <span>Emergency SOS</span>
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded">24x7</span>
                        </button>
                        <Link
                          to="/dashboard/settings"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#162029] text-[#202A32] dark:text-[#F0F4F7] transition-colors font-medium"
                        >
                          <Settings className="w-3.5 h-3.5 text-[#89939B]" />
                          <span>Settings</span>
                        </Link>
                      </div>

                      <div className="pt-1 mt-1 border-t border-[#E3E7EA] dark:border-[#293644]">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#B54747] hover:bg-[#EEF2F4] dark:hover:bg-[#162029] transition-colors font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#F1F3ED] hover:bg-white/5 border border-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-1.5 text-xs font-bold text-[#F1F3ED] bg-[#315B40] hover:bg-[#3d6f4f] border border-[#91B39A]/20 rounded-lg transition-all shadow-md shadow-[#315B40]/25 cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-8.5 h-8.5 flex items-center justify-center rounded-lg text-[#202A32] dark:text-[#F0F4F7] hover:bg-[#EEF2F4] dark:hover:bg-[#162029] transition-colors"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#202A32] dark:text-[#F0F4F7]" />}
            </button>

          </div>

        </div>

        {/* Mobile Horizontal Quick Category Switcher (Under Header - Visible only after login/signup) */}
        {user && (
          <div className="lg:hidden flex items-center gap-1.5 px-4 py-2 border-t border-[#E3E7EA] dark:border-[#293644] overflow-x-auto scrollbar-none bg-[#F7F8FA] dark:bg-[#162029]">
            {visibleCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#244C66] text-white font-semibold'
                      : 'bg-white dark:bg-[#1B242E] text-[#66737D] dark:text-[#9CAAB5] border border-[#E3E7EA] dark:border-[#293644]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* ====================================================================
          MOBILE DRAWER MENU
          ==================================================================== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className={`lg:hidden fixed ${user ? 'top-[108px] max-h-[calc(100vh-108px)]' : 'top-[64px] max-h-[calc(100vh-64px)]'} left-0 right-0 overflow-y-auto bg-white dark:bg-[#1B242E] border-b border-[#E3E7EA] dark:border-[#293644] z-40 p-4 space-y-4 shadow-xl`}
          >
            {/* Quick Command search trigger on mobile (Visible only after login/signup) */}
            {user && (
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsCommandOpen(true); }}
                className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-[#E3E7EA] dark:border-[#293644] bg-[#F7F8FA] dark:bg-[#162029] text-xs text-[#66737D]"
              >
                <Search className="w-4 h-4 text-[#89939B]" />
                <span>Search destinations, routes, trains...</span>
              </button>
            )}

            {/* Travel Categories List (Visible only after login/signup) */}
            {user && (
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Book & Plan</p>
                {visibleCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{cat.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* AI Studio & Intelligence Tools */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">AI Studio & Models</p>
                <span className="text-[9px] font-medium text-slate-400">7 Autonomous Tools</span>
              </div>
              {AI_STUDIO_ITEMS.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={idx}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-[#202A32] dark:text-[#F0F4F7] text-sm font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-semibold">{item.title}</div>
                        <p className="text-[10px] font-normal text-[#66737D] dark:text-[#9CAAB5] line-clamp-2 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Explore Tools */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Travel Utilities</p>
              <Link
                to="/destinations"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-sm font-semibold"
              >
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>50+ Popular Destinations Guide</span>
              </Link>
              <Link
                to="/dashboard/track"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-sm font-semibold"
              >
                <Navigation className="w-4 h-4 text-teal-600" />
                <span>Live Train GPS Tracker</span>
              </Link>
              <Link
                to="/dashboard/food"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#162029] text-[#202A32] dark:text-[#F0F4F7] text-sm font-medium"
              >
                <Utensils className="w-4 h-4 text-[#244C66]" />
                <span>Station Food Delivery</span>
              </Link>
              <Link
                to="/dashboard/developer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#162029] text-[#202A32] dark:text-[#F0F4F7] text-sm font-medium"
              >
                <Key className="w-4 h-4 text-[#244C66]" />
                <span>B2B Developer Hub & API Keys</span>
              </Link>
              <Link
                to="/support"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#162029] text-[#202A32] dark:text-[#F0F4F7] text-sm font-medium"
              >
                <HelpCircle className="w-4 h-4 text-[#244C66]" />
                <span>Support & Helpdesk</span>
              </Link>
              <button
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); setIsSosOpen(true); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-sm font-bold transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Emergency SOS Dispatch</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">24x7</span>
              </button>
            </div>

            {/* User Account / Auth Actions */}
            <div className="pt-2 border-t border-[#E3E7EA] dark:border-[#293644]">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2">
                    <span className="text-xs font-semibold text-[#202A32] dark:text-[#F0F4F7]">Logged in as {user.name}</span>
                    <button onClick={handleLogout} className="text-xs font-semibold text-[#B54747]">Log out</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => { openAuthModal('login'); setIsMobileMenuOpen(false); }}
                    className="flex-1 btn-secondary h-9 text-xs font-semibold"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { openAuthModal('signup'); setIsMobileMenuOpen(false); }}
                    className="flex-1 btn-primary h-9 text-xs font-semibold"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          COMMAND PALETTE DIALOG (⌘K / Ctrl+K)
          ==================================================================== */}
      <AnimatePresence>
        {isCommandOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommandOpen(false)}
              className="fixed inset-0 bg-[#202A32]/40 backdrop-blur-2xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -6 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#1B242E] border border-[#E3E7EA] dark:border-[#293644] rounded-xl shadow-xl overflow-hidden z-10"
            >
              <div className="flex items-center px-4 py-3 border-b border-[#E3E7EA] dark:border-[#293644] gap-3">
                <Search className="w-4 h-4 text-[#89939B] shrink-0" />
                <input
                  ref={commandInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destinations, train schedules, routes, hotels..."
                  className="w-full bg-transparent border-none outline-none text-sm font-medium text-[#202A32] dark:text-[#F0F4F7] placeholder-[#89939B]"
                />
                <button
                  onClick={() => setIsCommandOpen(false)}
                  className="px-1.5 py-0.5 rounded border border-[#E3E7EA] dark:border-[#293644] text-[#89939B] hover:text-[#202A32] text-[10px] font-mono"
                >
                  ESC
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {filteredSearchItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsCommandOpen(false);
                        if (item.to === '#sos') {
                          setIsSosOpen(true);
                        } else {
                          navigate(item.to);
                        }
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#162029] transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 rounded-md bg-[#EEF2F4] dark:bg-[#233240] text-[#244C66] dark:text-[#75A4C4] shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-[#202A32] dark:text-[#F0F4F7] block truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-[#89939B] block truncate">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#89939B] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Emergency SOS Dispatch Modal */}
      <EmergencySOSModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </>
  );
}
