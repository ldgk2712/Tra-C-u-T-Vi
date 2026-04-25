import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  transparent?: boolean;
  prefix?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  transparent = false,
  prefix = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const selectedOption = options.find(opt => opt.value === value);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
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

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      <div
        className={`w-full flex items-center justify-between px-5 py-3.5 cursor-pointer transition-all ${
          transparent
            ? 'bg-transparent text-gray-700 font-medium'
            : 'rounded-xl border border-gray-200 bg-white/80 text-gray-700 shadow-sm hover:border-amber-300 focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500'
        }`}
        onClick={handleToggle}
      >
        <span className={selectedOption ? (transparent ? 'text-gray-700' : 'text-gray-800') : 'text-gray-400'}>
          {selectedOption ? (prefix ? `${prefix}${selectedOption.label}` : selectedOption.label) : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${transparent ? 'ml-2' : ''}`} />
      </div>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            minWidth: 140,
            zIndex: 9999,
          }}
          className="bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-amber-50 transition-colors text-[12px] ${
                option.value === value ? 'bg-amber-50/50 text-amber-700 font-medium' : 'text-gray-700'
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span className="truncate pr-2">{option.label}</span>
              {option.value === value && <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};
