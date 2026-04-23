import React from 'react';
import { Menu, LogOut, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, logOut } from '../lib/firebase';

interface HeaderProps {
  onNavigate: (view: 'home' | 'chart') => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { user, loading } = useAuth();

  return (
    <header className="bg-transparent absolute top-0 w-full z-50">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer gap-3" 
            onClick={() => onNavigate('home')}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-[1.5px] border-[#C89B5F] text-[#C89B5F]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3L14.5 9.5L21 12L14.5 14.5L12 21L9.5 14.5L3 12L9.5 9.5L12 3Z"/>
              </svg>
            </div>
            <span className="font-bold text-2xl text-gray-900 font-serif tracking-wide">AstroTuVi</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <a href="#" className="text-gray-800 font-medium hover:text-[#C89B5F] transition-colors">Tính Năng</a>
            <a href="#" className="text-gray-800 font-medium hover:text-[#C89B5F] transition-colors">Bảng Giá</a>
            <a href="#" className="text-gray-800 font-medium hover:text-[#C89B5F] transition-colors">Kiến Thức</a>
            <a href="#" className="text-gray-800 font-medium hover:text-[#C89B5F] transition-colors">Giới Thiệu</a>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">{user.displayName || user.email}</span>
                  {user.photoURL && (
                    <img src={user.photoURL} alt="Avatar" className="w-9 h-9 rounded-full border border-[#C89B5F]/40" referrerPolicy="no-referrer" />
                  )}
                  <button 
                    onClick={logOut}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Đăng xuất"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={signInWithGoogle}
                    className="text-[#B98C4E] border border-[#B98C4E] rounded-md px-5 py-2.5 font-medium hover:bg-[#B98C4E]/5 transition-colors"
                  >
                    Đăng Nhập
                  </button>
                  <button className="bg-[#B98C4E] text-white rounded-md px-5 py-2.5 font-medium hover:bg-[#A67E45] transition-colors shadow-md shadow-[#B98C4E]/20">
                    Dùng Thử Miễn Phí
                  </button>
                </div>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button className="text-gray-500 hover:text-gray-900 p-2">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
