import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Loader2, Send, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { chatWithAstrologer } from '../services/gemini';
import { Palace, CentralInfo } from '../data/mockData';

interface FloatingChatProps {
  palaces: Palace[];
  centralInfo: CentralInfo;
}

const SUGGESTED_QUESTIONS = [
  "Tôi có số tự lập hay được người khác nâng đỡ?",
  "Đời tôi vất vả lúc trẻ rồi sướng về sau, hay ngược lại?",
  "Tôi nên sống ổn định hay càng dịch chuyển càng mở vận?",
  "Tôi dễ thành công nhờ chuyên môn, quan hệ hay thời điểm?",
  "Trong đời tôi, thứ gì là “điểm mù” lớn nhất?",
  "Tôi nên tránh nhất kiểu quyết định nào?",
  "Về hậu vận, tôi an nhàn hay vẫn phải lo toan?",
  "Nếu muốn đổi vận, tôi nên bắt đầu từ thói quen nào trước?"
];

export const FloatingChat: React.FC<FloatingChatProps> = ({ palaces, centralInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset chat when chart changes
  useEffect(() => {
    setChatHistory([]);
  }, [centralInfo]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isChatting]);

  // Helper to format chart data for AI
  const getChartData = () => {
    const data: Record<string, string[]> = {};
    palaces.forEach(p => {
      const allStars = [
        ...p.mainStars.map(s => s.name),
        ...p.goodStars.map(s => s.name),
        ...p.badStars.map(s => s.name)
      ];
      if (p.isTuan) allStars.push("Tuần");
      if (p.isTriet) allStars.push("Triệt");
      
      const palaceName = p.isThan ? `${p.name} (Thân)` : p.name;
      data[`${palaceName} (tại ${p.canChi})`] = allStars;
    });
    return data;
  };

  const submitQuestion = async (question: string) => {
    if (!question.trim() || isChatting) return;

    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: question }]);
    setIsChatting(true);

    try {
      const result = await chatWithAstrologer(getChartData(), chatHistory, question, centralInfo);
      setChatHistory(prev => [...prev, { role: 'model', text: result }]);
    } catch (error) {
      console.error("Lỗi chat:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "Xin lỗi, tôi đang bận suy nghĩ. Vui lòng thử lại sau." }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuestion(chatInput);
  };

  return (
    <>
      {/* Chat Window */}
      <div 
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[400px] h-[550px] max-h-[calc(100vh-32px)] sm:max-h-[80vh] bg-[#f7f3e9] rounded-2xl shadow-2xl border border-gold/30 flex flex-col z-50 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-maroon text-white px-5 py-4 rounded-t-2xl flex justify-between items-center shadow-md border-b border-gold/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-gold/20">
              <Sparkles size={20} className="text-gold" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg leading-tight">Cố Vấn Tử Vi AI</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-gold/80 text-[10px] font-medium uppercase tracking-wider">Đang trực tuyến</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gold/60 hover:text-gold p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f7f3e9]">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-2">
              <div className="w-14 h-14 bg-maroon/5 rounded-full flex items-center justify-center mb-4 shadow-inner border border-gold/20">
                <Sparkles size={28} className="text-gold" />
              </div>
              <p className="font-medium text-maroon mb-6 text-center font-serif">Bạn muốn hỏi gì về lá số này?</p>
              <div className="w-full flex flex-col gap-2.5 overflow-y-auto custom-scrollbar pb-2">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => submitQuestion(q)}
                    className="text-left px-4 py-3 bg-white/60 backdrop-blur-sm border border-gold/20 rounded-xl shadow-sm hover:bg-white hover:border-gold/50 transition-all text-sm text-gray-700 flex items-center gap-3 group"
                  >
                    <MessageCircle size={16} className="text-gold group-hover:text-maroon flex-shrink-0" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user' 
                    ? 'bg-maroon text-white rounded-tr-sm shadow-sm' 
                    : 'bg-white border border-gold/20 text-gray-800 rounded-tl-sm shadow-sm'
                }`}>
                  <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'text-white prose-p:text-white prose-strong:text-white prose-a:text-white' : 'prose-stone'}`}>
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
              </div>
            ))
          )}
          {isChatting && (
            <div className="flex justify-start">
              <div className="bg-white border border-gold/20 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-gold" size={16} />
                <span className="text-sm text-gray-500 italic font-serif">Đang suy nghĩ...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions (when chatting) */}
        {chatHistory.length > 0 && !isChatting && (
          <div className="px-3 py-2.5 bg-white border-t border-gold/10 overflow-x-auto whitespace-nowrap flex gap-2 [&::-webkit-scrollbar]:hidden">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => submitQuestion(q)}
                className="inline-block px-3 py-1.5 bg-maroon/5 border border-gold/20 rounded-full text-xs text-maroon hover:bg-maroon/10 hover:border-gold/40 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-gold/10 rounded-b-2xl flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Nhập câu hỏi..."
            className="flex-1 px-4 py-2.5 bg-maroon/5 border border-gold/20 rounded-full focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all text-sm"
            disabled={isChatting}
          />
          <button
            type="submit"
            disabled={isChatting || !chatInput.trim()}
            className="bg-maroon hover:bg-maroon/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all transform hover:-translate-y-0.5 disabled:hover:translate-y-0"
          >
            <Send size={18} className={`text-gold ${chatInput.trim() && !isChatting ? 'translate-x-[-1px] translate-y-[1px]' : ''}`} />
          </button>
        </form>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 bg-maroon text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-110 transition-all duration-300 z-40 border-2 border-gold/40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle size={28} className="text-gold" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full border border-maroon animate-pulse"></span>
      </button>
    </>
  );
};
