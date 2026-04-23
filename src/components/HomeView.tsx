import React, { useEffect, useState } from 'react';
import { BarChart2, RefreshCw, Target, User } from 'lucide-react';
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { CustomDatePicker } from './CustomDatePicker';
import { CustomSelect } from './CustomSelect';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface HomeViewProps {
  onNavigate: (view: 'home' | 'chart') => void;
  onGenerate: (formData: any) => void;
}

const hourOptions = [
  { value: 'ty', label: 'Tý (23:00 - 01:00)' },
  { value: 'suu', label: 'Sửu (01:00 - 03:00)' },
  { value: 'dan', label: 'Dần (03:00 - 05:00)' },
  { value: 'mao', label: 'Mão (05:00 - 07:00)' },
  { value: 'thin', label: 'Thìn (07:00 - 09:00)' },
  { value: 'ty_snake', label: 'Tỵ (09:00 - 11:00)' },
  { value: 'ngo', label: 'Ngọ (11:00 - 13:00)' },
  { value: 'mui', label: 'Mùi (13:00 - 15:00)' },
  { value: 'than', label: 'Thân (15:00 - 17:00)' },
  { value: 'dau', label: 'Dậu (17:00 - 19:00)' },
  { value: 'tuat', label: 'Tuất (19:00 - 21:00)' },
  { value: 'hoi', label: 'Hợi (21:00 - 23:00)' },
];

const palaces = ['MỆNH', 'PHỤ MẪU', 'PHÚC ĐỨC', 'ĐIỀN TRẠCH', 'QUAN LỘC', 'NÔ BỘC', 'THIÊN DI', 'TẬT ÁCH', 'TỬ TỨC', 'THÊ THIẾP', 'HUYNH ĐỆ', 'TÀI BẠCH'];

const FeatureIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full bg-[#f5ece0] text-[#b88327]">
    {children}
  </div>
);

const FloatingCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`absolute rounded-lg border border-[#eadfd6] bg-white/88 p-4 shadow-[0_16px_42px_rgba(63,43,21,0.08)] backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

const LineChart = () => (
  <svg viewBox="0 0 220 104" className="mt-3 h-[104px] w-full overflow-visible">
    {[0, 1, 2].map((line) => (
      <line key={line} x1="16" y1={18 + line * 31} x2="214" y2={18 + line * 31} stroke="#efe7dc" strokeWidth="1" />
    ))}
    {[0, 1, 2, 3, 4, 5, 6].map((line) => (
      <line key={line} x1={16 + line * 33} y1="18" x2={16 + line * 33} y2="80" stroke="#f3ece3" strokeWidth="1" />
    ))}
    <path d="M16 80 L38 51 L61 56 L83 34 L106 45 L130 27 L154 35 L181 12" fill="none" stroke="#bd8429" strokeWidth="2" />
    {[ [16, 80], [38, 51], [61, 56], [83, 34], [106, 45], [130, 27], [154, 35], [181, 12] ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r="2.8" fill="#bd8429" />
    ))}
    {['2024', '2026', '2028', '2030', '2032', '2034'].map((year, index) => (
      <text key={year} x={16 + index * 36} y="100" fill="#8d8580" fontSize="10">{year}</text>
    ))}
    <text x="0" y="22" fill="#8d8580" fontSize="10">6</text>
    <text x="0" y="53" fill="#8d8580" fontSize="10">3</text>
    <text x="0" y="83" fill="#8d8580" fontSize="10">0</text>
  </svg>
);

const OrbitVisual = () => (
  <div className="absolute left-[50%] top-[45%] z-10 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2">
    <div className="absolute inset-0 rounded-full border border-[#d19b4b]/16" />
    <div className="absolute inset-8 rounded-full border border-dashed border-[#d19b4b]/40" />
    <div className="absolute inset-[78px] rounded-full border border-[#d19b4b]/45" />
    <div className="absolute inset-[126px] rounded-full border border-[#d19b4b]/38" />
    <div className="absolute inset-[176px] rounded-full border border-dashed border-[#d19b4b]/55" />

    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 540 540" fill="none">
      <g stroke="#d3a052" strokeOpacity=".36" strokeWidth="1">
        {Array.from({ length: 12 }).map((_, index) => {
          const angle = (index * Math.PI) / 6;
          const x = 270 + Math.cos(angle) * 248;
          const y = 270 + Math.sin(angle) * 248;
          return <line key={index} x1="270" y1="270" x2={x} y2={y} />;
        })}
      </g>
      <path d="M270 54 C360 90 441 147 486 270 C437 389 356 458 270 486 C181 442 94 392 54 270 C86 161 165 88 270 54Z" stroke="#bd8429" strokeOpacity=".5" />
      <path d="M270 96 C352 127 413 183 444 270 C414 360 353 419 270 444 C184 414 124 356 96 270 C126 183 184 126 270 96Z" stroke="#bd8429" strokeOpacity=".35" strokeDasharray="7 8" />
    </svg>

    <div className="absolute left-1/2 top-1/2 h-[95px] w-[95px] -translate-x-1/2 -translate-y-1/2 text-[#bd8429]">
      <svg viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 6 58 42 94 50 58 58 50 94 42 58 6 50 42 42Z" opacity=".62" />
        <path d="M50 25 55 45 75 50 55 55 50 75 45 55 25 50 45 45Z" fill="#9d6d1b" />
        <circle cx="50" cy="50" r="4" fill="#fff6dc" />
      </svg>
    </div>

    {[['BẮC', 0], ['ĐÔNG', 90], ['NAM', 180], ['TÂY', 270]].map(([dir, angle]) => {
      const r = 126;
      const rad = (Number(angle) - 90) * Math.PI / 180;
      const x = 270 + Math.cos(rad) * r;
      const y = 270 + Math.sin(rad) * r;
      return (
        <span
          key={dir as string}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-sans text-[9px] font-bold tracking-[0.12em] text-[#b88327]/60"
          style={{ transform: `translate(calc(-50% + ${x - 270}px), calc(-50% + ${y - 270}px))` }}
        >
          {dir}
        </span>
      );
    })}

    {palaces.map((palace, index) => {
      const angle = (index * 360) / palaces.length - 90;
      const radius = 188;
      const dotRadius = 150;
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;
      const dotX = Math.cos((angle * Math.PI) / 180) * dotRadius;
      const dotY = Math.sin((angle * Math.PI) / 180) * dotRadius;

      return (
        <React.Fragment key={palace}>
          <span
            className="absolute left-1/2 top-1/2 min-w-16 -translate-x-1/2 -translate-y-1/2 text-center font-serif text-[12px] font-semibold tracking-[0.04em] text-[#2d2925]"
            style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
          >
            {palace}
          </span>
          <span
            className="absolute left-1/2 top-1/2 h-[5px] w-[5px] rounded-full bg-[#cb9132]"
            style={{ transform: `translate(calc(-50% + ${dotX}px), calc(-50% + ${dotY}px))` }}
          />
        </React.Fragment>
      );
    })}

    <div className="absolute -bottom-[104px] left-1/2 h-[146px] w-[460px] -translate-x-1/2">
      <div className="absolute bottom-2 left-8 h-12 w-[390px] rounded-[50%] bg-black/15 blur-xl" />
      <div className="absolute bottom-8 h-[58px] w-full rounded-[50%] border border-[#b87b1c]/50 bg-gradient-to-r from-[#b87b1c] via-[#fff0b9] to-[#c89331] shadow-[0_18px_28px_rgba(69,42,10,0.22)]" />
      <div className="absolute bottom-14 left-[8%] h-[48px] w-[84%] rounded-[50%] border border-white/70 bg-gradient-to-r from-[#9f6817] via-[#ffeab1] to-[#b87919]" />
      <div className="absolute bottom-[78px] left-[15%] h-[38px] w-[70%] rounded-[50%] border border-white bg-gradient-to-br from-[#fff4cf] via-[#d4a140] to-[#8a5a14]" />
      <div className="absolute bottom-[92px] left-1/2 h-[130px] w-[230px] -translate-x-1/2 bg-gradient-to-t from-[#fff0b9]/75 to-transparent blur-2xl" />
    </div>
  </div>
);

export const HomeView: React.FC<HomeViewProps> = ({ onGenerate }) => {
  const { user } = useAuth();
  const [savedHoroscopes, setSavedHoroscopes] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    hour: '',
    gender: 'Nam giới',
    viewYear: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    const fetchSavedHoroscopes = async () => {
      if (!user) {
        setSavedHoroscopes([]);
        return;
      }

      try {
        const q = query(collection(db, 'horoscopes'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        setSavedHoroscopes(querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      } catch (error) {
        console.error('Error fetching saved horoscopes', error);
      }
    };

    fetchSavedHoroscopes();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'horoscopes', id));
      setSavedHoroscopes((prev) => prev.filter((item) => item.id !== id));
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting horoscope', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbf7f3] pt-[98px] font-sans text-[#1f1d1b]">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -right-24 top-28 h-[820px] w-[820px] rounded-full border border-[#d7a34e]/10" />
        <div className="absolute right-0 top-20 h-[610px] w-[610px] rounded-full border border-[#d7a34e]/10" />
        <svg className="absolute inset-x-0 top-24 h-[780px] w-full" viewBox="0 0 1536 780" fill="none">
          <path d="M624 179 C721 105 818 107 916 174 C1054 269 1177 180 1283 90" stroke="#d2a04e" strokeOpacity=".24" />
          <path d="M1000 652 C1182 594 1340 636 1530 540" stroke="#d2a04e" strokeOpacity=".2" />
          <g fill="#d2a04e" fillOpacity=".45">
            <circle cx="626" cy="179" r="4" />
            <circle cx="1283" cy="90" r="6" />
            <circle cx="1375" cy="672" r="6" />
            <circle cx="1512" cy="555" r="3" />
          </g>
        </svg>
      </div>

      <section className="relative mx-auto min-h-[744px] max-w-[1432px] px-6 pb-10 sm:px-8 lg:px-10">
        <div className="relative z-20 w-full max-w-[600px] pt-0">
          <h1 className="font-serif text-[54px] font-medium leading-[1.04] tracking-[-0.012em] text-[#1f1d1b] sm:text-[60px] lg:text-[63px]">
            Giải mã
            <br />
            <span className="inline-block origin-left scale-x-[0.78] whitespace-nowrap">Vận Mệnh bằng <span className="text-[#ad7b28]">Dữ Liệu</span></span>
          </h1>
          <p className="mt-5 max-w-[540px] text-[16px] leading-[1.78] text-[#69625f]">
            AstroTuVi kết hợp trí tuệ cổ nhân và công nghệ dữ liệu hiện đại để phân tích vận mệnh, dự báo xu hướng và đồng hành cùng bạn trên hành trình phát triển bản thân.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 w-full max-w-[496px] rounded-lg border border-[#ebe3db] bg-white/90 p-6 shadow-[0_22px_55px_rgba(50,36,23,0.09)] backdrop-blur-sm">
            <h2 className="mb-5 font-serif text-[22px] font-semibold text-[#1f1d1b]">Khai mở lá số Tử Vi của bạn</h2>

            <label className="mb-2 block text-[14px] font-medium text-[#2b2825]">Họ và tên</label>
            <div className="relative mb-4">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a39c97]" />
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập họ và tên đầy đủ"
                className="h-10 w-full rounded border border-[#e4ded8] bg-white pl-11 pr-4 text-[14px] outline-none transition-colors placeholder:text-[#a19a95] focus:border-[#bd8429]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#2b2825]">Ngày sinh dương lịch</label>
                <div className="homepage-compact-field">
                  <CustomDatePicker value={formData.dob} onChange={(value) => setFormData({ ...formData, dob: value })} placeholder="DD / MM / YYYY" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#2b2825]">Giờ sinh <span className="font-normal text-[#6f6863]">(chọn khung giờ)</span></label>
                <div className="homepage-compact-field">
                  <CustomSelect value={formData.hour} onChange={(value) => setFormData({ ...formData, hour: value })} placeholder="Chọn khung giờ sinh" options={hourOptions} />
                </div>
              </div>
            </div>

            <label className="mb-2 mt-4 block text-[14px] font-medium text-[#2b2825]">Giới tính</label>
            <div className="grid grid-cols-2 gap-0">
              {['Nam giới', 'Nữ giới'].map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender })}
                  className={`h-10 border text-[14px] transition-colors ${gender === 'Nam giới' ? 'rounded-l' : 'rounded-r -ml-px'} ${
                    formData.gender === gender ? 'border-[#c58f35] bg-[#fffaf1] text-[#9b6b1d]' : 'border-[#e4ded8] bg-white text-[#4d4642]'
                  }`}
                >
                  <span className="mr-2">{gender === 'Nam giới' ? '♂' : '♀'}</span>
                  {gender === 'Nam giới' ? 'Nam' : 'Nữ'}
                </button>
              ))}
            </div>

            <button type="submit" className="mt-5 flex h-16 w-full flex-col items-center justify-center rounded-md bg-[#1f1d1b] text-white shadow-[0_12px_26px_rgba(20,16,10,0.24)] transition-colors hover:bg-[#2d2b29]">
              <span className="flex items-center gap-2 text-[18px] font-medium">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
                </svg>
                Khám Phá Lá Số
              </span>
              <span className="mt-0.5 text-[13px] opacity-75">Miễn phí · Không cần đăng ký</span>
            </button>
          </form>

        </div>

        <div className="absolute left-[36%] top-[-10px] hidden h-[650px] w-[860px] lg:block">
          <OrbitVisual />
          
          <FloatingCard className="left-[50px] top-[80px] z-20 w-[168px]">
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#706965]">Ngũ hành bản mệnh</h4>
            {[
              ['Kim', '#d8d1c8', '22%'],
              ['Mộc', '#58794d', '18%'],
              ['Thủy', '#486b82', '20%'],
              ['Hỏa', '#b84d37', '25%'],
              ['Thổ', '#b88327', '15%'],
            ].map(([name, color, pct]) => (
              <div key={name} className="mb-2 flex items-center gap-2 text-[11px] text-[#4c4642]">
                <span className="w-8">{name}</span>
                <span className="h-1.5 flex-1 rounded-full bg-[#e7e0d9]"><span className="block h-full rounded-full" style={{ width: pct, backgroundColor: color }} /></span>
                <span className="w-7 text-right text-[#7e7772]">{pct}</span>
              </div>
            ))}
          </FloatingCard>

          <FloatingCard className="left-[24px] top-[300px] z-20 w-[165px]">
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#706965]">Sự nghiệp</h4>
            <div className="flex gap-3 text-[12px] leading-relaxed text-[#433d39]">
              <BarChart2 className="mt-1 h-5 w-5 text-[#bd8429]" />
              <p>Thiên thời thuận lợi<br /><span className="text-[#716a65]">nỗ lực sẽ thành công</span></p>
            </div>
          </FloatingCard>

          <FloatingCard className="left-[24px] top-[425px] z-20 w-[165px]">
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#706965]">Tình duyên</h4>
            <div className="flex gap-3 text-[12px] leading-relaxed text-[#433d39]">
              <span className="mt-1 text-xl leading-none text-[#bd8429]">♡</span>
              <p>Đào hoa vượng<br /><span className="text-[#716a65]">nhân duyên tốt đẹp</span></p>
            </div>
          </FloatingCard>

          <FloatingCard className="right-[8px] top-[50px] z-20 w-[172px] text-center">
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#706965]">Năng lượng tổng quan</h4>
            <div className="relative mx-auto h-[92px] w-[92px]">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <path d="M18 2.08a15.92 15.92 0 1 1 0 31.84 15.92 15.92 0 0 1 0-31.84" stroke="#eee4d8" strokeWidth="3" fill="none" />
                <path d="M18 2.08a15.92 15.92 0 1 1 0 31.84 15.92 15.92 0 0 1 0-31.84" stroke="#bd8429" strokeDasharray="82 100" strokeLinecap="round" strokeWidth="3" fill="none" />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-serif text-[30px] leading-none">82</span>
                <span className="-mt-8 text-[10px] text-[#928a84]">/100</span>
              </div>
            </div>
            <p className="mt-2 text-[12px] font-medium text-[#a87318]">Rất tốt</p>
          </FloatingCard>

          <FloatingCard className="right-[8px] top-[238px] z-20 w-[172px]">
            <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#706965]">Đại vận hiện tại</h4>
            <p className="font-serif text-[23px] text-[#b57920]">24 - 33 <span className="font-sans text-[14px] text-[#5d554f]">tuổi</span></p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#e8f5e9] px-2.5 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4caf50]" />
              <span className="text-[11px] font-medium text-[#2e7d32]">Cát vận</span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-[#706965]">Giai đoạn phát triển vượt bậc</p>
          </FloatingCard>

          <FloatingCard className="right-[8px] top-[410px] z-20 w-[220px]">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#706965]">Xu hướng 10 năm tới</h4>
            <LineChart />
          </FloatingCard>
        </div>
      </section>

      <section id="features" className="relative z-30 mx-auto -mt-[44px] mb-12 max-w-[1432px] px-6 sm:px-8 lg:px-10">
        <div className="rounded-lg border border-[#ece4dc] bg-white/90 px-14 py-8 shadow-[0_16px_48px_rgba(63,43,21,0.07)] backdrop-blur-sm">
          <h2 className="text-center font-serif text-[28px] font-semibold text-[#1f1d1b]">Vì sao chọn AstroTuVi?</h2>
          <div className="mx-auto mt-2 h-[2px] w-8 bg-[#bd8429]" />
          <div className="mt-9 grid gap-10 lg:grid-cols-3">
            {[
              [<BarChart2 size={30} />, 'Phân tích chuyên sâu', 'Hệ thống thuật toán độc quyền phân tích lá số Tử Vi chi tiết, bao gồm 12 cung mệnh và các sao chủ chốt.'],
              [<Target size={30} />, 'Dự báo chính xác đến từng giai đoạn', 'Kết hợp trí tuệ cổ nhân và công nghệ AI để tạo ra những dự báo vận hạn đáng tin cậy theo từng chu kỳ 10 năm.'],
              [<RefreshCw size={30} />, 'Cập nhật liên tục', 'Dự báo vận hạn theo thời gian thực, giúp bạn chủ động nắm bắt cơ hội và vượt qua thách thức.'],
            ].map(([icon, title, copy]) => (
              <article key={title as string} className="flex gap-5">
                <FeatureIcon>{icon}</FeatureIcon>
                <div>
                  <h3 className="mb-2 text-[15px] font-semibold text-[#24211f]">{title}</h3>
                  <p className="text-[13px] leading-[1.85] text-[#67605b]">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-[#eadfd6] bg-white p-7 shadow-2xl">
            <h3 className="mb-3 font-serif text-2xl font-semibold">Xác nhận xóa</h3>
            <p className="mb-7 text-sm leading-relaxed text-[#625b56]">Bạn có chắc chắn muốn xóa lá số này không? Hành động này không thể hoàn tác.</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setShowDeleteModal(null)} className="h-11 rounded border border-[#e0d8d0] text-[#5f5751]">Hủy</button>
              <button type="button" onClick={() => handleDelete(showDeleteModal)} className="h-11 rounded bg-red-600 font-medium text-white">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
