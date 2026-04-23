import React from 'react';
import { CentralInfo } from '../data/mockData';

interface CentralBlockProps {
  info: CentralInfo;
}

export const CentralBlock: React.FC<CentralBlockProps> = ({ info }) => {
  return (
    <div className="h-full w-full bg-[#fffdfa] flex flex-col items-center justify-center p-0.5 sm:p-4 relative overflow-hidden rounded-lg">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] flex items-center justify-center">
        <div className="w-[120%] h-[120%] rounded-full border-[1px] border-amber-900/20" style={{ backgroundImage: 'repeating-radial-gradient(circle at center, transparent 0, transparent 20px, rgba(120, 53, 15, 0.1) 20px, rgba(120, 53, 15, 0.1) 21px)' }}></div>
      </div>

      <div className="w-full max-w-sm mx-auto flex flex-col relative z-10 h-full justify-center">
        <div className="my-auto">
          {/* Header */}
          <div className="text-center mb-1 sm:mb-4">
            <h1 className="text-[8px] sm:text-2xl font-bold text-gray-900 tracking-widest font-serif leading-none">LÁ SỐ TỬ VI</h1>
            <div className="flex items-center justify-center mt-0.5 sm:mt-1.5 space-x-1 sm:space-x-2">
              <div className="h-px w-4 sm:w-12 bg-amber-600/40"></div>
              <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-amber-600/60"></div>
              <div className="h-px w-4 sm:w-12 bg-amber-600/40"></div>
            </div>
          </div>

          {/* Info Table */}
          <div className="bg-white/60 rounded-lg sm:rounded-xl p-1.5 sm:p-6 shadow-sm border border-amber-900/5 backdrop-blur-sm w-full">
            <div className="grid grid-cols-[30px_1fr_1fr] sm:grid-cols-[90px_1fr_1fr] gap-x-1 sm:gap-x-4 gap-y-0.5 sm:gap-y-3.5 text-[5px] sm:text-[13px] leading-tight">
              
              {/* Name */}
              <div className="text-gray-500 font-medium">Họ tên</div>
              <div className="col-span-2 font-bold text-amber-900 text-[6px] sm:text-[16px]">{info.name}</div>
              
              <div className="col-span-3 h-px bg-amber-900/10 my-0.5 sm:my-1.5"></div>

              {/* Birth Info */}
              <div className="text-gray-500 font-medium">Năm</div>
              <div className="font-medium text-gray-800">{info.birthYear}</div>
              <div className="font-medium text-gray-600">{info.birthYearCanChi}</div>
              
              <div className="text-gray-500 font-medium">Tháng</div>
              <div className="font-medium text-gray-800">{info.lunarMonth}</div>
              <div className="font-medium text-gray-600">{info.lunarMonthCanChi}</div>
              
              <div className="text-gray-500 font-medium">Ngày</div>
              <div className="font-medium text-gray-800">{info.lunarDay}</div>
              <div className="font-medium text-gray-600">{info.lunarDayCanChi}</div>
              
              <div className="text-gray-500 font-medium">Giờ</div>
              <div className="font-medium text-gray-800">{info.birthHour}</div>
              <div className="font-medium text-gray-600">{info.birthHourCanChi}</div>
              
              <div className="col-span-3 h-px bg-amber-900/10 my-0.5 sm:my-1.5"></div>

              {/* View Year */}
              <div className="text-gray-500 font-medium">Xem</div>
              <div className="font-medium text-gray-800">{info.viewYear}</div>
              <div className="font-medium text-gray-600">{info.viewYearCanChi} ({info.age}t)</div>
              
              <div className="col-span-3 h-px bg-amber-900/10 my-0.5 sm:my-1.5"></div>

              {/* Astrological Info */}
              <div className="text-gray-500 font-medium">Â.Dương</div>
              <div className="col-span-2 font-medium text-gray-800">{info.amDuong} - <span className="text-gray-600 truncate inline-block max-w-[50px] sm:max-w-none align-bottom">{info.amDuongNghichLy}</span></div>
              
              <div className="text-gray-500 font-medium">B.Mệnh</div>
              <div className="col-span-2 font-medium text-gray-800 truncate">{info.menh}</div>
              
              <div className="text-gray-500 font-medium">Cục</div>
              <div className="col-span-2 font-medium text-gray-800">{info.cuc} - <span className="text-gray-600 truncate inline-block max-w-[50px] sm:max-w-none align-bottom">{info.cucMenhRelation}</span></div>
              
              <div className="col-span-3 h-px bg-amber-900/10 my-0.5 sm:my-1.5"></div>

              {/* Chu */}
              <div className="text-gray-500 font-medium">M.chủ</div>
              <div className="col-span-2 font-medium text-gray-800">{info.menhChu}</div>
              
              <div className="text-gray-500 font-medium">T.chủ</div>
              <div className="col-span-2 font-medium text-gray-800">{info.thanChu}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
