import React from 'react';
import { Shield } from 'lucide-react';

interface LogoProps {
  variant?: 'light' | 'dark'; // 'light' is for light backgrounds (dark text), 'dark' is for dark backgrounds (white text)
  size?: 'sm' | 'md' | 'lg';
  badge?: string;
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  badge,
  showTagline = false,
  className = '',
  onClick
}) => {
  const isDark = variant === 'dark';

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5 sm:w-6 sm:h-6',
    lg: 'w-7 h-7 sm:w-8 sm:h-8'
  };

  const badgeBoxSizes = {
    sm: 'w-6 h-6 rounded-md',
    md: 'w-8 h-8 rounded-xl',
    lg: 'w-10 h-10 rounded-2xl'
  };

  const textSizes = {
    sm: 'text-sm font-extrabold',
    md: 'text-base sm:text-lg font-black',
    lg: 'text-xl sm:text-2xl font-black'
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center space-x-2.5 select-none transition-transform ${
        onClick ? 'cursor-pointer hover:opacity-90 active:scale-[0.98]' : ''
      } ${className}`}
    >
      {/* Emblem Icon Container with Sleek Gradient Border */}
      <div
        className={`${badgeBoxSizes[size]} flex items-center justify-center shadow-xs ${
          isDark
            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-500/20'
            : 'bg-slate-900 text-white shadow-slate-900/10'
        }`}
      >
        <Shield className={`${iconSizes[size]} fill-current`} />
      </div>

      {/* Brand Title & Badges */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-1.5 leading-none">
          <span
            className={`${textSizes[size]} tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Protego
          </span>
          {badge && (
            <span
              className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded ${
                isDark
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                  : 'bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              {badge}
            </span>
          )}
        </div>

        {showTagline && (
          <span
            className={`text-[10px] font-medium tracking-wide mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Public Safety & Emergency Response
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
