import React from 'react';

export default function GlassCard({
  children,
  className = '',
  elevated = false,
  interactive = false,
  ...props
}) {
  const baseClass = elevated ? 'glass-card-elevated' : 'glass-card';
  const interactiveClass = interactive ? 'cursor-pointer hover:border-[#91B39A]/40 hover:-translate-y-1' : '';

  return (
    <div 
      className={`rounded-2xl p-6 relative overflow-hidden ${baseClass} ${interactiveClass} ${className}`}
      {...props}
    >
      {/* Subtle top-edge light reflection */}
      <div 
        className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
      />
      {children}
    </div>
  );
}
