/**
 * TravelIQ Official Brand Configuration & Identity System
 * Premium Dark Luxury Travel Intelligence & Mobility Platform.
 */

export const BRAND = {
  name: 'TravelIQ',
  legalName: 'TravelIQ Global Technologies Inc.',
  tagline: 'Explore Beyond Routes.',
  subtitle: 'Discover destinations, compare journeys and experience intelligent travel planning with TravelIQ.',
  philosophy: 'Explore. Connect. Experience.',
  positioning: 'Dark Luxury Glass 3D Travel Intelligence Platform.',
  version: '3.0.0',

  colors: {
    bgMain: '#0B100D',          // Main background
    bgSecondary: '#111A14',     // Secondary background
    bgCard: '#17221A',          // Card background
    bgElevated: '#1D2A21',      // Elevated surface
    primaryGreen: '#315B40',    // Primary emerald forest green
    sage: '#91B39A',            // Sage green accent
    mutedGreen: '#6F8D76',      // Muted green
    textPrimary: '#F1F3ED',     // Primary text
    textSecondary: '#A6B1A7',   // Secondary text
    gold: '#C4A77D',            // Champagne gold accent
    borderGlass: 'rgba(255, 255, 255, 0.10)',
    borderAccent: 'rgba(196, 167, 125, 0.22)',
  },

  gradients: {
    primary: 'linear-gradient(135deg, #315B40 0%, #91B39A 100%)',
    forestGlow: 'linear-gradient(135deg, #111A14 0%, #17221A 100%)',
    glassSurface: 'linear-gradient(180deg, rgba(23, 34, 26, 0.75) 0%, rgba(17, 26, 20, 0.85) 100%)',
    goldGlow: 'linear-gradient(135deg, #C4A77D 0%, #91B39A 100%)',
  },

  typography: {
    headingFont: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
    bodyFont: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    editorialFont: "'DM Serif Display', Georgia, serif",
  },

  assets: {
    logo: '/brand/aevora-logo.svg',
    logoDark: '/brand/aevora-logo-dark.svg',
    logoLight: '/brand/aevora-logo-light.svg',
    icon: '/brand/aevora-icon.svg',
    favicon: '/favicon.svg',
  },

  links: {
    supportEmail: 'concierge@traveliq.ai',
    securityEmail: 'security@traveliq.ai',
    docs: '/developer',
  },

  features: [
    {
      title: 'Cinematic 3D Multi-Modal Discovery',
      description: 'Algorithmic route synthesis calculating rail, road, and flight itineraries in real time.',
      icon: 'Compass',
    },
    {
      title: 'Dark Luxury Travel Intelligence',
      description: 'Intelligent journey forecasting, crowd analysis, and hotel reservation luxury tiers.',
      icon: 'Shield',
    },
    {
      title: 'Instant Railway & Stay Integration',
      description: 'Authentic IRCTC telescopic fares, live station tracking, and verified hospitality.',
      icon: 'Train',
    },
    {
      title: 'Smart Fare Comparison',
      description: 'Transparent fare structures with dynamic historical price analytics.',
      icon: 'TrendingDown',
    },
    {
      title: 'Personalized Travel Assistance',
      description: 'Context-aware conversational intelligence tailored to your travel preferences.',
      icon: 'Sparkles',
    },
    {
      title: 'Local Transportation Insights',
      description: 'First-to-last-mile connectivity maps, station hubs, and local transit transfers.',
      icon: 'MapPin',
    },
    {
      title: 'Real-Time Travel Information',
      description: 'Live rail delay forecasts, platform updates, and schedule notifications.',
      icon: 'Clock',
    },
  ],
};

export default BRAND;

