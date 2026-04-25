import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, placeholder = "Chọn ngày sinh" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date(2000, 0, 1));
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = Math.min(320, window.innerWidth - 32);
    const left = Math.min(rect.left, window.innerWidth - dropdownWidth - 16);
    setDropdownPos({ top: rect.bottom + 4, left: Math.max(16, left) });
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      updatePosition();
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => updatePosition();
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleSelectDate = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const d = String(newDate.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${d}`);
    setIsOpen(false);
  };

  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const displayValue = value ? value.split('-').reverse().join('/') : '';

  return (
    <div className="relative w-full" ref={triggerRef}>
      <div
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-gray-200 bg-white/80 text-gray-700 shadow-sm hover:border-amber-300 focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500 cursor-pointer transition-all"
        onClick={handleToggle}
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon className="w-5 h-5 text-gray-400" />
      </div>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: Math.min(320, window.innerWidth - 32),
            zIndex: 9999,
          }}
          className="p-3 bg-white border border-gray-100 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between mb-3 gap-2">
            <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>

            <div className="flex gap-1.5">
              <select
                className="px-1.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                value={currentDate.getMonth()}
                onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
              >
                {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select
                className="px-1.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                value={currentDate.getFullYear()}
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1.5 text-center">
            {dayNames.map(day => (
              <div key={day} className="text-[10px] font-medium text-gray-400 py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {blanks.map(blank => (
              <div key={`blank-${blank}`} className="w-8 h-8" />
            ))}
            {days.map(day => {
              const isSelected = value === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDate(day)}
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-[12px] transition-colors ${
                    isSelected
                      ? 'bg-amber-500 text-white font-bold shadow-md'
                      : isToday
                        ? 'bg-amber-100 text-amber-700 font-semibold hover:bg-amber-200'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
