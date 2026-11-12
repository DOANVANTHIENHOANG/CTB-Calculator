function validateDiscountCode(rawCode, currentSubTotal) {
  if (!rawCode || rawCode.trim() === '') {
    return { valid: true, code: '', amount: 0, message: '' };
  }

  const code = rawCode.trim().toUpperCase();
  if (!DISCOUNTS[code]) {
    return { valid: false, code: '', amount: 0, message: 'Mã giảm giá không hợp lệ.' };
  }

  const discountRule = DISCOUNTS[code];

  if (discountRule.type === 'fixed') {
    if (currentSubTotal < discountRule.minOrder) {
      return { 
        valid: false, 
        code: '', 
        amount: 0, 
        message: 'Đơn hàng chưa đủ điều kiện áp dụng mã giảm giá.' 
      };
    }
    return { valid: true, code, amount: discountRule.value, message: 'Áp dụng mã giảm giá thành công.' };
  }

  if (discountRule.type === 'percent') {
    let calcDiscount = currentSubTotal * discountRule.value;
    if (discountRule.max && calcDiscount > discountRule.max) {
      calcDiscount = discountRule.max;
    }
    return { valid: true, code, amount: calcDiscount, message: 'Áp dụng mã giảm giá thành công.' };
  }

  return { valid: false, code: '', amount: 0, message: 'Mã giảm giá không hợp lệ.' };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validateDiscountCode };
}