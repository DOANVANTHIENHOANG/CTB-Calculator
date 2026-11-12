function validateSeat(seat) {
  if (!seat || seat === '') {
    return { valid: false, message: 'Vui lòng chọn loại ghế.' };
  }
  const validSeats = ['seat_standard', 'seat_vip', 'seat_sweetbox'];
  if (!validSeats.includes(seat)) {
    return { valid: false, message: 'Loại ghế không hợp lệ.' };
  }
  return { valid: true, message: '' };
}

function validateTicketQuantity(rawQty) {
  if (rawQty === undefined || rawQty === null || rawQty.trim() === '') {
    return { valid: false, message: 'Vui lòng nhập số lượng vé.' };
  }

  const str = rawQty.trim();
  if (str.includes('.') || str.includes(',')) {
    return { valid: false, message: 'Số lượng vé phải là số nguyên.' };
  }

  const qty = Number(str);
  if (isNaN(qty)) {
    return { valid: false, message: 'Số lượng vé không hợp lệ.' };
  }

  if (qty < 1) {
    return { valid: false, message: 'Số lượng vé phải lớn hơn hoặc bằng 1.' };
  }

  if (qty > 10) {
    return { valid: false, message: 'Số lượng vé không được vượt quá 10 vé.' };
  }

  return { valid: true, value: qty, message: '' };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validateSeat, validateTicketQuantity };
}