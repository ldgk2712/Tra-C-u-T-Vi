import React, { useMemo } from 'react';
import {
  LayoutDashboard, Star, TrendingUp, CalendarDays,
  Info, BarChart2, ChevronRight, Search, Zap,
  Settings, Wrench, Bell, Maximize2, Briefcase, Heart, Sun, Target, User, Crown, ArrowUp, ArrowDown, ChevronDown
} from 'lucide-react';
import { Palace, CentralInfo, mockCentralInfo } from '../data/mockData';

interface OverviewDashboardProps {
  onNavigate: (view: 'home' | 'chart' | 'overview') => void;
  chartData: { palaces: Palace[]; centralInfo: CentralInfo } | null;
}

function getDvRating(p: Palace): number {
  const score = p.goodStars.length * 1.5 + p.mainStars.length * 2 - p.badStars.length;
  if (score >= 7) return 5;
  if (score >= 5) return 4;
  if (score >= 3) return 3;
  if (score >= 1) return 2;
  return 1;
}

/* ── Sidebar NavItem ── */
const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  hasArrow?: boolean;
}> = ({ icon, label, active, onClick, hasArrow }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-medium transition-all duration-200 rounded-lg group ${
      active
        ? 'text-[#C8A464] bg-[#2A2A2A]'
        : 'text-white/45 hover:text-white/80 hover:bg-white/[0.05]'
    }`}
  >
    <div className="flex items-center gap-3">
      <span className={`flex-shrink-0 ${active ? 'text-[#C8A464]' : 'text-white/30 group-hover:text-white/55'}`}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </div>
    {hasArrow && <ChevronRight size={14} className="text-white/30" />}
  </button>
);

/* ── Circular gauge ── */
const GaugeChart: React.FC<{ value: number; size?: number; strokeWidth?: number }> = ({
  value, size = 82, strokeWidth = 8,
}) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const progress = (value / 100) * circ * 0.75;
  const uid = `gc${value}x${size}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C8A464" />
          <stop offset="100%" stopColor="#e8c872" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth}
        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeLinecap="round"
        transform={`rotate(135 ${size / 2} ${size / 2})`} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${uid})`} strokeWidth={strokeWidth}
        strokeDasharray={`${progress} ${circ}`} strokeLinecap="round"
        transform={`rotate(135 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" dominantBaseline="middle"
        fontSize="21" fontWeight="bold" fill="#333" fontFamily="sans-serif">
        {value}
      </text>
      <text x={size / 2} y={size / 2 + 12} textAnchor="middle" fontSize="9" fill="#888" fontFamily="sans-serif">
        /100
      </text>
    </svg>
  );
};

/* ── Multi-segment element donut ── */
const ElementDonutChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  total: number;
}> = ({ data, total }) => {
  const r = 32;
  const cx = 38, cy = 38;
  const circ = 2 * Math.PI * r;
  let accumulated = 0;
  const gap = 2;
  const segments = data.map(d => {
    const len = total > 0 ? (d.value / total) * circ : 0;
    const seg = { ...d, len: Math.max(0, len - gap), rotation: (accumulated / circ) * 360 - 90 };
    accumulated += len;
    return seg;
  });
  return (
    <svg width={76} height={76} viewBox="0 0 76 76">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0ebe4" strokeWidth={8} />
      {segments.map((seg, i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill="none" stroke={seg.color} strokeWidth={8}
          strokeDasharray={`${seg.len} ${circ}`}
          strokeLinecap="butt"
          transform={`rotate(${seg.rotation} ${cx} ${cy})`} />
      ))}
      <circle cx={cx} cy={cy} r={14} fill="#fff" shadow="0 2px 4px rgba(0,0,0,0.1)" />
      <Star x={cx - 7} y={cy - 7} size={14} className="text-[#C8A464]" fill="currentColor" />
    </svg>
  );
};

/* ── Wu Xing compass (compact, landscape-friendly) ── */
const ElementCompass: React.FC<{ menh: string; menhChu: string; thanChu: string }> = ({
  menh, menhChu, thanChu,
}) => {
  const cx = 80, cy = 60, r = 36;
  const nodes = [
    { label: 'Hỏa', color: '#B9655D', angle: -90 },
    { label: 'Thổ', color: '#A88C54', angle: -90 + 72 },
    { label: 'Kim', color: '#D1D5DB', angle: -90 + 144 },
    { label: 'Thủy', color: '#6B8EAD', angle: -90 + 216 },
    { label: 'Mộc', color: '#5A8A72', angle: -90 + 288 },
  ].map(n => ({
    ...n,
    x: cx + r * Math.cos((n.angle * Math.PI) / 180),
    y: cy + r * Math.sin((n.angle * Math.PI) / 180),
  }));
  const poly = nodes.map((n, i) => `${i === 0 ? 'M' : 'L'}${n.x.toFixed(1)},${n.y.toFixed(1)}`).join(' ') + ' Z';
  return (
    <div className="flex w-full h-full items-center">
      <div className="w-[140px] h-[120px] relative">
        <svg viewBox="0 0 160 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="#E5E7EB" strokeWidth={0.8} strokeDasharray="2 5" />
          <path d={poly} fill="none" stroke="#C8A464" strokeWidth={0.7} strokeOpacity={0.3} />
          {nodes.map((n, i) => (
            <line key={i} x1={cx} y1={cy} x2={n.x.toFixed(1)} y2={n.y.toFixed(1)}
              stroke="#C8A464" strokeWidth={0.5} strokeOpacity={0.2} />
          ))}
          <circle cx={cx} cy={cy} r={14} fill="#fff" stroke="#C8A464" strokeWidth={1} />
          <text x={cx} y={cy + 3} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#C8A464">Bản</text>
          {nodes.map((n, i) => (
            <g key={i} transform={`translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`}>
              <circle r={9} fill="#fff" stroke={n.color} strokeWidth={0.8} />
              <text x={0} y={3} textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={n.color}>{n.label}</text>
            </g>
          ))}
          <text x={cx} y={15} textAnchor="middle" fontSize="8" fill="#888">N</text>
          <text x={cx} y={115} textAnchor="middle" fontSize="8" fill="#888">S</text>
          <text x={20} y={cy+3} textAnchor="middle" fontSize="8" fill="#888">W</text>
          <text x={140} y={cy+3} textAnchor="middle" fontSize="8" fill="#888">E</text>
        </svg>
      </div>
      <div className="flex-1 flex flex-col justify-center space-y-4 pl-2">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-[#A88C54]" />
          <div>
            <p className="text-[10px] text-gray-500">Tài thần</p>
            <p className="text-[11px] font-bold text-gray-800">ĐÔNG NAM</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Heart size={14} className="text-[#B9655D]" />
          <div>
            <p className="text-[10px] text-gray-500">Hỷ thần</p>
            <p className="text-[11px] font-bold text-gray-800">CHÍNH NAM</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <User size={14} className="text-[#6B8EAD]" />
          <div>
            <p className="text-[10px] text-gray-500">Quý nhân</p>
            <p className="text-[11px] font-bold text-gray-800">TÂY BẮC</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Mini Palace Grid (4×4) ── */
const MiniGrid: React.FC<{ palaces: Palace[] }> = ({ palaces }) => {
  const getPalace = (id: string) => palaces.find(p => p.id === id);
  const toTitle = (t: string) => t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const parseName = (name: string) => {
    const m = name.match(/^(.+?)\s*(\([^)]+\))\s*$/);
    return m ? { main: toTitle(m[1]), status: m[2] } : { main: toTitle(name), status: '' };
  };
  const outer: { id: string; row: number; col: number }[] = [
    { id: 'ty', row: 1, col: 1 }, { id: 'ngo', row: 1, col: 2 },
    { id: 'mui', row: 1, col: 3 }, { id: 'than', row: 1, col: 4 },
    { id: 'thin', row: 2, col: 1 }, { id: 'dau', row: 2, col: 4 },
    { id: 'mao', row: 3, col: 1 }, { id: 'tuat', row: 3, col: 4 },
    { id: 'dan', row: 4, col: 1 }, { id: 'suu', row: 4, col: 2 },
    { id: 'ty_bottom', row: 4, col: 3 }, { id: 'hoi', row: 4, col: 4 },
  ];
  return (
    <div className="grid gap-[1px] bg-[#E5E7EB] rounded-lg overflow-hidden border border-[#E5E7EB]"
      style={{ gridTemplateColumns: 'repeat(4,1fr)', gridTemplateRows: 'repeat(4,1fr)', height: '100%' }}>
      {outer.map(cell => {
        const p = getPalace(cell.id);
        return (
          <div key={cell.id} style={{ gridColumn: cell.col, gridRow: cell.row }}
            className="bg-[#FFFFFF] hover:bg-[#FDFBF7] transition-colors duration-200 flex flex-col items-center justify-start overflow-hidden pt-1.5 pb-0 px-0.5">
            <div className="w-full scale-[0.85] origin-top flex flex-col items-center gap-0">
              <div className="text-[7.5px] font-bold text-[#333] text-center leading-tight w-full px-0.5 mb-px">
                {p?.name?.toUpperCase() || ''}
              </div>
              <div className="text-[6px] text-gray-400 font-medium mb-1">{toTitle(cell.id)}</div>
              <div className="flex flex-col items-center gap-0 w-full">
                {p?.mainStars.map((star, idx) => {
                  const { main, status } = parseName(star.name);
                  return (
                    <div key={idx} className="leading-[0.75] w-full text-center px-0.5 mt-0.5">
                      <span className="text-[7px] text-[#C8A464] font-medium">{main}</span>
                      {status && <span className="text-[6px] text-[#C8A464] ml-[1px]">{status}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ gridColumn: '2 / 4', gridRow: '2 / 4' }}
        className="bg-[#FDFBF7] flex flex-col items-center justify-center gap-1.5 border border-[#E5E7EB]/50">
        <span className="text-[20px] text-[#333] leading-none">☯</span>
        <span className="text-[12px] font-bold text-[#333] uppercase tracking-widest mt-1">MỆNH</span>
        <span className="text-[9px] font-semibold text-[#888] uppercase tracking-wide">THÁI DƯƠNG (H)</span>
        <div className="text-[8px] text-gray-500 mt-2 space-y-0.5 text-center">
            <p>Hành Hỏa</p>
            <p>Âm Dương Dương</p>
            <p>Mệnh chủ: Liêm Trinh</p>
            <p>Thân chủ: Thiên Đồng</p>
        </div>
      </div>
    </div>
  );
};

/* ── Smooth SVG trend chart ── */
const TrendChart: React.FC<{ viewYear: number }> = ({ viewYear }) => {
  const years = Array.from({ length: 11 }, (_, i) => viewYear - 5 + i);
  const vals = [42, 55, 60, 52, 68, 76, 72, 88, 77, 85, 70];
  const minV = 0, maxV = 100;
  const W = 540, H = 155;
  const pL = 24, pR = 16, pT = 16, pB = 28;
  const cW = W - pL - pR, cH = H - pT - pB;
  const pts = vals.map((v, i) => ({
    x: pL + (i / (vals.length - 1)) * cW,
    y: pT + cH - ((v - minV) / (maxV - minV)) * cH,
  }));
  const smooth = (ps: { x: number; y: number }[]) => {
    let d = `M${ps[0].x.toFixed(1)},${ps[0].y.toFixed(1)}`;
    for (let i = 1; i < ps.length; i++) {
      const cpx = (ps[i - 1].x + ps[i].x) / 2;
      d += ` C${cpx.toFixed(1)},${ps[i - 1].y.toFixed(1)} ${cpx.toFixed(1)},${ps[i].y.toFixed(1)} ${ps[i].x.toFixed(1)},${ps[i].y.toFixed(1)}`;
    }
    return d;
  };
  const line = smooth(pts);
  const area = `${line} L${pts[pts.length - 1].x},${pT + cH} L${pts[0].x},${pT + cH} Z`;
  const nowIdx = 7; // Year 2028 based on analysis example
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8A464" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#C8A464" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1={pL} y1={pT + t * cH} x2={pL + cW} y2={pT + t * cH}
          stroke="#E5E7EB" strokeWidth={i === 4 ? 1 : 0.6} />
      ))}
      {[100, 75, 50, 25, 0].map((v, i) => (
          <text key={v} x={pL - 8} y={pT + (i/4) * cH + 3} textAnchor="end" fontSize="9" fill="#9CA3AF">{v}</text>
      ))}

      {/* Vertical hover line for highlighted year */}
      <line x1={pts[nowIdx].x} y1={pT} x2={pts[nowIdx].x} y2={pT + cH}
        stroke="#E5E7EB" strokeWidth={1} strokeDasharray="4 4" />
      
      <path d={area} fill="url(#tGrad)" />
      <path d={line} fill="none" stroke="#C8A464" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={i === nowIdx ? 5 : 3.5}
            fill="#C8A464" stroke="#fff" strokeWidth={1.5} />
        </g>
      ))}
      {years.map((yr, i) => (
        <text key={yr} x={pts[i].x} y={H - 5} textAnchor="middle" fontSize="10"
          fill={i === nowIdx ? '#333' : '#9CA3AF'} fontWeight={i === nowIdx ? 'bold' : 'normal'}>
          {yr}
        </text>
      ))}

      {/* Tooltip */}
      <g transform={`translate(${pts[nowIdx].x - 60}, ${pts[nowIdx].y - 65})`}>
         <rect x="0" y="0" width="120" height="50" rx="6" fill="#fff" stroke="#E5E7EB" strokeWidth="1" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))" />
         <text x="10" y="15" fontSize="10" fontWeight="bold" fill="#333">2028 (Năm 5)</text>
         <text x="10" y="28" fontSize="9" fill="#888">Năng lượng: <tspan fontWeight="bold" fill="#333">{vals[nowIdx]}</tspan></text>
         <text x="10" y="40" fontSize="9" fill="#888">Cơ hội: </text>
         <text x="45" y="40" fontSize="10" fill="#C8A464">★★★</text><text x="75" y="40" fontSize="10" fill="#E5E7EB">★★</text>
      </g>
    </svg>
  );
};

/* ── Star rating ── */
const StarRatingCompact: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={11} className={i < rating ? 'text-[#C8A464] fill-[#C8A464]' : 'text-[#E5E7EB] fill-[#E5E7EB]'} />
    ))}
  </div>
);

/* ── Card primitives ── */
const KpiCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-4 pt-4
    shadow-sm
    hover:shadow-md
    transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const PanelCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden
    shadow-sm transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const PanelHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode; icon?: React.ReactNode }> = ({
  title, subtitle, action, icon
}) => (
  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
    <div className="flex items-center gap-2">
      {icon && <span className="text-gray-400">{icon}</span>}
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-gray-800 uppercase tracking-wide truncate">{title}</p>
        {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

/* ── Main ── */
export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate, chartData }) => {
  const palaces = chartData?.palaces ?? [];
  const info = chartData?.centralInfo ?? mockCentralInfo;

  const currentAge = parseInt(info.age) || 34; // Using 34 based on analysis image "34-43 tuổi"
  const firstName = info.name.split(' ').pop() || "Minh Anh";
  const viewYear = parseInt(info.viewYear) || 2024; // Base year 2024 for chart

  const currentDaiVan = useMemo(() => {
    if (!palaces.length) return null;
    return (
      palaces.find(p => {
        const s = parseInt(p.age);
        return s <= currentAge && currentAge < s + 10;
      }) ??
      palaces.find(p => parseInt(p.age) <= currentAge) ??
      palaces[0]
    );
  }, [palaces, currentAge]);

  const dvAge = currentDaiVan ? parseInt(currentDaiVan.age) : Math.floor(currentAge / 10) * 10;
  const dvStartYear = viewYear - (currentAge - dvAge);
  const dvEndYear = dvStartYear + 9;
  const dvProgress = Math.round(((currentAge - dvAge) / 10) * 100);

  const elementCounts = useMemo(() => {
    const c = { kim: 20, moc: 30, thuy: 15, hoa: 25, tho: 10 }; // Values from analysis
    return c;
  }, []);
  const totalStars = 100;

  const overallScore = 86;
  const careerScore = 82;
  const relaScore = 74;
  const globalScore = 87;

  const ELEMENTS = [
    { key: 'kim' as const, label: 'Kim', color: '#D1D5DB' },
    { key: 'moc' as const, label: 'Mộc', color: '#5A8A72' },
    { key: 'thuy' as const, label: 'Thủy', color: '#6B8EAD' },
    { key: 'hoa' as const, label: 'Hỏa', color: '#B9655D' },
    { key: 'tho' as const, label: 'Thổ', color: '#A88C54' },
  ];

  const elementDonutData = ELEMENTS.map(el => ({
    label: el.label,
    value: elementCounts[el.key],
    color: el.color,
  }));

  const mockTimeline = [
    { age: '14 - 23', range: '2014 – 2023', score: 68, active: false, title: 'THIẾU NIÊN' },
    { age: '24 - 33', range: '2024 – 2033', score: 76, active: false, title: 'THANH NIÊN' },
    { age: '34 - 43', range: '2024 – 2033', score: 86, active: true, title: 'TRUNG NIÊN' },
    { age: '44 - 53', range: '2034 – 2043', score: 72, active: false, title: 'HẬU VẬN' },
    { age: '54 - 63', range: '2044 – 2053', score: 65, active: false, title: 'AN NHÀN' },
    { age: '64 - 73', range: '2054 – 2063', score: 60, active: false, title: 'PHÚC THỌ' },
  ];

  const starInfluenceRows = [
      { name: 'Thái Dương', type: 'Chính Tinh', palace: 'Danh vọng, sự nghiệp', rating: 5, positive: true, intensity: 90 },
      { name: 'Thiên Lương', type: 'Cát Tinh', palace: 'Quý nhân, phúc đức', rating: 4, positive: true, intensity: 75 },
      { name: 'Thất Sát', type: 'Hung Tinh', palace: 'Thử thách, biến động', rating: 2, positive: false, intensity: 40 },
      { name: 'Thiên Đồng', type: 'Phúc Tinh', palace: 'Hỗ trợ, may mắn', rating: 4, positive: true, intensity: 70 },
  ];

  const greetingStr = 'Chào buổi sáng';

  return (
    <div className="flex h-screen overflow-hidden bg-[#FDFBF7] font-sans text-gray-800">

      {/* ── Left Sidebar ── */}
      <aside className="w-[260px] flex-shrink-0 flex flex-col bg-[#1D1D1D] text-white">

        {/* Logo */}
        <div className="px-6 py-6 flex items-center justify-center">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-[#C8A464] text-[#C8A464]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3.5 13.9 9.2 19.5 7.2 15.8 12l3.7 4.8-5.6-2-1.9 5.7-1.9-5.7-5.6 2L8.2 12 4.5 7.2l5.6 2L12 3.5Z" />
                  <path d="M18.8 3.8h.01M20.9 5.9h.01" />
                </svg>
              </span>
              <span className="font-serif text-[26px] font-semibold leading-none tracking-[-0.01em] text-[#F3E9D2]">AstroTuVi</span>
            </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          <NavItem icon={<LayoutDashboard size={18} />} label="Tổng quan" active />
          <NavItem icon={<Star size={18} />} label="Lá Số Tử Vi" onClick={() => onNavigate('chart')} />
          <NavItem icon={<TrendingUp size={18} />} label="Đại Vận" />
          <NavItem icon={<BarChart2 size={18} />} label="Báo Cáo" />
          <NavItem icon={<CalendarDays size={18} />} label="Lịch" />
          
          <div className="my-4 mx-3 border-t border-gray-800" />
          
          <NavItem icon={<Sun size={18} />} label="Thông Tin Chiêm Tinh" />
          <NavItem icon={<Wrench size={18} />} label="Công Cụ" hasArrow={true} />
          <NavItem icon={<Settings size={18} />} label="Cài Đặt" />
        </nav>

        {/* Premium CTA */}
        <div className="mx-4 mb-6 rounded-2xl p-5 text-center bg-gradient-to-br from-[#332B1C] to-[#1F1D1B] border border-[#4A3E26]">
          <div className="inline-flex items-center justify-center mb-3">
            <Star className="text-[#C8A464]" size={24} />
          </div>
          <p className="text-[14px] font-bold text-white mb-2">Khai mở tiềm năng vô hạn</p>
          <p className="text-[12px] text-gray-400 leading-relaxed mb-4">
            Nhận những phân tích chuyên sâu để kiến tạo tương lai tốt đẹp hơn.
          </p>
          <button className="w-full py-2.5 rounded-lg bg-[#C8A464] text-gray-900 text-[13px] font-bold hover:bg-[#d4af37] transition-all flex items-center justify-center gap-2">
            Nâng cấp ngay
            <Crown size={14} />
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top Header ── */}
        <header className="flex-shrink-0 flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
          {/* Search – left */}
          <div className="flex items-center gap-2 h-10 bg-gray-50 border border-gray-200 rounded-lg px-4 w-[400px] text-gray-500">
            <Search size={16} />
            <input type="text" placeholder="Tìm kiếm lá số, báo cáo, insight..." className="bg-transparent border-none outline-none flex-1 text-[13px]" />
            <div className="bg-gray-200 text-gray-600 text-[11px] font-medium px-2 py-0.5 rounded">⌘K</div>
          </div>

          <div className="flex items-center gap-6">
            {/* Energy pill */}
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-gray-600">Năng lượng hôm nay</span>
              <div className="flex items-baseline gap-0.5">
                  <span className="text-[20px] font-bold text-[#C8A464]">{globalScore}</span>
                  <span className="text-[12px] text-gray-400">/100</span>
              </div>
              <TrendingUp size={16} className="text-[#C8A464] ml-1" />
            </div>

            <div className="h-6 w-px bg-gray-200" />

            {/* Bell */}
            <button className="relative">
              <Bell size={20} className="text-gray-500 hover:text-gray-800 transition-colors" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Avatar + name */}
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-cover bg-center border border-gray-200 overflow-hidden">
                 <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=FDFBF7&color=333&bold=true`} alt="Avatar" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-gray-800">Chào, {firstName}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Thành viên Cao cấp</p>
              </div>
              <ChevronDown size={14} className="text-gray-400 ml-1" />
            </div>
          </div>
        </header>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-8 py-6">

          {/* Greeting */}
          <div className="mb-6 flex items-start gap-3">
             <div className="mt-1">
                 <Sun size={24} className="text-[#C8A464]" fill="currentColor" />
             </div>
             <div>
                <h1 className="text-[24px] font-bold text-gray-900 leading-tight">
                {greetingStr}, {firstName}
                </h1>
                <p className="text-[14px] text-gray-500 mt-1">
                Đây là tổng quan năng lượng của bạn hôm nay.
                </p>
             </div>
          </div>

          {/* ── KPI Row ── */}
          <div className="grid grid-cols-4 gap-5 mb-6">

            {/* 1: Overall gauge */}
            <KpiCard>
              <p className="text-[14px] font-bold text-gray-800 mb-4">Tổng quan năng lượng</p>
              <div className="flex items-center gap-4">
                <GaugeChart value={overallScore} size={70} strokeWidth={6} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-gray-800">Rất tốt</p>
                  <p className="text-[12px] text-gray-500 leading-tight mt-1 mb-2">
                    Bạn đang trong giai đoạn năng lượng dồi dào và thuận lợi.
                  </p>
                  <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1">
                      <ArrowUp size={12} /> 12 điểm so với hôm qua
                  </span>
                </div>
              </div>
            </KpiCard>

            {/* 2: Dai van hien tai */}
            <KpiCard className="flex flex-col">
              <p className="text-[14px] font-bold text-gray-800 mb-1">Đại vận hiện tại</p>
              <p className="text-[18px] font-bold text-[#C8A464] uppercase mb-1">TAM HỢP MỘC DỤC</p>
              <p className="text-[12px] text-gray-500 mb-auto">2024 – 2033 (34 – 43 tuổi)</p>
              
              <div className="mt-4">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                    <div className="h-full bg-gradient-to-r from-[#C8A464] to-[#e8c872] rounded-full"
                        style={{ width: `20%` }} />
                  </div>
                  <p className="text-[11px] font-medium text-gray-500">Năm thứ 2 / 10</p>
              </div>
            </KpiCard>

            {/* 3: Career */}
            <KpiCard className="flex flex-col relative justify-center">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Briefcase size={20} className="text-[#C8A464]" />
              </div>
              <p className="text-[14px] font-bold text-gray-800 mb-3">Vận trình sự nghiệp</p>
              <div className="flex items-baseline gap-1 mt-auto">
                 <span className="text-[36px] font-light text-gray-900 leading-none">{careerScore}</span>
                 <span className="text-[14px] text-gray-400">/100</span>
              </div>
              <p className="text-[13px] font-bold text-gray-800 mt-2 mb-1">Thuận lợi</p>
              <p className="text-[12px] text-gray-500 leading-snug">Thời điểm tốt để mở rộng công việc và khẳng định vị thế lãnh đạo.</p>
            </KpiCard>

            {/* 4: Relas */}
            <KpiCard className="flex flex-col relative justify-center">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                  <Heart size={20} className="text-[#B9655D]" />
              </div>
              <p className="text-[14px] font-bold text-gray-800 mb-3">Vận trình quan hệ</p>
              <div className="flex items-baseline gap-1 mt-auto">
                 <span className="text-[36px] font-light text-gray-900 leading-none">{relaScore}</span>
                 <span className="text-[14px] text-gray-400">/100</span>
              </div>
              <p className="text-[13px] font-bold text-gray-800 mt-2 mb-1">Ổn định</p>
              <p className="text-[12px] text-gray-500 leading-snug">Duy trì sự cân bằng và giao tiếp cởi mở sẽ giúp gắn kết bền lâu.</p>
            </KpiCard>
          </div>

          {/* ── Middle Grid 2 columns ── */}
          <div className="grid grid-cols-[1fr_2.5fr] gap-5 mb-6">

            {/* Left: Đại Vận Timeline */}
            <PanelCard className="flex flex-col">
              <PanelHeader title="ĐẠI VẬN (10 NĂM)" />
              <div className="p-5 flex-1 relative">
                 <div className="space-y-6 relative">
                     {mockTimeline.map((item, idx) => (
                         <div key={idx} className="flex grid grid-cols-[60px_30px_1fr] items-center">
                            <span className={`text-[12px] ${item.active ? 'font-bold text-gray-900' : 'text-gray-500 text-right pr-2'}`}>{item.age}</span>
                            <div className="flex justify-center z-10 w-[15px] mx-auto">
                               {item.active ? (
                                   <div className="w-[15px] h-[15px] bg-[#C8A464] border-4 border-orange-100 rounded-full"></div>
                               ) : (
                                   <div className="w-[11px] h-[11px] bg-white border-2 border-gray-300 rounded-full"></div>
                               )}
                            </div>
                            <div className="pl-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className={`text-[13px] font-bold ${item.active ? 'text-gray-900' : 'text-gray-500'}`}>{item.title}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{item.range}</p>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-full text-[12px] font-bold ${item.active ? 'bg-gradient-to-r from-[#C8A464] to-[#D4AF37] text-white shadow-sm' : 'bg-gray-100 text-gray-600'}`}>
                                        {item.score}
                                    </div>
                                </div>
                            </div>
                         </div>
                     ))}
                 </div>
                 
                 <button className="w-full mt-6 py-2 rounded-lg bg-gray-50 text-gray-700 text-[12px] font-bold hover:bg-gray-100 border border-gray-200 flex items-center justify-center gap-2">
                     <Maximize2 size={12} />
                     Xem toàn bộ dòng thời gian
                 </button>
              </div>
            </PanelCard>

            {/* Right Group: Grid of cards */}
            <div className="grid grid-cols-[1.5fr_1fr] gap-5">
                 
                {/* LÁ SỐ TỬ VI */}
                <PanelCard className="col-span-1 border border-[#E5E7EB] bg-white flex flex-col">
                    <PanelHeader 
                        title="LÁ SỐ TỬ VI" 
                        action={
                            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-md">
                                <button className="px-3 py-1 bg-white rounded shadow-sm text-[11px] font-bold text-[#C8A464]">Tiếng Việt</button>
                                <button className="px-3 py-1 text-gray-500 hover:text-gray-800 text-[11px] font-medium">Hán Việt</button>
                            </div>
                        }
                        icon={<Info size={16} className="text-gray-400"/>}
                    />
                    <div className="p-4 flex-1">
                         <div style={{ height: '340px' }}>
                             <MiniGrid palaces={palaces} />
                         </div>
                    </div>
                </PanelCard>

                {/* Ngũ Hành & Tỷ lệ */}
                <div className="col-span-1 flex flex-col gap-5">
                    {/* Ngũ Hành Bản Mệnh */}
                    <PanelCard className="h-[180px] flex flex-col">
                        <PanelHeader title="NGŨ HÀNH BẢN MỆNH" />
                        <div className="flex-1 p-4">
                            <ElementCompass menh={info.menh} menhChu={info.menhChu} thanChu={info.thanChu} />
                        </div>
                    </PanelCard>

                    {/* Tỷ Lệ Ngũ Hành */}
                    <PanelCard className="flex-1 flex flex-col">
                        <PanelHeader title="TỶ LỆ NGŨ HÀNH" />
                        <div className="flex-1 p-6 flex items-center gap-8">
                            <div className="flex-shrink-0">
                                <ElementDonutChart data={elementDonutData} total={totalStars} />
                            </div>
                            <div className="flex-1 space-y-3">
                                {ELEMENTS.map(el => {
                                const pct = totalStars > 0 ? Math.round((elementCounts[el.key as keyof typeof elementCounts] / totalStars) * 100) : 0;
                                return (
                                    <div key={el.key} className="flex items-center gap-3 text-[12px]">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: el.color }} />
                                        <span className="font-semibold text-gray-700 w-8">{el.label}</span>
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: el.color }} />
                                        </div>
                                        <span className="text-gray-500 font-bold w-8 text-right">{pct}%</span>
                                    </div>
                                );
                                })}
                            </div>
                        </div>
                    </PanelCard>
                </div>

            </div>

          </div>

          {/* ── Bottom Grid Chart & Table ── */}
          <div className="grid grid-cols-[1fr_1fr] gap-5">

            {/* Trend chart */}
            <PanelCard>
              <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-[14px] font-bold text-gray-800 uppercase">DÒNG CHẢY NĂNG LƯỢNG 10 NĂM TỚI</p>
              </div>
              <div className="px-6 py-4" style={{ height: 260 }}>
                <TrendChart viewYear={viewYear} />
              </div>
            </PanelCard>

            {/* Star influence table */}
            <PanelCard>
              <PanelHeader title="ẢNH HƯỞNG SAO CHỦ ĐẠO" />
              <div className="overflow-x-auto p-1">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Sao', 'Loại', 'Ảnh hưởng', 'Cường độ', 'Xu hướng'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold text-gray-500 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {starInfluenceRows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-gray-800 whitespace-nowrap">{row.name}</td>
                        <td className="px-4 py-3.5 text-gray-500">{row.type}</td>
                        <td className="px-4 py-3.5 text-gray-700">{row.palace}</td>
                        <td className="px-4 py-3.5">
                           <div className="flex items-center gap-2">
                               <span className="font-bold text-gray-700 w-6">{row.intensity}</span>
                               <StarRatingCompact rating={row.rating} />
                           </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {row.positive ? (
                              <ArrowUp size={16} className="text-green-500" />
                          ) : (
                              <ArrowDown size={16} className="text-red-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PanelCard>
            
          </div>
          
          {/* Footer */}
          <div className="mt-8 mb-4 text-center space-y-2">
              <p className="text-[13px] text-gray-800 font-medium"><span className="font-bold">AstroTuVi</span> • Hiện đại hóa Tử Vi Học</p>
              <div className="flex justify-center gap-4 text-[12px] text-gray-500">
                  <a href="#" className="hover:text-gray-800">Chính sách bảo mật</a>
                  <span>•</span>
                  <a href="#" className="hover:text-gray-800">Điều khoản sử dụng</a>
                  <span>•</span>
                  <a href="#" className="hover:text-gray-800">Trung tâm trợ giúp</a>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">© 2026 AstroTuVi. Mọi quyền được bảo lưu.</p>
          </div>

        </div>
      </div>
    </div>
  );
};
