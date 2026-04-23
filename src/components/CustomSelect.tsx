import React, { useState, useRef, useEffect } from 'react';
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
  prefix = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`w-full flex items-center justify-between px-5 py-3.5 cursor-pointer transition-all ${
          transparent 
            ? 'bg-transparent text-gray-700 font-medium' 
            : 'rounded-xl border border-gray-200 bg-white/80 text-gray-700 shadow-sm hover:border-amber-300 focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? (transparent ? 'text-gray-700' : 'text-gray-800') : 'text-gray-400'}>
          {selectedOption ? (prefix ? `${prefix}${selectedOption.label}` : selectedOption.label) : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${transparent ? 'ml-2' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full min-w-[140px] mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-auto py-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-5 py-3 cursor-pointer flex items-center justify-between hover:bg-amber-50 transition-colors ${
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
        </div>
      )}
    </div>
  );
};
