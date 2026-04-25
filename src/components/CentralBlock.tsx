import React from 'react';
import { CentralInfo } from '../data/mockData';

interface CentralBlockProps {
  info: CentralInfo;
}

const TaiCuc: React.FC = () => (
  <svg width="60" height="60" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="47" fill="white" stroke="#c4a96a" strokeWidth="1.5" />
    {/* Dark (Âm) half - bottom */}
    <path d="M50 3 A47 47 0 0 1 50 97 A23.5 23.5 0 0 0 50 50 A23.5 23.5 0 0 1 50 3 Z" fill="#1a1916" />
    {/* Small white circle in dark half (top of dark = yang inside yin) */}
    <circle cx="50" cy="26.5" r="11.75" fill="white" />
    {/* Small dark circle in light half (bottom of light = yin inside yang) */}
    <circle cx="50" cy="73.5" r="11.75" fill="#1a1916" />
  </svg>
);

export const CentralBlock: React.FC<CentralBlockProps> = ({ info }) => {
  return (
    <div className="h-full w-full bg-[#fffdf9] flex flex-col items-center overflow-hidden border border-[#e8ddd0]">
      {/* Title bar */}
      <div className="text-center py-2 w-full border-b border-[#e8ddd0]">
        <h2 className="font-serif font-bold text-[12px] text-[#2b2218] tracking-[0.2em] uppercase leading-none">THIÊN BÀN</h2>
        <div className="flex items-center justify-center mt-1 gap-1.5">
          <div className="h-px w-6 bg-[#c4a96a]/50" />
          <div className="w-1 h-1 rounded-full bg-[#c4a96a]/70" />
          <div className="h-px w-6 bg-[#c4a96a]/50" />
        </div>
      </div>

      {/* Content: two-column layout */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Left: Yin-yang + key labels */}
        <div className="flex flex-col items-center justify-center w-[45%] px-2 py-2 border-r border-[#e8ddd0]/60 gap-2">
          <TaiCuc />
          <div className="text-center space-y-0.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#c4a96a]">Lá Số Tử Vi</p>
            <p className="text-[10px] font-bold text-[#2b2218] truncate max-w-[100px] text-center">{info.name}</p>
            <p className="text-[8.5px] text-[#8a7a6a]">{info.menh}</p>
            <p className="text-[8.5px] text-[#8a7a6a]">{info.cuc}</p>
          </div>
          <div className="w-full border-t border-[#e8ddd0]/60 pt-1.5 space-y-1 text-center">
            <div>
              <p className="text-[7.5px] text-[#a09080] uppercase tracking-[0.1em]">Mệnh Chủ</p>
              <p className="text-[10px] font-semibold text-[#3a2e24]">{info.menhChu}</p>
            </div>
            <div>
              <p className="text-[7.5px] text-[#a09080] uppercase tracking-[0.1em]">Thân Chủ</p>
              <p className="text-[10px] font-semibold text-[#3a2e24]">{info.thanChu}</p>
            </div>
          </div>
        </div>

        {/* Right: Info table */}
        <div className="flex-1 px-2 py-2 overflow-y-auto">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#c4a96a] mb-1.5">Thông tin</p>
          <table className="w-full text-[9.5px] leading-snug">
            <tbody>
              <InfoRow label="Họ tên" value={info.name} bold />
              <Divider />
              <InfoRow label="Năm" value={`${info.birthYear} · ${info.birthYearCanChi}`} />
              <InfoRow label="Tháng" value={`${info.lunarMonth} · ${info.lunarMonthCanChi}`} />
              <InfoRow label="Ngày" value={`${info.lunarDay} · ${info.lunarDayCanChi}`} />
              <InfoRow label="Giờ" value={`${info.birthHour}`} />
              <InfoRow label="" value={info.birthHourCanChi} muted />
              <Divider />
              <InfoRow label="Xem" value={`${info.viewYear} · ${info.viewYearCanChi}`} />
              <InfoRow label="Tuổi" value={info.age} />
              <Divider />
              <InfoRow label="Â.Dương" value={info.amDuong} />
              <InfoRow label="" value={info.amDuongNghichLy} muted />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string; bold?: boolean; muted?: boolean }> = ({ label, value, bold, muted }) => (
  <tr>
    <td className="text-[#9a8878] font-medium pr-1.5 pb-0.5 align-top whitespace-nowrap">{label}</td>
    <td className={`pb-0.5 align-top ${bold ? 'font-bold text-[#1f1d1b]' : muted ? 'text-[#a09080]' : 'font-medium text-[#3a2e24]'}`}>{value}</td>
  </tr>
);

const Divider: React.FC = () => (
  <tr><td colSpan={2}><div className="h-px bg-[#ede5da] my-1" /></td></tr>
);
