import React from 'react';

/**
 * Reusable Frosted Glass Surface Component
 * Follows exact specifications: rgba(17, 26, 20, 0.55) + blur(20px) + 1px solid rgba(255, 255, 255, 0.14)
 */
export default function GlassCard({
  children,
  className = '',
  elevated = false,
  interactive = false,
  onClick,
  style = {},
  ...props
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: elevated ? 'rgba(29, 42, 33, 0.85)' : 'rgba(17, 26, 20, 0.55)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        ...style
      }}
      className={`rounded-2xl transition-all duration-300 ${
        interactive ? 'cursor-pointer hover:border-[#C4A77D]/40 hover:-translate-y-1 hover:shadow-2xl shadow-black/40' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
