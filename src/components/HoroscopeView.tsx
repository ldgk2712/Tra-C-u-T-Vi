import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Download, Share2, LayoutDashboard, Star, TrendingUp, CalendarDays, Info, BarChart2, PieChart, Settings, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { PalaceCell } from './PalaceCell';
import { CentralBlock } from './CentralBlock';
import { AIAnalysisTabs } from './AIAnalysisTabs';
import { CustomSelect } from './CustomSelect';
import { FloatingChat } from './FloatingChat';
import { mockPalaces, mockCentralInfo, Palace, CentralInfo } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import * as htmlToImage from 'html-to-image';

interface HoroscopeViewProps {
  onNavigate: (view: 'home' | 'chart' | 'overview') => void;
  chartData?: { palaces: Palace[], centralInfo: CentralInfo } | null;
  onYearChange?: (year: number) => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
      active
        ? 'bg-[#d4af37]/15 text-[#d4af37]'
        : 'text-white/60 hover:text-white/90 hover:bg-white/5'
    }`}
  >
    <span className={`flex-shrink-0 ${active ? 'text-[#d4af37]' : 'text-white/50'}`}>{icon}</span>
    <span className="truncate">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto text-[#d4af37]/60" />}
  </button>
);

export const HoroscopeView: React.FC<HoroscopeViewProps> = ({ onNavigate, chartData, onYearChange }) => {
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  const [showAnnualStars, setShowAnnualStars] = useState<boolean>(true);
  const chartRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const palaces = chartData?.palaces || mockPalaces;
  const centralInfo = chartData?.centralInfo || mockCentralInfo;

  const getPalace = (id: string) => palaces.find(p => p.id === id);

  const handlePalaceClick = (palace: Palace) => {
    setSelectedPalace(palace);
    document.getElementById('ai-analysis-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDownload = async () => {
    if (chartRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(chartRef.current, {
          quality: 1.0,
          pixelRatio: 2,
          backgroundColor: '#f7f3e9'
        });
        const link = document.createElement('a');
        link.download = `laso_${centralInfo.name}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to download chart', err);
      }
    }
  };

  const renderTuanTrietBadge = (p1Id: string, p2Id: string, top: string, left: string, transform: string) => {
    const p1 = getPalace(p1Id);
    const p2 = getPalace(p2Id);
    if (!p1 || !p2) return null;
    const hasTuan = p1.isTuan && p2.isTuan;
    const hasTriet = p1.isTriet && p2.isTriet;
    if (!hasTuan && !hasTriet) return null;
    let text = '';
    if (hasTuan && hasTriet) text = 'Tuần - Triệt';
    else if (hasTuan) text = 'Tuần';
    else if (hasTriet) text = 'Triệt';
    return (
      <div
        className="absolute z-20 px-1.5 py-[1px] bg-gray-800/70 backdrop-blur-sm text-white/90 text-[8px] font-bold rounded-sm shadow-sm border border-gray-600/30 whitespace-nowrap tracking-wide"
        style={{ top, left, transform }}
      >
        {text}
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#1f1d1b]">
      {/* ─── Left Sidebar ─── */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col bg-[#1f1d1b] border-r border-white/[0.06]">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full border border-[#d4af37]/60 text-[#d4af37] group-hover:border-[#d4af37] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3.5 13.9 9.2 19.5 7.2 15.8 12l3.7 4.8-5.6-2-1.9 5.7-1.9-5.7-5.6 2L8.2 12 4.5 7.2l5.6 2L12 3.5Z" />
              </svg>
            </span>
            <span className="font-serif text-[20px] font-semibold text-white leading-none tracking-[-0.01em]">AstroTuVi</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">Chính</p>
          <NavItem icon={<LayoutDashboard size={16} />} label="Tổng quan" onClick={() => onNavigate('home')} />
          <NavItem icon={<Star size={16} />} label="Lá Số Tử Vi" active />
          <NavItem icon={<TrendingUp size={16} />} label="Tài vận" />
          <NavItem icon={<CalendarDays size={16} />} label="Lịch" />

          <div className="my-3 border-t border-white/[0.06]" />
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">Khác</p>
          <NavItem icon={<Info size={16} />} label="Thông tin" />
          <NavItem icon={<BarChart2 size={16} />} label="Thống kê Orion Điện" />
          <NavItem icon={<PieChart size={16} />} label="Tổng Cộng" />
          <NavItem icon={<Settings size={16} />} label="Cài đặt" />
        </nav>

        {/* Bottom user strip */}
        <div className="px-3 py-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors cursor-pointer">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="h-7 w-7 rounded-full border border-white/20" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-[#d4af37]/20 grid place-items-center text-[#d4af37] text-[11px] font-bold">
                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-white/80 truncate">{user?.displayName || 'Khách'}</p>
              <p className="text-[10px] text-white/35 truncate">{user?.email || 'Chưa đăng nhập'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f7f3e9]">
        {/* Top Header Bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-[#f7f3e9] border-b border-[#e8ddd0] z-30">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[13px]">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 text-[#8a7968] hover:text-[#5a4a3a] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Trang chủ
            </button>
            <span className="text-[#c4b8a8]">/</span>
            <span className="font-semibold text-[#2b2825]">Lá Số Tử Vi</span>
            <ChevronRight size={14} className="text-[#c4b8a8]" />
            <span className="text-[#8a7968] max-w-[180px] truncate">{centralInfo.name}</span>
          </div>

          {/* Actions + User */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#e0d5c8] bg-white/70 text-[12px] font-medium text-[#5a4a3a] hover:border-[#c4a96a] hover:bg-white transition-colors">
              <SlidersHorizontal size={13} />
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#e0d5c8] bg-white/70 text-[12px] font-medium text-[#5a4a3a] hover:border-[#c4a96a] hover:bg-white transition-colors">
              <Share2 size={13} />
              Chia sẻ
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#e0d5c8] bg-white/70 text-[12px] font-medium text-[#5a4a3a] hover:border-[#c4a96a] hover:bg-white transition-colors"
            >
              <Download size={13} />
              Tải về
            </button>
            {/* User info */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[#e0d5c8]">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="h-7 w-7 rounded-full border border-[#c4a96a]/40" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-[#d4af37]/20 grid place-items-center text-[#9a7020] text-[11px] font-bold border border-[#d4af37]/30">
                  {(user?.displayName || centralInfo.name || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="text-[12px] font-medium text-[#3a2e24] max-w-[100px] truncate">
                {user?.displayName || centralInfo.name}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5">
            {/* Page title + Luận giải CTA */}
            <div className="flex items-center justify-between mb-4 max-w-[960px] mx-auto">
              <div>
                <h1 className="font-serif text-[22px] font-semibold text-[#1f1d1b] leading-tight">
                  Lá số <span className="text-[#b88327]">{centralInfo.name}</span>
                </h1>
                <p className="text-[12px] text-[#8a7968] mt-0.5">Tử Vi · {centralInfo.birthYear} · {centralInfo.menh}</p>
              </div>
              <button
                onClick={() => document.getElementById('ai-analysis-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-1.5 h-9 px-5 rounded-lg bg-[#1f1d1b] text-white text-[13px] font-medium hover:bg-[#2d2b29] transition-colors shadow-sm flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Luận giải toàn bộ
                <span className="text-[#d4af37] font-semibold">219k</span>
              </button>
            </div>

            {/* Chart Grid */}
            <div ref={chartRef} className="bg-white/50 rounded-xl shadow-sm border border-[#e8ddd0] overflow-hidden max-w-[960px] mx-auto">
              <div className="w-full grid grid-cols-4 grid-rows-4 border-[1.5px] border-[#c4a96a]/30 relative" style={{ aspectRatio: '4/3' }}>
                {/* Tuần/Triệt Badges */}
                {renderTuanTrietBadge('ty', 'ngo', '0%', '25%', 'translate(-50%, 0)')}
                {renderTuanTrietBadge('ngo', 'mui', '0%', '50%', 'translate(-50%, 0)')}
                {renderTuanTrietBadge('mui', 'than', '0%', '75%', 'translate(-50%, 0)')}
                {renderTuanTrietBadge('than', 'dau', '25%', '100%', 'translate(-50%, -50%)')}
                {renderTuanTrietBadge('dau', 'tuat', '50%', '100%', 'translate(-50%, -50%)')}
                {renderTuanTrietBadge('tuat', 'hoi', '75%', '100%', 'translate(-50%, -50%)')}
                {renderTuanTrietBadge('hoi', 'ty_bottom', '100%', '75%', 'translate(-50%, -100%)')}
                {renderTuanTrietBadge('ty_bottom', 'suu', '100%', '50%', 'translate(-50%, -100%)')}
                {renderTuanTrietBadge('suu', 'dan', '100%', '25%', 'translate(-50%, -100%)')}
                {renderTuanTrietBadge('dan', 'mao', '75%', '0%', 'translate(0, -50%)')}
                {renderTuanTrietBadge('mao', 'thin', '50%', '0%', 'translate(0, -50%)')}
                {renderTuanTrietBadge('thin', 'ty', '25%', '0%', 'translate(0, -50%)')}

                {/* Row 1 */}
                <div className="col-start-1 row-start-1 h-full">
                  {getPalace('ty') && <PalaceCell palace={getPalace('ty')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
                </div>
                <div className="col-start-2 row-start-1 h-full">
                  {getPalace('ngo') && <PalaceCell palace={getPalace('ngo')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
                </div>
                <div className="col-start-3 row-start-1 h-full">
                  {getPalace('mui') && <PalaceCell palace={getPalace('mui')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
                </div>
                <div className="col-start-4 row-start-1 h-full">
                  {getPalace('than') && <PalaceCell palace={getPalace('than')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
                </div>

                {/* Row 2 */}
                <div className="col-start-1 row-start-2 h-full">
                  {getPalace('thin') && <PalaceCell palace={getPalace('thin')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
                </div>
                {/* Central Block spans row 2-3, col 2-3 */}
                <div className="col-start-2 col-span-2 row-start-2 row-span-2 h-full">
                  <CentralBlock info={centralInfo} />
                </div>
                <div className="col-start-4 row-start-2 h-full">
                  {getPalace('dau') && <PalaceCell palace={getPalace('dau')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
                </div>

                {/* Row 3 */}
                <div className="col-start-1 row-start-3 h-full">
                  {getPalace('mao') && <PalaceCell palace={getPalace('mao')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
                </div>
                <div className="col-start-4 row-start-3 h-full">
                  {getPalace('tuat') && <PalaceCell palace={getPalace('tuat')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
                </div>

                {/* Row 4 */}
                <div className="col-start-1 row-start-4 h-full">
                  {getPalace('dan') && <PalaceCell palace={getPalace('dan')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
                </div>
                <div className="col-start-2 row-start-4 h-full">
                  {getPalace('suu') && <PalaceCell palace={getPalace('suu')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
                </div>
                <div className="col-start-3 row-start-4 h-full">
                  {getPalace('ty_bottom') && <PalaceCell palace={getPalace('ty_bottom')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
                </div>
                <div className="col-start-4 row-start-4 h-full">
                  {getPalace('hoi') && <PalaceCell palace={getPalace('hoi')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
                </div>
              </div>

              {/* Legend + Controls Bar */}
              <div className="flex flex-wrap justify-between items-center px-4 py-3 border-t border-[#e8ddd0] gap-3 bg-white/30">
                <div className="flex items-center gap-4 text-[11px] text-[#7a6a5a]">
                  <span className="flex items-center gap-1"><strong className="text-red-600">M</strong> Miếu</span>
                  <span className="flex items-center gap-1"><strong className="text-orange-500">V</strong> Vượng</span>
                  <span className="flex items-center gap-1"><strong className="text-green-600">Đ</strong> Đắc</span>
                  <span className="flex items-center gap-1"><strong className="text-blue-500">B</strong> Bình</span>
                  <span className="flex items-center gap-1"><strong className="text-gray-500">H</strong> Hãm</span>
                  <span className="w-px h-3 bg-[#e0d5c8]" />
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />Kim</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600 inline-block" />Mộc</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700 inline-block" />Thủy</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Hỏa</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />Thổ</span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <CustomSelect
                      value={centralInfo.viewYear}
                      onChange={(value) => onYearChange && onYearChange(parseInt(value))}
                      prefix="Năm: "
                      transparent={true}
                      className="text-[12px] text-[#5a4a3a] font-medium"
                      options={[...Array(13)].map((_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return { value: `${year}`, label: `${year}` };
                      })}
                    />
                  </div>
                  <button
                    onClick={() => setShowAnnualStars(!showAnnualStars)}
                    className={`flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] font-medium transition-all border ${
                      showAnnualStars
                        ? 'bg-[#1f1d1b] text-white border-transparent'
                        : 'bg-white/60 text-[#5a4a3a] border-[#e0d5c8] hover:bg-white'
                    }`}
                  >
                    {showAnnualStars ? <EyeOff size={13} /> : <Eye size={13} />}
                    {showAnnualStars ? 'Ẩn sao lưu' : 'Sao lưu'}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div id="ai-analysis-section" className="mt-8">
              <AIAnalysisTabs selectedPalace={selectedPalace} palaces={palaces} centralInfo={centralInfo} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Box */}
      <FloatingChat palaces={palaces} centralInfo={centralInfo} />
    </div>
  );
};
