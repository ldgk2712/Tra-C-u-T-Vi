import { Palace, CentralInfo, mockPalaces, mockCentralInfo, Element } from '../data/mockData';
import { generateLaSo, T_CAN, D_CHI } from 'tuvi-neo';
import { getLunarDate, getDayCanChi, getYearCanChi } from '@dqcai/vn-lunar';

// Order of 12 Earthly Branches in our UI layout (starting from Tý at bottom right)
const CHI_ORDER = ['ty_bottom', 'suu', 'dan', 'mao', 'thin', 'ty', 'ngo', 'mui', 'than', 'dau', 'tuat', 'hoi'];

// Mapping from tuvi-neo Cung names to our UI IDs
// tuvi-neo returns palaces in order from Tý to Hợi
const TUVI_NEO_CHI_ORDER = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

const HOUR_MAP: Record<string, number> = {
  'ty': 0,
  'suu': 2,
  'dan': 4,
  'mao': 6,
  'thin': 8,
  'ty_snake': 10,
  'ngo': 12,
  'mui': 14,
  'than': 16,
  'dau': 18,
  'tuat': 20,
  'hoi': 22
};

const HOUR_DISPLAY_MAP: Record<string, string> = {
  'ty': '23h - 0h59',
  'suu': '1h - 2h59',
  'dan': '3h - 4h59',
  'mao': '5h - 6h59',
  'thin': '7h - 8h59',
  'ty_snake': '9h - 10h59',
  'ngo': '11h - 12h59',
  'mui': '13h - 14h59',
  'than': '15h - 16h59',
  'dau': '17h - 18h59',
  'tuat': '19h - 20h59',
  'hoi': '21h - 22h59'
};

export function generateChart(formData: any): { palaces: Palace[], centralInfo: CentralInfo } {
  // Parse DOB
  let year = 2026, month = 1, day = 1;
  if (formData.year && formData.month && formData.day) {
    year = parseInt(formData.year) || 2026;
    month = parseInt(formData.month) || 1;
    day = parseInt(formData.day) || 1;
  } else if (formData.dob) {
    if (formData.dob.includes('-')) {
      const parts = formData.dob.split('-');
      if (parts.length === 3) {
        year = parseInt(parts[0]) || 2026;
        month = parseInt(parts[1]) || 1;
        day = parseInt(parts[2]) || 1;
      }
    } else if (formData.dob.includes('/')) {
      const parts = formData.dob.split('/');
      if (parts.length === 3) {
        day = parseInt(parts[0]) || 1;
        month = parseInt(parts[1]) || 1;
        year = parseInt(parts[2]) || 2026;
      }
    }
  }

  const hour = HOUR_MAP[formData.hour] || 0;
  const isLunar = formData.calendarType === 'Âm lịch';
  const gender = formData.gender === 'Nam giới' ? 'male' : 'female';

  try {
    const laso = generateLaSo({
      name: formData.name || 'Vô Danh',
      gender: gender,
      birth: {
        isLunar,
        year,
        month,
        day,
        hour,
        minute: 0
      }
    });

    const newPalaces: Palace[] = JSON.parse(JSON.stringify(mockPalaces));

    const info = laso.Info;
    const menhIndex = laso.Cac_cung.findIndex(c => c.Name === 'Mệnh');
    const daiVanAges = calculateDaiVan(info.Cuc, info.Nam, gender, menhIndex);

    // Map tuvi-neo data to our Palace format
    laso.Cac_cung.forEach((cung, index) => {
      // tuvi-neo returns 12 palaces starting from Tý (index 0) to Hợi (index 11)
      const uiId = CHI_ORDER[index];
      const palace = newPalaces.find(p => p.id === uiId);
      
      if (palace) {
        palace.name = cung.Name.toUpperCase();
        palace.canChi = `${T_CAN[cung.CanCung]}.${D_CHI[cung.ChiCung]}`;
        palace.age = daiVanAges[index].toString();
        palace.isThan = cung.Than === 1;
        palace.isTuan = cung.Tuan === 1;
        palace.isTriet = cung.Triet === 1;
        
        // Map main stars
        palace.mainStars = cung.ChinhTinh.map(star => ({
          name: star.Name + (star.Status ? ` (${star.Status})` : ''),
          element: getElementFromNguHanh(star.NguHanh)
        }));

        // Map good stars
        palace.goodStars = cung.Saotot.map(star => ({
          name: star.Name + (star.Status ? ` (${star.Status})` : ''),
          element: getElementFromNguHanh(star.NguHanh)
        }));

        // Map bad stars
        palace.badStars = cung.Saoxau.map(star => ({
          name: star.Name + (star.Status ? ` (${star.Status})` : ''),
          element: getElementFromNguHanh(star.NguHanh)
        }));

        palace.bottomLeft = cung.TieuHan;
        palace.bottomRight = `Tháng ${cung.ThangHan}`;
      }
    });

    let jd = 0;
    let solarDay = day, solarMonth = month, solarYear = year;
    let lunarDay = day, lunarMonth = month, lunarYear = year;

    if (isLunar) {
      const solarDate = require('@dqcai/vn-lunar').getSolarDate(day, month, year, false);
      jd = solarDate.jd;
      solarDay = solarDate.day;
      solarMonth = solarDate.month;
      solarYear = solarDate.year;
    } else {
      const lunarDate = getLunarDate(day, month, year);
      jd = lunarDate.jd;
      lunarDay = lunarDate.day;
      lunarMonth = lunarDate.month;
      lunarYear = lunarDate.year;
    }

    const dayCanChi = normalizeCanChi(getDayCanChi(jd));
    const monthCanChi = getLunarMonthCanChi(info.Nam, info.Thang);
    const hourCanChi = getLunarHourCanChi(dayCanChi, info.Gio);
    
    // Extract viewYear from formData (e.g., "Năm xem 2026" -> 2026)
    let viewYear = new Date().getFullYear();
    if (formData.viewYear) {
      const match = formData.viewYear.match(/\d{4}/);
      if (match) {
        viewYear = parseInt(match[0]);
      }
    }
    
    const viewYearCanChi = normalizeCanChi(getYearCanChi(viewYear));

    // Calculate annual stars
    calculateAnnualStars(viewYearCanChi, newPalaces);

    const menhCung = laso.Cac_cung.find(c => c.Name === 'Mệnh');
    const menhChiIndex = menhCung ? menhCung.ChiCung : 0;

    const newCentralInfo: CentralInfo = {
      name: formData.name || 'Vô Danh',
      dob: formData.dob || '',
      birthYear: solarYear.toString(),
      birthYearCanChi: normalizeCanChi(info.Nam),
      lunarMonth: solarMonth.toString(),
      lunarMonthCanChi: `(${info.Thang}) ${monthCanChi}`, 
      lunarDay: solarDay.toString(),
      lunarDayCanChi: `(${info.Ngay}) ${dayCanChi}`,
      birthHour: formData.hour ? HOUR_DISPLAY_MAP[formData.hour] : '23h - 0h59',
      birthHourCanChi: hourCanChi,
      viewYear: viewYear.toString(),
      viewYearCanChi: viewYearCanChi,
      age: (viewYear - lunarYear + 1).toString(),
      amDuong: info.AmDuong,
      amDuongNghichLy: getAmDuongNghichLy(info.AmDuong, menhChiIndex),
      menh: getNapAm(info.Nam),
      cuc: info.Cuc.replace(/cục$/i, 'Cục'),
      cucMenhRelation: getCucMenhRelation(info.Cuc, getNapAm(info.Nam)),
      menhChu: info.ChuMenh,
      thanChu: info.ChuThan
    };

    return { palaces: newPalaces, centralInfo: newCentralInfo };
  } catch (error) {
    console.error("Error generating chart:", error);
    // Fallback to mock data if generation fails
    return { palaces: mockPalaces, centralInfo: mockCentralInfo };
  }
}

export function updateChartYear(chartData: { palaces: Palace[], centralInfo: CentralInfo }, newViewYear: number): { palaces: Palace[], centralInfo: CentralInfo } {
  const newPalaces = JSON.parse(JSON.stringify(chartData.palaces));
  const newCentralInfo = { ...chartData.centralInfo };

  // Clear old annual stars
  newPalaces.forEach((p: Palace) => {
    p.annualStars = [];
  });

  const viewYearCanChi = normalizeCanChi(getYearCanChi(newViewYear));
  calculateAnnualStars(viewYearCanChi, newPalaces);

  const oldViewYear = parseInt(newCentralInfo.viewYear);
  const oldAge = parseInt(newCentralInfo.age);
  const newAge = oldAge + (newViewYear - oldViewYear);

  newCentralInfo.viewYear = newViewYear.toString();
  newCentralInfo.viewYearCanChi = viewYearCanChi;
  newCentralInfo.age = newAge.toString();

  return { palaces: newPalaces, centralInfo: newCentralInfo };
}

function getLunarMonthCanChi(yearCanChi: string, lunarMonth: number): string {
  const normalized = normalizeCanChi(yearCanChi);
  const can = normalized.split(' ')[0];
  const canIndex = T_CAN.findIndex(c => c.toLowerCase() === can.toLowerCase() || c.toLowerCase() === 'kỷ' && can.toLowerCase() === 'kỹ' || c.toLowerCase() === 'quý' && can.toLowerCase() === 'quí');
  
  if (canIndex === -1) return '';
  
  // Month 1 starts at Dần (index 2)
  const monthChiIndex = (lunarMonth + 1) % 12;
  
  // Can of month 1
  let month1CanIndex = 0;
  switch (canIndex % 5) {
    case 0: month1CanIndex = 2; break; // Giáp, Kỷ -> Bính
    case 1: month1CanIndex = 4; break; // Ất, Canh -> Mậu
    case 2: month1CanIndex = 6; break; // Bính, Tân -> Canh
    case 3: month1CanIndex = 8; break; // Đinh, Nhâm -> Nhâm
    case 4: month1CanIndex = 0; break; // Mậu, Quý -> Giáp
  }
  
  const monthCanIndex = (month1CanIndex + lunarMonth - 1) % 10;
  return `${T_CAN[monthCanIndex]} ${D_CHI[monthChiIndex]}`;
}

function getLunarHourCanChi(dayCanChi: string, hourChi: string): string {
  const normalized = normalizeCanChi(dayCanChi);
  const can = normalized.split(' ')[0];
  const canIndex = T_CAN.findIndex(c => c.toLowerCase() === can.toLowerCase() || c.toLowerCase() === 'kỷ' && can.toLowerCase() === 'kỹ' || c.toLowerCase() === 'quý' && can.toLowerCase() === 'quí');
  
  const chiIndex = D_CHI.findIndex(c => c.toLowerCase() === hourChi.toLowerCase() || c.toLowerCase() === 'tý' && hourChi.toLowerCase() === 'tí' || c.toLowerCase() === 'sửu' && hourChi.toLowerCase() === 'sữu' || c.toLowerCase() === 'tỵ' && hourChi.toLowerCase() === 'tị');
  
  if (canIndex === -1 || chiIndex === -1) return hourChi;
  
  let hour0CanIndex = 0;
  switch (canIndex % 5) {
    case 0: hour0CanIndex = 0; break; // Giáp, Kỷ -> Giáp
    case 1: hour0CanIndex = 2; break; // Ất, Canh -> Bính
    case 2: hour0CanIndex = 4; break; // Bính, Tân -> Mậu
    case 3: hour0CanIndex = 6; break; // Đinh, Nhâm -> Canh
    case 4: hour0CanIndex = 8; break; // Mậu, Quý -> Nhâm
  }
  
  const hourCanIndex = (hour0CanIndex + chiIndex) % 10;
  return `${T_CAN[hourCanIndex]} ${D_CHI[chiIndex]}`;
}

function normalizeCanChi(str: string): string {
  if (!str) return '';
  return str
    .replace(/Bình/gi, 'Bính')
    .replace(/Kỹ/gi, 'Kỷ')
    .replace(/Quí/gi, 'Quý')
    .replace(/Tí/gi, 'Tý')
    .replace(/Sữu/gi, 'Sửu')
    .replace(/Tị/gi, 'Tỵ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function calculateAnnualStars(viewYearCanChi: string, palaces: Palace[]) {
  const normalized = normalizeCanChi(viewYearCanChi);
  const [can, chi] = normalized.split(' ');
  
  const canIndex = T_CAN.findIndex(c => c.toLowerCase() === can.toLowerCase());
  const chiIndex = D_CHI.findIndex(c => c.toLowerCase() === chi.toLowerCase());
  
  if (canIndex === -1 || chiIndex === -1) return;

  const addStar = (chiIdx: number, name: string, element: Element) => {
    const uiId = CHI_ORDER[chiIdx];
    const palace = palaces.find(p => p.id === uiId);
    if (palace) {
      if (!palace.annualStars) palace.annualStars = [];
      palace.annualStars.push({ name, element });
    }
  };

  // 1. Lưu Thái Tuế
  addStar(chiIndex, 'L.Thái Tuế', 'hoa');

  // 2. Lưu Tang Môn
  addStar((chiIndex + 2) % 12, 'L.Tang Môn', 'moc');

  // 3. Lưu Bạch Hổ
  addStar((chiIndex + 6) % 12, 'L.Bạch Hổ', 'kim');

  // 4. Lưu Thiên Khốc
  const khocIndex = (6 - chiIndex + 12) % 12;
  addStar(khocIndex, 'L.Thiên Khốc', 'thuy');

  // 5. Lưu Thiên Hư
  const huIndex = (6 + chiIndex) % 12;
  addStar(huIndex, 'L.Thiên Hư', 'thuy');

  // 6. Lưu Lộc Tồn
  const locTonMap = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
  const locTonIndex = locTonMap[canIndex];
  addStar(locTonIndex, 'L.Lộc Tồn', 'tho');

  // 7. Lưu Kình Dương
  addStar((locTonIndex + 1) % 12, 'L.Kình Dương', 'kim');

  // 8. Lưu Đà La
  addStar((locTonIndex + 11) % 12, 'L.Đà La', 'kim');

  // 9. Lưu Thiên Khôi & Lưu Thiên Việt
  let khoiIndex = 0, vietIndex = 0;
  if ([0, 4, 6].includes(canIndex)) { khoiIndex = 1; vietIndex = 7; }
  else if ([1, 5].includes(canIndex)) { khoiIndex = 0; vietIndex = 8; }
  else if ([2, 3].includes(canIndex)) { khoiIndex = 11; vietIndex = 9; }
  else if (canIndex === 7) { khoiIndex = 6; vietIndex = 2; }
  else if ([8, 9].includes(canIndex)) { khoiIndex = 3; vietIndex = 5; }
  addStar(khoiIndex, 'L.Thiên Khôi', 'hoa');
  addStar(vietIndex, 'L.Thiên Việt', 'hoa');

  // 10. Lưu Thiên Mã
  let maIndex = 0;
  if ([2, 6, 10].includes(chiIndex)) maIndex = 8;
  else if ([8, 0, 4].includes(chiIndex)) maIndex = 2;
  else if ([5, 9, 1].includes(chiIndex)) maIndex = 11;
  else if ([11, 3, 7].includes(chiIndex)) maIndex = 5;
  addStar(maIndex, 'L.Thiên Mã', 'hoa');
}

const NAP_AM: Record<string, string> = {
  'Giáp Tý': 'Hải trung kim', 'Ất Sửu': 'Hải trung kim',
  'Bính Dần': 'Lư trung hỏa', 'Đinh Mão': 'Lư trung hỏa',
  'Mậu Thìn': 'Đại lâm mộc', 'Kỷ Tỵ': 'Đại lâm mộc',
  'Canh Ngọ': 'Lộ bàng thổ', 'Tân Mùi': 'Lộ bàng thổ',
  'Nhâm Thân': 'Kiếm phong kim', 'Quý Dậu': 'Kiếm phong kim',
  'Giáp Tuất': 'Sơn đầu hỏa', 'Ất Hợi': 'Sơn đầu hỏa',
  'Bính Tý': 'Giản hạ thủy', 'Đinh Sửu': 'Giản hạ thủy',
  'Mậu Dần': 'Thành đầu thổ', 'Kỷ Mão': 'Thành đầu thổ',
  'Canh Thìn': 'Bạch lạp kim', 'Tân Tỵ': 'Bạch lạp kim',
  'Nhâm Ngọ': 'Dương liễu mộc', 'Quý Mùi': 'Dương liễu mộc',
  'Giáp Thân': 'Tuyền trung thủy', 'Ất Dậu': 'Tuyền trung thủy',
  'Bính Tuất': 'Ốc thượng thổ', 'Đinh Hợi': 'Ốc thượng thổ',
  'Mậu Tý': 'Tích lịch hỏa', 'Kỷ Sửu': 'Tích lịch hỏa',
  'Canh Dần': 'Tùng bách mộc', 'Tân Mão': 'Tùng bách mộc',
  'Nhâm Thìn': 'Trường lưu thủy', 'Quý Tỵ': 'Trường lưu thủy',
  'Giáp Ngọ': 'Sa trung kim', 'Ất Mùi': 'Sa trung kim',
  'Bính Thân': 'Sơn hạ hỏa', 'Đinh Dậu': 'Sơn hạ hỏa',
  'Mậu Tuất': 'Bình địa mộc', 'Kỷ Hợi': 'Bình địa mộc',
  'Canh Tý': 'Bích thượng thổ', 'Tân Sửu': 'Bích thượng thổ',
  'Nhâm Dần': 'Kim bạch kim', 'Quý Mão': 'Kim bạch kim',
  'Giáp Thìn': 'Phú đăng hỏa', 'Ất Tỵ': 'Phú đăng hỏa',
  'Bính Ngọ': 'Thiên hà thủy', 'Đinh Mùi': 'Thiên hà thủy',
  'Mậu Thân': 'Đại trạch thổ', 'Kỷ Dậu': 'Đại trạch thổ',
  'Canh Tuất': 'Thoa xuyến kim', 'Tân Hợi': 'Thoa xuyến kim',
  'Nhâm Tý': 'Tang đố mộc', 'Quý Sửu': 'Tang đố mộc',
  'Giáp Dần': 'Đại khê thủy', 'Ất Mão': 'Đại khê thủy',
  'Bính Thìn': 'Sa trung thổ', 'Đinh Tỵ': 'Sa trung thổ',
  'Mậu Ngọ': 'Thiên thượng hỏa', 'Kỷ Mùi': 'Thiên thượng hỏa',
  'Canh Thân': 'Thạch lựu mộc', 'Tân Dậu': 'Thạch lựu mộc',
  'Nhâm Tuất': 'Đại hải thủy', 'Quý Hợi': 'Đại hải thủy'
};

function getNapAm(canChi: string): string {
  const normalized = normalizeCanChi(canChi);
  const napAm = NAP_AM[normalized];
  if (!napAm) return 'Không Rõ';
  return napAm.charAt(0).toUpperCase() + napAm.slice(1);
}

function getAmDuongNghichLy(amDuong: string, menhChiIndex: number): string {
  const isYearDuong = amDuong.includes('Dương');
  // Chi index: 0=Tý, 1=Sửu, 2=Dần, 3=Mão, 4=Thìn, 5=Tỵ, 6=Ngọ, 7=Mùi, 8=Thân, 9=Dậu, 10=Tuất, 11=Hợi
  // Even index = Dương, Odd index = Âm
  const isMenhDuong = menhChiIndex % 2 === 0;
  
  return isYearDuong === isMenhDuong ? 'Âm dương thuận lý' : 'Âm dương nghịch lý';
}

function getMenhNguHanh(napAm: string): number {
  const lower = napAm.toLowerCase();
  if (lower.includes('kim')) return 1;
  if (lower.includes('thủy') || lower.includes('thuy')) return 2;
  if (lower.includes('mộc') || lower.includes('moc')) return 3;
  if (lower.includes('hỏa') || lower.includes('hoa')) return 4;
  if (lower.includes('thổ') || lower.includes('tho')) return 5;
  return 0;
}

function getCucNguHanh(cucString: string): number {
  const lower = cucString.toLowerCase();
  if (lower.includes('kim')) return 1;
  if (lower.includes('thủy') || lower.includes('thuy')) return 2;
  if (lower.includes('mộc') || lower.includes('moc')) return 3;
  if (lower.includes('hỏa') || lower.includes('hoa')) return 4;
  if (lower.includes('thổ') || lower.includes('tho')) return 5;
  return 0;
}

function getCucMenhRelation(cucString: string, menhString: string): string {
  const cuc = getCucNguHanh(cucString);
  const menh = getMenhNguHanh(menhString);

  if (!cuc || !menh) return '';

  if (cuc === menh) return 'Cục hòa Bản Mệnh';
  
  // Tuong sinh: Kim sinh Thuy, Thuy sinh Moc, Moc sinh Hoa, Hoa sinh Tho, Tho sinh Kim
  // 1 -> 2, 2 -> 3, 3 -> 4, 4 -> 5, 5 -> 1
  if ((cuc === 1 && menh === 2) || (cuc === 2 && menh === 3) || (cuc === 3 && menh === 4) || (cuc === 4 && menh === 5) || (cuc === 5 && menh === 1)) {
    return 'Cục sinh Bản Mệnh';
  }
  if ((menh === 1 && cuc === 2) || (menh === 2 && cuc === 3) || (menh === 3 && cuc === 4) || (menh === 4 && cuc === 5) || (menh === 5 && cuc === 1)) {
    return 'Bản Mệnh sinh Cục';
  }

  // Tuong khac: Kim khac Moc, Moc khac Tho, Tho khac Thuy, Thuy khac Hoa, Hoa khac Kim
  // 1 -> 3, 3 -> 5, 5 -> 2, 2 -> 4, 4 -> 1
  if ((cuc === 1 && menh === 3) || (cuc === 3 && menh === 5) || (cuc === 5 && menh === 2) || (cuc === 2 && menh === 4) || (cuc === 4 && menh === 1)) {
    return 'Cục khắc Bản Mệnh';
  }
  if ((menh === 1 && cuc === 3) || (menh === 3 && cuc === 5) || (menh === 5 && cuc === 2) || (menh === 2 && cuc === 4) || (menh === 4 && cuc === 1)) {
    return 'Bản Mệnh khắc Cục';
  }

  return '';
}

function getElementFromNguHanh(nguHanh: number): any {
  // Map tuvi-neo NguHanh numbers to our element types
  // 1: Kim, 2: Thuy, 3: Moc, 4: Hoa, 5: Tho
  switch (nguHanh) {
    case 1: return 'kim';
    case 2: return 'thuy';
    case 3: return 'moc';
    case 4: return 'hoa';
    case 5: return 'tho';
    default: return 'tho';
  }
}

function calculateDaiVan(cucString: string, yearCanChi: string, gender: string, menhIndex: number): number[] {
  // 1. Starting Age
  let startAge = 2;
  const cucLower = cucString.toLowerCase();
  if (cucLower.includes('nhị')) startAge = 2;
  else if (cucLower.includes('tam')) startAge = 3;
  else if (cucLower.includes('tứ')) startAge = 4;
  else if (cucLower.includes('ngũ')) startAge = 5;
  else if (cucLower.includes('lục')) startAge = 6;

  // 2. Year Yin/Yang
  const can = yearCanChi.split(' ')[0].toLowerCase();
  const yangCans = ['giáp', 'bính', 'mậu', 'canh', 'nhâm'];
  const isYangYear = yangCans.includes(can);

  // 3. Traversal Direction
  const isMale = gender === 'male';
  const isClockwise = (isMale && isYangYear) || (!isMale && !isYangYear);
  const step = isClockwise ? 1 : -1;

  // 4. 12-Palace Sequence
  const daiVan = new Array(12).fill(0);
  for (let i = 0; i < 12; i++) {
    const currentIndex = menhIndex;
    const targetIndex = ((currentIndex + (step * i)) % 12 + 12) % 12;
    daiVan[targetIndex] = startAge + (i * 10);
  }

  return daiVan;
}
