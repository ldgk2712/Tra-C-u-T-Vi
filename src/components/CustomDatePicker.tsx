import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, placeholder = "Chọn ngày sinh" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date(2000, 0, 1));
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-gray-200 bg-white/80 text-gray-700 shadow-sm hover:border-amber-300 focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500 cursor-pointer transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon className="w-5 h-5 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-[calc(100vw-32px)] sm:w-[320px] mt-2 p-4 bg-white border border-gray-100 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 left-0">
          <div className="flex items-center justify-between mb-4 gap-2">
            <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex gap-2">
              <select 
                className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                value={currentDate.getMonth()}
                onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
              >
                {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select
                className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                value={currentDate.getFullYear()}
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {dayNames.map(day => (
              <div key={day} className="text-xs font-medium text-gray-400 py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {blanks.map(blank => (
              <div key={`blank-${blank}`} className="w-9 h-9"></div>
            ))}
            {days.map(day => {
              const isSelected = value === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
              
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDate(day)}
                  className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-sm transition-colors ${
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
        </div>
      )}
    </div>
  );
};
