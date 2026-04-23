import React, { useState, useEffect } from 'react';
import { User, Calendar, Clock, BarChart2, Target, Shield, RefreshCw } from 'lucide-react';
import { CustomSelect } from './CustomSelect';
import { CustomDatePicker } from './CustomDatePicker';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface HomeViewProps {
  onNavigate: (view: 'home' | 'chart') => void;
  onGenerate: (formData: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onGenerate }) => {
  const { user } = useAuth();
  const [savedHoroscopes, setSavedHoroscopes] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const fetchSavedHoroscopes = async () => {
    if (!user) {
      setSavedHoroscopes([]);
      return;
    }
    setLoadingSaved(true);
    try {
      const q = query(
        collection(db, 'horoscopes'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const horoscopes: any[] = [];
      querySnapshot.forEach((doc) => {
        horoscopes.push({ id: doc.id, ...doc.data() });
      });
      setSavedHoroscopes(horoscopes);
    } catch (error) {
      console.error("Error fetching saved horoscopes", error);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    fetchSavedHoroscopes();
  }, [user]);

  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'horoscopes', id));
      setSavedHoroscopes(prev => prev.filter(h => h.id !== id));
      setShowDeleteModal(null);
    } catch (error) {
      console.error("Error deleting horoscope", error);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    hour: '',
    gender: 'Nam giới',
    viewYear: new Date().getFullYear().toString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  // Reusable SVG Chart Component
  const LineChart = () => (
    <div className="w-full h-24 mt-2">
      <svg viewBox="0 0 100 40" className="w-full text-[#C89B5F] overflow-visible">
        {/* Grid lines */}
        <line x1="0" y1="0" x2="100" y2="0" stroke="#f0e6d2" strokeWidth="0.5" />
        <line x1="0" y1="20" x2="100" y2="20" stroke="#f0e6d2" strokeWidth="0.5" />
        <line x1="0" y1="40" x2="100" y2="40" stroke="#f0e6d2" strokeWidth="0.5" />
        {/* Y Axis text */}
        <text x="-5" y="4" fontSize="4" fill="#888">6</text>
        <text x="-5" y="22" fontSize="4" fill="#888">3</text>
        <text x="-5" y="40" fontSize="4" fill="#888">0</text>
        
        {/* X Axis text */}
        <text x="0" y="46" fontSize="4" fill="#888">2024</text>
        <text x="20" y="46" fontSize="4" fill="#888">2026</text>
        <text x="40" y="46" fontSize="4" fill="#888">2028</text>
        <text x="60" y="46" fontSize="4" fill="#888">2030</text>
        <text x="80" y="46" fontSize="4" fill="#888">2032</text>
        <text x="100" y="46" fontSize="4" fill="#888">2034</text>

        {/* Path and dots */}
        <path d="M0,40 L10,25 L20,20 L30,28 L40,15 L50,18 L60,10 L70,15 L80,5" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="0" cy="40" r="1.5" fill="currentColor" />
        <circle cx="10" cy="25" r="1.5" fill="currentColor" />
        <circle cx="20" cy="20" r="1.5" fill="currentColor" />
        <circle cx="30" cy="28" r="1.5" fill="currentColor" />
        <circle cx="40" cy="15" r="1.5" fill="currentColor" />
        <circle cx="50" cy="18" r="1.5" fill="currentColor" />
        <circle cx="60" cy="10" r="1.5" fill="currentColor" />
        <circle cx="70" cy="15" r="1.5" fill="currentColor" />
        <circle cx="80" cy="5" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBF8F5] font-sans pt-24 pb-12 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-start mb-24">
          
          {/* Left Column: Typography & Form */}
          <div className="pt-8 relative z-10 w-full max-w-xl">
            <h1 className="text-5xl sm:text-6xl md:text-[4rem] font-serif font-normal text-[#1F1F1F] leading-[1.15] mb-6">
              Giải mã <br />
              Vận Mệnh bằng <span className="text-[#B98C4E]">Dữ Liệu</span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-lg">
              AstroTuVi kết hợp trí tuệ cổ nhân và công nghệ dữ liệu hiện đại
              để phân tích vận mệnh, dự báo xu hướng và đồng hành cùng
              bạn trên hành trình phát triển bản thân.
            </p>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-[#e5e0d8]">
              <h2 className="text-xl font-medium text-gray-800 mb-6 font-serif">Khai mở lá số Tử Vi của bạn</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">Họ và tên</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Nhập họ và tên đầy đủ"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-1 focus:ring-[#B98C4E] focus:border-[#B98C4E] outline-none transition-all placeholder-gray-400 text-gray-800"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">Ngày sinh dương lịch</label>
                    <CustomDatePicker
                      value={formData.dob}
                      onChange={(value) => setFormData({ ...formData, dob: value })}
                      placeholder="DD / MM / YYYY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">Giờ sinh <span className="text-gray-400 font-normal">(chọn khung giờ)</span></label>
                    <CustomSelect
                      value={formData.hour}
                      onChange={(value) => setFormData({ ...formData, hour: value })}
                      placeholder="Chọn khung giờ sinh"
                      options={[
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
                        { value: 'hoi', label: 'Hợi (21:00 - 23:00)' }
                      ]}
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">Giới tính</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'Nam giới' })}
                      className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl border transition-colors ${
                        formData.gender === 'Nam giới' 
                          ? 'border-[#B98C4E] bg-[#B98C4E]/5 text-[#B98C4E]' 
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="5"/><line x1="14" y1="10" x2="21" y2="3"/><polyline points="15 3 21 3 21 9"/></svg>
                      Nam
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'Nữ giới' })}
                      className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl border transition-colors ${
                        formData.gender === 'Nữ giới' 
                          ? 'border-[#B98C4E] bg-[#B98C4E]/5 text-[#B98C4E]' 
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="5"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="9" y1="19" x2="15" y2="19"/></svg>
                      Nữ
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#B98C4E] hover:bg-[#A67E45] text-white font-medium py-3 rounded-xl transition-all shadow-md shadow-[#B98C4E]/20 flex flex-col items-center justify-center mt-6"
                >
                  <div className="flex items-center gap-2 text-lg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    Khai Mở Lá Số
                  </div>
                  <span className="font-normal opacity-90 text-sm mt-0.5">Miễn phí</span>
                </button>
              </form>
            </div>
            
            {/* Saved Horoscopes Note */}
            {user && savedHoroscopes.length > 0 && (
               <div className="mt-8">
                 <p className="text-gray-600 text-sm mb-3 font-medium">Lá số đã lưu của bạn:</p>
                 <div className="flex flex-wrap gap-2">
                   {savedHoroscopes.map(h => (
                     <div key={h.id} className="group relative bg-white border border-[#e5e0d8] rounded-full pl-4 pr-2 py-1.5 flex items-center gap-2 hover:border-[#B98C4E] transition-colors shadow-sm">
                       <button 
                         onClick={() => onGenerate({ ...h, isMock: false })}
                         className="text-sm text-gray-700 group-hover:text-[#B98C4E] transition-colors"
                       >
                         {h.name}
                       </button>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           setShowDeleteModal(h.id);
                         }}
                         className="p-1 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                         title="Xóa lá số"
                       >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                       </button>
                     </div>
                   ))}
                 </div>
               </div>
            )}
          </div>

          {/* Right Column: Graphic Representation */}
          <div className="relative h-[650px] w-full hidden lg:block border h-full border-transparent z-0">
             
             {/* Node Connection Lines Layer (Behind cards and wheel) */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ filter: 'drop-shadow(0px 0px 4px rgba(185, 140, 78, 0.4))' }}>
               <defs>
                 <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C89B5F" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#C89B5F" stopOpacity="0.1" />
                 </linearGradient>
                 <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                 </filter>
               </defs>

               {/* Center point is approx (50%, 50%) minus pedestal offset -> X: ~50%, Y: ~45% relative to container geometry.
                   Using relative CSS coordinates via absolute div is safer for responsiveness, but for SVG we can draw from a specific center.
                   Let's assume container is roughly 500x650. Center of wheel is 250, 275 (considering it's shifted up slightly by the layout). 
                   Actually, let's use percentage-based lines or just rely on CSS lines to be safer across screen sizes.
                   However, SVG with viewBox="0 0 500 650" is responsive enough since the parent is w-full h-[650px].
               */}
             </svg>
             
             {/* CSS-based Node Connections (More reliable for absolute positioned cards) */}
             <div className="absolute inset-0 pointer-events-none z-0">
                 <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-[55%]">
                     {/* Line to Top Left (Ngũ Hành) */}
                     <div className="absolute top-1/2 left-1/2 w-[220px] h-[1px] bg-gradient-to-r from-transparent to-[#B98C4E]/60 origin-left -rotate-[155deg] shadow-[0_0_8px_#B98C4E]">
                         <div className="absolute left-full top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#B98C4E] shadow-[0_0_10px_#B98C4E]"></div>
                     </div>
                     {/* Line to Bottom Left 1 (Sự nghiệp) */}
                     <div className="absolute top-1/2 left-1/2 w-[200px] h-[1px] bg-gradient-to-r from-transparent to-[#B98C4E]/60 origin-left -rotate-[190deg] shadow-[0_0_8px_#B98C4E]">
                         <div className="absolute left-full top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#B98C4E] shadow-[0_0_10px_#B98C4E]"></div>
                     </div>
                     {/* Line to Bottom Left 2 (Tình duyên) */}
                     <div className="absolute top-1/2 left-1/2 w-[210px] h-[1px] bg-gradient-to-r from-transparent to-[#B98C4E]/60 origin-left -rotate-[220deg] shadow-[0_0_8px_#B98C4E]">
                         <div className="absolute left-full top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#B98C4E] shadow-[0_0_10px_#B98C4E]"></div>
                     </div>
                     {/* Line to Top Right (Năng lượng) */}
                     <div className="absolute top-1/2 left-1/2 w-[240px] h-[1px] bg-gradient-to-r from-[#B98C4E]/60 to-transparent origin-left -rotate-[25deg] shadow-[0_0_8px_#B98C4E]">
                         <div className="absolute right-full top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#B98C4E] shadow-[0_0_10px_#B98C4E]"></div>
                     </div>
                     {/* Line to Middle Right (Đại vận) */}
                     <div className="absolute top-1/2 left-1/2 w-[220px] h-[1px] bg-gradient-to-r from-[#B98C4E]/60 to-transparent origin-left -rotate-[-10deg] shadow-[0_0_8px_#B98C4E]">
                         <div className="absolute right-full top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#B98C4E] shadow-[0_0_10px_#B98C4E]"></div>
                     </div>
                     {/* Line to Bottom Right (Xu hướng) */}
                     <div className="absolute top-1/2 left-1/2 w-[230px] h-[1px] bg-gradient-to-r from-[#B98C4E]/60 to-transparent origin-left -rotate-[-45deg] shadow-[0_0_8px_#B98C4E]">
                         <div className="absolute right-full top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#B98C4E] shadow-[0_0_10px_#B98C4E]"></div>
                     </div>
                 </div>
             </div>

             {/* Center Graphic */}
             <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] flex items-center justify-center z-10">
                {/* Outmost dashed ring */}
                <div className="absolute w-[460px] h-[460px] rounded-full border border-dashed border-[#C89B5F]/40 animate-[spin_80s_linear_infinite]" style={{boxShadow: '0 0 20px rgba(200,155,95,0.1) inset'}}></div>
                {/* Outmost inner thin ring */}
                <div className="absolute w-[440px] h-[440px] rounded-full border-[0.5px] border-[#C89B5F]/30"></div>
                {/* Middle ring with thicker border */}
                <div className="absolute w-[340px] h-[340px] rounded-full border border-[#C89B5F]/30 shadow-[0_0_30px_rgba(200,155,95,0.1)]"></div>
                {/* Inner dashed ring */}
                <div className="absolute w-[240px] h-[240px] rounded-full border border-dashed border-[#C89B5F]/70 animate-[spin_30s_linear_infinite_reverse]"></div>
                {/* Inner glowing core ring */}
                <div className="absolute w-[160px] h-[160px] rounded-full border-2 border-[#C89B5F]/40 bg-[#FBF8F5]/80 shadow-[0_0_40px_rgba(185,140,78,0.4)] backdrop-blur-sm"></div>
                {/* Innermost ring */}
                <div className="absolute w-[100px] h-[100px] rounded-full border border-[#C89B5F]/60"></div>
                
                {/* Center Star Complex */}
                <div className="absolute w-28 h-28 text-[#B98C4E] animate-[pulse_4s_ease-in-out_infinite]">
                  <svg viewBox="0 0 100 100" fill="currentColor">
                    {/* Outer thin 8-point rays */}
                    <path d="M50 5 L52 45 L95 50 L52 55 L50 95 L48 55 L5 50 L48 45 Z" fill="#C89B5F" opacity="0.5"/>
                    <path d="M50 20 L53 47 L80 50 L53 53 L50 80 L47 53 L20 50 L47 47 Z" fill="#b8860b" opacity="0.8"/>
                    {/* Diagonal thin rays */}
                    <path d="M50 50 L85 15 L55 50 L85 85 L50 55 L15 85 L45 50 L15 15 Z" stroke="#C89B5F" strokeWidth="1" fill="none" opacity="0.6"/>
                    
                    {/* Inner Sharp 4-point star */}
                    <path d="M50 15 L54 46 L85 50 L54 54 L50 85 L46 54 L15 50 L46 46 Z" fill="#A67E45"/>
                    <path d="M50 15 L50 85 M15 50 L85 50" stroke="#FFF8D6" strokeWidth="1" opacity="0.5"/>
                    {/* Core highlight */}
                    <circle cx="50" cy="50" r="4" fill="#FFF8D6" filter="blur(1px)"/>
                  </svg>
                </div>
                
                {/* 12 Palaces Texts placed circularly */}
                {['MỆNH', 'PHỤ MẪU', 'PHÚC ĐỨC', 'ĐIỀN TRẠCH', 'QUAN LỘC', 'NÔ BỘC', 'THIÊN DI', 'TẬT ÁCH', 'TÀI BẠCH', 'TỬ TỨC', 'THÊ THIẾP', 'HUYNH ĐỆ'].map((palace, i) => {
                   const angle = (i * 360 / 12) - 90;
                   const radius = 195;
                   const x = Math.cos(angle * Math.PI / 180) * radius;
                   const y = Math.sin(angle * Math.PI / 180) * radius;
                   
                   // Add dots along the rings
                   const dotRadius = 170;
                   const cx = Math.cos(angle * Math.PI / 180) * dotRadius;
                   const cy = Math.sin(angle * Math.PI / 180) * dotRadius;

                   return (
                     <React.Fragment key={palace}>
                       <div 
                          className="absolute text-[9.5px] font-semibold text-gray-700 tracking-widest font-serif drop-shadow-sm"
                          style={{ transform: `translate(${x}px, ${y}px)` }}
                       >
                         {palace}
                       </div>
                       {/* Connective small dots on inner ring */}
                       <div 
                         className="absolute w-1.5 h-1.5 rounded-full bg-[#C89B5F]/80 shadow-[0_0_5px_rgba(200,155,95,0.6)]"
                         style={{ transform: `translate(${cx}px, ${cy}px)` }}
                       ></div>
                     </React.Fragment>
                   );
                })}
             </div>

             {/* Floating 3D Golden Pedestal at the bottom */}
             <div className="absolute bottom-[20px] left-1/2 transform -translate-x-1/2 w-[460px] h-[140px] z-0">
                {/* Drop shadow for floating effect */}
                <div className="absolute bottom-[-10px] left-[5%] w-[90%] h-[30px] rounded-[50%] bg-black/20 blur-xl"></div>
                <div className="absolute bottom-[0px] left-[15%] w-[70%] h-[20px] rounded-[50%] bg-black/30 blur-lg"></div>

                {/* Base Tier (Bottom) */}
                <div className="absolute bottom-[15px] w-full h-[60px] rounded-[50%] bg-gradient-to-r from-[#d4af37]/80 via-[#FFF8D6]/90 to-[#b8860b]/80 border border-[#b8860b]/50 shadow-[0_15px_25px_rgba(0,0,0,0.15)] flex items-center justify-center">
                    {/* Ring ridges */}
                    <div className="absolute w-[98%] h-[85%] rounded-[50%] border-t-[2px] border-white/60"></div>
                    <div className="absolute w-[95%] h-[80%] rounded-[50%] border-b-[3px] border-[#8b6508]/40"></div>
                </div>
                
                {/* Middle Tier */}
                <div className="absolute bottom-[32px] left-[5%] w-[90%] h-[50px] rounded-[50%] bg-gradient-to-r from-[#b8860b] via-[#FFF8D6] to-[#d4af37] border-t border-white/40 shadow-[0_-2px_10px_rgba(0,0,0,0.1)_inset]">
                     <div className="absolute w-full h-full rounded-[50%] bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,rgba(255,255,255,0.2)_10px,rgba(255,255,255,0.2)_20px)] opacity-30 mix-blend-overlay"></div>
                </div>

                {/* Top Tier (Surface) */}
                <div className="absolute bottom-[48px] left-[10%] w-[80%] h-[40px] rounded-[50%] bg-gradient-to-br from-[#FFF8D6] via-[#d4af37] to-[#8b6508] border-[1px] border-white/80 shadow-[0_5px_15px_rgba(0,0,0,0.2)_inset]">
                     {/* Surface inner rings */}
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[80%] rounded-[50%] border-[0.5px] border-[#b8860b]/60"></div>
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70%] h-[60%] rounded-[50%] border border-[#fff]/80 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50%] h-[40%] rounded-[50%] bg-[#FFF8D6]/80 border-[0.5px] border-[#b8860b]/40"></div>
                </div>
                
                {/* Bright central upward glow from pedestal to chart */}
                <div className="absolute bottom-[60px] left-1/2 transform -translate-x-1/2 w-[60%] h-[150px] bg-gradient-to-t from-[#FFF8D6]/50 to-transparent blur-2xl pointer-events-none mix-blend-screen"></div>
             </div>

            {/* Floating Info Cards */}
            {/* Top Left: Ngũ Hành */}
            <div className="absolute top-[5%] left-[-10%] bg-white rounded-xl shadow-lg border border-[#e5e0d8] p-4 w-[200px] !z-20">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">Ngũ Hành Bản Mệnh</h4>
               <div className="space-y-2.5">
                 {[
                   {name: 'Kim', color: '#D1D5DB', pct: '22%'},
                   {name: 'Mộc', color: '#059669', pct: '18%'},
                   {name: 'Thủy', color: '#3B82F6', pct: '20%'},
                   {name: 'Hỏa', color: '#DC2626', pct: '25%'},
                   {name: 'Thổ', color: '#D97706', pct: '15%'}
                 ].map(el => (
                   <div key={el.name} className="flex items-center text-xs">
                     <span className="w-10 text-gray-600">{el.name}</span>
                     <div className="flex-1 h-1.5 bg-gray-100 rounded-full mx-2 overflow-hidden">
                       <div className="h-full rounded-full" style={{width: el.pct, backgroundColor: el.color}}></div>
                     </div>
                     <span className="text-gray-400 text-[10px] w-8 text-right">{el.pct}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Bottom Left 1: Sự Nghiệp */}
            <div className="absolute top-[45%] left-[-15%] bg-white rounded-xl shadow-lg border border-[#e5e0d8] p-4 w-[200px]">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">Sự Nghiệp</h4>
               <div className="flex items-start gap-3">
                 <div className="mt-1 text-[#B98C4E]"><BarChart2 size={18}/></div>
                 <p className="text-xs text-gray-700 font-medium">Thiên thời thuận lợi<br/><span className="text-gray-500 font-normal">nỗ lực sẽ thành công</span></p>
               </div>
            </div>

            {/* Bottom Left 2: Tình Duyên */}
            <div className="absolute top-[65%] left-[-10%] bg-white rounded-xl shadow-lg border border-[#e5e0d8] p-4 w-[200px]">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">Tình Duyên</h4>
               <div className="flex items-start gap-3">
                 <div className="mt-1 text-[#B98C4E]">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                 </div>
                 <p className="text-xs text-gray-700 font-medium">Đào hoa vượng<br/><span className="text-gray-500 font-normal">nhân duyên tốt đẹp</span></p>
               </div>
            </div>

            {/* Top Right: Năng Lượng */}
            <div className="absolute top-[10%] right-[-10%] bg-white rounded-xl shadow-lg border border-[#e5e0d8] p-4 w-[200px] text-center">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Năng Lượng Tổng Quan</h4>
               <div className="relative w-20 h-20 mx-auto">
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                   <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                   <path className="text-[#B98C4E]" strokeDasharray="82, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-2xl font-serif text-gray-800">82</span>
                   <span className="text-[8px] text-gray-400">/100</span>
                 </div>
               </div>
               <p className="text-[#B98C4E] font-medium text-xs mt-3">Rất tốt</p>
            </div>

            {/* Middle Right: Đại Vận */}
            <div className="absolute top-[40%] right-[-15%] bg-white rounded-xl shadow-lg border border-[#e5e0d8] p-4 w-[200px] text-center">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">Đại Vận Hiện Tại</h4>
               <div className="text-2xl font-serif text-[#B98C4E] mb-1">24 - 33 <span className="text-sm text-gray-600">tuổi</span></div>
               <p className="text-xs text-gray-600">Giai đoạn phát triển<br/>vượt bậc</p>
            </div>

            {/* Bottom Right: Xu Hướng Chart */}
            <div className="absolute top-[60%] right-[-10%] bg-white rounded-xl shadow-lg border border-[#e5e0d8] p-4 w-[240px]">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2 mb-2">Xu Hướng 10 Năm Tới</h4>
               <LineChart />
            </div>

          </div>
        </div>

        {/* Bottom Section: Features */}
        <div className="bg-white rounded-3xl p-10 md:p-14 shadow-sm border border-[#e5e0d8] mb-12">
          <h2 className="text-3xl font-serif font-bold text-center text-gray-900 mb-12">Vì sao chọn AstroTuVi?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {/* Feature 1 */}
             <div className="flex gap-4">
               <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#B98C4E]/10 flex items-center justify-center text-[#B98C4E]">
                 <BarChart2 size={24} />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900 mb-2">Phân tích chuyên sâu</h3>
                 <p className="text-sm text-gray-600 leading-relaxed">Hệ thống thuật toán độc quyền phân tích lá số Tử Vi chi tiết và chính xác.</p>
               </div>
             </div>

             {/* Feature 2 */}
             <div className="flex gap-4">
               <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#B98C4E]/10 flex items-center justify-center text-[#B98C4E]">
                 <Target size={24} />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900 mb-2">Dữ liệu khoa học</h3>
                 <p className="text-sm text-gray-600 leading-relaxed">Kết hợp trí tuệ cổ nhân và công nghệ AI để tạo ra những dự báo đáng tin cậy.</p>
               </div>
             </div>

             {/* Feature 3 */}
             <div className="flex gap-4">
               <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#B98C4E]/10 flex items-center justify-center text-[#B98C4E]">
                 <Shield size={24} />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900 mb-2">Bảo mật tuyệt đối</h3>
                 <p className="text-sm text-gray-600 leading-relaxed">Thông tin cá nhân được mã hóa và bảo vệ theo tiêu chuẩn bảo mật quốc tế.</p>
               </div>
             </div>

             {/* Feature 4 */}
             <div className="flex gap-4">
               <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#B98C4E]/10 flex items-center justify-center text-[#B98C4E]">
                 <RefreshCw size={24} />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900 mb-2">Cập nhật vận hạn</h3>
                 <p className="text-sm text-gray-600 leading-relaxed">Dự báo vận hạn theo thời gian thực, giúp bạn chủ động nắm bắt cơ hội.</p>
               </div>
             </div>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-gold/20 transform transition-all">
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Bạn có chắc chắn muốn xóa lá số này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
