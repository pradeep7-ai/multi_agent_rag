import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-20',
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/assets/company-logo.png"
        alt="Logo"
        className={`${sizeClasses[size]} w-auto object-contain`}
        style={{ maxWidth: '100%' }}
      />
    </div>
  );
};

export default Logo; 