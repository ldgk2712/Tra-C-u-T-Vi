export type Element = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';

export interface Star {
  name: string;
  element: Element;
}

export interface Palace {
  id: string;
  canChi: string;
  name: string;
  age: string;
  mainStars: Star[];
  goodStars: Star[];
  badStars: Star[];
  annualStars?: Star[];
  bottomLeft: string;
  bottomRight: string;
  isThan?: boolean;
  isTuan?: boolean;
  isTriet?: boolean;
}

export interface CentralInfo {
  name: string;
  birthYear: string;
  birthYearCanChi: string;
  lunarMonth: string;
  lunarMonthCanChi: string;
  lunarDay: string;
  lunarDayCanChi: string;
  birthHour: string;
  birthHourCanChi: string;
  viewYear: string;
  viewYearCanChi: string;
  age: string;
  amDuong: string;
  amDuongNghichLy: string;
  menh: string;
  cuc: string;
  cucMenhRelation: string;
  menhChu: string;
  thanChu: string;
  isMock?: boolean;
  docId?: string;
  dob?: string;
  analyses?: {
    holistic?: string;
    palaces?: Record<string, string>;
    self?: Record<string, string>;
    deep?: Record<string, string>;
  };
}

export const mockCentralInfo: CentralInfo = {
  name: "Lê Đặng Gia Khánh",
  birthYear: "2003",
  birthYearCanChi: "Quý Mùi",
  lunarMonth: "12",
  lunarMonthCanChi: "Ất Sửu",
  lunarDay: "27",
  lunarDayCanChi: "Giáp Tuất",
  birthHour: "13h - 14h59",
  birthHourCanChi: "Tân Mùi",
  viewYear: "2026",
  viewYearCanChi: "Bính Ngọ",
  age: "24 tuổi",
  amDuong: "Âm Nam",
  amDuongNghichLy: "Âm dương nghịch lý",
  menh: "Dương liễu mộc",
  cuc: "Hỏa lục Cục",
  cucMenhRelation: "Bản Mệnh sinh Cục",
  menhChu: "Văn khúc",
  thanChu: "Thiên đồng",
  isMock: true
};

export const mockPalaces: Palace[] = [
  {
    id: "ty",
    canChi: "Đ.Tỵ",
    name: "HUYNH ĐỆ",
    age: "16",
    mainStars: [
      { name: "Liêm Trinh (H)", element: "hoa" },
      { name: "Tham Lang (H)", element: "thuy" }
    ],
    goodStars: [
      { name: "Thiên Việt", element: "hoa" },
      { name: "Hỷ Thần", element: "hoa" },
      { name: "Thiên Phúc", element: "tho" },
      { name: "Đường Phù", element: "moc" },
      { name: "Thiên Mã (Đ)", element: "hoa" }
    ],
    badStars: [
      { name: "Linh Tinh (Đ)", element: "hoa" },
      { name: "Hóa Kỵ (H)", element: "thuy" },
      { name: "Điều Khách", element: "hoa" }
    ],
    bottomLeft: "Hợi",
    bottomRight: "Tuyệt"
  },
  {
    id: "ngo",
    canChi: "M.Ngọ",
    name: "MỆNH",
    age: "6",
    mainStars: [
      { name: "Cự Môn (V)", element: "thuy" }
    ],
    goodStars: [
      { name: "Hóa Quyền", element: "moc" },
      { name: "Ân Quang", element: "moc" },
      { name: "Thiên Quan", element: "hoa" },
      { name: "Địa Giải", element: "tho" }
    ],
    badStars: [
      { name: "Địa Kiếp (H)", element: "hoa" },
      { name: "Phi Liêm", element: "hoa" },
      { name: "Trực Phù", element: "kim" }
    ],
    bottomLeft: "Tý",
    bottomRight: "Mộ"
  },
  {
    id: "mui",
    canChi: "K.Mùi",
    name: "PHỤ MẪU",
    age: "116",
    mainStars: [
      { name: "Thiên Tướng (Đ)", element: "thuy" }
    ],
    goodStars: [
      { name: "Tấu Thư", element: "kim" },
      { name: "Tam Thai", element: "thuy" },
      { name: "Bát Tọa", element: "moc" },
      { name: "Thiên Giải", element: "moc" },
      { name: "Hoa Cái", element: "kim" }
    ],
    badStars: [
      { name: "Thái Tuế", element: "hoa" }
    ],
    bottomLeft: "Sửu",
    bottomRight: "Tử"
  },
  {
    id: "than",
    canChi: "C.Thân",
    name: "PHÚC ĐỨC",
    age: "106",
    isThan: true,
    isTuan: true,
    mainStars: [
      { name: "Thiên Đồng (M)", element: "thuy" },
      { name: "Thiên Lương (V)", element: "moc" }
    ],
    goodStars: [
      { name: "Thiếu Dương", element: "hoa" },
      { name: "Thiên Quý", element: "tho" },
      { name: "Hồng Loan", element: "thuy" },
      { name: "Quốc Ấn", element: "tho" }
    ],
    badStars: [
      { name: "Thiên Không", element: "hoa" },
      { name: "Tướng Quân", element: "moc" },
      { name: "Thiên Hình (Đ)", element: "hoa" },
      { name: "Cô Thần", element: "tho" },
      { name: "Kiếp Sát", element: "hoa" }
    ],
    bottomLeft: "Dần",
    bottomRight: "Bệnh"
  },
  {
    id: "dau",
    canChi: "T.Dậu",
    name: "ĐIỀN TRẠCH",
    age: "96",
    isTuan: true,
    mainStars: [
      { name: "Vũ Khúc (Đ)", element: "kim" },
      { name: "Thất Sát (H)", element: "kim" }
    ],
    goodStars: [
      { name: "Phong Cáo", element: "tho" }
    ],
    badStars: [
      { name: "Tiểu Hao (Đ)", element: "hoa" },
      { name: "Tang Môn (Đ)", element: "moc" }
    ],
    bottomLeft: "Mão",
    bottomRight: "Suy"
  },
  {
    id: "tuat",
    canChi: "N.Tuất",
    name: "QUAN LỘC",
    age: "86",
    mainStars: [
      { name: "Thái Dương (H)", element: "hoa" }
    ],
    goodStars: [
      { name: "Thanh Long", element: "thuy" },
      { name: "Thiếu Âm", element: "thuy" },
      { name: "Thiên Trù", element: "tho" }
    ],
    badStars: [
      { name: "Địa Võng", element: "tho" }
    ],
    bottomLeft: "Thìn",
    bottomRight: "Đế Vượng"
  },
  {
    id: "hoi",
    canChi: "Q.Hợi",
    name: "NÔ BỘC",
    age: "76",
    mainStars: [],
    goodStars: [
      { name: "Hữu Bật", element: "tho" },
      { name: "Văn Khúc (Đ)", element: "thuy" },
      { name: "Lực Sĩ", element: "hoa" },
      { name: "Long Trì", element: "thuy" }
    ],
    badStars: [
      { name: "Đà La (H)", element: "kim" },
      { name: "Quan Phủ", element: "hoa" },
      { name: "Thiên Khốc (H)", element: "thuy" },
      { name: "Thiên Thương", element: "tho" }
    ],
    bottomLeft: "Tỵ",
    bottomRight: "Lâm Quan"
  },
  {
    id: "ty_bottom",
    canChi: "G.Tý",
    name: "THIÊN DI",
    age: "66",
    isTriet: true,
    mainStars: [
      { name: "Thiên Cơ (Đ)", element: "moc" }
    ],
    goodStars: [
      { name: "Lộc Tồn", element: "tho" },
      { name: "Bác Sỹ", element: "thuy" },
      { name: "Nguyệt Đức", element: "hoa" },
      { name: "Thiên Hỷ (Đ)", element: "thuy" },
      { name: "Đào Hoa", element: "moc" }
    ],
    badStars: [
      { name: "Tử Phù", element: "kim" },
      { name: "Thiên Riêu (H)", element: "thuy" }
    ],
    bottomLeft: "Ngọ",
    bottomRight: "Quan Đới"
  },
  {
    id: "suu",
    canChi: "Ấ.Sửu",
    name: "TẬT ÁCH",
    age: "56",
    isTriet: true,
    mainStars: [
      { name: "Tử Vi (B)", element: "tho" },
      { name: "Phá Quân (V)", element: "thuy" }
    ],
    goodStars: [
      { name: "Hóa Lộc", element: "moc" },
      { name: "Thiên Tài", element: "moc" },
      { name: "Thai Phụ", element: "kim" }
    ],
    badStars: [
      { name: "Kình Dương (Đ)", element: "kim" },
      { name: "Quan Phủ", element: "hoa" },
      { name: "Tuế Phá", element: "hoa" },
      { name: "Thiên Hư (Đ)", element: "thuy" },
      { name: "Thiên Sứ", element: "thuy" },
      { name: "Phá Toái", element: "hoa" }
    ],
    bottomLeft: "Mùi",
    bottomRight: "Mộc Dục"
  },
  {
    id: "dan",
    canChi: "G.Dần",
    name: "TÀI BẠCH",
    age: "46",
    mainStars: [],
    goodStars: [
      { name: "Long Đức", element: "thuy" },
      { name: "Thiên Hỷ", element: "thuy" }
    ],
    badStars: [
      { name: "Hỏa Tinh (Đ)", element: "hoa" },
      { name: "Phục Binh", element: "hoa" },
      { name: "Lưu Hà", element: "thuy" }
    ],
    bottomLeft: "Thân",
    bottomRight: "Tràng Sinh"
  },
  {
    id: "mao",
    canChi: "Ấ.Mão",
    name: "TỬ TỨC",
    age: "36",
    mainStars: [
      { name: "Thiên Phủ (B)", element: "tho" }
    ],
    goodStars: [
      { name: "Tả Phù", element: "tho" },
      { name: "Văn Xương (Đ)", element: "kim" },
      { name: "Thiên Khôi", element: "hoa" },
      { name: "Phượng Các", element: "moc" },
      { name: "Giải Thần", element: "moc" },
      { name: "Thiên Thọ", element: "tho" },
      { name: "Văn Tinh", element: "hoa" }
    ],
    badStars: [
      { name: "Đại Hao (Đ)", element: "hoa" },
      { name: "Bạch Hổ (Đ)", element: "kim" },
      { name: "Đẩu Quân", element: "hoa" }
    ],
    bottomLeft: "Dậu",
    bottomRight: "Dưỡng"
  },
  {
    id: "thin",
    canChi: "B.Thìn",
    name: "PHU THÊ",
    age: "26",
    mainStars: [
      { name: "Thái Âm (H)", element: "thuy" }
    ],
    goodStars: [
      { name: "Hóa Khoa", element: "thuy" },
      { name: "Phúc Đức", element: "tho" },
      { name: "Thiên Đức", element: "hoa" }
    ],
    badStars: [
      { name: "Địa Không (H)", element: "hoa" },
      { name: "Bệnh Phù", element: "tho" },
      { name: "Quả Tú", element: "tho" },
      { name: "Thiên La", element: "tho" }
    ],
    bottomLeft: "Tuất",
    bottomRight: "Thai"
  }
];
