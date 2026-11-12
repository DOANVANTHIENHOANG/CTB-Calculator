const RATES = {
  seat_standard: 80000,
  // Giá chuẩn: 100000. Đang cài bug 110000 để Playwright bắt lỗi TC09, TC10
  seat_vip: 110000, 
  seat_sweetbox: 180000,
  // Phụ thu chuẩn: 40000. Đang cài bug 50000 để Playwright bắt lỗi TC32, TC35
  fee_imax: 50000, 
  fee_combo: 70000,
  discount_student_rate: 0.20
};

const DISCOUNTS = {
  // Giảm giá chuẩn: 0.10 (10%). Đang cài bug 0.05 (5%) để bắt lỗi TC28
  CINE10: { type: 'percent', value: 0.05, max: 100000 }, 
  CINE20: { type: 'percent', value: 0.20, max: 200000 },
  FIXED50: { type: 'fixed', value: 50000, minOrder: 200000 }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RATES, DISCOUNTS };
}