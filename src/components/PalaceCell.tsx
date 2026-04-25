import React from 'react';
import { Palace } from '../data/mockData';
import { getElementColorClass } from '../utils/colors';

interface PalaceCellProps {
  palace: Palace;
  onClick?: (palace: Palace) => void;
  showAnnualStars?: boolean;
}

export const PalaceCell: React.FC<PalaceCellProps> = ({ palace, onClick, showAnnualStars = false }) => {
  const ageNum = parseInt(palace.age);
  const daiVanLabel = !isNaN(ageNum) ? `${ageNum} - ${ageNum + 9}` : palace.age;

  return (
    <div
      className={`border border-[#e8ddd0] bg-[#fffdf9] flex flex-col w-full h-full text-xs relative group overflow-hidden ${
        onClick ? 'cursor-pointer hover:bg-[#fffbf3] hover:border-[#c4a96a]/60 transition-all duration-200' : ''
      }`}
      onClick={() => onClick && onClick(palace)}
    >
      {/* Top Row: Can Chi | Palace Name | Age */}
      <div className="flex justify-between items-start px-2 pt-1.5 pb-1 relative">
        <span className="font-serif text-[10px] text-[#a08060]/70 leading-none flex-shrink-0">{palace.canChi}</span>
        <span className="absolute inset-x-0 top-1.5 text-center font-bold text-[11px] text-[#2b2218] uppercase tracking-wide leading-none pointer-events-none px-8 truncate">
          {palace.name}
        </span>
        <span className="font-medium text-[10px] text-[#a08060]/70 leading-none flex-shrink-0">{palace.age}</span>
      </div>

      {/* Main Stars */}
      <div className="flex flex-col items-center justify-center px-1 py-0.5 min-h-[28px]">
        {palace.mainStars.map((star, idx) => (
          <span
            key={idx}
            className={`font-serif font-bold text-[12px] leading-tight tracking-wide drop-shadow-sm ${getElementColorClass(star.element)}`}
          >
            {star.name}
          </span>
        ))}
      </div>

      {/* Auxiliary Stars: Left (good) | Right (bad) */}
      <div className="flex justify-between flex-1 overflow-hidden px-1.5 pb-1 gap-1">
        {/* Good Stars - Left */}
        <div className="flex flex-col items-start w-1/2 space-y-[1px]">
          {palace.goodStars.map((star, idx) => (
            <span key={idx} className={`truncate w-full text-[9.5px] font-medium leading-snug ${getElementColorClass(star.element)}`}>
              {star.name}
            </span>
          ))}
          {showAnnualStars && palace.annualStars?.filter((_, i) => i % 2 === 0).map((star, idx) => (
            <span key={`ann-l-${idx}`} className={`truncate w-full text-[9px] font-semibold leading-snug bg-amber-100/60 rounded px-0.5 ${getElementColorClass(star.element)}`}>
              {star.name}
            </span>
          ))}
        </div>
        {/* Bad Stars - Right */}
        <div className="flex flex-col items-end w-1/2 space-y-[1px]">
          {palace.badStars.map((star, idx) => (
            <span key={idx} className={`truncate w-full text-right text-[9.5px] font-medium leading-snug ${getElementColorClass(star.element)}`}>
              {star.name}
            </span>
          ))}
          {showAnnualStars && palace.annualStars?.filter((_, i) => i % 2 !== 0).map((star, idx) => (
            <span key={`ann-r-${idx}`} className={`truncate w-full text-right text-[9px] font-semibold leading-snug bg-amber-100/60 rounded px-0.5 ${getElementColorClass(star.element)}`}>
              {star.name}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Row: Đại Vận badge | địa chi | status */}
      <div className="flex justify-between items-center px-2 py-1 border-t border-[#e8ddd0]/60 mt-auto gap-1">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#d4af37]/15 text-[#9a7020] border border-[#d4af37]/35 leading-none flex-shrink-0">
          {daiVanLabel}
        </span>
        <div className="flex items-center gap-1 min-w-0">
          {palace.bottomLeft && <span className="text-[8.5px] text-[#a09080] truncate">{palace.bottomLeft}</span>}
          {palace.bottomRight && <span className="text-[8.5px] font-medium text-[#7a6a5a] truncate">{palace.bottomRight}</span>}
        </div>
      </div>

      {/* Thân badge */}
      {palace.isThan && (
        <div className="absolute top-1 right-1 z-20">
          <span className="bg-red-600/85 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">Thân</span>
        </div>
      )}
    </div>
  );
};
