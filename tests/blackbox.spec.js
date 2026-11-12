const { test, expect } = require('./extension.fixture');

const money = (val) => `${Number(val).toLocaleString('vi-VN')}đ`;

// 1. Nhóm kiểm thử Giá trị biên & Dữ liệu không hợp lệ (Boundary & Validation: TC01 - TC25)
const boundaryCases = [
  ['TC01', 'seat_standard', '-1', null],
  ['TC02', 'seat_standard', '0', null],
  ['TC03', 'seat_standard', '1', 80000],
  ['TC04', 'seat_standard', '2', 160000],
  ['TC05', 'seat_standard', '9', 720000],
  ['TC06', 'seat_standard', '10', 800000],
  ['TC07', 'seat_standard', '11', null],
  ['TC08', 'seat_vip', '0', null],
  ['TC09', 'seat_vip', '1', 100000],        // Bắt Bug 1 (VIP thực tế tính 110.000)
  ['TC10', 'seat_vip', '10', 1000000],      // Bắt Bug 1 (VIP thực tế tính 1.100.000)
  ['TC11', 'seat_vip', '11', null],
  ['TC12', 'seat_sweetbox', '0', null],
  ['TC13', 'seat_sweetbox', '1', 180000],
  ['TC14', 'seat_sweetbox', '10', 1800000],
  ['TC15', 'seat_sweetbox', '11', null],
  ['TC16', 'seat_standard', '', null],
  ['TC17', 'seat_standard', '1.5', null],
  ['TC18', 'seat_standard', 'abc', null],
  ['TC19', 'seat_vip', '-1', null],
  ['TC20', 'seat_sweetbox', '-1', null],
  ['TC21', 'seat_standard', '5', 400000],
  ['TC22', 'seat_standard', '7', 560000],   // Ghế tiêu chuẩn 7 vé (Passed)
  ['TC23', 'seat_sweetbox', '5', 900000],
  ['TC24', 'seat_standard', '100', null],
  ['TC25', 'seat_sweetbox', '9', 1620000]
];

test.describe('Boundary Value and Invalid Input Testing', () => {
  for (const [id, seat, qty, expected] of boundaryCases) {
    test(`${id} - ${seat}, qty=${qty || '(empty)'}`, async ({ extensionPage }) => {
      await extensionPage.getByTestId('seat-select').selectOption(seat);
      await extensionPage.getByTestId('ticket-quantity').fill(qty);
      await extensionPage.getByTestId('calculate-btn').click();

      if (expected !== null) {
        await expect(extensionPage.getByTestId('invoice-content')).toBeVisible();
        await expect(extensionPage.getByTestId('inv-total-payment')).toHaveText(money(expected));
      } else {
        await expect(extensionPage.getByTestId('quantity-error')).not.toBeEmpty();
        await expect(extensionPage.getByTestId('invoice-content')).toBeHidden();
      }
    });
  }
});

// 2. Nhóm kiểm thử Mã giảm giá (Discount Processing: TC26 - TC31)
const discountCases = [
  ['TC26', 'seat_standard', '1', '', 80000, false],
  ['TC27', 'seat_standard', '1', 'INVALID', null, true],
  ['TC28', 'seat_standard', '1', 'CINE10', 72000, false],     // Bắt Bug 2 (CINE10 giảm 5% thay vì 10%)
  ['TC29', 'seat_standard', '5', 'FIXED50', 350000, false],
  ['TC30', 'seat_standard', '1', 'FIXED50', null, true],      // Đơn < 200k không đủ điều kiện
  ['TC31', 'seat_standard', '3', 'FIXED50', 190000, false]
];

test.describe('Discount Code Processing', () => {
  for (const [id, seat, qty, code, expected, isError] of discountCases) {
    test(`${id} - Voucher: ${code || '(empty)'}`, async ({ extensionPage }) => {
      await extensionPage.getByTestId('seat-select').selectOption(seat);
      await extensionPage.getByTestId('ticket-quantity').fill(qty);
      await extensionPage.getByTestId('discount-input').fill(code);
      await extensionPage.getByTestId('apply-discount-btn').click();
      await extensionPage.getByTestId('calculate-btn').click();

      if (!isError) {
        await expect(extensionPage.getByTestId('inv-total-payment')).toHaveText(money(expected));
      } else {
        await expect(extensionPage.getByTestId('discount-error')).not.toBeEmpty();
      }
    });
  }
});

// 3. Nhóm kiểm thử Dịch vụ phụ phí & Bảng quyết định (Additional Services: TC32 - TC35)
const serviceCases = [
  ['TC32', 'seat_standard', '2', ['service-imax'], 240000],                            // Bắt Bug 3 (IMAX thực tế nhận 260.000đ do tính 50k/vé)
  ['TC33', 'seat_standard', '2', ['service-combo'], 230000],                           // Kỳ vọng: 160k vé + 70k combo = 230.000đ (Passed)
  ['TC34', 'seat_standard', '2', ['service-student'], 128000],                         // Kỳ vọng: 160k vé - 32k U22 = 128.000đ (Passed)
  ['TC35', 'seat_standard', '2', ['service-imax', 'service-combo', 'service-student'], 278000] // Bắt Bug 3 (Thực tế nhận 298.000đ vì IMAX 50k)
];

test.describe('Additional Service Fees', () => {
  for (const [id, seat, qty, services, expected] of serviceCases) {
    test(`${id} - Services: ${services.join(', ')}`, async ({ extensionPage }) => {
      await extensionPage.getByTestId('seat-select').selectOption(seat);
      await extensionPage.getByTestId('ticket-quantity').fill(qty);

      for (const s of services) {
        // Đảm bảo toggle được bật và kích hoạt sự kiện cập nhật DOM
        const checkbox = extensionPage.getByTestId(s);
        await checkbox.evaluate((el) => {
          el.checked = true;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }

      await extensionPage.getByTestId('calculate-btn').click();
      await expect(extensionPage.getByTestId('inv-total-payment')).toHaveText(money(expected));
    });
  }
});