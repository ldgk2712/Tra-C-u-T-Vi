import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logOut, signInWithGoogle } from '../lib/firebase';

interface HeaderProps {
  onNavigate: (view: 'home' | 'chart') => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { user, loading } = useAuth();

  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-transparent">
      <div className="mx-auto max-w-[1432px] px-6 sm:px-8 lg:px-10">
        <div className="flex h-[76px] items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-3"
            onClick={() => onNavigate('home')}
            aria-label="AstroTuVi trang chủ"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[#b88327] text-[#b88327]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3.5 13.9 9.2 19.5 7.2 15.8 12l3.7 4.8-5.6-2-1.9 5.7-1.9-5.7-5.6 2L8.2 12 4.5 7.2l5.6 2L12 3.5Z" />
                <path d="M18.8 3.8h.01M20.9 5.9h.01" />
              </svg>
            </span>
            <span className="font-serif text-[28px] font-semibold leading-none tracking-[-0.01em] text-[#1f1d1b]">
              AstroTuVi
            </span>
          </button>

          <nav className="hidden items-center gap-8 text-[14px] font-medium text-[#1f1d1b] md:flex">
            <a className="transition-colors hover:text-[#aa771e]" href="#menh">Tính Mệnh</a>
            <a className="transition-colors hover:text-[#aa771e]" href="#pricing">Bảng Giá</a>
            <a className="transition-colors hover:text-[#aa771e]" href="#knowledge">Kiến Thức</a>
            <a className="transition-colors hover:text-[#aa771e]" href="#about">Giới Thiệu</a>
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            {!loading && (
              user ? (
                <div className="flex items-center gap-3">
                  <span className="max-w-40 truncate text-sm font-medium text-[#403936]">{user.displayName || user.email}</span>
                  {user.photoURL && (
                    <img src={user.photoURL} alt="" className="h-9 w-9 rounded-full border border-[#c49138]/40" referrerPolicy="no-referrer" />
                  )}
                  <button
                    type="button"
                    onClick={logOut}
                    className="rounded-full p-2 text-[#706661] transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Đăng xuất"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="h-9 rounded-md border border-[#b88327]/80 px-4 text-[13px] font-medium text-[#a06f1f] transition-colors hover:bg-white/70"
                  >
                    Đăng Nhập
                  </button>
                  <button
                    type="button"
                    className="h-9 rounded-md bg-[#1f1d1b] px-5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-[#2d2b29]"
                  >
                    Dùng Thử Ngay
                  </button>
                </>
              )
            )}
          </div>

          <button type="button" className="grid h-10 w-10 place-items-center rounded-full text-[#1f1d1b] md:hidden" aria-label="Mở menu">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};
