# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: blackbox.spec.js >> Additional Service Fees >> TC35 - Services: service-imax, service-combo, service-student
- Location: tests\blackbox.spec.js:90:5

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('inv-total-payment')
Expected: "278.000đ"
Received: "298.000đ"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" getByTestId('inv-total-payment') with timeout 5000ms
  - waiting for getByTestId('inv-total-payment')
    14 × locator resolved to <span class="total-badge" id="inv-total-payment" data-testid="inv-total-payment">298.000đ</span>
       - unexpected value "298.000đ"

```

```yaml
- text: 298.000đ
```

# Test source

```ts
  4   | 
  5   | // 1. Nhóm kiểm thử Giá trị biên & Dữ liệu không hợp lệ (Boundary & Validation: TC01 - TC25)
  6   | const boundaryCases = [
  7   |   ['TC01', 'seat_standard', '-1', null],
  8   |   ['TC02', 'seat_standard', '0', null],
  9   |   ['TC03', 'seat_standard', '1', 80000],
  10  |   ['TC04', 'seat_standard', '2', 160000],
  11  |   ['TC05', 'seat_standard', '9', 720000],
  12  |   ['TC06', 'seat_standard', '10', 800000],
  13  |   ['TC07', 'seat_standard', '11', null],
  14  |   ['TC08', 'seat_vip', '0', null],
  15  |   ['TC09', 'seat_vip', '1', 100000],        // Bắt Bug 1 (VIP thực tế tính 110.000)
  16  |   ['TC10', 'seat_vip', '10', 1000000],      // Bắt Bug 1 (VIP thực tế tính 1.100.000)
  17  |   ['TC11', 'seat_vip', '11', null],
  18  |   ['TC12', 'seat_sweetbox', '0', null],
  19  |   ['TC13', 'seat_sweetbox', '1', 180000],
  20  |   ['TC14', 'seat_sweetbox', '10', 1800000],
  21  |   ['TC15', 'seat_sweetbox', '11', null],
  22  |   ['TC16', 'seat_standard', '', null],
  23  |   ['TC17', 'seat_standard', '1.5', null],
  24  |   ['TC18', 'seat_standard', 'abc', null],
  25  |   ['TC19', 'seat_vip', '-1', null],
  26  |   ['TC20', 'seat_sweetbox', '-1', null],
  27  |   ['TC21', 'seat_standard', '5', 400000],
  28  |   ['TC22', 'seat_standard', '7', 560000],   // Ghế tiêu chuẩn 7 vé (Passed)
  29  |   ['TC23', 'seat_sweetbox', '5', 900000],
  30  |   ['TC24', 'seat_standard', '100', null],
  31  |   ['TC25', 'seat_sweetbox', '9', 1620000]
  32  | ];
  33  | 
  34  | test.describe('Boundary Value and Invalid Input Testing', () => {
  35  |   for (const [id, seat, qty, expected] of boundaryCases) {
  36  |     test(`${id} - ${seat}, qty=${qty || '(empty)'}`, async ({ extensionPage }) => {
  37  |       await extensionPage.getByTestId('seat-select').selectOption(seat);
  38  |       await extensionPage.getByTestId('ticket-quantity').fill(qty);
  39  |       await extensionPage.getByTestId('calculate-btn').click();
  40  | 
  41  |       if (expected !== null) {
  42  |         await expect(extensionPage.getByTestId('invoice-content')).toBeVisible();
  43  |         await expect(extensionPage.getByTestId('inv-total-payment')).toHaveText(money(expected));
  44  |       } else {
  45  |         await expect(extensionPage.getByTestId('quantity-error')).not.toBeEmpty();
  46  |         await expect(extensionPage.getByTestId('invoice-content')).toBeHidden();
  47  |       }
  48  |     });
  49  |   }
  50  | });
  51  | 
  52  | // 2. Nhóm kiểm thử Mã giảm giá (Discount Processing: TC26 - TC31)
  53  | const discountCases = [
  54  |   ['TC26', 'seat_standard', '1', '', 80000, false],
  55  |   ['TC27', 'seat_standard', '1', 'INVALID', null, true],
  56  |   ['TC28', 'seat_standard', '1', 'CINE10', 72000, false],     // Bắt Bug 2 (CINE10 giảm 5% thay vì 10%)
  57  |   ['TC29', 'seat_standard', '5', 'FIXED50', 350000, false],
  58  |   ['TC30', 'seat_standard', '1', 'FIXED50', null, true],      // Đơn < 200k không đủ điều kiện
  59  |   ['TC31', 'seat_standard', '3', 'FIXED50', 190000, false]
  60  | ];
  61  | 
  62  | test.describe('Discount Code Processing', () => {
  63  |   for (const [id, seat, qty, code, expected, isError] of discountCases) {
  64  |     test(`${id} - Voucher: ${code || '(empty)'}`, async ({ extensionPage }) => {
  65  |       await extensionPage.getByTestId('seat-select').selectOption(seat);
  66  |       await extensionPage.getByTestId('ticket-quantity').fill(qty);
  67  |       await extensionPage.getByTestId('discount-input').fill(code);
  68  |       await extensionPage.getByTestId('apply-discount-btn').click();
  69  |       await extensionPage.getByTestId('calculate-btn').click();
  70  | 
  71  |       if (!isError) {
  72  |         await expect(extensionPage.getByTestId('inv-total-payment')).toHaveText(money(expected));
  73  |       } else {
  74  |         await expect(extensionPage.getByTestId('discount-error')).not.toBeEmpty();
  75  |       }
  76  |     });
  77  |   }
  78  | });
  79  | 
  80  | // 3. Nhóm kiểm thử Dịch vụ phụ phí & Bảng quyết định (Additional Services: TC32 - TC35)
  81  | const serviceCases = [
  82  |   ['TC32', 'seat_standard', '2', ['service-imax'], 240000],                            // Bắt Bug 3 (IMAX thực tế nhận 260.000đ do tính 50k/vé)
  83  |   ['TC33', 'seat_standard', '2', ['service-combo'], 230000],                           // Kỳ vọng: 160k vé + 70k combo = 230.000đ (Passed)
  84  |   ['TC34', 'seat_standard', '2', ['service-student'], 128000],                         // Kỳ vọng: 160k vé - 32k U22 = 128.000đ (Passed)
  85  |   ['TC35', 'seat_standard', '2', ['service-imax', 'service-combo', 'service-student'], 278000] // Bắt Bug 3 (Thực tế nhận 298.000đ vì IMAX 50k)
  86  | ];
  87  | 
  88  | test.describe('Additional Service Fees', () => {
  89  |   for (const [id, seat, qty, services, expected] of serviceCases) {
  90  |     test(`${id} - Services: ${services.join(', ')}`, async ({ extensionPage }) => {
  91  |       await extensionPage.getByTestId('seat-select').selectOption(seat);
  92  |       await extensionPage.getByTestId('ticket-quantity').fill(qty);
  93  | 
  94  |       for (const s of services) {
  95  |         // Đảm bảo toggle được bật và kích hoạt sự kiện cập nhật DOM
  96  |         const checkbox = extensionPage.getByTestId(s);
  97  |         await checkbox.evaluate((el) => {
  98  |           el.checked = true;
  99  |           el.dispatchEvent(new Event('change', { bubbles: true }));
  100 |         });
  101 |       }
  102 | 
  103 |       await extensionPage.getByTestId('calculate-btn').click();
> 104 |       await expect(extensionPage.getByTestId('inv-total-payment')).toHaveText(money(expected));
      |                                                                    ^ Error: expect(locator).toHaveText(expected) failed
  105 |     });
  106 |   }
  107 | });
```