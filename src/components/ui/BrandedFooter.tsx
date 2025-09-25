import React from 'react';
import { cn } from '@/lib/utils';

interface BrandedFooterProps {
  className?: string;
  showCopyright?: boolean;
  additionalInfo?: string;
}

const BrandedFooter: React.FC<BrandedFooterProps> = ({
  className,
  showCopyright = true,
  additionalInfo
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className={cn(
      "brand-footer bg-gray-100 text-gray-600 px-6 py-3 text-center text-sm rounded-b-lg",
      className
    )}>
      <div className="flex flex-col items-center gap-1">
        <p className="font-medium text-gray-700">
          Prontivus — Intelligent Care
        </p>
        {additionalInfo && (
          <p className="text-xs text-gray-500">
            {additionalInfo}
          </p>
        )}
        {showCopyright && (
          <p className="text-xs text-gray-400">
            © {currentYear} Prontivus. Todos os direitos reservados.
          </p>
        )}
      </div>
    </div>
  );
};

export default BrandedFooter;
