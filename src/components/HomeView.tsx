import React, { useEffect, useState } from 'react';
import { BarChart2, CalendarDays, Clock3, RefreshCw, Sparkles, Target, Trash2, User } from 'lucide-react';
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { CustomDatePicker } from './CustomDatePicker';
import { CustomSelect } from './CustomSelect';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import backgroundHomepage from '../../original_images/background_homepage.svg';

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

const formatSavedDate = (date?: string) => {
  if (!date) return 'Chưa có ngày sinh';
  const [year, month, day] = date.split('-');
  return day && month && year ? `${day}/${month}/${year}` : date;
};

const getHourLabel = (value?: string) => hourOptions.find((option) => option.value === value)?.label || 'Chưa chọn giờ sinh';

const FeatureIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-full bg-[#f5ece0] text-[#b88327]">
    {children}
  </div>
);

const FloatingCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`absolute rounded-lg border border-[#dfcfbf]/80 bg-[#f7efe4]/84 p-3 shadow-[0_12px_28px_rgba(63,43,21,0.075)] backdrop-blur-[2px] ${className}`}>
    {children}
  </div>
);

const LineChart = () => (
  <svg viewBox="0 0 220 104" className="mt-2 h-[88px] w-full overflow-visible">
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
    {['2026', '2028', '2030', '2032', '2034', '2036'].map((year, index) => (
      <text key={year} x={16 + index * 36} y="100" fill="#8d8580" fontSize="10">{year}</text>
    ))}
    <text x="0" y="22" fill="#8d8580" fontSize="10">6</text>
    <text x="0" y="53" fill="#8d8580" fontSize="10">3</text>
    <text x="0" y="83" fill="#8d8580" fontSize="10">0</text>
  </svg>
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
    <div
      className="relative min-h-screen overflow-x-hidden bg-[#fbf7f3] bg-cover bg-top bg-no-repeat pt-[76px] font-sans text-[#1f1d1b]"
      style={{ backgroundImage: `url(${backgroundHomepage})` }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -right-24 top-24 h-[680px] w-[680px] rounded-full border border-[#d7a34e]/10" />
        <div className="absolute right-0 top-16 h-[510px] w-[510px] rounded-full border border-[#d7a34e]/10" />
        <svg className="absolute inset-x-0 top-20 h-[640px] w-full" viewBox="0 0 1536 780" fill="none">
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

      <section className="relative mx-auto min-h-[610px] max-w-[1360px] overflow-x-hidden px-5 pb-6 sm:px-7 lg:px-8">
        <div className="relative z-20 w-full max-w-[540px] pt-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d9c3a3] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9b6b1d] shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Tử Vi dữ liệu hóa
          </div>
          <h1 className="font-serif text-[42px] font-medium leading-[1.04] tracking-[-0.012em] text-[#1f1d1b] sm:text-[48px] lg:text-[52px]">
            Giải mã
            <br />
            <span className="inline-block max-w-full">Vận Mệnh bằng <span className="text-[#ad7b28]">Dữ Liệu</span></span>
          </h1>
          <p className="mt-4 max-w-[500px] text-[12px] leading-[1.75] text-[#69625f]">
            <span className="font-semibold text-[#2d2925]">AstroTuVi</span> kết hợp trí tuệ cổ nhân và công nghệ dữ liệu hiện đại
            {' '}để <span className="text-[#9b6b1d]">phân tích vận mệnh</span>, <span className="text-[#9b6b1d]">dự báo xu hướng</span> và đồng hành cùng bạn trên hành trình phát triển bản thân.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 w-full max-w-[440px] rounded-lg border border-[#ebe3db] bg-white/90 p-5 shadow-[0_16px_42px_rgba(50,36,23,0.09)] backdrop-blur-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b88327]">Bắt đầu miễn phí</p>
                <h2 className="mt-1 font-serif text-[19px] font-semibold text-[#1f1d1b]">Khai mở lá số Tử Vi của bạn</h2>
              </div>
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fff7e8] text-[#b88327]">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>

            <label className="mb-1.5 block text-[13px] font-medium text-[#2b2825]">Họ và tên</label>
            <div className="relative mb-3">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a39c97]" />
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập họ và tên đầy đủ"
                className="h-9 w-full rounded border border-[#e4ded8] bg-white pl-10 pr-3 text-[13px] outline-none transition-colors placeholder:text-[#a19a95] focus:border-[#bd8429]"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#2b2825]">Ngày sinh dương lịch</label>
                <div className="homepage-compact-field">
                  <CustomDatePicker value={formData.dob} onChange={(value) => setFormData({ ...formData, dob: value })} placeholder="DD / MM / YYYY" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#2b2825]">Giờ sinh <span className="font-normal text-[#6f6863]">(chọn khung giờ)</span></label>
                <div className="homepage-compact-field">
                  <CustomSelect value={formData.hour} onChange={(value) => setFormData({ ...formData, hour: value })} placeholder="Chọn khung giờ sinh" options={hourOptions} />
                </div>
              </div>
            </div>

            <label className="mb-1.5 mt-3 block text-[13px] font-medium text-[#2b2825]">Giới tính</label>
            <div className="grid grid-cols-2 gap-0">
              {['Nam giới', 'Nữ giới'].map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender })}
                  className={`h-9 border text-[13px] transition-colors ${gender === 'Nam giới' ? 'rounded-l' : 'rounded-r -ml-px'} ${
                    formData.gender === gender ? 'border-[#c58f35] bg-[#fffaf1] text-[#9b6b1d]' : 'border-[#e4ded8] bg-white text-[#4d4642]'
                  }`}
                >
                  <span className="mr-2">{gender === 'Nam giới' ? '♂' : '♀'}</span>
                  {gender === 'Nam giới' ? 'Nam' : 'Nữ'}
                </button>
              ))}
            </div>

            <button type="submit" className="mt-4 flex h-13 w-full flex-col items-center justify-center rounded-md bg-[#1f1d1b] text-white shadow-[0_10px_22px_rgba(20,16,10,0.22)] transition-colors hover:bg-[#2d2b29]">
              <span className="flex items-center gap-2 text-[16px] font-medium">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
                </svg>
                Khám Phá Lá Số
              </span>
              <span className="mt-0.5 text-[12px] opacity-75">Miễn phí · Không cần đăng ký</span>
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-[#827a74]">
              Thông tin chỉ dùng để dựng lá số và có thể lưu lại khi bạn đăng nhập.
            </p>
          </form>

          {user && savedHoroscopes.length > 0 && (
            <div className="mt-4 w-full max-w-[440px] rounded-lg border border-[#eadfd6] bg-white/82 p-4 shadow-[0_12px_30px_rgba(50,36,23,0.07)] backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#b88327]">Đã lưu</p>
                  <h3 className="font-serif text-[18px] font-semibold text-[#1f1d1b]">Lá số gần đây</h3>
                </div>
                <span className="rounded-full bg-[#f5ece0] px-2.5 py-1 text-[11px] font-semibold text-[#9b6b1d]">
                  {savedHoroscopes.length}
                </span>
              </div>

              <div className="max-h-[178px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                {savedHoroscopes.slice(0, 5).map((item) => (
                  <div key={item.id} className="group flex items-center gap-3 rounded-md border border-[#eee5dc] bg-white/76 p-2.5 transition-colors hover:border-[#d8b77c] hover:bg-[#fffaf1]">
                    <button
                      type="button"
                      onClick={() => onGenerate({
                        id: item.id,
                        name: item.name || '',
                        dob: item.dob || '',
                        hour: item.hour || '',
                        gender: item.gender || 'Nam giới',
                        viewYear: item.viewYear || new Date().getFullYear().toString(),
                        analyses: item.analyses || {},
                      })}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-[13px] font-semibold text-[#2b2825]">{item.name || 'Lá số chưa đặt tên'}</p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#766e68]">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatSavedDate(item.dob)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3 w-3" />
                          {getHourLabel(item.hour)}
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(item.id)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#9b8f87] transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label={`Xóa lá số ${item.name || ''}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="absolute left-[39%] top-[-26px] hidden h-[570px] w-[760px] lg:block">
          <FloatingCard className="left-[46px] top-[74px] z-20 w-[152px]">
            <h4 className="mb-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#706965]">Ngũ hành bản mệnh</h4>
            {[
              ['Kim', '#d8d1c8', '22%'],
              ['Mộc', '#58794d', '18%'],
              ['Thủy', '#486b82', '20%'],
              ['Hỏa', '#b84d37', '25%'],
              ['Thổ', '#b88327', '15%'],
            ].map(([name, color, pct]) => (
              <div key={name} className="mb-1.5 flex items-center gap-2 text-[10px] text-[#4c4642]">
                <span className="w-8">{name}</span>
                <span className="h-1.5 flex-1 rounded-full bg-[#e7e0d9]"><span className="block h-full rounded-full" style={{ width: pct, backgroundColor: color }} /></span>
                <span className="w-7 text-right text-[#7e7772]">{pct}</span>
              </div>
            ))}
          </FloatingCard>

          <FloatingCard className="left-[26px] top-[268px] z-20 w-[168px]">
            <h4 className="mb-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#706965]">Sự nghiệp</h4>
            <div className="flex gap-2.5 text-[11px] leading-relaxed text-[#433d39]">
              <BarChart2 className="mt-1 h-4 w-4 text-[#bd8429]" />
              <p>Thiên thời thuận lợi<br /><span className="text-[#716a65]">nỗ lực sẽ thành công</span></p>
            </div>
          </FloatingCard>

          <FloatingCard className="left-[26px] top-[380px] z-20 w-[150px]">
            <h4 className="mb-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#706965]">Tình duyên</h4>
            <div className="flex gap-2.5 text-[11px] leading-relaxed text-[#433d39]">
              <span className="mt-1 text-lg leading-none text-[#bd8429]">♡</span>
              <p>Đào hoa vượng<br /><span className="text-[#716a65]">nhân duyên tốt đẹp</span></p>
            </div>
          </FloatingCard>

          <FloatingCard className="right-[8px] top-[50px] z-20 w-[172px] text-center">
            <h4 className="mb-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#706965]">Năng lượng tổng quan</h4>
            <div className="relative mx-auto h-[78px] w-[78px]">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <path d="M18 2.08a15.92 15.92 0 1 1 0 31.84 15.92 15.92 0 0 1 0-31.84" stroke="#eee4d8" strokeWidth="3" fill="none" />
                <path d="M18 2.08a15.92 15.92 0 1 1 0 31.84 15.92 15.92 0 0 1 0-31.84" stroke="#bd8429" strokeDasharray="82 100" strokeLinecap="round" strokeWidth="3" fill="none" />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-serif text-[25px] leading-none">82</span>
                <span className="-mt-7 text-[9px] text-[#928a84]">/100</span>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-[#a87318]">Rất tốt</p>
          </FloatingCard>

          <FloatingCard className="right-[8px] top-[218px] z-20 w-[180px]">
            <h4 className="mb-3 text-[9px] font-bold uppercase tracking-[0.08em] text-[#706965]">Đại vận hiện tại</h4>
            <p className="font-serif text-[20px] text-[#b57920]">24 - 33 <span className="font-sans text-[12px] text-[#5d554f]">tuổi</span></p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#e8f5e9] px-2.5 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4caf50]" />
              <span className="text-[10px] font-medium text-[#2e7d32]">Cát vận</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[#706965]">Giai đoạn phát triển vượt bậc</p>
          </FloatingCard>

          <FloatingCard className="right-[8px] top-[388px] z-20 w-[190px]">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#706965]">Xu hướng 10 năm tới</h4>
            <LineChart />
          </FloatingCard>
        </div>
      </section>

      <section id="features" className="relative z-30 mx-auto mt-6 mb-8 max-w-[1360px] px-5 sm:px-7 lg:px-8">
        <div className="rounded-lg border border-[#ece4dc] bg-white/90 px-8 py-6 shadow-[0_12px_36px_rgba(63,43,21,0.07)] backdrop-blur-sm">
          <h2 className="text-center font-serif text-[24px] font-semibold text-[#1f1d1b]">Vì sao chọn AstroTuVi?</h2>
          <div className="mx-auto mt-2 h-[2px] w-8 bg-[#bd8429]" />
          <div className="mt-6 grid gap-7 lg:grid-cols-3">
            {[
              [<BarChart2 size={24} />, 'Phân tích chuyên sâu', 'Hệ thống thuật toán độc quyền phân tích lá số Tử Vi chi tiết, bao gồm 12 cung mệnh và các sao chủ chốt.'],
              [<Target size={24} />, 'Dự báo chính xác đến từng giai đoạn', 'Kết hợp trí tuệ cổ nhân và công nghệ AI để tạo ra những dự báo vận hạn đáng tin cậy theo từng chu kỳ 10 năm.'],
              [<RefreshCw size={24} />, 'Cập nhật liên tục', 'Dự báo vận hạn theo thời gian thực, giúp bạn chủ động nắm bắt cơ hội và vượt qua thách thức.'],
            ].map(([icon, title, copy]) => (
              <article key={title as string} className="flex gap-4">
                <FeatureIcon>{icon}</FeatureIcon>
                <div>
                  <h3 className="mb-1.5 text-[14px] font-semibold text-[#24211f]">{title}</h3>
                  <p className="text-[12px] leading-[1.7] text-[#67605b]">{copy}</p>
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
