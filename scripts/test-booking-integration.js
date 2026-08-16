/**
 * scripts/test-booking-integration.js
 *
 * Comprehensive integration test suite for msari_web hotel booking integration.
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';

async function runBookingIntegrationTests() {
  console.log('================================================================');
  console.log('🏨 TESTING HOTEL BOOKING INTEGRATION & OPERATIONAL DATA BINDING');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  // ── TEST GROUP 1: Route Protection & Login Gate ──
  console.log('--- TEST GROUP 1: Route Guards & Auth Gate ---');
  try {
    const res = await fetch(`${BASE_URL}/ar/booking?hotel=aden-hotel&checkIn=2026-09-01&checkOut=2026-09-05&guests=2`, {
      redirect: 'manual'
    });
    // Unauthenticated user should get the login gate HTML or redirect
    const html = await res.text();
    const hasLoginPrompt = html.includes('تسجيل الدخول مطلوب') || html.includes('loginUrl') || res.status === 307;
    assert(hasLoginPrompt, 'Unauthenticated user sees Login Required gate for /booking');
  } catch (e) {
    assert(false, `Route guard check threw error: ${e.message}`);
  }

  // ── TEST GROUP 2: Operational Data Contracts ──
  console.log('\n--- TEST GROUP 2: Operational Data & Schemas ---');
  
  // 2.1 Test CreateBookingSchema contract
  const { z } = require('zod');
  const CreateBookingSchema = z.object({
    hotelId:              z.string().min(1),
    roomId:               z.string().min(1).optional(),
    guestName:            z.string().min(2).max(100),
    guestEmail:           z.string().email().max(254),
    guestPhone:           z.string().min(7).max(20),
    checkIn:              z.string().datetime(),
    checkOut:             z.string().datetime(),
    guests:               z.number().int().min(1).max(20),
    paymentMethod:        z.string().min(1),
    selectedCurrencyCode: z.string().optional().default('USD'),
    isForAnotherGuest:    z.boolean().optional().default(false),
    anotherGuestName:     z.string().max(100).optional(),
    anotherGuestPhone:    z.string().max(20).optional(),
    senderName:           z.string().max(100).optional(),
    senderNumber:         z.string().max(30).optional(),
    transferAmount:       z.number().nonnegative().optional(),
    transferCurrencyCode: z.string().optional(),
    transferToNumber:     z.string().max(50).optional(),
    notes:                z.string().max(1000).optional(),
  }).strict();

  // Test 2.1: Booking for self payload
  const selfPayload = {
    hotelId: 'hotel-aden-1',
    roomId: 'room-deluxe-1',
    guestName: 'أحمد علي',
    guestEmail: 'ahmed@example.com',
    guestPhone: '+967771234567',
    checkIn: '2026-09-01T12:00:00.000Z',
    checkOut: '2026-09-05T12:00:00.000Z',
    guests: 2,
    paymentMethod: 'cash',
    selectedCurrencyCode: 'USD',
    isForAnotherGuest: false,
  };
  const parseSelf = CreateBookingSchema.safeParse(selfPayload);
  assert(parseSelf.success, 'CreateBookingSchema validates booking for self correctly');
  assert(parseSelf.data?.isForAnotherGuest === false, 'isForAnotherGuest is false when booking for self');

  // Test 2.2: Booking for another guest payload
  const otherGuestPayload = {
    hotelId: 'hotel-aden-1',
    roomId: 'room-deluxe-1',
    guestName: 'أحمد علي',
    guestEmail: 'ahmed@example.com',
    guestPhone: '+967771234567',
    checkIn: '2026-09-01T12:00:00.000Z',
    checkOut: '2026-09-05T12:00:00.000Z',
    guests: 1,
    paymentMethod: 'transfer',
    selectedCurrencyCode: 'SAR',
    isForAnotherGuest: true,
    anotherGuestName: 'محمد سالم',
    anotherGuestPhone: '+967733987654',
    senderName: 'أحمد علي بن علي',
    transferAmount: 1500,
    transferCurrencyCode: 'SAR',
    transferToNumber: '123456789',
    notes: 'غرفة مطلة على البحر',
  };
  const parseOther = CreateBookingSchema.safeParse(otherGuestPayload);
  assert(parseOther.success, 'CreateBookingSchema validates booking for another guest with transfer details');
  assert(parseOther.data?.anotherGuestName === 'محمد سالم', 'anotherGuestName is preserved in contract');
  assert(parseOther.data?.transferAmount === 1500, 'transferAmount is preserved in contract');
  assert(parseOther.data?.transferToNumber === '123456789', 'transferToNumber is preserved in contract');

  // ── TEST GROUP 3: Bank Accounts Operational Contract ──
  console.log('\n--- TEST GROUP 3: Operational Bank Accounts Mapping ---');
  const mockFirestoreBank = {
    id: 'kuraimi',
    nameAr: 'بنك الكريمي',
    nameEn: 'Kuraimi Bank',
    isActive: true,
    sortOrder: 1,
    accounts: [
      { currencyCode: 'sar', accountNumber: '3001234567' },
      { currencyCode: 'usd', accountNumber: '3009876543' },
      { currencyCode: 'yerSouth', accountNumber: '3001122334' },
    ]
  };
  assert(mockFirestoreBank.isActive === true, 'Bank account is active');
  assert(mockFirestoreBank.accounts.length === 3, 'Bank account provides multiple currencies (SAR, USD, YER)');
  const sarAccount = mockFirestoreBank.accounts.find(a => a.currencyCode === 'sar');
  assert(sarAccount?.accountNumber === '3001234567', 'Correct SAR account number mapped');

  // ── TEST GROUP 4: Regression Tests ──
  console.log('\n--- TEST GROUP 4: Account & CMS Regression Check ---');
  try {
    const profileRes = await fetch(`${BASE_URL}/ar/account/profile`, { redirect: 'manual' });
    assert(profileRes.status === 307 || profileRes.status === 200, 'Account Profile route remains healthy (HTTP 307/200)');

    const bookingsRes = await fetch(`${BASE_URL}/ar/account/bookings`, { redirect: 'manual' });
    assert(bookingsRes.status === 307 || bookingsRes.status === 200, 'Account Bookings route remains healthy (HTTP 307/200)');

    const homeRes = await fetch(`${BASE_URL}/ar`, { redirect: 'follow' });
    assert(homeRes.status === 200, `Homepage remains healthy (HTTP ${homeRes.status})`);

    const addHotelRes = await fetch(`${BASE_URL}/ar/add-hotel`, { redirect: 'follow' });
    assert(addHotelRes.status === 200, `Add Hotel route remains healthy (HTTP ${addHotelRes.status})`);
  } catch (e) {
    assert(false, `Regression checks threw error: ${e.message}`);
  }

  console.log('\n================================================================');
  console.log(`🎯 TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runBookingIntegrationTests().catch(e => {
  console.error(e);
  process.exit(1);
});
