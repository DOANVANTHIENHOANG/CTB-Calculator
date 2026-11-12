document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const seatSelect = document.getElementById('seat-select');
  const unitPriceDisplay = document.getElementById('unit-price-display');
  const ticketQuantity = document.getElementById('ticket-quantity');
  const seatError = document.getElementById('seat-error');
  const quantityError = document.getElementById('quantity-error');

  const serviceImax = document.getElementById('service-imax');
  const serviceCombo = document.getElementById('service-combo');
  const serviceStudent = document.getElementById('service-student');
  const studentRow = document.getElementById('student-service-row');

  const discountInput = document.getElementById('discount-input');
  const applyDiscountBtn = document.getElementById('apply-discount-btn');
  const discountStatus = document.getElementById('discount-status');
  const discountError = document.getElementById('discount-error');

  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const headerResetBtn = document.getElementById('header-reset-btn');

  const invoiceEmpty = document.getElementById('invoice-empty');
  const invoiceContent = document.getElementById('invoice-content');

  const invSeatName = document.getElementById('inv-seat-name');
  const invUnitPrice = document.getElementById('inv-unit-price');
  const invQuantity = document.getElementById('inv-quantity');
  const invBaseTotal = document.getElementById('inv-base-total');
  const invFeeImax = document.getElementById('inv-fee-imax');
  const invFeeCombo = document.getElementById('inv-fee-combo');
  const invDiscountStudent = document.getElementById('inv-discount-student');
  const invDiscountCode = document.getElementById('inv-discount-code');
  const invDiscountAmount = document.getElementById('inv-discount-amount');
  const invTotalPayment = document.getElementById('inv-total-payment');

  let appliedDiscount = { code: '', amount: 0 };

  const formatVND = (num) => `${Number(num).toLocaleString('vi-VN')}đ`;

  // Cập nhật đơn giá khi thay đổi loại ghế
  seatSelect.addEventListener('change', () => {
    seatError.innerText = '';
    const seat = seatSelect.value;
    if (seat && RATES[seat]) {
      unitPriceDisplay.innerText = `${formatVND(RATES[seat])}/vé`;
    } else {
      unitPriceDisplay.innerText = '0đ/vé';
    }

    // Logic ràng buộc: Sweetbox không áp dụng ưu đãi U22 (tương tự như xe máy không thuê tài xế)
    if (seat === 'seat_sweetbox') {
      serviceStudent.checked = false;
      studentRow.classList.add('disabled');
      serviceStudent.disabled = true;
    } else {
      studentRow.classList.remove('disabled');
      serviceStudent.disabled = false;
    }

    resetDiscountIfInvalid();
    hideInvoice();
  });

  ticketQuantity.addEventListener('input', () => {
    quantityError.innerText = '';
    resetDiscountIfInvalid();
    hideInvoice();
  });

  // Xử lý áp dụng mã giảm giá
  applyDiscountBtn.addEventListener('click', () => {
    discountError.innerText = '';
    discountStatus.innerText = '';

    const rawCode = discountInput.value.trim();
    if (!rawCode) {
      appliedDiscount = { code: '', amount: 0 };
      return;
    }

    const seat = seatSelect.value;
    const qtyValid = validateTicketQuantity(ticketQuantity.value);

    let tempSubTotal = 0;
    if (seat && qtyValid.valid) {
      const baseFee = calculateBaseTicketFee(seat, qtyValid.value);
      const studentDisc = calculateStudentDiscount(serviceStudent.checked, baseFee, seat);
      const imaxFee = calculateImaxFee(serviceImax.checked, qtyValid.value);
      const comboFee = calculateComboFee(serviceCombo.checked);
      tempSubTotal = (baseFee - studentDisc) + imaxFee + comboFee;
    }

    const result = validateDiscountCode(rawCode, tempSubTotal);
    if (!result.valid) {
      discountError.innerText = result.message;
      appliedDiscount = { code: '', amount: 0 };
    } else {
      discountStatus.innerText = result.message;
      appliedDiscount = { code: result.code, amount: result.amount };
    }
  });

  function resetDiscountIfInvalid() {
    if (appliedDiscount.code === 'FIXED50') {
      appliedDiscount = { code: '', amount: 0 };
      discountStatus.innerText = '';
      discountError.innerText = '';
    }
  }

  function hideInvoice() {
    invoiceContent.style.display = 'none';
    invoiceEmpty.style.display = 'flex';
  }

  // Nút TÍNH TIỀN VÉ
  calculateBtn.addEventListener('click', () => {
    seatError.innerText = '';
    quantityError.innerText = '';

    const seat = seatSelect.value;
    const seatVal = validateSeat(seat);
    const qtyVal = validateTicketQuantity(ticketQuantity.value);

    let hasError = false;
    if (!seatVal.valid) {
      seatError.innerText = seatVal.message;
      hasError = true;
    }
    if (!qtyVal.valid) {
      quantityError.innerText = qtyVal.message;
      hasError = true;
    }

    if (hasError) {
      hideInvoice();
      return;
    }

    // Tính toán hóa đơn
    const bill = calculateBookingTotal({
      seat,
      qty: qtyVal.value,
      isImax: serviceImax.checked,
      isCombo: serviceCombo.checked,
      isStudent: serviceStudent.checked,
      discountAmount: appliedDiscount.amount
    });

    // Cập nhật giao diện hóa đơn
    const seatNameMap = {
      seat_standard: 'Ghế tiêu chuẩn',
      seat_vip: 'Ghế VIP',
      seat_sweetbox: 'Ghế Sweetbox'
    };

    invSeatName.innerText = seatNameMap[seat];
    invUnitPrice.innerText = formatVND(RATES[seat]);
    invQuantity.innerText = `${qtyVal.value} vé`;
    invBaseTotal.innerText = formatVND(bill.baseFee);
    invFeeImax.innerText = formatVND(bill.imaxFee);
    invFeeCombo.innerText = formatVND(bill.comboFee);
    invDiscountStudent.innerText = bill.studentDiscount > 0 ? `-${formatVND(bill.studentDiscount)}` : '0đ';
    invDiscountCode.innerText = appliedDiscount.code ? appliedDiscount.code : 'Không áp dụng';
    invDiscountAmount.innerText = bill.discountAmount > 0 ? `-${formatVND(bill.discountAmount)}` : '0đ';
    invTotalPayment.innerText = formatVND(bill.finalPayment);

    invoiceEmpty.style.display = 'none';
    invoiceContent.style.display = 'flex';
  });

  // Hàm Đặt lại toàn bộ
  function handleReset() {
    seatSelect.value = '';
    unitPriceDisplay.innerText = '0đ/vé';
    ticketQuantity.value = '1';
    serviceImax.checked = false;
    serviceCombo.checked = false;
    serviceStudent.checked = false;
    studentRow.classList.remove('disabled');
    serviceStudent.disabled = false;

    discountInput.value = '';
    appliedDiscount = { code: '', amount: 0 };

    seatError.innerText = '';
    quantityError.innerText = '';
    discountError.innerText = '';
    discountStatus.innerText = '';

    hideInvoice();
  }

  resetBtn.addEventListener('click', handleReset);
  headerResetBtn.addEventListener('click', handleReset);
});