import React from 'react';
import { useApp } from '../../context/AppContext';

export interface LogoProps {
  size?: 'navbar' | 'sidebar' | 'auth' | 'loading' | 'footer' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  showSubtitle?: boolean;
  clickable?: boolean;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'navbar',
  className = '',
  onClick,
  showSubtitle = false,
  clickable = true,
  alt = 'UrbanPulse - Safer Streets, Smarter Cities'
}) => {
  const { setActiveTab } = useApp();

  const handleClick = () => {
    if (!clickable) return;
    if (onClick) {
      onClick();
    } else {
      setActiveTab('command_center');
    }
  };

  // Size mapping preserving aspect ratio with object-contain
  const sizeClasses: Record<string, string> = {
    navbar: 'h-10 sm:h-11 w-auto max-w-[170px]',
    sidebar: 'h-8 sm:h-9 w-auto max-w-[140px]',
    auth: 'w-36 sm:w-44 h-auto max-h-24',
    loading: 'w-24 sm:w-28 h-auto max-h-28 animate-pulse',
    footer: 'h-8 w-auto max-w-[130px]',
    sm: 'h-7 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-24 w-auto'
  };

  const imgClass = sizeClasses[size] || sizeClasses.navbar;

  return (
    <div
      onClick={clickable ? handleClick : undefined}
      className={`inline-flex items-center space-x-2 select-none ${
        clickable ? 'cursor-pointer group' : ''
      } ${className}`}
      title="UrbanPulse - AI-Powered Urban Intelligence Platform"
    >
      <img
        src="/urbanpulse-logo.png"
        alt={alt}
        className={`${imgClass} object-contain shrink-0 transition-transform duration-200 ${
          clickable ? 'group-hover:scale-102' : ''
        }`}
        loading="eager"
      />
      {showSubtitle && (
        <div className="hidden sm:flex flex-col">
          <span className="text-[10px] text-[#64748B] font-mono leading-none">
            BEL • SIH26124
          </span>
        </div>
      )}
    </div>
  );
};
