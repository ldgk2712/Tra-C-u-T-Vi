import React, { useMemo } from 'react';
import {
  LayoutDashboard, Star, TrendingUp, CalendarDays,
  Info, BarChart2, ChevronRight, Search, Zap,
  Settings, Wrench, Bell, Maximize2,
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
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-5 py-2.5 text-[12.5px] font-medium transition-all duration-200 relative group ${
      active
        ? 'text-[#d4af37] bg-[#d4af37]/10'
        : 'text-white/45 hover:text-white/80 hover:bg-white/[0.05]'
    }`}
  >
    {active && (
      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#d4af37] rounded-r-full" />
    )}
    <span className={`flex-shrink-0 ${active ? 'text-[#d4af37]' : 'text-white/30 group-hover:text-white/55'}`}>
      {icon}
    </span>
    <span className="truncate">{label}</span>
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
          <stop offset="0%" stopColor="#c49f2a" />
          <stop offset="100%" stopColor="#f5d060" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ede5da" strokeWidth={strokeWidth}
        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeLinecap="round"
        transform={`rotate(135 ${size / 2} ${size / 2})`} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${uid})`} strokeWidth={strokeWidth}
        strokeDasharray={`${progress} ${circ}`} strokeLinecap="round"
        transform={`rotate(135 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" dominantBaseline="middle"
        fontSize="21" fontWeight="bold" fill="#1f1d1b" fontFamily="Georgia, serif">
        {value}
      </text>
      <text x={size / 2} y={size / 2 + 12} textAnchor="middle" fontSize="8.5" fill="#b09080" fontFamily="sans-serif">
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
      <text x={cx} y={cx - 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1f1d1b">{total}</text>
      <text x={cx} y={cx + 7} textAnchor="middle" fontSize="7" fill="#b09080">sao</text>
    </svg>
  );
};

/* ── Wu Xing compass (compact, landscape-friendly) ── */
const ElementCompass: React.FC<{ menh: string; menhChu: string; thanChu: string }> = ({
  menh, menhChu, thanChu,
}) => {
  const cx = 100, cy = 72, r = 46;
  const nodes = [
    { label: 'Hỏa', color: '#dc2626', bg: '#fee2e2', stroke: '#fca5a5', angle: -90 },
    { label: 'Thổ', color: '#d97706', bg: '#fef3c7', stroke: '#fcd34d', angle: -90 + 72 },
    { label: 'Kim', color: '#6b7280', bg: '#f3f4f6', stroke: '#d1d5db', angle: -90 + 144 },
    { label: 'Thủy', color: '#1d4ed8', bg: '#dbeafe', stroke: '#93c5fd', angle: -90 + 216 },
    { label: 'Mộc', color: '#16a34a', bg: '#dcfce7', stroke: '#86efac', angle: -90 + 288 },
  ].map(n => ({
    ...n,
    x: cx + r * Math.cos((n.angle * Math.PI) / 180),
    y: cy + r * Math.sin((n.angle * Math.PI) / 180),
  }));
  const poly = nodes.map((n, i) => `${i === 0 ? 'M' : 'L'}${n.x.toFixed(1)},${n.y.toFixed(1)}`).join(' ') + ' Z';
  return (
    <svg viewBox="0 0 200 144" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="cmpGr" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffbf0" /><stop offset="100%" stopColor="#f5ead5" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="#ede5da" strokeWidth={0.8} strokeDasharray="2 5" />
      <path d={poly} fill="none" stroke="#d4af37" strokeWidth={0.7} strokeOpacity={0.3} />
      {nodes.map((n, i) => (
        <line key={i} x1={cx} y1={cy} x2={n.x.toFixed(1)} y2={n.y.toFixed(1)}
          stroke="#d4af37" strokeWidth={0.5} strokeOpacity={0.2} />
      ))}
      <circle cx={cx} cy={cy} r={20} fill="url(#cmpGr)" stroke="#d4af37" strokeWidth={1} />
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#b88327">Bản mệnh</text>
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="5.5" fill="#a07020">{menh.split(' ').slice(0,2).join(' ')}</text>
      {nodes.map((n, i) => (
        <g key={i} transform={`translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`}>
          <circle r={13} fill={n.bg} stroke={n.stroke} strokeWidth={0.8} />
          <text x={0} y={4} textAnchor="middle" fontSize="7.5" fontWeight="bold" fill={n.color}>{n.label}</text>
        </g>
      ))}
      {/* Info panel right side */}
      <rect x={158} y={10} width={38} height={64} rx={6} fill="#fffbf0" stroke="#ede5da" strokeWidth={0.8} />
      <text x={177} y={26} textAnchor="middle" fontSize="6" fill="#a09080">Tài thần</text>
      <text x={177} y={37} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#3a2e24">{menhChu.split(' ').slice(-1)[0]}</text>
      <line x1={163} y1={42} x2={191} y2={42} stroke="#ede5da" strokeWidth={0.6} />
      <text x={177} y={52} textAnchor="middle" fontSize="6" fill="#a09080">Hỷ thần</text>
      <text x={177} y={63} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#3a2e24">{thanChu.split(' ').slice(-1)[0]}</text>
    </svg>
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
    <div className="grid gap-[1.5px] bg-[#ddd4c4] rounded-lg overflow-hidden border border-[#ddd4c4]"
      style={{ gridTemplateColumns: 'repeat(4,1fr)', gridTemplateRows: 'repeat(4,1fr)', height: '100%' }}>
      {outer.map(cell => {
        const p = getPalace(cell.id);
        return (
          <div key={cell.id} style={{ gridColumn: cell.col, gridRow: cell.row }}
            className="bg-[#fffdf8] hover:bg-[#fff9ee] transition-colors duration-200 flex flex-col items-center justify-start overflow-hidden pt-1.5 pb-0 px-0.5">
            <div className="w-full scale-[0.85] origin-top flex flex-col items-center gap-0">
              <div className="text-[6.5px] font-bold text-[#2b2218] text-center leading-tight w-full px-0.5 mb-px">
                {p?.name || ''}
              </div>
              <div className="flex flex-col items-center gap-0 w-full">
                {p?.mainStars.map((star, idx) => {
                  const { main, status } = parseName(star.name);
                  return (
                    <div key={idx} className="leading-[0.75] w-full text-center px-0.5">
                      <span className="text-[6.5px] text-[#c4a96a]">{main}</span>
                      {status && <span className="text-[6px] text-[#c4a96a]/50 ml-[1px]">{status}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ gridColumn: '2 / 4', gridRow: '2 / 4' }}
        className="bg-gradient-to-br from-[#f8f0e3] to-[#ecdcc0] flex flex-col items-center justify-center gap-1.5 border border-[#d8c090]/50 shadow-[inset_0_2px_10px_rgba(160,120,40,0.10)]">
        <span className="text-[20px] text-[#c4a96a] leading-none">☯</span>
        <span className="text-[7px] font-bold text-[#b88327] uppercase tracking-widest">Thiên Bàn</span>
      </div>
    </div>
  );
};

/* ── Smooth SVG trend chart ── */
const TrendChart: React.FC<{ viewYear: number }> = ({ viewYear }) => {
  const years = Array.from({ length: 11 }, (_, i) => viewYear - 5 + i);
  const vals = [42, 55, 60, 52, 68, 76, 72, 82, 77, 85, 70];
  const minV = 30, maxV = 95;
  const W = 540, H = 155;
  const pL = 44, pR = 16, pT = 16, pB = 28;
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
  const nowIdx = 5;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 0.33, 0.66, 1].map((t, i) => (
        <line key={i} x1={pL} y1={pT + t * cH} x2={pL + cW} y2={pT + t * cH}
          stroke="#ede5da" strokeWidth={i === 0 ? 1 : 0.6} strokeDasharray={i === 0 ? '' : '3 4'} />
      ))}
      <line x1={pts[nowIdx].x} y1={pT} x2={pts[nowIdx].x} y2={pT + cH}
        stroke="#d4af37" strokeWidth={0.8} strokeDasharray="4 3" strokeOpacity={0.45} />
      <path d={area} fill="url(#tGrad)" />
      <path d={line} fill="none" stroke="#d4af37" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          {i === nowIdx && <circle cx={p.x} cy={p.y} r={9} fill="#d4af37" fillOpacity={0.12} />}
          <circle cx={p.x} cy={p.y} r={i === nowIdx ? 4 : 2.5}
            fill={i === nowIdx ? '#d4af37' : '#fff'} stroke="#d4af37" strokeWidth={i === nowIdx ? 0 : 1.5} />
        </g>
      ))}
      {years.map((yr, i) => (
        <text key={yr} x={pts[i].x} y={H - 5} textAnchor="middle" fontSize="8"
          fill={i === nowIdx ? '#b88327' : '#c0b0a0'} fontWeight={i === nowIdx ? 'bold' : 'normal'}>
          {yr}
        </text>
      ))}
      <text x={pL - 5} y={pT + 3} textAnchor="end" fontSize="7" fill="#c0b0a0">Cao</text>
      <text x={pL - 5} y={pT + cH * 0.5 + 3} textAnchor="end" fontSize="7" fill="#c0b0a0">TB</text>
      <text x={pL - 5} y={pT + cH + 2} textAnchor="end" fontSize="7" fill="#c0b0a0">Thấp</text>
    </svg>
  );
};

/* ── Star rating ── */
const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} width="8" height="8" viewBox="0 0 10 10">
        <path d="M5 1l1.2 2.4L9 3.9 7 5.8l.5 2.8L5 7.4 2.5 8.6 3 5.8 1 3.9l2.8-.5z"
          fill={i < rating ? '#d4af37' : '#e8ddd0'} />
      </svg>
    ))}
  </div>
);

/* ── Card primitives ── */
const KpiCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-[#ece4d8] p-4 pt-3.5
    shadow-[0_2px_6px_rgba(160,130,60,0.08)]
    hover:shadow-[0_8px_28px_rgba(160,130,60,0.15)]
    hover:-translate-y-[2px] hover:border-[#d4af37]/30
    transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const PanelCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-[#ece4d8] overflow-hidden
    shadow-[0_1px_4px_rgba(160,130,60,0.07)]
    hover:shadow-[0_4px_18px_rgba(160,130,60,0.12)]
    transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const PanelHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({
  title, subtitle, action,
}) => (
  <div className="px-4 py-2.5 border-b border-[#f0e8d8] flex items-center justify-between gap-2">
    <div className="min-w-0">
      <p className="text-[10.5px] font-bold text-[#1f1d1b] tracking-[0.04em] uppercase truncate">{title}</p>
      {subtitle && <p className="text-[8.5px] text-[#a09080] mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

/* ── Main ── */
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
  const dvProgress = Math.round(((currentAge - dvAge) / 10) * 100);

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

  const elementDonutData = ELEMENTS.map(el => ({
    label: el.label,
    value: elementCounts[el.key],
    color: el.color,
  }));

  const starInfluenceRows = useMemo(() => {
    const rows: { name: string; type: string; palace: string; rating: number; positive: boolean }[] = [];
    palaces.forEach(p => {
      const s = p.mainStars[0];
      if (!s) return;
      rows.push({
        name: s.name.split(' ')[0],
        type: 'Chính tinh',
        palace: p.name,
        rating: getDvRating(p),
        positive: p.goodStars.length >= p.badStars.length,
      });
    });
    return rows.slice(0, 7);
  }, [palaces]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <div className="flex h-screen overflow-hidden bg-[#16130f]">

      {/* ── Left Sidebar ── */}
      <aside className="w-[240px] flex-shrink-0 flex flex-col bg-[#16130f] border-r border-white/[0.04]">

        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-white/[0.05]">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group">
            <span className="grid h-7 w-7 place-items-center rounded-lg border border-[#d4af37]/40 text-[#d4af37] group-hover:bg-[#d4af37]/10 transition-colors duration-200">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3.5 13.9 9.2 19.5 7.2 15.8 12l3.7 4.8-5.6-2-1.9 5.7-1.9-5.7-5.6 2L8.2 12 4.5 7.2l5.6 2L12 3.5Z" />
              </svg>
            </span>
            <span className="font-serif text-[18px] font-semibold text-white leading-none tracking-tight">AstroTuVi</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <p className="px-5 mb-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white/[0.14]">Chính</p>
          <NavItem icon={<LayoutDashboard size={14} />} label="Tổng quan" active />
          <NavItem icon={<Star size={14} />} label="Lá Số Tử Vi" onClick={() => onNavigate('chart')} />
          <NavItem icon={<TrendingUp size={14} />} label="Đại Vận" />
          <NavItem icon={<BarChart2 size={14} />} label="Báo Cáo" />
          <NavItem icon={<CalendarDays size={14} />} label="Lịch" />
          <div className="my-2.5 mx-5 border-t border-white/[0.05]" />
          <p className="px-5 mb-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white/[0.14]">Khác</p>
          <NavItem icon={<Info size={14} />} label="Thông Tin Chiêm Tinh" />
          <NavItem icon={<Wrench size={14} />} label="Công Cụ" />
          <NavItem icon={<Settings size={14} />} label="Cài Đặt" />
        </nav>

        {/* Premium CTA */}
        <div className="mx-3.5 mb-3 rounded-xl p-4 text-center"
          style={{ background: 'linear-gradient(160deg,#251e10 0%,#1a1608 100%)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#d4af37]/14 border border-[#d4af37]/24 mb-2.5">
            <Zap size={13} className="text-[#d4af37]" />
          </div>
          <p className="text-[10.5px] font-bold text-white/90 leading-snug mb-1">Khai mở tiềm năng vô hạn</p>
          <p className="text-[8.5px] text-white/32 leading-relaxed mb-3">
            Nâng cấp để xem lá số đầy đủ và phân tích chuyên sâu
          </p>
          <button className="w-full h-7 rounded-lg bg-[#d4af37] text-[#1a1810] text-[10px] font-bold hover:bg-[#e0bc42] active:scale-95 transition-all duration-200">
            Nâng cấp ngay
          </button>
        </div>

        {/* Login */}
        <div className="px-3.5 pb-4">
          <button className="w-full h-8 rounded-lg border border-white/[0.08] text-white/38 text-[11px] font-medium hover:bg-white/[0.05] hover:text-white/65 transition-all duration-200">
            Đăng nhập
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f0e8]">

        {/* ── Top Header ── */}
        <header className="flex-shrink-0 flex items-center gap-3 px-6 py-3 bg-[#faf7f2] border-b border-[#ece4d8]/80 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          {/* Search – left */}
          <div className="flex items-center gap-2 h-9 bg-white border border-[#ece4d8] rounded-xl px-3.5 w-[340px] hover:border-[#d4af37]/40 transition-colors duration-200 cursor-text flex-shrink-0">
            <Search size={13} className="text-[#c0b0a0] shrink-0" />
            <span className="text-[11px] text-[#c0b0a0] select-none">Tìm kiếm lá số, báo cáo, insight...</span>
          </div>

          <div className="flex-1" />

          {/* Energy pill */}
          <div className="flex items-center gap-1.5 bg-[#fffbee] border border-[#d4af37]/40 rounded-full px-3 py-1.5 cursor-default select-none">
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            <span className="text-[12px] font-bold text-[#9a7020] font-serif leading-none">{globalScore}</span>
          </div>

          {/* Bell */}
          <button className="h-8 w-8 rounded-full bg-white border border-[#ece4d8] grid place-items-center hover:bg-[#fffbee] hover:border-[#d4af37]/30 transition-all duration-200">
            <Bell size={13} className="text-[#a09080]" />
          </button>

          {/* Avatar + name */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#2a2014] to-[#3c301a] grid place-items-center text-[#d4af37] text-[13px] font-bold border border-[#d4af37]/30 cursor-pointer select-none">
              {info.name[0]}
            </div>
            <div className="leading-none">
              <p className="text-[8.5px] text-[#a09080]">Chào,</p>
              <p className="text-[12px] font-semibold text-[#1f1d1b] mt-0.5">{firstName}</p>
            </div>
          </div>
        </header>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5">

          {/* Greeting */}
          <div>
            <h1 className="font-serif text-[22px] font-bold text-[#1f1d1b] leading-tight">
              {greeting}, {firstName}
            </h1>
            <p className="text-[12px] text-[#8a7968] mt-0.5">
              Đây là tổng quan năng lượng của bạn hôm nay.
            </p>
          </div>

          {/* ── KPI Row ── */}
          <div className="grid grid-cols-4 gap-3">

            {/* 1: Overall gauge */}
            <KpiCard>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-[#c4a030] mb-3">Tổng quan năng lượng</p>
              <div className="flex items-center gap-3">
                <GaugeChart value={overallScore} size={82} strokeWidth={8} />
                <div className="flex-1 min-w-0">
                  <p className="text-[9.5px] text-[#4a3e30] leading-relaxed">
                    Đại vận thuận lợi — nhiều cơ hội phát triển bản thân.
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

            {/* 2: Tam hợp bộc cục */}
            <KpiCard>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-[#c4a030] mb-2">Tam hợp bộc cục</p>
              <div className="flex items-end justify-between mb-2.5">
                <span className="font-serif text-[40px] font-bold leading-none text-[#1f1d1b]">{menhScore}</span>
                <div className="text-right">
                  <p className="text-[8px] text-[#a09080]">Bản mệnh</p>
                  <p className="text-[11px] font-semibold text-[#3a2e24] leading-tight">{info.menh}</p>
                </div>
              </div>
              <div className="h-1.5 bg-[#f0ebe4] rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-gradient-to-r from-[#c49f2a] to-[#e8c842] rounded-full"
                  style={{ width: `${menhScore}%` }} />
              </div>
              <p className="text-[8.5px] text-[#8a7968]">{info.cuc} · {info.cucMenhRelation}</p>
            </KpiCard>

            {/* 3: Career */}
            <KpiCard>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-[#c4a030] mb-2.5">Vận trình sự nghiệp</p>
              <div className="flex items-end justify-between mb-2">
                <span className="font-serif text-[36px] font-bold leading-none text-[#1f1d1b]">{careerScore}</span>
                <span className="text-[8.5px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Khá tốt
                </span>
              </div>
              <div className="h-1.5 bg-[#f0ebe4] rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                  style={{ width: `${careerScore}%` }} />
              </div>
              <p className="text-[8.5px] text-[#8a7968]">
                {currentDaiVan?.mainStars[0]?.name.split(' ')[0] || 'Thiên cơ'} · Giai đoạn phát triển
              </p>
            </KpiCard>

            {/* 4: Tiêu mạnh quý tiết */}
            <KpiCard>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-[#c4a030] mb-2">Tiêu mạnh quý tiết</p>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="h-9 w-9 rounded-full bg-amber-50 border border-amber-200/80 grid place-items-center flex-shrink-0">
                  <span className="text-[17px] leading-none">☀</span>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#1f1d1b] leading-tight">{info.viewYearCanChi}</p>
                  <p className="text-[9px] text-[#a09080]">Năm {info.viewYear} · {info.age}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {([
                  ['Mệnh chủ', info.menhChu],
                  ['Thân chủ', info.thanChu],
                  ['Âm dương', info.amDuong],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[9px] py-0.5 border-b border-[#f5ede0] last:border-0">
                    <span className="text-[#8a7968]">{k}</span>
                    <span className="font-semibold text-[#3a2e24]">{v}</span>
                  </div>
                ))}
              </div>
            </KpiCard>
          </div>

          {/* ── Middle Grid 1:2:1 ── */}
          <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 2fr 1fr' }}>

            {/* Left: Đại Vận list */}
            <PanelCard className="flex flex-col">
              <PanelHeader title="Đại Vận (10 Năm)" subtitle="Các giai đoạn vận khí" />
              {/* Active period progress */}
              <div className="px-3 py-2 bg-[#fffbf0] border-b border-[#f0e8d8]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] text-[#b88327] font-semibold">Vận hiện tại: {dvAge}–{dvAge + 9} tuổi</span>
                  <span className="text-[7.5px] text-[#a09080]">{dvProgress}%</span>
                </div>
                <div className="h-1 bg-[#f0ebe4] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#c49f2a] to-[#e8c842] rounded-full"
                    style={{ width: `${dvProgress}%` }} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: 210 }}>
                {daiVanList.slice(0, 10).map(p => {
                  const isActive = p.ageNum === dvAge;
                  const rating = getDvRating(p);
                  const startYr = dvStartYear - (dvAge - p.ageNum);
                  return (
                    <div key={p.id}
                      className={`flex items-center gap-2 px-3 py-2 border-b border-[#f5ede0] transition-colors duration-150 ${isActive ? 'bg-[#fffbf0]' : 'hover:bg-[#faf6f0]'}`}>
                      {/* Star rating left */}
                      <div className="flex-shrink-0">
                        <StarRating rating={rating} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className={`text-[9px] font-bold leading-none ${isActive ? 'text-[#b88327]' : 'text-[#1f1d1b]'}`}>
                            {p.ageNum}–{p.ageNum + 9}
                          </p>
                          {isActive && (
                            <span className="bg-[#d4af37]/18 text-[#9a7020] text-[6px] font-bold px-1 py-0.5 rounded-full">●</span>
                          )}
                        </div>
                        <p className="text-[8px] text-[#a09080] leading-none mt-0.5 truncate">{p.name}</p>
                        <p className="text-[7px] text-[#c0b0a0] leading-none">{startYr}–{startYr + 9}</p>
                      </div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center text-[7.5px] font-bold flex-shrink-0 ${
                        rating >= 4 ? 'bg-amber-100 text-amber-700' : rating >= 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {rating}
                      </div>
                    </div>
                  );
                })}
              </div>
            </PanelCard>

            {/* Center: Lá Số Tử Vi mini */}
            <PanelCard>
              <PanelHeader
                title="Lá Số Tử Vi"
                subtitle={`${palaces.length} cung · ${info.birthYearCanChi}`}
                action={
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-0.5 bg-[#f5f0e8] rounded-md p-0.5">
                      <button className="text-[7.5px] font-semibold text-[#b88327] bg-white rounded px-1.5 py-0.5 shadow-sm">
                        Tiếng Việt
                      </button>
                      <button className="text-[7.5px] text-[#a09080] px-1.5 py-0.5 hover:text-[#1f1d1b] transition-colors">
                        Hán Việt
                      </button>
                    </div>
                    <button onClick={() => onNavigate('chart')}
                      className="flex items-center gap-0.5 text-[9.5px] font-semibold text-[#b88327] hover:text-[#9a7020] transition-colors duration-150">
                      <Maximize2 size={10} />
                      <span className="hidden sm:inline">Xem đầy đủ</span>
                      <ChevronRight size={9} />
                    </button>
                  </div>
                }
              />
              <div className="p-3">
                <div style={{ height: 248 }}>
                  <MiniGrid palaces={palaces} />
                </div>
                <div className="flex items-center justify-between mt-2 text-[8px] text-[#a09080] px-0.5">
                  <span><strong className="text-[#3a2e24]">Mệnh:</strong> {info.menhChu}</span>
                  <span><strong className="text-[#3a2e24]">Thân:</strong> {info.thanChu}</span>
                  <span>{info.menh}</span>
                  <span className="text-[#b88327] font-medium">{info.cuc}</span>
                </div>
              </div>
            </PanelCard>

            {/* Right: 2 stacked cards */}
            <div className="flex flex-col gap-3">

              {/* Ngũ Hành Bản Mệnh – fixed height */}
              <div className="bg-white rounded-2xl border border-[#ece4d8] overflow-hidden shadow-[0_1px_4px_rgba(160,130,60,0.07)]" style={{ height: 162 }}>
                <PanelHeader title="Ngũ Hành Bản Mệnh" />
                <div className="p-2.5">
                  <div className="w-full" style={{ height: 100 }}>
                    <ElementCompass menh={info.menh} menhChu={info.menhChu} thanChu={info.thanChu} />
                  </div>
                </div>
              </div>

              {/* Tỷ Lệ Ngũ Hành */}
              <PanelCard className="flex-1">
                <PanelHeader title="Tỷ Lệ Ngũ Hành" subtitle={`${totalStars} sao tổng`} />
                <div className="p-2.5 flex items-center gap-2">
                  <div className="flex-shrink-0">
                    <ElementDonutChart data={elementDonutData} total={totalStars} />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    {ELEMENTS.map(el => {
                      const pct = totalStars > 0 ? Math.round((elementCounts[el.key] / totalStars) * 100) : 0;
                      return (
                        <div key={el.key} className="flex items-center gap-1.5 text-[8px]">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: el.color }} />
                          <span className="text-[#6a5e54] w-6 font-medium flex-shrink-0">{el.label}</span>
                          <div className="flex-1 h-1 bg-[#f0ebe4] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, backgroundColor: el.color }} />
                          </div>
                          <span className="text-[#b09080] w-6 text-right font-semibold flex-shrink-0">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </PanelCard>
            </div>
          </div>

          {/* ── Bottom Grid ── */}
          <div className="grid gap-3" style={{ gridTemplateColumns: '3fr 2fr' }}>

            {/* Trend chart */}
            <PanelCard>
              <div className="px-5 py-3 border-b border-[#f0e8d8] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-[#1f1d1b] uppercase tracking-[0.04em]">
                    Dòng Chảy Năng Lượng 10 Năm Tới
                  </p>
                  <p className="text-[8.5px] text-[#a09080] mt-0.5">Xu hướng vận khí theo thời gian</p>
                </div>
                <div className="flex items-center gap-1.5 text-[8.5px] text-[#8a7968]">
                  <span className="inline-block w-4 h-[2px] bg-[#d4af37] rounded" />
                  <span>Vận khí</span>
                </div>
              </div>
              <div className="px-5 py-3" style={{ height: 170 }}>
                <TrendChart viewYear={viewYear} />
              </div>
            </PanelCard>

            {/* Star influence table */}
            <PanelCard>
              <PanelHeader title="Ảnh Hưởng Sao Chủ Đạo" subtitle="Tác động đến các lĩnh vực" />
              <div className="overflow-x-auto">
                <table className="w-full text-[8.5px]">
                  <thead>
                    <tr className="border-b border-[#f0e8d8] bg-[#faf7f2]">
                      {['Sao', 'Loại', 'Ảnh hưởng', 'Cường độ', 'XH'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-bold text-[#a09080] uppercase tracking-[0.05em] whitespace-nowrap first:pl-4">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {starInfluenceRows.map((row, i) => (
                      <tr key={i} className="border-b border-[#f5ede0] hover:bg-[#faf6f0] transition-colors duration-100">
                        <td className="pl-4 pr-3 py-2 font-semibold text-[#1f1d1b] whitespace-nowrap">{row.name}</td>
                        <td className="px-3 py-2 text-[#a09080]">{row.type}</td>
                        <td className="px-3 py-2 text-[#3a2e24] font-medium truncate max-w-[80px]">{row.palace}</td>
                        <td className="px-3 py-2">
                          <StarRating rating={row.rating} />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`text-[11px] font-bold ${row.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {row.positive ? '↑' : '↓'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PanelCard>
          </div>

        </div>
      </div>
    </div>
  );
};
