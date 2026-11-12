function calculateBaseTicketFee(seat, qty) {
  return (RATES[seat] || 0) * qty;
}

function calculateImaxFee(isImax, qty) {
  return isImax ? RATES.fee_imax * qty : 0;
}

function calculateComboFee(isCombo) {
  return isCombo ? RATES.fee_combo : 0;
}

function calculateStudentDiscount(isStudent, baseFee, seat) {
  // Logic tương tự xe máy không được thuê tài xế: Sweetbox không áp dụng ưu đãi U22
  if (seat === 'seat_sweetbox') return 0;
  return isStudent ? baseFee * RATES.discount_student_rate : 0;
}

function calculateBookingTotal({ seat, qty, isImax, isCombo, isStudent, discountAmount }) {
  const baseFee = calculateBaseTicketFee(seat, qty);
  const imaxFee = calculateImaxFee(isImax, qty);
  const comboFee = calculateComboFee(isCombo);
  const studentDiscount = calculateStudentDiscount(isStudent, baseFee, seat);

  const subTotal = (baseFee - studentDiscount) + imaxFee + comboFee;
  const finalPayment = Math.max(0, subTotal - (discountAmount || 0));

  return {
    baseFee,
    imaxFee,
    comboFee,
    studentDiscount,
    subTotal,
    discountAmount: discountAmount || 0,
    finalPayment
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateBaseTicketFee,
    calculateImaxFee,
    calculateComboFee,
    calculateStudentDiscount,
    calculateBookingTotal
  };
}