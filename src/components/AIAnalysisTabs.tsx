import React, { useState, useEffect } from 'react';
import { Loader2, BookOpen, Sparkles, User, Map, Search } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { analyzeHolisticChart, answerSelfUnderstandingCategory, analyzeTuVi } from '../services/gemini';
import { mockPalaces, Palace, CentralInfo, mockCentralInfo } from '../data/mockData';
import { deepAnalysisCategories } from '../data/deepAnalysisCategories';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface AIAnalysisTabsProps {
  selectedPalace?: Palace | null;
  palaces?: Palace[];
  centralInfo?: CentralInfo;
}

export const AIAnalysisTabs: React.FC<AIAnalysisTabsProps> = ({ selectedPalace, palaces = mockPalaces, centralInfo = mockCentralInfo }) => {
  const [activeTab, setActiveTab] = useState<'holistic' | 'self' | 'palace' | 'deep'>('holistic');
  const [holisticResult, setHolisticResult] = useState<string>('');
  const [isAnalyzingHolistic, setIsAnalyzingHolistic] = useState(false);
  
  const [palaceResult, setPalaceResult] = useState<string>('');
  const [palaceResults, setPalaceResults] = useState<Record<string, string>>({});
  const [isAnalyzingPalace, setIsAnalyzingPalace] = useState(false);
  const [lastAnalyzedPalace, setLastAnalyzedPalace] = useState<string>('');

  useEffect(() => {
    if (selectedPalace && !centralInfo.isMock) {
      setActiveTab('palace');
      handlePalaceAnalysis(selectedPalace);
    } else if (selectedPalace && centralInfo.isMock) {
      setActiveTab('palace');
    }
  }, [selectedPalace, centralInfo.isMock]);

  const [selfCategory, setSelfCategory] = useState<string>('');
  const [selfResult, setSelfResult] = useState<string>('');
  const [selfResults, setSelfResults] = useState<Record<string, string>>({});
  const [isAnalyzingSelf, setIsAnalyzingSelf] = useState(false);

  const [deepCategory, setDeepCategory] = useState<string>('');
  const [deepQuestion, setDeepQuestion] = useState<string>('');
  const [deepResult, setDeepResult] = useState<string>('');
  const [deepResults, setDeepResults] = useState<Record<string, string>>({});
  const [isAnalyzingDeep, setIsAnalyzingDeep] = useState(false);

  // Initialize or reset based on centralInfo
  useEffect(() => {
    // If we have saved analyses, load them
    if (centralInfo.analyses) {
      setHolisticResult(centralInfo.analyses.holistic || '');
      setPalaceResults(centralInfo.analyses.palaces || {});
      setSelfResults(centralInfo.analyses.self || {});
      setDeepResults(centralInfo.analyses.deep || {});
      
      // Clear current active results since we're switching charts
      setPalaceResult('');
      setLastAnalyzedPalace('');
      setSelfResult('');
      setSelfCategory('');
      setDeepResult('');
      setDeepCategory('');
      setDeepQuestion('');
    } else {
      // If no analyses (new chart), reset everything
      setHolisticResult('');
      setPalaceResult('');
      setPalaceResults({});
      setLastAnalyzedPalace('');
      setSelfResult('');
      setSelfResults({});
      setSelfCategory('');
      setDeepResult('');
      setDeepResults({});
      setDeepCategory('');
      setDeepQuestion('');
    }
  }, [centralInfo.docId, centralInfo.name, centralInfo.dob]); // Use specific fields to avoid unnecessary resets if the object reference changes but data is same

  // Helper to format chart data for AI
  const getChartData = () => {
    const data: Record<string, string[]> = {};
    palaces.forEach(p => {
      const allStars = [
        ...p.mainStars.map(s => s.name),
        ...p.goodStars.map(s => s.name),
        ...p.badStars.map(s => s.name)
      ];
      if (p.annualStars) {
        allStars.push(...p.annualStars.map(s => s.name));
      }
      if (p.isTuan) allStars.push("Tuần");
      if (p.isTriet) allStars.push("Triệt");
      
      const palaceName = p.isThan ? `${p.name} (Thân)` : p.name;
      data[`${palaceName} (tại ${p.canChi}) - Đại Hạn: ${p.age}, Tiểu Hạn: ${p.bottomLeft}, Tràng Sinh: ${p.bottomRight}`] = allStars;
    });
    return data;
  };

  const saveAnalysisToFirestore = async (type: 'holistic' | 'palaces' | 'self' | 'deep', data: any) => {
    if (!centralInfo.docId || centralInfo.isMock) return;
    
    try {
      const docRef = doc(db, 'horoscopes', centralInfo.docId);
      const updateData: any = {};
      
      if (type === 'holistic') {
        updateData['analyses.holistic'] = data;
      } else if (type === 'palaces') {
        const palaceId = Object.keys(data)[0];
        updateData[`analyses.palaces.${palaceId}`] = data[palaceId];
      } else if (type === 'self') {
        const categoryId = Object.keys(data)[0];
        updateData[`analyses.self.${categoryId}`] = data[categoryId];
      } else if (type === 'deep') {
        const cacheKey = Object.keys(data)[0];
        updateData[`analyses.deep.${cacheKey}`] = data[cacheKey];
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error("Error saving analysis to Firestore", error);
    }
  };

  const handleHolisticAnalysis = async () => {
    if (holisticResult) return;
    setIsAnalyzingHolistic(true);
    try {
      const result = await analyzeHolisticChart(getChartData(), centralInfo);
      setHolisticResult(result);
      saveAnalysisToFirestore('holistic', result);
    } catch (error: any) {
      console.error("Lỗi phân tích:", error);
      setHolisticResult(`Đã có lỗi xảy ra khi phân tích: ${error.message || String(error)}`);
    } finally {
      setIsAnalyzingHolistic(false);
    }
  };

  const handlePalaceAnalysis = async (palace: Palace) => {
    if (lastAnalyzedPalace === palace.id && palaceResult) return;
    
    if (palaceResults[palace.id]) {
      setPalaceResult(palaceResults[palace.id]);
      setLastAnalyzedPalace(palace.id);
      return;
    }

    setIsAnalyzingPalace(true);
    setLastAnalyzedPalace(palace.id);
    setPalaceResult('');
    
    const stars = [
      ...palace.mainStars.map(s => s.name),
      ...palace.goodStars.map(s => s.name),
      ...palace.badStars.map(s => s.name)
    ];
    if (palace.annualStars) {
      stars.push(...palace.annualStars.map(s => s.name));
    }
    if (palace.isTuan) stars.push("Tuần");
    if (palace.isTriet) stars.push("Triệt");

    const palaceName = palace.isThan ? `${palace.name} (Thân)` : palace.name;
    const fullPalaceName = `${palaceName} (tại ${palace.canChi}) - Đại Hạn: ${palace.age}, Tiểu Hạn: ${palace.bottomLeft}, Tràng Sinh: ${palace.bottomRight}`;

    try {
      const result = await analyzeTuVi(fullPalaceName, stars, getChartData(), centralInfo);
      setPalaceResult(result);
      setPalaceResults(prev => ({ ...prev, [palace.id]: result }));
      saveAnalysisToFirestore('palaces', { [palace.id]: result });
    } catch (error: any) {
      console.error("Lỗi phân tích cung:", error);
      setPalaceResult(`Đã có lỗi xảy ra khi phân tích cung này: ${error.message || String(error)}`);
    } finally {
      setIsAnalyzingPalace(false);
    }
  };

  const handleSelfAnalysis = async (categoryId: string, categoryName: string, questions: string[]) => {
    setSelfCategory(categoryId);
    
    // Scroll to result area on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('self-result-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }

    if (selfResults[categoryId]) {
      setSelfResult(selfResults[categoryId]);
      return;
    }

    setIsAnalyzingSelf(true);
    setSelfResult('');
    try {
      const result = await answerSelfUnderstandingCategory(getChartData(), categoryName, questions, centralInfo);
      setSelfResult(result);
      setSelfResults(prev => ({ ...prev, [categoryId]: result }));
      saveAnalysisToFirestore('self', { [categoryId]: result });
    } catch (error: any) {
      console.error("Lỗi phân tích:", error);
      setSelfResult(`Đã có lỗi xảy ra khi phân tích: ${error.message || String(error)}`);
    } finally {
      setIsAnalyzingSelf(false);
    }
  };

  const handleDeepAnalysis = async (categoryId: string, categoryName: string, question: string) => {
    setDeepCategory(categoryId);
    setDeepQuestion(question);
    
    // Scroll to result area on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('deep-result-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    
    const cacheKey = `${categoryId}-${question}`;
    if (deepResults[cacheKey]) {
      setDeepResult(deepResults[cacheKey]);
      return;
    }

    setIsAnalyzingDeep(true);
    setDeepResult('');
    try {
      const result = await answerSelfUnderstandingCategory(getChartData(), categoryName, [question], centralInfo);
      setDeepResult(result);
      setDeepResults(prev => ({ ...prev, [cacheKey]: result }));
      saveAnalysisToFirestore('deep', { [cacheKey]: result });
    } catch (error: any) {
      console.error("Lỗi phân tích:", error);
      setDeepResult(`Đã có lỗi xảy ra khi phân tích: ${error.message || String(error)}`);
    } finally {
      setIsAnalyzingDeep(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gold/20 overflow-hidden relative">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#961e1e 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Tabs Header */}
      <div className="flex border-b border-gold/20 overflow-x-auto relative z-10 bg-maroon/5 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setActiveTab('holistic')}
          className={`flex-1 py-4 px-6 text-sm font-medium whitespace-nowrap flex items-center justify-center gap-2 transition-all duration-300 ${
            activeTab === 'holistic' ? 'bg-white text-maroon border-b-2 border-maroon shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)_inset]' : 'text-gray-500 hover:text-maroon hover:bg-maroon/5'
          }`}
        >
          <Sparkles size={18} className={activeTab === 'holistic' ? 'text-gold' : ''} />
          Luận Giải Tổng Quan
        </button>
        <button
          onClick={() => setActiveTab('palace')}
          className={`flex-1 py-4 px-6 text-sm font-medium whitespace-nowrap flex items-center justify-center gap-2 transition-all duration-300 ${
            activeTab === 'palace' ? 'bg-white text-maroon border-b-2 border-maroon shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)_inset]' : 'text-gray-500 hover:text-maroon hover:bg-maroon/5'
          }`}
        >
          <Map size={18} className={activeTab === 'palace' ? 'text-gold' : ''} />
          Luận Giải Từng Cung
        </button>
        <button
          onClick={() => setActiveTab('self')}
          className={`flex-1 py-4 px-6 text-sm font-medium whitespace-nowrap flex items-center justify-center gap-2 transition-all duration-300 ${
            activeTab === 'self' ? 'bg-white text-maroon border-b-2 border-maroon shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)_inset]' : 'text-gray-500 hover:text-maroon hover:bg-maroon/5'
          }`}
        >
          <User size={18} className={activeTab === 'self' ? 'text-gold' : ''} />
          Thấu Hiểu Bản Thân
        </button>
        <button
          onClick={() => setActiveTab('deep')}
          className={`flex-1 py-4 px-6 text-sm font-medium whitespace-nowrap flex items-center justify-center gap-2 transition-all duration-300 ${
            activeTab === 'deep' ? 'bg-white text-maroon border-b-2 border-maroon shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)_inset]' : 'text-gray-500 hover:text-maroon hover:bg-maroon/5'
          }`}
        >
          <Search size={18} className={activeTab === 'deep' ? 'text-gold' : ''} />
          Luận Giải Sâu Hơn
        </button>
      </div>

      {/* Tabs Content */}
      <div className="p-6 md:p-8 min-h-[400px] relative z-10">
        {centralInfo.isMock ? (
          <div className="flex flex-col items-center justify-center py-20 text-center h-full">
            <div className="w-20 h-20 bg-amber-100/50 rounded-full flex items-center justify-center mb-6 border border-amber-200/50">
              <Sparkles size={32} className="text-amber-500" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-amber-900 mb-3">Tính năng luận giải AI bị khóa</h3>
            <p className="text-amber-800/70 max-w-md text-lg">
              Tính năng luận giải AI chỉ khả dụng khi bạn khởi tạo lá số của riêng mình. Vui lòng quay lại trang chủ và nhập thông tin để xem luận giải chi tiết.
            </p>
          </div>
        ) : (
          <>
            {/* Palace Tab */}
            {activeTab === 'palace' && (
              <div className="max-w-4xl mx-auto">
                {!selectedPalace && !palaceResult && !isAnalyzingPalace && (
                  <div className="text-center py-16 bg-amber-50/30 rounded-2xl border border-amber-100/50 border-dashed">
                    <Map size={48} className="mx-auto text-amber-300 mb-4" />
                    <p className="text-amber-800/60 mb-6 font-medium">Nhấn vào một cung bất kỳ trên lá số để xem luận giải chi tiết.</p>
                  </div>
                )}
                
                {isAnalyzingPalace && (
                  <div className="flex flex-col items-center justify-center py-20 text-amber-700 space-y-4">
                    <Loader2 className="animate-spin" size={40} />
                    <p className="italic font-serif text-lg">Đang phân tích cung {selectedPalace?.name}...</p>
                  </div>
                )}

                {palaceResult && !isAnalyzingPalace && (
                  <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-amber-900 prose-a:text-amber-700 font-sans leading-relaxed bg-white/60 p-6 sm:p-8 rounded-2xl border border-amber-100/50 shadow-sm">
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{palaceResult}</Markdown>
                  </div>
                )}
              </div>
            )}

        {/* Holistic Tab */}
        {activeTab === 'holistic' && (
          <div className="max-w-4xl mx-auto">
            {!holisticResult && !isAnalyzingHolistic && (
              <div className="text-center py-16 bg-maroon/5 rounded-2xl border border-gold/20 border-dashed">
                <BookOpen size={48} className="mx-auto text-gold/40 mb-4" />
                <p className="text-maroon/60 mb-6 font-medium">Nhấn vào nút bên dưới để AI phân tích toàn bộ lá số của bạn.</p>
                <button 
                  onClick={handleHolisticAnalysis}
                  className="bg-maroon hover:bg-maroon/90 text-white px-8 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border border-gold/30"
                >
                  Bắt đầu luận giải
                </button>
              </div>
            )}
            
            {isAnalyzingHolistic && (
              <div className="flex flex-col items-center justify-center py-20 text-amber-700 space-y-4">
                <Loader2 className="animate-spin" size={40} />
                <p className="italic font-serif text-lg">Đang thỉnh ý cổ nhân, phân tích tinh bàn...</p>
              </div>
            )}

            {holisticResult && !isAnalyzingHolistic && (
              <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-amber-900 prose-a:text-amber-700 font-sans leading-relaxed bg-white/60 p-6 sm:p-8 rounded-2xl border border-amber-100/50 shadow-sm">
                <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{holisticResult}</Markdown>
              </div>
            )}
          </div>
        )}

        {/* Self Understanding Tab */}
        {activeTab === 'self' && (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 space-y-3 max-h-[40vh] md:max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
              <h3 className="font-serif font-bold text-xl text-maroon mb-4 border-b border-gold/20 pb-2 sticky top-0 bg-white/90 backdrop-blur-sm z-10">Chọn chủ đề</h3>
              {[
                {
                  id: 'tim-hieu-ban-than',
                  name: 'A. Tìm hiểu bản thân',
                  qs: [
                    'Tính cách & khuynh hướng',
                    'Thử thách cá tính, hành trình',
                    'Yếu tố tác động cuộc đời',
                    'Nợ nghiệp'
                  ]
                },
                {
                  id: 'su-nghiep-tien-tai',
                  name: 'B. Sự nghiệp & tiền tài',
                  qs: [
                    'Tổng quan tài phú, sự nghiệp',
                    'Con người trong công việc',
                    'Ngành nghề phù hợp',
                    'Điểm mạnh nổi trội',
                    'Nhận định, lời khuyên sự nghiệp'
                  ]
                },
                {
                  id: 'tinh-duyen-hon-nhan',
                  name: 'C. Tình duyên & hôn nhân',
                  qs: [
                    'Bạn trong tình yêu',
                    'Ai bị thu hút bởi bạn?',
                    'Những kiểu người thường gặp trong tình yêu?',
                    'Cá tính, chính tinh phù hợp',
                    'Tổng quan bạn đời',
                    'Nhận định hôn nhân',
                    'Tính cách con cái'
                  ]
                },
                {
                  id: 'xu-huong-dai-van',
                  name: 'D. Xu hướng đại vận',
                  qs: [
                    'Diễn biến 40 năm',
                    'Thiên thời địa lợi',
                    'Biểu đồ 10 năm tới'
                  ]
                },
                {
                  id: `tieu-van-${centralInfo.viewYear}`,
                  name: `E. Tiểu vận ${centralInfo.viewYear}`,
                  qs: [
                    `Tổng quan ${centralInfo.viewYear}`,
                    `Sự nghiệp ${centralInfo.viewYear}`,
                    `Tiền bạc ${centralInfo.viewYear}`,
                    `Tình cảm ${centralInfo.viewYear}`,
                    `Vận hạn ${centralInfo.viewYear}`
                  ]
                },
                {
                  id: 'cau-hoi-su-nghiep',
                  name: 'F. Câu hỏi sự nghiệp',
                  qs: [
                    'Môi trường phù hợp',
                    'Bạn có hợp tổ chức truyền thống',
                    'Yếu tố đòn bẩy sự nghiệp',
                    'Bạn có nên học cao'
                  ]
                },
                {
                  id: 'cau-hoi-tien-tai',
                  name: 'G. Câu hỏi tiền tài',
                  qs: [
                    'Tiềm năng giàu có',
                    'Bạn có hợp làm chủ?',
                    'Bạn có được thừa hưởng',
                    'Bạn có hợp làm về bất động sản?',
                    'Xu hướng nhà cửa'
                  ]
                },
                {
                  id: 'cau-hoi-xuat-ngoai',
                  name: 'H. Câu hỏi xuất ngoại',
                  qs: [
                    'Đánh giá cơ hội xa xứ',
                    'Bạn có nên đi xa phát triển',
                    'Năm có lợi cho di chuyển'
                  ]
                }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleSelfAnalysis(cat.id, cat.name, cat.qs)}
                  className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-300 border ${
                    selfCategory === cat.id 
                      ? 'bg-maroon/10 text-maroon font-medium border-gold/40 shadow-sm' 
                      : 'bg-white text-gray-600 border-gold/10 hover:bg-maroon/5 hover:border-gold/30'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div id="self-result-area" className="w-full md:w-2/3 bg-white/60 rounded-2xl p-6 sm:p-8 border border-gold/20 shadow-sm min-h-[400px]">
              {!selfResult && !isAnalyzingSelf && (
                <div className="h-full flex flex-col items-center justify-center text-maroon/40 py-12">
                  <User size={48} className="mb-4 opacity-50" />
                  <p className="font-medium">Chọn một chủ đề bên trái để khám phá bản thân.</p>
                </div>
              )}
              
              {isAnalyzingSelf && (
                <div className="h-full flex flex-col items-center justify-center text-maroon py-12 space-y-4">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="italic font-serif text-lg">Đang phân tích chuyên sâu...</p>
                </div>
              )}

              {selfResult && !isAnalyzingSelf && (
                <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-maroon font-sans text-sm md:text-base leading-relaxed">
                  <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{selfResult}</Markdown>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deep Analysis Tab */}
        {activeTab === 'deep' && (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 space-y-3 max-h-[40vh] md:max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
              <h3 className="font-serif font-bold text-xl text-maroon mb-4 border-b border-gold/20 pb-2 sticky top-0 bg-white/90 backdrop-blur-sm z-10">Luận giải chuyên sâu</h3>
              {deepAnalysisCategories.map(cat => (
                <div key={cat.id} className="mb-4">
                  <button
                    onClick={() => setDeepCategory(deepCategory === cat.id ? '' : cat.id)}
                    className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-300 border font-medium ${
                      deepCategory === cat.id 
                        ? 'bg-maroon/10 text-maroon border-gold/40 shadow-sm' 
                        : 'bg-white text-gray-700 border-gold/10 hover:bg-maroon/5 hover:border-gold/30'
                    }`}
                  >
                    {cat.title}
                  </button>
                  {deepCategory === cat.id && (
                    <div className="mt-2 pl-4 space-y-2 border-l-2 border-gold/30 ml-2">
                      {cat.questions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleDeepAnalysis(cat.id, cat.title, q)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                            deepQuestion === q
                              ? 'bg-maroon/5 text-maroon font-medium border border-gold/20'
                              : 'text-gray-600 hover:bg-maroon/5 hover:text-maroon border border-transparent'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div id="deep-result-area" className="w-full md:w-2/3 bg-white/60 rounded-2xl p-6 sm:p-8 border border-gold/20 shadow-sm min-h-[400px]">
              {!deepResult && !isAnalyzingDeep && (
                <div className="h-full flex flex-col items-center justify-center text-maroon/40 py-12">
                  <Search size={48} className="mb-4 opacity-50" />
                  <p className="font-medium text-center">Chọn một chủ đề và câu hỏi bên trái<br/>để AI phân tích chuyên sâu cho bạn.</p>
                </div>
              )}
              
              {isAnalyzingDeep && (
                <div className="h-full flex flex-col items-center justify-center text-maroon py-12 space-y-4">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="italic font-serif text-lg">Đang phân tích chuyên sâu...</p>
                </div>
              )}

              {deepResult && !isAnalyzingDeep && (
                <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-maroon font-sans text-sm md:text-base leading-relaxed">
                  <h3 className="text-xl font-serif text-maroon mb-4 pb-2 border-b border-gold/20">{deepQuestion}</h3>
                  <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{deepResult}</Markdown>
                </div>
              )}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};
