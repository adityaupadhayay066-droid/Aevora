import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../../config/branding';

/**
 * TravelIQ Official Logo Component
 * Dark Luxury Glass Identity with Emerald & Gold accents.
 */
export const Logo = ({
  variant = 'full',      // 'full' | 'icon' | 'wordmark' | 'badge'
  theme = 'dark',        // 'dark'
  size = 'md',           // 'sm' | 'md' | 'lg' | 'xl'
  withTagline = false,
  to = '/',
  className = '',
  link = true,
}) => {
  // Height presets
  const sizeMap = {
    sm: { height: 26, iconSize: 26, fontSize: 'text-base' },
    md: { height: 34, iconSize: 32, fontSize: 'text-xl' },
    lg: { height: 44, iconSize: 40, fontSize: 'text-2xl' },
    xl: { height: 54, iconSize: 48, fontSize: 'text-3xl' },
  };

  const { iconSize, fontSize } = sizeMap[size] || sizeMap.md;

  // Render pure SVG Monogram with subtle gold / sage accent
  const renderIcon = () => (
    <div
      style={{
        width: iconSize,
        height: iconSize,
        background: 'linear-gradient(135deg, #17221A 0%, #1D2A21 100%)',
        border: '1px solid rgba(196, 167, 125, 0.35)',
        boxShadow: '0 4px 12px rgba(11, 16, 13, 0.5)'
      }}
      className="relative flex-shrink-0 flex items-center justify-center rounded-lg text-[#F1F3ED] transition-transform duration-200 group-hover:scale-105"
    >
      <svg className="w-4 h-4 fill-[#C4A77D]" viewBox="0 0 24 24">
        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
      </svg>
      <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent via-transparent to-white/10 pointer-events-none" />
    </div>
  );

  // Render text wordmark
  const renderWordmark = () => (
    <div className="flex flex-col leading-none">
      <div className="flex items-center gap-1">
        <span
          className={`font-extrabold tracking-tight ${fontSize} text-[#F1F3ED] font-heading`}
        >
          Travel<span className="text-[#C4A77D]">IQ</span>
        </span>
      </div>
      {withTagline && (
        <span className="text-[9.5px] font-medium text-[#A6B1A7] tracking-widest uppercase leading-none mt-1 hidden xs:inline">
          {BRAND.tagline}
        </span>
      )}
    </div>
  );

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none group ${className}`}>
      {(variant === 'full' || variant === 'icon' || variant === 'badge') && renderIcon()}
      {(variant === 'full' || variant === 'wordmark') && renderWordmark()}
      {variant === 'badge' && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#315B40]/20 text-[#91B39A] border border-[#315B40]/40">
          INTELLIGENCE
        </span>
      )}
    </div>
  );

  if (link && to) {
    return (
      <Link to={to} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;

