import React from 'react';
import { cn } from '@/lib/utils';

interface BrandedHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const BrandedHeader: React.FC<BrandedHeaderProps> = ({
  title = "Prontivus",
  subtitle = "Intelligent Care",
  showLogo = true,
  className,
  children
}) => {
  return (
    <div className={cn(
      "brand-header bg-gradient-to-r from-blue-600 to-blue-800 text-white",
      "px-6 py-4 rounded-t-lg",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showLogo && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="brand-logo text-xl font-bold text-white">
                  {title}
                </h1>
                <p className="brand-slogan text-sm text-blue-100 italic">
                  {subtitle}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandedHeader;
