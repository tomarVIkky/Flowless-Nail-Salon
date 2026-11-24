import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SALON_CONFIG,
  isPastDate,
  isValidPhone,
  validateBookingInput,
  formatWhatsAppMessage,
  buildWhatsAppUrl,
} from '../script.js';

test('isPastDate rejects dates before today and accepts today or future dates', () => {
  assert.equal(isPastDate('2026-11-23', '2026-11-24'), true);
  assert.equal(isPastDate('2026-11-24', '2026-11-24'), false);
  assert.equal(isPastDate('2026-12-01', '2026-11-24'), false);
});

test('isValidPhone validates 10 to 15 digit phone numbers', () => {
  assert.equal(isValidPhone('8780973878'), true);
  assert.equal(isValidPhone('+91 878 097 3878'), true);
  assert.equal(isValidPhone('12345'), false);
  assert.equal(isValidPhone(''), false);
});

test('validateBookingInput catches missing fields and past dates', () => {
  const errors = validateBookingInput(
    {
      name: 'A',
      phone: '123',
      service: '',
      date: '2026-11-20',
      time: '',
    },
    '2026-11-24'
  );

  assert.ok(errors.name);
  assert.ok(errors.phone);
  assert.ok(errors.service);
  assert.ok(errors.date);
  assert.ok(errors.time);
});

test('validateBookingInput passes when all required fields are valid', () => {
  const errors = validateBookingInput(
    {
      name: 'Meera Patel',
      phone: '+91 98765 43210',
      service: 'Gel Polish',
      date: '2026-11-26',
      time: '3:00 PM – 5:00 PM',
      note: 'Sheer blush finish',
    },
    '2026-11-24'
  );

  assert.deepEqual(errors, {});
});

test('validateBookingInput prevents 5:00 PM – 7:00 PM slot on Sundays', () => {
  // 2026-11-29 is a Sunday
  const errors = validateBookingInput(
    {
      name: 'Meera Patel',
      phone: '9876543210',
      service: 'Nail Art',
      date: '2026-11-29',
      time: '5:00 PM – 7:00 PM (Mon–Sat)',
    },
    '2026-11-24'
  );

  assert.match(errors.time, /Sundays/i);
});

test('buildWhatsAppUrl generates properly encoded wa.me URL for Flawless Nail Studio', () => {
  const payload = {
    name: 'Meera Patel',
    phone: '9876543210',
    service: 'Nail Art',
    date: '2026-11-26',
    time: '11:00 AM – 1:00 PM',
    note: 'Micro French',
  };

  const msg = formatWhatsAppMessage(payload);
  assert.match(msg, /Flawless Nail Studio/);
  assert.match(msg, /Meera Patel/);
  assert.match(msg, /Nail Art/);
  assert.match(msg, /Micro French/);

  const url = buildWhatsAppUrl(payload);
  assert.ok(url.startsWith(`${SALON_CONFIG.whatsappBaseUrl}?text=`));
  assert.equal(decodeURIComponent(url.split('?text=')[1]), msg);
});
