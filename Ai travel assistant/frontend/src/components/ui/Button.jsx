import React from 'react';
import { Link } from 'react-router-dom';

export default function Button({
  children,
  variant = 'forest', // 'forest' | 'gold' | 'ghost' | 'glass'
  size = 'md', // 'sm' | 'md' | 'lg'
  to,
  href,
  onClick,
  className = '',
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-5 py-2.5 rounded-xl gap-2',
    lg: 'text-base px-6 py-3.5 rounded-xl gap-2.5 font-semibold',
  };

  const variantClasses = {
    forest: 'btn-forest font-medium',
    gold: 'btn-gold font-medium',
    ghost: 'btn-ghost-glass font-medium',
    glass: 'bg-[#17221A]/80 hover:bg-[#1D2A21] text-[#F1F3ED] border border-white/10 hover:border-[#91B39A]/30 backdrop-blur-md shadow-sm transition-all',
  };

  const combinedClasses = `inline-flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.forest} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
        {children}
        {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} target="_blank" rel="noopener noreferrer" {...props}>
        {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
        {children}
        {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
