export const PHI_HOA_TABLE: Record<string, { loc: string, quyen: string, khoa: string, ky: string }> = {
  'Giáp': { loc: 'Liêm Trinh', quyen: 'Phá Quân', khoa: 'Vũ Khúc', ky: 'Thái Dương' },
  'Ất': { loc: 'Thiên Cơ', quyen: 'Thiên Lương', khoa: 'Tử Vi', ky: 'Thái Âm' },
  'Bính': { loc: 'Thiên Đồng', quyen: 'Thiên Cơ', khoa: 'Văn Xương', ky: 'Liêm Trinh' },
  'Đinh': { loc: 'Thái Âm', quyen: 'Thiên Đồng', khoa: 'Thiên Cơ', ky: 'Cự Môn' },
  'Mậu': { loc: 'Tham Lang', quyen: 'Thái Âm', khoa: 'Hữu Bật', ky: 'Thiên Cơ' },
  'Kỷ': { loc: 'Vũ Khúc', quyen: 'Tham Lang', khoa: 'Thiên Lương', ky: 'Văn Khúc' },
  'Canh': { loc: 'Thái Dương', quyen: 'Vũ Khúc', khoa: 'Thái Âm', ky: 'Thiên Đồng' },
  'Tân': { loc: 'Cự Môn', quyen: 'Thái Dương', khoa: 'Văn Khúc', ky: 'Văn Xương' },
  'Nhâm': { loc: 'Thiên Lương', quyen: 'Tử Vi', khoa: 'Tả Phù', ky: 'Vũ Khúc' },
  'Quý': { loc: 'Phá Quân', quyen: 'Cự Môn', khoa: 'Thái Âm', ky: 'Tham Lang' }
};

export function getCanFromCanChi(canChi: string): string {
  if (!canChi) return '';
  const parts = canChi.includes('.') ? canChi.split('.') : canChi.split(' ');
  return parts[0].trim();
}

export function getPhiHoaTargets(can: string) {
  if (!can) return null;
  let normalizedCan = can.charAt(0).toUpperCase() + can.slice(1).toLowerCase();
  
  const CAN_MAP: Record<string, string> = {
    'G': 'Giáp',
    'Ấ': 'Ất',
    'B': 'Bính',
    'Đ': 'Đinh',
    'M': 'Mậu',
    'K': 'Kỷ',
    'C': 'Canh',
    'T': 'Tân',
    'N': 'Nhâm',
    'Q': 'Quý',
    'Kỹ': 'Kỷ',
    'Quí': 'Quý'
  };

  if (CAN_MAP[normalizedCan]) {
    normalizedCan = CAN_MAP[normalizedCan];
  }

  return PHI_HOA_TABLE[normalizedCan] || null;
}
