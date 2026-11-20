/**
 * AEVORA Travel - Robust Offline/CDN Image Fallback Generator
 * Generates self-contained SVG Data URIs with zero network dependencies.
 * Prevents broken image icons, CDN timeouts, and layout shifts.
 */

export function getDestinationFallbackSvg(name = 'Destination', state = 'India', region = 'Explore') {
  const safeName = String(name || 'Destination').replace(/[<>&'"]/g, '');
  const safeState = String(state || 'India').replace(/[<>&'"]/g, '');
  const safeRegion = String(region || 'Explore').toUpperCase().replace(/[<>&'"]/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
    <defs>
      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#142C3D"/>
        <stop offset="45%" stop-color="#244C66"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
      <linearGradient id="accentGlow" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#D96C4F" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#244C66" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="hill1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0F2433" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#193B52" stop-opacity="0.85"/>
      </linearGradient>
      <linearGradient id="hill2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#08141F" stop-opacity="0.98"/>
        <stop offset="100%" stop-color="#0E212E" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    
    <!-- Sky Background -->
    <rect width="800" height="520" fill="url(#skyGrad)"/>
    <rect width="800" height="520" fill="url(#accentGlow)"/>
    
    <!-- Ambient Sun/Moon -->
    <circle cx="680" cy="90" r="110" fill="#D96C4F" opacity="0.15"/>
    <circle cx="680" cy="90" r="70" fill="#F8FAFC" opacity="0.1"/>

    <!-- Decorative Stars / Constellations -->
    <circle cx="120" cy="60" r="1.5" fill="#FFFFFF" opacity="0.6"/>
    <circle cx="240" cy="90" r="1.5" fill="#FFFFFF" opacity="0.4"/>
    <circle cx="380" cy="50" r="2" fill="#FFFFFF" opacity="0.5"/>
    <circle cx="520" cy="110" r="1.5" fill="#FFFFFF" opacity="0.7"/>

    <!-- Architectural Mountain/Dome Silhouette -->
    <path d="M0,380 Q180,320 360,370 T720,340 L800,360 L800,520 L0,520 Z" fill="url(#hill1)"/>
    
    <!-- Heritage Palace / Landmark Outline -->
    <g transform="translate(480, 260)" fill="#142C3D" opacity="0.7">
      <rect x="0" y="40" width="180" height="80" rx="4"/>
      <path d="M40,40 C40,10 70,10 70,40 Z"/>
      <path d="M110,40 C110,0 150,0 150,40 Z"/>
      <circle cx="90" cy="15" r="8" fill="#D96C4F" opacity="0.7"/>
    </g>

    <!-- Foreground Ridge -->
    <path d="M0,420 Q220,380 440,430 T800,410 L800,520 L0,520 Z" fill="url(#hill2)"/>
    
    <!-- Typographic Watermark -->
    <g transform="translate(48, 290)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" letter-spacing="3" fill="#D96C4F">${safeRegion}</text>
      <text x="0" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">${safeName}</text>
      <text x="0" y="68" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#CBD5E1">${safeState}, India</text>
    </g>

    <g transform="translate(752, 480)" text-anchor="end" opacity="0.4">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" letter-spacing="1.5" fill="#94A3B8">AEVORA TRAVEL</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function handleImageFallback(e, name = 'Destination', state = 'India', region = 'Explore') {
  e.currentTarget.onerror = null;
  e.currentTarget.src = getDestinationFallbackSvg(name, state, region);
}
