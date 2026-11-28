import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../../config/branding';

/**
 * AEVORA Official Logo Component
 * Luxury Dark Glass Monogram with Warm Gold & Forest Accent.
 */
export const Logo = ({
  variant = 'full',      // 'full' | 'icon' | 'wordmark' | 'badge'
  size = 'md',           // 'sm' | 'md' | 'lg' | 'xl'
  withTagline = false,
  to = '/',
  className = '',
  link = true,
}) => {
  const sizeMap = {
    sm: { height: 26, iconSize: 26, fontSize: 'text-base' },
    md: { height: 34, iconSize: 32, fontSize: 'text-xl' },
    lg: { height: 44, iconSize: 40, fontSize: 'text-2xl' },
    xl: { height: 54, iconSize: 48, fontSize: 'text-3xl' },
  };

  const { iconSize, fontSize } = sizeMap[size] || sizeMap.md;

  // Pure SVG Luxury Chevron Monogram
  const renderIcon = () => (
    <div
      style={{
        width: iconSize,
        height: iconSize,
        background: 'linear-gradient(135deg, #17221A 0%, #1D2A21 100%)',
        border: '1px solid rgba(196, 167, 125, 0.40)',
        boxShadow: '0 4px 14px rgba(11, 16, 13, 0.6)'
      }}
      className="relative flex-shrink-0 flex items-center justify-center rounded-xl text-[#F1F3ED] transition-transform duration-300 group-hover:scale-105"
    >
      <svg className="w-4 h-4 fill-[#C4A77D]" viewBox="0 0 24 24">
        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
      </svg>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-transparent to-white/10 pointer-events-none" />
    </div>
  );

  // Text Wordmark
  const renderWordmark = () => (
    <div className="flex flex-col leading-none">
      <div className="flex items-center gap-1">
        <span
          className={`font-extrabold tracking-tight ${fontSize} text-[#F1F3ED] font-heading`}
        >
          Aevora<span className="text-[#C4A77D]">.</span>
        </span>
      </div>
      {withTagline && (
        <span className="text-[9px] font-semibold text-[#91B39A] tracking-widest uppercase leading-none mt-1 hidden xs:inline">
          {BRAND.subTagline || BRAND.tagline}
        </span>
      )}
    </div>
  );

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none group ${className}`}>
      {(variant === 'full' || variant === 'icon' || variant === 'badge') && renderIcon()}
      {(variant === 'full' || variant === 'wordmark') && renderWordmark()}
      {variant === 'badge' && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#315B40]/25 text-[#91B39A] border border-[#315B40]/50 tracking-wider">
          LUXURY
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
