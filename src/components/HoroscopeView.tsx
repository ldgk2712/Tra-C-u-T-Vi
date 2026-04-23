import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Download } from 'lucide-react';
import { PalaceCell } from './PalaceCell';
import { CentralBlock } from './CentralBlock';
import { AIAnalysisTabs } from './AIAnalysisTabs';
import { CustomSelect } from './CustomSelect';
import { FloatingChat } from './FloatingChat';
import { mockPalaces, mockCentralInfo, Palace, CentralInfo } from '../data/mockData';
import * as htmlToImage from 'html-to-image';

interface HoroscopeViewProps {
  onNavigate: (view: 'home' | 'chart') => void;
  chartData?: { palaces: Palace[], centralInfo: CentralInfo } | null;
  onYearChange?: (year: number) => void;
}

export const HoroscopeView: React.FC<HoroscopeViewProps> = ({ onNavigate, chartData, onYearChange }) => {
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  const [showAnnualStars, setShowAnnualStars] = useState<boolean>(true);
  const chartRef = useRef<HTMLDivElement>(null);

  const palaces = chartData?.palaces || mockPalaces;
  const centralInfo = chartData?.centralInfo || mockCentralInfo;

  // Helper to find a palace by its ID
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
        console.error("Failed to download chart", err);
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
        className="absolute z-20 px-0.5 sm:px-1.5 py-0 sm:py-[1px] bg-gray-800/60 backdrop-blur-sm text-white/90 text-[4px] sm:text-[8px] font-bold rounded-sm shadow-sm border border-gray-600/30 whitespace-nowrap tracking-wide"
        style={{ top, left, transform }}
      >
        {text}
      </div>
    );
  };

  const VanKhanh = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <path d="M20,50 Q30,30 50,50 T80,50 Q90,70 70,80 T30,80 Q10,70 20,50 Z M40,60 Q45,55 50,60 T60,60" opacity="0.15" />
      <path d="M30,40 Q40,20 60,40 T90,40 Q100,60 80,70 T40,70 Q20,60 30,40 Z" opacity="0.1" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#f7f3e9] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-amber-50/30 to-transparent pointer-events-none"></div>
      
      {/* Vân Khánh - Traditional Clouds */}
      <VanKhanh className="absolute top-4 left-4 w-32 h-32 text-gold rotate-0" />
      <VanKhanh className="absolute top-4 right-4 w-32 h-32 text-gold rotate-90" />
      <VanKhanh className="absolute bottom-4 left-4 w-32 h-32 text-gold -rotate-90" />
      <VanKhanh className="absolute bottom-4 right-4 w-32 h-32 text-gold rotate-180" />

      {/* Geometric Frame */}
      <div className="absolute inset-8 border border-gold/20 pointer-events-none"></div>
      <div className="absolute inset-10 border-[0.5px] border-gold/10 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header/Title */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('home')}
              className="p-2 text-maroon/60 hover:text-maroon hover:bg-maroon/5 rounded-full transition-colors"
              title="Quay lại"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                Lá số của <span className="text-maroon">{centralInfo.name}</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">Khám phá vận mệnh qua góc nhìn Tử Vi & AI</p>
            </div>
          </div>
          <button 
            onClick={() => document.getElementById('ai-analysis-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto justify-center bg-maroon hover:bg-maroon/90 text-white px-6 py-2.5 rounded-full font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Luận giải toàn bộ - 219k
          </button>
        </div>

        {/* Chart Grid Container */}
        <div ref={chartRef} className="bg-white/60 backdrop-blur-sm p-1 sm:p-4 md:p-8 rounded-2xl shadow-xl border border-gold/20 relative">
          {/* Internal Frame for Chart */}
          <div className="absolute inset-2 border border-gold/10 rounded-xl pointer-events-none"></div>
          
          <div className="w-full max-w-4xl mx-auto grid grid-cols-4 auto-rows-fr gap-0 border-[2px] sm:border-[3px] border-maroon/20 rounded-lg overflow-hidden shadow-inner bg-maroon/5 relative aspect-[3/4] sm:aspect-auto sm:min-h-[800px]">
            
            {/* Tuần/Triệt Badges */}
            {/* Top Row (Horizontal) - Topmost of intersection */}
            {renderTuanTrietBadge('ty', 'ngo', '0%', '25%', 'translate(-50%, 0)')}
            {renderTuanTrietBadge('ngo', 'mui', '0%', '50%', 'translate(-50%, 0)')}
            {renderTuanTrietBadge('mui', 'than', '0%', '75%', 'translate(-50%, 0)')}

            {/* Right Column (Vertical) - Middle of intersection */}
            {renderTuanTrietBadge('than', 'dau', '25%', '87.5%', 'translate(-50%, -50%)')}
            {renderTuanTrietBadge('dau', 'tuat', '50%', '87.5%', 'translate(-50%, -50%)')}
            {renderTuanTrietBadge('tuat', 'hoi', '75%', '87.5%', 'translate(-50%, -50%)')}

            {/* Bottom Row (Horizontal) - Topmost of intersection */}
            {renderTuanTrietBadge('hoi', 'ty_bottom', '75%', '75%', 'translate(-50%, -50%)')}
            {renderTuanTrietBadge('ty_bottom', 'suu', '75%', '50%', 'translate(-50%, -50%)')}
            {renderTuanTrietBadge('suu', 'dan', '75%', '25%', 'translate(-50%, -50%)')}

            {/* Left Column (Vertical) - Middle of intersection */}
            {renderTuanTrietBadge('dan', 'mao', '75%', '12.5%', 'translate(-50%, -50%)')}
            {renderTuanTrietBadge('mao', 'thin', '50%', '12.5%', 'translate(-50%, -50%)')}
            {renderTuanTrietBadge('thin', 'ty', '25%', '12.5%', 'translate(-50%, -50%)')}

            {/* Row 1 */}
            <div className="col-start-1 row-start-1 h-full w-full">
              {getPalace('ty') && <PalaceCell palace={getPalace('ty')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
            </div>
            <div className="col-start-2 row-start-1 h-full w-full">
              {getPalace('ngo') && <PalaceCell palace={getPalace('ngo')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
            </div>
            <div className="col-start-3 row-start-1 h-full w-full">
              {getPalace('mui') && <PalaceCell palace={getPalace('mui')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
            </div>
            <div className="col-start-4 row-start-1 h-full w-full">
              {getPalace('than') && <PalaceCell palace={getPalace('than')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
            </div>

            {/* Row 2 */}
            <div className="col-start-1 row-start-2 h-full w-full">
              {getPalace('thin') && <PalaceCell palace={getPalace('thin')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
            </div>
            {/* Central Block spans row 2-3, col 2-3 */}
            <div className="col-start-2 col-span-2 row-start-2 row-span-2 h-full w-full p-1 overflow-hidden">
              <CentralBlock info={centralInfo} />
            </div>
            <div className="col-start-4 row-start-2 h-full w-full">
              {getPalace('dau') && <PalaceCell palace={getPalace('dau')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
            </div>

            {/* Row 3 */}
            <div className="col-start-1 row-start-3 h-full w-full">
              {getPalace('mao') && <PalaceCell palace={getPalace('mao')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
            </div>
            <div className="col-start-4 row-start-3 h-full w-full">
              {getPalace('tuat') && <PalaceCell palace={getPalace('tuat')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
            </div>

            {/* Row 4 */}
            <div className="col-start-1 row-start-4 h-full w-full">
              {getPalace('dan') && <PalaceCell palace={getPalace('dan')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
            </div>
            <div className="col-start-2 row-start-4 h-full w-full">
              {getPalace('suu') && <PalaceCell palace={getPalace('suu')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
            </div>
            <div className="col-start-3 row-start-4 h-full w-full">
              {getPalace('ty_bottom') && <PalaceCell palace={getPalace('ty_bottom')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
            </div>
            <div className="col-start-4 row-start-4 h-full w-full">
              {getPalace('hoi') && <PalaceCell palace={getPalace('hoi')!} onClick={handlePalaceClick} showAnnualStars={showAnnualStars} />}
            </div>

          </div>

          {/* Legend */}
          <div className="mt-4 sm:mt-8 flex flex-wrap justify-center sm:justify-between items-center text-[9px] sm:text-sm text-gray-600 border-t border-gold/20 pt-4 sm:pt-6 gap-2 sm:gap-4">
            <div className="flex space-x-2 sm:space-x-4 bg-maroon/5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gold/10">
              <span className="flex items-center gap-0.5 sm:gap-1"><strong className="text-red-600 font-serif">M:</strong> Miếu</span>
              <span className="flex items-center gap-0.5 sm:gap-1"><strong className="text-orange-500 font-serif">V:</strong> Vượng</span>
              <span className="flex items-center gap-0.5 sm:gap-1"><strong className="text-green-600 font-serif">Đ:</strong> Đắc</span>
              <span className="flex items-center gap-0.5 sm:gap-1"><strong className="text-blue-600 font-serif">B:</strong> Bình hòa</span>
              <span className="flex items-center gap-0.5 sm:gap-1"><strong className="text-gray-500 font-serif">H:</strong> Hãm</span>
            </div>
            <div className="flex space-x-2 sm:space-x-4 items-center bg-maroon/5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gold/10">
              <div className="flex items-center"><span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-500 inline-block mr-1 sm:mr-1.5 shadow-sm"></span>Kim</div>
              <div className="flex items-center"><span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-green-600 inline-block mr-1 sm:mr-1.5 shadow-sm"></span>Mộc</div>
              <div className="flex items-center"><span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-black inline-block mr-1 sm:mr-1.5 shadow-sm"></span>Thủy</div>
              <div className="flex items-center"><span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-red-600 inline-block mr-1 sm:mr-1.5 shadow-sm"></span>Hỏa</div>
              <div className="flex items-center"><span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-600 inline-block mr-1 sm:mr-1.5 shadow-sm"></span>Thổ</div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="mt-6 flex justify-center relative z-50">
          <div className="bg-white/60 backdrop-blur-md border border-gold/30 rounded-2xl p-1.5 flex flex-col sm:flex-row items-stretch shadow-sm gap-1.5 sm:gap-0">
            <div className="w-full sm:w-44 border-b sm:border-b-0 sm:border-r border-gold/10 pb-1.5 sm:pb-0 sm:pr-1.5 flex items-center">
              <CustomSelect
                value={centralInfo.viewYear}
                onChange={(value) => onYearChange && onYearChange(parseInt(value))}
                prefix="Năm xem: "
                transparent={true}
                className="w-full text-maroon font-medium"
                options={[...Array(13)].map((_, i) => {
                  const currentYear = new Date().getFullYear();
                  const year = currentYear - 2 + i;
                  return {
                    value: `${year}`,
                    label: `${year}`
                  };
                })}
              />
            </div>
            <div className="sm:pl-1.5 flex items-center justify-center gap-2">
              <button
                onClick={() => setShowAnnualStars(!showAnnualStars)}
                className={`w-full sm:w-auto h-10 sm:h-full px-5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border ${
                  showAnnualStars 
                    ? 'bg-maroon text-white border-gold/30 shadow-md hover:bg-maroon/90' 
                    : 'bg-white/40 text-maroon border-gold/20 hover:bg-maroon/5'
                }`}
              >
                {showAnnualStars ? (
                  <>
                    <EyeOff size={18} className="text-gold" />
                    Ẩn sao lưu
                  </>
                ) : (
                  <>
                    <Eye size={18} className="text-gold" />
                    Hiện sao lưu
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto h-10 sm:h-full px-5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 bg-maroon text-white border border-gold/30 shadow-md hover:bg-maroon/90"
                title="Tải lá số về máy"
              >
                <Download size={18} className="text-gold" />
                Tải lá số
              </button>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div id="ai-analysis-section" className="mt-12">
          <AIAnalysisTabs selectedPalace={selectedPalace} palaces={palaces} centralInfo={centralInfo} />
        </div>
      </div>

      {/* Floating Chat Box */}
      <FloatingChat palaces={palaces} centralInfo={centralInfo} />
    </div>
  );
};
