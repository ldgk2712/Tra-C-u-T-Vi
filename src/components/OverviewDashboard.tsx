import React, { useMemo } from 'react';
import {
  LayoutDashboard, Star, TrendingUp, CalendarDays,
  Info, BarChart2, ChevronRight, Sun, Search, Zap,
} from 'lucide-react';
import { Palace, CentralInfo, mockCentralInfo } from '../data/mockData';

interface OverviewDashboardProps {
  onNavigate: (view: 'home' | 'chart' | 'overview') => void;
  chartData: { palaces: Palace[]; centralInfo: CentralInfo } | null;
}

/* ─── Sidebar nav item ─── */
const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12.5px] font-medium transition-all duration-200 group ${
      active
        ? 'bg-[#d4af37]/15 text-[#d4af37]'
        : 'text-white/50 hover:text-white/90 hover:bg-white/[0.06]'
    }`}
  >
    <span
      className={`flex-shrink-0 transition-colors duration-200 ${
        active ? 'text-[#d4af37]' : 'text-white/35 group-hover:text-white/65'
      }`}
    >
      {icon}
    </span>
    <span className="truncate">{label}</span>
    {active && <ChevronRight size={12} className="ml-auto text-[#d4af37]/50 shrink-0" />}
  </button>
);

/* ─── Circular gauge ─── */
const GaugeChart: React.FC<{
  value: number;
  size?: number;
  strokeWidth?: number;
}> = ({ value, size = 88, strokeWidth = 8 }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const progress = (value / 100) * circ * 0.75;
  const uid = `g${value}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c49f2a" />
          <stop offset="100%" stopColor="#f5d060" />
        </linearGradient>
      </defs>
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="#ede5da" strokeWidth={strokeWidth}
        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
        strokeLinecap="round"
        transform={`rotate(135 ${size / 2} ${size / 2})`}
      />
      {/* Progress */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={`url(#${uid})`} strokeWidth={strokeWidth}
        strokeDasharray={`${progress} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(135 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2} y={size / 2 - 4}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="22" fontWeight="bold" fill="#1f1d1b" fontFamily="Georgia, serif"
      >
        {value}
      </text>
      <text
        x={size / 2} y={size / 2 + 12}
        textAnchor="middle" fontSize="9" fill="#b09080" fontFamily="sans-serif"
      >
        /100
      </text>
    </svg>
  );
};

/* ─── Mini palace grid (4×4 with central 2×2) ─── */
const MiniGrid: React.FC<{ palaces: Palace[] }> = ({ palaces }) => {
  const getPalace = (id: string) => palaces.find(p => p.id === id);

  /* Split "Cự Môn (H)" → { main: "Cự Môn", status: "(H)" } */
  const toTitleCaseVi = (text: string) =>
  text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const parseStarName = (name: string) => {
    const m = name.match(/^(.+?)\s*(\([^)]+\))\s*$/);
    return m
      ? { main: toTitleCaseVi(m[1]), status: m[2] }
      : { main: toTitleCaseVi(name), status: '' };
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
    <div
      className="grid gap-[1.5px] bg-[#ddd4c4] rounded-lg overflow-hidden border border-[#ddd4c4]"
      style={{ gridTemplateColumns: 'repeat(4,1fr)', gridTemplateRows: 'repeat(4,1fr)', aspectRatio: '4/3' }}
    >
      {outer.map(cell => {
        const p = getPalace(cell.id);
        return (
          <div
            key={cell.id}
            style={{ gridColumn: cell.col, gridRow: cell.row }}
            className="bg-[#fffdf8] hover:bg-[#fff9ee] transition-colors duration-200 flex flex-col items-center justify-start overflow-hidden pt-2 pb-0 px-0.5"
          >
            <div className="w-full origin-top scale-[0.85] flex flex-col items-center gap-0">
            {/* Palace name — fixed top anchor, leading-tight keeps diacritics safe */}
            <div className="text-[7px] font-bold text-[#2b2218] text-center leading-tight break-words w-full px-0.5 mb-px">
              {p?.name || ''}
            </div>
            {/* All stars stacked — gap-0 reclaims the inter-item space */}
            <div className="flex flex-col items-center gap-0 w-full">
              {p?.mainStars.map((star, idx) => {
                const { main, status } = parseStarName(star.name);
                return (
                  <div key={idx} className="leading-[0.75] w-full text-center px-0.5 break-words">
                    <span className="text-[7px] text-[#c4a96a]">{main}</span>
                    {status && (
                      <span className="text-[6.5px] text-[#c4a96a]/55 ml-[1px]">{status}</span>
                    )}
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        );
      })}

      {/* Central 2×2 — inset shadow creates subtle depth vs the flat outer cells */}
      <div
        style={{ gridColumn: '2 / 4', gridRow: '2 / 4' }}
        className="bg-gradient-to-br from-[#f8f0e3] to-[#ecdcc0] flex flex-col items-center justify-center gap-2 border border-[#d8c090]/50 shadow-[inset_0_2px_10px_rgba(160,120,40,0.10)]"
      >
        <span className="text-[22px] text-[#c4a96a] leading-none">☯</span>
        <span className="text-[8px] font-bold text-[#b88327] uppercase tracking-widest">Thiên Bàn</span>
      </div>
    </div>
  );
};

/* ─── Element donut ─── */
const ElementDonut: React.FC<{ value: number; max: number; color: string; label: string }> = ({
  value, max, color, label,
}) => {
  const pct = max > 0 ? value / max : 0;
  const r = 15;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-0.5 group cursor-default">
      <svg width="38" height="38" viewBox="0 0 38 38" className="transition-transform duration-200 group-hover:scale-110">
        <circle cx="19" cy="19" r={r} fill="none" stroke="#ede5da" strokeWidth="3.5" />
        <circle
          cx="19" cy="19" r={r} fill="none" stroke={color} strokeWidth="3.5"
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 19 19)"
        />
        <text x="19" y="19" textAnchor="middle" dominantBaseline="middle"
          fontSize="8.5" fontWeight="bold" fill="#1f1d1b"
        >
          {value}
        </text>
      </svg>
      <span className="text-[7.5px] font-semibold text-[#7a6e64]">{label}</span>
    </div>
  );
};

/* ─── SVG trend line chart ─── */
const TrendChart: React.FC<{ viewYear: number }> = ({ viewYear }) => {
  const years = Array.from({ length: 11 }, (_, i) => viewYear - 5 + i);
  const rawValues = [42, 55, 60, 52, 68, 76, 72, 82, 77, 85, 70];
  const minV = 30, maxV = 95;
  const W = 420, H = 180;
  const padL = 58, padR = 24, padT = 22, padB = 34;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const pts = rawValues.map((v, i) => ({
    x: padL + (i / (rawValues.length - 1)) * chartW,
    y: padT + chartH - ((v - minV) / (maxV - minV)) * chartH,
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1].x} ${padT + chartH} L${pts[0].x} ${padT + chartH} Z`;
  const nowIdx = 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.5, 1].map((t, i) => (
        <line key={i}
          x1={padL} y1={padT + t * chartH} x2={padL + chartW} y2={padT + t * chartH}
          stroke="#ede5da" strokeWidth="0.7" strokeDasharray={i === 0 ? '' : '3 3'}
        />
      ))}
      <path d={areaPath} fill="url(#trendAreaGrad)" />
      <path d={linePath} fill="none" stroke="#d4af37" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={i === nowIdx ? 4.5 : 2.5} fill="#d4af37" />
          {i === nowIdx && (
            <circle cx={p.x} cy={p.y} r="8" fill="none" stroke="#d4af37" strokeWidth="1" strokeOpacity="0.35" />
          )}
        </g>
      ))}
      {years.filter((_, i) => i % 2 === 0).map((yr, i) => {
        const idx = i * 2;
        return (
          <text key={yr} x={pts[idx]?.x || 0} y={H - 5}
            textAnchor="middle" fontSize="8.5"
            fill={idx === nowIdx ? '#b88327' : '#b09080'}
            fontWeight={idx === nowIdx ? 'bold' : 'normal'}
          >
            {yr}
          </text>
        );
      })}
      <text x={padL - 5} y={padT + 3} textAnchor="end" fontSize="7.5" fill="#b8a898">Cao</text>
      <text x={padL - 5} y={padT + chartH / 2 + 3} textAnchor="end" fontSize="7.5" fill="#b8a898">Trung bình</text>
      <text x={padL - 5} y={padT + chartH + 2} textAnchor="end" fontSize="7.5" fill="#b8a898">Thấp</text>
    </svg>
  );
};

/* ─── Star rating ─── */
const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} width="9" height="9" viewBox="0 0 10 10">
        <path
          d="M5 1l1.2 2.4L9 3.9 7 5.8l.5 2.8L5 7.4 2.5 8.6 3 5.8 1 3.9l2.8-.5z"
          fill={i < rating ? '#d4af37' : '#e8ddd0'}
        />
      </svg>
    ))}
  </div>
);

/* ─── Card primitives ─── */
const KpiCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className={`bg-white rounded-2xl border border-[#ece4d8] p-4
      shadow-[0_1px_3px_rgba(160,130,60,0.08)]
      hover:shadow-[0_6px_20px_rgba(160,130,60,0.14)]
      hover:-translate-y-[2px] hover:border-[#d4af37]/30
      transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

const PanelCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className={`bg-white rounded-2xl border border-[#ece4d8] overflow-hidden
      shadow-[0_1px_3px_rgba(160,130,60,0.08)]
      hover:shadow-[0_4px_16px_rgba(160,130,60,0.12)]
      transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

const PanelHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="px-4 py-2.5 border-b border-[#f0e8d8] flex items-center justify-between">
    <div>
      <p className="text-[11.5px] font-bold text-[#1f1d1b] tracking-tight">{title}</p>
      {subtitle && <p className="text-[9px] text-[#a09080] mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

/* ─── Main OverviewDashboard ─── */
export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate, chartData }) => {
  const palaces = chartData?.palaces ?? [];
  const info = chartData?.centralInfo ?? mockCentralInfo;

  const currentAge = parseInt(info.age) || 22;
  const firstName = info.name.split(' ').pop() || info.name;
  const viewYear = parseInt(info.viewYear) || 2026;

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

  const elementCounts = useMemo(() => {
    const c = { kim: 0, moc: 0, thuy: 0, hoa: 0, tho: 0 };
    palaces.forEach(p =>
      [...p.mainStars, ...p.goodStars, ...p.badStars].forEach(s => {
        if (s.element in c) c[s.element as keyof typeof c]++;
      })
    );
    return c;
  }, [palaces]);
  const totalStars = Object.values(elementCounts).reduce((a, b) => a + b, 0);

  const daiVanList = useMemo(
    () =>
      [...palaces]
        .map(p => ({ ...p, ageNum: parseInt(p.age) }))
        .filter(p => !isNaN(p.ageNum) && p.ageNum >= 2 && p.ageNum < 120)
        .sort((a, b) => a.ageNum - b.ageNum),
    [palaces]
  );

  const getDvRating = (p: Palace): number => {
    const score = p.goodStars.length * 1.5 + p.mainStars.length * 2 - p.badStars.length;
    if (score >= 7) return 5;
    if (score >= 5) return 4;
    if (score >= 3) return 3;
    if (score >= 1) return 2;
    return 1;
  };

  const overallScore = Math.min(
    80 + (elementCounts.moc + elementCounts.hoa) % 12 + (currentDaiVan ? getDvRating(currentDaiVan) * 2 : 0),
    98
  );
  const menhScore = Math.min(75 + (currentDaiVan?.goodStars.length ?? 0) * 3, 98);
  const careerScore = Math.min(68 + (currentDaiVan?.mainStars.length ?? 0) * 5 + elementCounts.kim, 98);
  const globalScore = Math.min(overallScore + 3, 99);

  const ELEMENTS = [
    { key: 'kim' as const, label: 'Kim', color: '#9ca3af' },
    { key: 'moc' as const, label: 'Mộc', color: '#16a34a' },
    { key: 'thuy' as const, label: 'Thủy', color: '#1d4ed8' },
    { key: 'hoa' as const, label: 'Hỏa', color: '#dc2626' },
    { key: 'tho' as const, label: 'Thổ', color: '#d97706' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <div className="flex h-screen overflow-hidden bg-[#1a1815]">

      {/* ── Left Sidebar ── */}
      <aside className="w-[200px] flex-shrink-0 flex flex-col border-r border-white/[0.05]">

        {/* Logo */}
        <div className="px-4 pt-4 pb-3.5 border-b border-white/[0.05]">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-[#d4af37]/50 text-[#d4af37] group-hover:bg-[#d4af37]/10 transition-colors duration-200">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3.5 13.9 9.2 19.5 7.2 15.8 12l3.7 4.8-5.6-2-1.9 5.7-1.9-5.7-5.6 2L8.2 12 4.5 7.2l5.6 2L12 3.5Z" />
              </svg>
            </span>
            <span className="font-serif text-[17px] font-semibold text-white leading-none tracking-tight">AstroTuVi</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3.5 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-white/20">Chính</p>
          <NavItem icon={<LayoutDashboard size={14} />} label="Tổng quan" active />
          <NavItem icon={<Star size={14} />} label="Lá Số Tử Vi" onClick={() => onNavigate('chart')} />
          <NavItem icon={<BarChart2 size={14} />} label="Báo Cáo" />
          <NavItem icon={<CalendarDays size={14} />} label="Lịch" />
          <div className="my-3 border-t border-white/[0.05]" />
          <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-white/20">Phân Tích</p>
          <NavItem icon={<TrendingUp size={14} />} label="Thống Kê" />
          <NavItem icon={<Info size={14} />} label="Giới Thiệu" />
        </nav>

        {/* Premium CTA */}
        <div className="mx-2.5 mb-2.5 rounded-xl bg-gradient-to-b from-[#272318] to-[#1c1a12] border border-[#d4af37]/18 p-3 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#d4af37]/12 border border-[#d4af37]/20 mb-2">
            <Zap size={13} className="text-[#d4af37]" />
          </div>
          <p className="text-[10px] font-bold text-white/85 leading-snug">Khởi mở bảo mật</p>
          <p className="text-[8px] text-white/35 leading-relaxed mt-0.5 mb-2.5">Nâng cấp để xem lá số đầy đủ và phân tích chuyên sâu</p>
          <button className="w-full h-7 rounded-lg bg-[#d4af37] text-[#1a1810] text-[10px] font-bold hover:bg-[#e0bc42] active:scale-95 transition-all duration-200">
            Đăng ký ngay
          </button>
        </div>

        {/* Auth */}
        <div className="px-2.5 pb-3 space-y-1.5">
          <button className="w-full h-8 rounded-lg border border-white/10 text-white/50 text-[11px] font-medium hover:bg-white/[0.05] hover:text-white/75 hover:border-white/20 transition-all duration-200">
            Đăng nhập
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f8f4ee]">

        {/* Top Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-[#fbf8f3] border-b border-[#ece4d8]/80 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <div>
            <div className="flex items-center gap-2">
              <Sun size={14} className="text-[#d4af37]" />
              <span className="font-serif text-[16.5px] font-semibold text-[#1f1d1b]">
                {greeting}, {firstName}!
              </span>
            </div>
            <p className="text-[10px] text-[#a09080] mt-0.5 ml-[22px]">
              Báo cáo tổng hợp · {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="flex items-center gap-2 h-8 bg-white border border-[#ece4d8] rounded-full px-3 w-40 hover:border-[#d4af37]/50 transition-colors duration-200 cursor-text">
              <Search size={11} className="text-[#c0b0a0] shrink-0" />
              <span className="text-[10.5px] text-[#c0b0a0] select-none">Tìm kiếm...</span>
            </div>

            {/* Global score */}
            <div className="flex items-center gap-1.5 bg-[#fffbee] border border-[#d4af37]/40 rounded-full px-2.5 py-1 hover:bg-[#fff6d4] hover:border-[#d4af37]/70 transition-all duration-200 cursor-default">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
              <span className="font-serif text-[15px] font-bold text-[#9a7020]">{globalScore}</span>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-[9.5px] text-[#a09080]">Chào,</p>
                <p className="text-[11.5px] font-semibold text-[#1f1d1b]">{info.name.split(' ').slice(-2).join(' ')}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#f5e6b8] to-[#d4af37]/20 grid place-items-center text-[#8a6010] text-[14px] font-bold border border-[#d4af37]/40 hover:border-[#d4af37]/80 hover:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all duration-200 cursor-pointer select-none">
                {info.name[0]}
              </div>
            </div>
          </div>
        </header>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">

          {/* Row 1: KPI Cards */}
          <div className="grid grid-cols-4 gap-3">

            {/* Card 1: Gauge */}
            <KpiCard>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-[#c4a030] mb-2.5">Tổng năng lượng</p>
              <div className="flex items-center gap-3">
                <GaugeChart value={overallScore} size={84} strokeWidth={8} />
                <div className="flex-1 min-w-0">
                  <p className="text-[9.5px] text-[#4a3e30] leading-relaxed">
                    Đại vận hiện tại rất thuận lợi — cơ hội phát triển bản thân và sự nghiệp.
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fffbee] border border-[#d4af37]/25 px-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                      <span className="text-[7.5px] font-semibold text-[#9a7020]">
                        {dvStartYear}–{dvEndYear} · {dvAge}–{dvAge + 9} tuổi
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </KpiCard>

            {/* Card 2: Mệnh */}
            <KpiCard>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-[#c4a030] mb-2">Tam hợp bản mệnh</p>
              <div className="flex items-end justify-between mb-2.5">
                <span className="font-serif text-[36px] font-bold leading-none text-[#1f1d1b]">{menhScore}</span>
                <div className="text-right">
                  <p className="text-[8px] text-[#a09080]">Bản mệnh</p>
                  <p className="text-[11px] font-semibold text-[#3a2e24] leading-tight">{info.menh}</p>
                </div>
              </div>
              <div className="h-1.5 bg-[#f0ebe4] rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-gradient-to-r from-[#c49f2a] to-[#e8c842] rounded-full"
                  style={{ width: `${menhScore}%`, transition: 'width 0.9s ease' }}
                />
              </div>
              <p className="text-[8.5px] text-[#8a7968]">{info.cuc} · {info.cucMenhRelation}</p>
            </KpiCard>

            {/* Card 3: Career */}
            <KpiCard>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-[#c4a030] mb-2">Tài vận sự nghiệp</p>
              <div className="flex items-end justify-between mb-2.5">
                <span className="font-serif text-[36px] font-bold leading-none text-[#1f1d1b]">{careerScore}</span>
                <div className="text-right">
                  <p className="text-[8px] text-[#a09080]">Cung đương vận</p>
                  <p className="text-[11px] font-semibold text-[#3a2e24] leading-tight">{currentDaiVan?.name || 'QUAN LỘC'}</p>
                </div>
              </div>
              <div className="h-1.5 bg-[#f0ebe4] rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-green-400 rounded-full"
                  style={{ width: `${careerScore}%`, transition: 'width 0.9s ease' }}
                />
              </div>
              <p className="text-[8.5px] text-[#8a7968]">
                {currentDaiVan?.mainStars[0]?.name.split(' ')[0] || 'Thiên cơ'} · Giai đoạn phát triển tốt
              </p>
            </KpiCard>

            {/* Card 4: Quý tiết */}
            <KpiCard>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-[#c4a030] mb-2">Tiêu mạnh quý tiết</p>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="h-9 w-9 rounded-full bg-amber-50 border border-amber-200/80 grid place-items-center flex-shrink-0">
                  <span className="text-[17px]">☀</span>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#1f1d1b]">{info.viewYearCanChi}</p>
                  <p className="text-[9px] text-[#a09080]">Năm {info.viewYear} · {info.age} tuổi</p>
                </div>
              </div>
              <div className="space-y-1 text-[9.5px]">
                {([
                  ['Mệnh chủ', info.menhChu],
                  ['Thân chủ', info.thanChu],
                  ['Âm dương', info.amDuong],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-0.5 border-b border-[#f5ede0] last:border-0">
                    <span className="text-[#8a7968]">{k}</span>
                    <span className="font-semibold text-[#3a2e24]">{v}</span>
                  </div>
                ))}
              </div>
            </KpiCard>
          </div>

          {/* Row 2: Middle Panels */}
          <div className="grid grid-cols-4 gap-3">

            {/* Đại vận table */}
            <PanelCard>
              <PanelHeader title="Đại Vận Lá Thế" subtitle="Các giai đoạn 10 năm" />
              <div className="overflow-y-auto" style={{ maxHeight: 214 }}>
                <table className="w-full text-[9.5px]">
                  <tbody>
                    {daiVanList.slice(0, 9).map(p => {
                      const isActive = p.ageNum === dvAge;
                      const rating = getDvRating(p);
                      return (
                        <tr
                          key={p.id}
                          className={`border-b border-[#f5ede0] transition-colors duration-150 ${
                            isActive ? 'bg-[#fffbf0]' : 'hover:bg-[#faf6f0]'
                          }`}
                        >
                          <td className="px-2 py-1.5 w-[52px]">
                            <StarRating rating={rating} />
                          </td>
                          <td className="py-1.5 pr-1">
                            <p className="font-bold text-[#1f1d1b]">{p.ageNum}–{p.ageNum + 9}</p>
                            <p className="text-[8.5px] text-[#a09080] leading-none mt-0.5">{p.name}</p>
                          </td>
                          <td className="pr-2.5 text-right w-[46px]">
                            {isActive && (
                              <span className="bg-[#d4af37]/15 text-[#9a7020] text-[7px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                Hiện tại
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </PanelCard>

            {/* Mini Lá số */}
            <PanelCard>
              <PanelHeader
                title="Lá Số Tử Vi"
                subtitle={`${palaces.length} cung · ${info.birthYearCanChi}`}
                action={
                  <button
                    onClick={() => onNavigate('chart')}
                    className="flex items-center gap-0.5 text-[10px] font-semibold text-[#b88327] hover:text-[#9a7020] transition-colors duration-150"
                  >
                    Xem đầy đủ <ChevronRight size={11} />
                  </button>
                }
              />
              <div className="p-3 flex flex-col gap-2">
                <MiniGrid palaces={palaces} />
                <div className="flex items-center justify-between text-[8px] text-[#a09080] px-0.5">
                  <span>{info.menh}</span>
                  <span>{info.cuc}</span>
                </div>
                <div className="flex items-center justify-between text-[8px]">
                  <span className="text-[#8a7968]">Mệnh: <strong className="text-[#3a2e24]">{info.menhChu}</strong></span>
                  <span className="text-[#8a7968]">Thân: <strong className="text-[#3a2e24]">{info.thanChu}</strong></span>
                </div>
              </div>
            </PanelCard>

            {/* Ngũ hành */}
            <PanelCard>
              <PanelHeader title="Ngũ Hành Bản Mệnh" subtitle={`Phân bố năng lượng · ${totalStars} sao`} />
              <div className="p-3 flex flex-col gap-2.5">
                <div className="grid grid-cols-5 gap-0.5">
                  {ELEMENTS.map(el => (
                    <ElementDonut
                      key={el.key}
                      value={elementCounts[el.key]}
                      max={totalStars}
                      color={el.color}
                      label={el.label}
                    />
                  ))}
                </div>
                <div className="space-y-1.5">
                  {ELEMENTS.map(el => (
                    <div key={el.key} className="flex items-center gap-1.5 text-[8.5px]">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: el.color }} />
                      <span className="text-[#6a5e54] w-7 font-medium">{el.label}</span>
                      <div className="flex-1 h-1 bg-[#f0ebe4] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${totalStars > 0 ? (elementCounts[el.key] / totalStars) * 100 : 0}%`,
                            backgroundColor: el.color,
                            transition: 'width 0.7s ease',
                          }}
                        />
                      </div>
                      <span className="text-[#8a7968] w-4 text-right font-bold">{elementCounts[el.key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </PanelCard>

            {/* Current đại vận detail */}
            <PanelCard>
              <PanelHeader title="Vị Trí Hiện Tại" subtitle="Đại vận đang chạy" />
              <div className="p-4">
                <div className="text-center mb-3.5">
                  <p className="font-serif text-[26px] font-bold text-[#b88327] leading-none">{dvAge}–{dvAge + 9}</p>
                  <p className="text-[8.5px] text-[#a09080] mt-0.5">tuổi · {dvStartYear}–{dvEndYear}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#e8f5e9] px-3 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[8px] font-bold text-green-700">Đang hoạt động</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-[9.5px]">
                  {([
                    ['Cung', currentDaiVan?.name || '—'],
                    ['Can Chi', currentDaiVan?.canChi || '—'],
                    ['Sao chính', currentDaiVan?.mainStars[0]?.name.split(' ')[0] || 'Không rõ'],
                    ['Sao tốt', `${currentDaiVan?.goodStars.length ?? 0} sao`],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-[#f5ede0] pb-1.5 last:border-0 last:pb-0">
                      <span className="text-[#8a7968]">{k}</span>
                      <span className="font-bold text-[#1f1d1b] text-right max-w-[90px] truncate">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2.5 bg-gradient-to-br from-[#fffbf0] to-[#fff8e0] rounded-xl border border-[#f0e0a0]/50">
                  <p className="text-[8.5px] text-[#7a6018] leading-relaxed">
                    {currentDaiVan && currentDaiVan.goodStars.length > currentDaiVan.badStars.length
                      ? '✦ Giai đoạn phát triển vượt bậc — nhiều cơ hội thuận lợi cho sự nghiệp và tài vận.'
                      : '◆ Giai đoạn cần thận trọng — chú ý sức khỏe và quản lý tài chính cẩn thận.'}
                  </p>
                </div>
              </div>
            </PanelCard>
          </div>

          {/* Row 3: Bottom Panels */}
          <div className="grid gap-3" style={{ gridTemplateColumns: '3fr 2fr' }}>

            {/* Trend chart */}
            <PanelCard className="h-full">
              <div className="px-5 py-3 border-b border-[#f0e8d8] flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-bold text-[#1f1d1b] tracking-tight">Dòng Chảy Năng Lượng Xuyên Suốt</p>
                  <p className="text-[9px] text-[#a09080] mt-0.5">Xu hướng vận khí qua các giai đoạn năm</p>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-[#8a7968]">
                  <span className="inline-block w-4 h-[2px] bg-[#d4af37] rounded" />
                  <span>Vận khí</span>
                </div>
              </div>
              <div className="px-6 py-5 h-[260px]">
                <TrendChart viewYear={viewYear} />
              </div>
            </PanelCard>

            {/* Influence table */}
            <PanelCard>
              <PanelHeader title="Ảnh Hưởng Các Cung Đào" subtitle="Tác động đến từng lĩnh vực cuộc sống" />
              <div className="divide-y divide-[#f5ede0]">
                {[
                  { category: 'Tài Lộc', palace: 'TÀI BẠCH', impact: 'Trung bình', color: '#d97706', bg: '#fef3c7' },
                  { category: 'Sự Nghiệp', palace: 'QUAN LỘC', impact: 'Tốt', color: '#16a34a', bg: '#dcfce7' },
                  { category: 'Tình Cảm', palace: 'PHU THÊ', impact: 'Khá tốt', color: '#2563eb', bg: '#dbeafe' },
                  { category: 'Sức Khỏe', palace: 'BỆNH ÁCH', impact: 'Bình thường', color: '#6b7280', bg: '#f3f4f6' },
                  { category: 'Gia Đình', palace: 'PHỤ MẪU', impact: 'Tốt', color: '#16a34a', bg: '#dcfce7' },
                ].map(row => (
                  <div
                    key={row.category}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-[#faf6f0] transition-colors duration-150"
                  >
                    <div>
                      <p className="text-[10.5px] font-semibold text-[#1f1d1b]">{row.category}</p>
                      <p className="text-[8.5px] text-[#a09080]">{row.palace}</p>
                    </div>
                    <span
                      className="text-[8.5px] font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ color: row.color, backgroundColor: row.bg }}
                    >
                      {row.impact}
                    </span>
                  </div>
                ))}
              </div>
            </PanelCard>
          </div>

        </div>
      </div>
    </div>
  );
};
