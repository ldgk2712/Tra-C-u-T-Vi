import React from 'react';
import { Palace } from '../data/mockData';
import { getElementColorClass } from '../utils/colors';

interface PalaceCellProps {
  palace: Palace;
  onClick?: (palace: Palace) => void;
  showAnnualStars?: boolean;
}

export const PalaceCell: React.FC<PalaceCellProps> = ({ palace, onClick, showAnnualStars = false }) => {
  const formatCanChi = (str: string) => {
    if (!str) return '';
    const parts = str.includes('.') ? str.split('.') : str.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}. ${parts.slice(1).join(' ')}`;
    }
    return str;
  };

  return (
    <div 
      className={`border border-amber-200/40 bg-[#fffdfa] p-0.5 sm:p-2 flex flex-col h-full text-[7px] sm:text-xs relative group overflow-hidden ${onClick ? 'cursor-pointer hover:bg-amber-50/80 hover:border-amber-400/60 hover:shadow-md transition-all duration-300' : ''}`}
      onClick={() => onClick && onClick(palace)}
    >
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-8 sm:w-16 h-8 sm:h-16 bg-gradient-to-bl from-amber-100/30 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Top Row: Can Chi, Name, Age */}
      <div className="flex justify-between items-start mb-1.5 sm:mb-4 relative z-10">
        <span className="font-serif font-medium text-amber-800/60 text-[4.5px] sm:text-[11px] leading-none">{formatCanChi(palace.canChi)}</span>
        <div className="absolute inset-x-0 top-[3px] sm:top-[2px] flex justify-center pointer-events-none">
          <span className="font-bold text-amber-900 uppercase tracking-wider text-[6px] sm:text-[15px] drop-shadow-sm leading-none">{palace.name}</span>
        </div>
        <span className="font-medium text-amber-700/80 text-[4.5px] sm:text-[11px] leading-none">{palace.age}</span>
      </div>

      {/* Main Stars */}
      <div className="flex flex-col items-center justify-center mb-0.5 sm:mb-3 min-h-[14px] sm:min-h-[24px] relative z-10">
        {palace.mainStars.map((star, idx) => (
          <span key={idx} className={`font-serif font-bold text-[6px] sm:text-base tracking-wide drop-shadow-sm leading-tight ${getElementColorClass(star.element)}`}>
            {star.name}
          </span>
        ))}
      </div>

      {/* Auxiliary Stars (Left/Right Columns) */}
      <div className="flex justify-between flex-1 overflow-hidden relative z-10 leading-[1.1] sm:leading-tight">
        {/* Good Stars (Left) */}
        <div className="flex flex-col items-start w-1/2 pr-0.5 sm:pr-1 space-y-0 sm:space-y-0.5">
          {palace.goodStars.map((star, idx) => (
            <span key={idx} className={`truncate w-full font-medium text-[4.5px] sm:text-[11px] ${getElementColorClass(star.element)}`}>
              {star.name}
            </span>
          ))}
          {showAnnualStars && palace.annualStars?.filter((_, i) => i % 2 === 0).map((star, idx) => (
            <span key={`ann-l-${idx}`} className={`truncate w-full font-bold bg-amber-200/40 px-0.5 rounded text-[4.5px] sm:text-[11px] ${getElementColorClass(star.element)}`}>
              {star.name}
            </span>
          ))}
        </div>
        
        {/* Bad Stars (Right) */}
        <div className="flex flex-col items-end w-1/2 pl-0.5 sm:pl-1 space-y-0 sm:space-y-0.5">
          {palace.badStars.map((star, idx) => (
            <span key={idx} className={`truncate w-full text-right font-medium text-[4.5px] sm:text-[11px] ${getElementColorClass(star.element)}`}>
              {star.name}
            </span>
          ))}
          {showAnnualStars && palace.annualStars?.filter((_, i) => i % 2 !== 0).map((star, idx) => (
            <span key={`ann-r-${idx}`} className={`truncate w-full text-right font-bold bg-amber-200/40 px-0.5 rounded text-[4.5px] sm:text-[11px] ${getElementColorClass(star.element)}`}>
              {star.name}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Row: Element & Status */}
      <div className="flex justify-between items-end mt-0.5 sm:mt-2 pt-0.5 sm:pt-1.5 border-t border-amber-100/50 relative z-10">
        <span className="font-medium text-amber-800/60 text-[4px] sm:text-[10px] leading-none">{palace.bottomLeft}</span>
        <span className="font-medium text-amber-800/60 text-[4px] sm:text-[10px] leading-none">{palace.bottomRight}</span>
      </div>

      {/* Special Badges (Thân) */}
      <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 flex flex-col items-end gap-1 z-20">
        {palace.isThan && (
          <span className="bg-red-600/90 text-white text-[3.5px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0 sm:py-0.5 rounded shadow-sm backdrop-blur-sm">Thân</span>
        )}
      </div>
    </div>
  );
};
