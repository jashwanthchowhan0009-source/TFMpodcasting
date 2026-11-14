/**
 * The Founder Mafia — backend (Google Apps Script)
 *
 * Saves seat bookings, community joins and guest pitches to the Google Sheet
 * "The Founder Mafia — Bookings & Pitches", and runs the Razorpay payment flow for ₹199 seats.
 *
 * Endpoints — every request goes to the Web app URL (ending in /exec); the body's "action" picks the step:
 *   POST { type, name, age, email, mobile, startup }                       save a booking / join / pitch
 *   POST { action: 'create-order', booking_id }                            create a Razorpay order for a booking
 *   POST { action: 'verify-payment', booking_id, razorpay_order_id,
 *          razorpay_payment_id, razorpay_signature }                       verify Checkout's signature, mark paid
 *   GET                                                                    { booked } count for a "seats left" counter
 *
 * Secrets — never in content.js, never on GitHub. Apps Script → Project Settings (gear icon) → Script Properties:
 *   RAZORPAY_KEY_ID       rzp_test_…  (rzp_live_… when you go live)
 *   RAZORPAY_KEY_SECRET   the secret shown once when you generated the key
 *
 * One-time setup:
 *   1. Open the Google Sheet → Extensions → Apps Script. Replace everything with this file. Save.
 *   2. Add the two Script Properties above.
 *   3. Run setupPayments() once from the editor (pick it in the function menu, click Run, allow access).
 *      It adds the payment columns to "Seat bookings" and turns on reconcilePayments() every 10 minutes,
 *      which records any payment that was captured even if the buyer closed the browser before it finished.
 *   4. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone. Copy the Web app URL
 *      into content.js → booking.endpoint.
 *   After any change to this file: Deploy → Manage deployments → Edit → Version: New version (keeps the same URL).
 */

const SHEETS = { booking: 'Seat bookings', pitch: 'Guest pitches', join: 'Community members' };
const SEAT_PRICE = 199;          // ₹ per seat — keep in sync with content.js
const CURRENCY = 'INR';
const RZP = 'https://api.razorpay.com/v1';

// "Seat bookings" columns (1-based)
const COL = { at: 1, id: 2, name: 3, age: 4, email: 5, mobile: 6, startup: 7, seats: 8, amount: 9, status: 10, confirmed: 11, orderId: 12, paymentId: 13, paidAt: 14 };
const PAY_HEADERS = ['Razorpay order ID', 'Razorpay payment ID', 'Paid at'];

/* ───────────────────────── routing ───────────────────────── */

function doPost(e) {
  let data;
  try { data = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return json({ ok: false, error: 'Bad request.' }); }
  // The step comes in the body ({ action: 'create-order' }) — browsers can't reach /exec/<path> URLs
  // cross-origin — with ?action= and /exec/<path> still accepted.
  const route = String(data.action || (e && e.parameter && e.parameter.action) || (e && e.pathInfo) || '').replace(/^\/+|\/+$/g, '');
  try {
    if (route === 'create-order') return json(createOrder(data));
    if (route === 'verify-payment') return json(verifyPayment(data));
    if (route === '') return json(saveForm(data));
    return json({ ok: false, error: 'Unknown endpoint.' });
  } catch (err) {
    console.error(route || 'save', err && err.stack || err);
    return json({ ok: false, error: route ? 'Payment service is unavailable. Please try again in a minute.' : 'Could not save right now. Please try again.' });
  }
}

function doGet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEETS.booking);
  return json({ ok: true, booked: sheet ? Math.max(0, sheet.getLastRow() - 1) : 0 });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ───────────────────────── forms ───────────────────────── */

function saveForm(data) {
  if (data.website) return { ok: true, id: 'ignored' }; // spam trap: the hidden field real people never fill
  const type = SHEETS[data.type] ? data.type : 'booking';
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEETS[type]);
    if (!sheet) return { ok: false, error: 'Sheet tab "' + SHEETS[type] + '" not found.' };
    const now = new Date();
    const id = ({ pitch: 'P-', join: 'M-', booking: 'S-' })[type] + Utilities.formatDate(now, 'Asia/Kolkata', 'yyMMdd') + '-' +
      Math.random().toString(36).slice(2, 6).toUpperCase();

    if (type === 'booking' || type === 'join') {
      // Check the number as typed (+91 88970 04533 is fine), then store digits only.
      const rawMobile = String(data.mobile == null ? '' : data.mobile).trim();
      const mobile = rawMobile.replace(/\D/g, '').replace(/^91(\d{10})$/, '$1').replace(/^0(\d{10})$/, '$1');
      const name = clean(data.name, 80), email = clean(data.email, 120);
      const age = parseInt(data.age, 10);
      if (!name || !/^\S+@\S+\.\S+$/.test(email) || !/^[0-9+\-\s()]{8,20}$/.test(rawMobile) || mobile.length < 8 || mobile.length > 15 || !(age >= 13 && age <= 100)) {
        return { ok: false, error: 'Please fill in your name, a valid age, email and mobile number.' };
      }
      if (type === 'join') sheet.appendRow([now, id, name, age, email, mobile, clean(data.startup, 120), 'New']);
      else sheet.appendRow([now, id, name, age, email, mobile, clean(data.startup, 120), 1, SEAT_PRICE, 'Pending', false, '', '', '']);
    } else {
      const name = clean(data.name, 80), email = clean(data.email, 120);
      if (!name || !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: 'Please fill in your name and a valid email.' };
      sheet.appendRow([now, id, name, clean(data.company, 120), email, clean(data.stage, 60), clean(data.story, 4000), 'Pending']);
    }
    return { ok: true, id: id };
  } finally {
    lock.releaseLock();
  }
}

// Text that starts with = + - @ would run as a formula in Sheets; prefix it with ' so it stays text.
function clean(v, max) {
  return String(v == null ? '' : v).replace(/^[=+\-@]/, "'$&").trim().slice(0, max || 200);
}

/* ───────────────────────── payments ───────────────────────── */

/**
 * POST /create-order  { booking_id }
 * The amount is never taken from the browser: it is worked out here from the booking (seats × ₹199),
 * converted to paise (× 100), so nobody can pay ₹1 for a seat by editing the request.
 */
function createOrder(data) {
  const keys = rzpKeys();
  const bookingId = String(data.booking_id || '').trim();
  if (!/^S-\d{6}-[A-Z0-9]{4}$/.test(bookingId)) return { ok: false, error: 'Booking not found.' };

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const row = findBooking(bookingId);
    if (!row) return { ok: false, error: 'Booking not found.' };
    if (row.status === 'Paid') return { ok: false, paid: true, error: 'This seat is already paid for.' };

    const seats = Math.max(1, parseInt(row.seats, 10) || 1);
    const amount = seats * SEAT_PRICE * 100; // ₹ → paise

    // Reuse the booking's open order on a retry, so one seat never has two live orders.
    let order = null;
    if (row.orderId) {
      const existing = rzp('get', '/orders/' + row.orderId, null, keys);
      if (existing.ok && existing.body.status !== 'paid' && existing.body.amount === amount) order = existing.body;
      if (existing.ok && existing.body.status === 'paid') {
        reconcileRow(row, keys);
        return { ok: false, paid: true, error: 'This seat is already paid for.' };
      }
    }
    if (!order) {
      const created = rzp('post', '/orders', {
        amount: amount,
        currency: CURRENCY,
        receipt: bookingId,
        notes: { booking_id: bookingId, name: row.name, email: row.email },
      }, keys);
      if (!created.ok) {
        console.error('create order failed', created.code, created.text);
        return { ok: false, error: 'Could not start the payment. Please try again.' };
      }
      order = created.body;
      row.range(COL.orderId).setValue(order.id);
    }

    return {
      ok: true,
      key_id: keys.id,            // the Key ID is public by design; the secret never leaves this script
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      booking_id: bookingId,
      prefill: { name: row.name, email: row.email, contact: contactFor(row.mobile) },
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * POST /verify-payment  { booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * 1. Recompute HMAC-SHA256(order_id + "|" + payment_id) with the Key Secret and compare it in constant time.
 * 2. Check the order belongs to this booking.
 * 3. Ask Razorpay for the payment itself (amount, order, status) and capture it if it is only authorised.
 * Only then is the seat marked Paid.
 */
function verifyPayment(data) {
  const keys = rzpKeys();
  const bookingId = String(data.booking_id || '').trim();
  const orderId = String(data.razorpay_order_id || '');
  const paymentId = String(data.razorpay_payment_id || '');
  const signature = String(data.razorpay_signature || '');
  if (!orderId || !paymentId || !signature) return { ok: false, error: 'Missing payment details.' };

  const expected = hmacHex(orderId + '|' + paymentId, keys.secret);
  if (!safeEqual(expected, signature)) return { ok: false, error: 'Payment could not be verified.' };

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const row = findBooking(bookingId);
    if (!row || row.orderId !== orderId) return { ok: false, error: 'Payment does not match this booking.' };
    if (row.status === 'Paid' && row.paymentId === paymentId) return { ok: true, status: 'paid', booking_id: bookingId, payment_id: paymentId };

    const payment = settlePayment(paymentId, orderId, row, keys);
    if (!payment) return { ok: false, error: 'Payment was not completed. You have not been charged twice — please try again.' };
    markPaid(row, payment.id);
    return { ok: true, status: 'paid', booking_id: bookingId, payment_id: payment.id };
  } finally {
    lock.releaseLock();
  }
}

/** Fetches the payment from Razorpay, checks it belongs to the order and the right amount, captures if needed. */
function settlePayment(paymentId, orderId, row, keys) {
  const got = rzp('get', '/payments/' + paymentId, null, keys);
  if (!got.ok) return null;
  let p = got.body;
  const amount = (Math.max(1, parseInt(row.seats, 10) || 1)) * SEAT_PRICE * 100;
  if (p.order_id !== orderId || p.amount !== amount || p.currency !== CURRENCY) return null;
  if (p.status === 'authorized') {
    const cap = rzp('post', '/payments/' + paymentId + '/capture', { amount: amount, currency: CURRENCY }, keys);
    if (!cap.ok) return null;
    p = cap.body;
  }
  return p.status === 'captured' ? p : null;
}

function markPaid(row, paymentId) {
  row.range(COL.status).setValue('Paid');
  row.range(COL.confirmed).setValue(true);
  row.range(COL.paymentId).setValue(paymentId);
  row.range(COL.paidAt).setValue(new Date());
}

/**
 * Runs every 10 minutes (set up by setupPayments). For every unpaid booking that has an order,
 * asks Razorpay whether a payment was captured — so a seat is recorded as Paid even if the buyer
 * closed the browser before the website could confirm it. This replaces a webhook: Apps Script
 * cannot read Razorpay's X-Razorpay-Signature header, so a webhook here could not be authenticated.
 */
function reconcilePayments() {
  const keys = rzpKeys();
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEETS.booking);
  if (!sheet || sheet.getLastRow() < 2) return;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, COL.paidAt).getValues();
    values.forEach((v, i) => {
      if (v[COL.orderId - 1] && v[COL.status - 1] !== 'Paid') reconcileRow(rowFrom(sheet, i + 2, v), keys);
    });
  } finally {
    lock.releaseLock();
  }
}

function reconcileRow(row, keys) {
  const list = rzp('get', '/orders/' + row.orderId + '/payments', null, keys);
  if (!list.ok) return false;
  const items = (list.body.items || []).filter((p) => p.status === 'captured' || p.status === 'authorized');
  for (const p of items) {
    const settled = settlePayment(p.id, row.orderId, row, keys);
    if (settled) { markPaid(row, settled.id); return true; }
  }
  return false;
}

/** Run once from the editor. Adds the payment columns and the 10-minute reconcile trigger. */
function setupPayments() {
  rzpKeys(); // fails loudly here if the Script Properties are missing
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEETS.booking);
  sheet.getRange(1, COL.orderId, 1, PAY_HEADERS.length).setValues([PAY_HEADERS]).setFontWeight('bold');
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'reconcilePayments')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('reconcilePayments').timeBased().everyMinutes(10).create();
  console.log('Payments ready: columns added, reconcile runs every 10 minutes.');
}

/* ───────────────────────── helpers ───────────────────────── */

function rzpKeys() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('RAZORPAY_KEY_ID');
  const secret = props.getProperty('RAZORPAY_KEY_SECRET');
  if (!id || !secret) throw new Error('Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Project Settings → Script Properties.');
  return { id: id, secret: secret };
}

function rzp(method, path, payload, keys) {
  const opts = {
    method: method,
    headers: { Authorization: 'Basic ' + Utilities.base64Encode(keys.id + ':' + keys.secret) },
    muteHttpExceptions: true,
  };
  if (payload) { opts.contentType = 'application/json'; opts.payload = JSON.stringify(payload); }
  const res = UrlFetchApp.fetch(RZP + path, opts);
  const code = res.getResponseCode();
  const text = res.getContentText();
  let body = {};
  try { body = JSON.parse(text); } catch (err) {}
  return { ok: code >= 200 && code < 300, code: code, body: body, text: text };
}

function findBooking(bookingId) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEETS.booking);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const hit = sheet.getRange(2, COL.id, sheet.getLastRow() - 1, 1).createTextFinder(bookingId).matchEntireCell(true).findNext();
  if (!hit) return null;
  const r = hit.getRow();
  return rowFrom(sheet, r, sheet.getRange(r, 1, 1, COL.paidAt).getValues()[0]);
}

function rowFrom(sheet, r, v) {
  return {
    r: r,
    id: String(v[COL.id - 1]),
    name: String(v[COL.name - 1]),
    email: String(v[COL.email - 1]),
    mobile: String(v[COL.mobile - 1]),
    seats: v[COL.seats - 1],
    status: String(v[COL.status - 1]),
    orderId: String(v[COL.orderId - 1] || ''),
    paymentId: String(v[COL.paymentId - 1] || ''),
    range: (c) => sheet.getRange(r, c),
  };
}

// Razorpay prefill wants the country code: "98765 43210" → "+919876543210"
function contactFor(mobile) {
  const digits = String(mobile).replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (/^\d{10}$/.test(digits)) return '+91' + digits;
  if (/^91\d{10}$/.test(digits)) return '+' + digits;
  return digits;
}

function hmacHex(message, secret) {
  return Utilities.computeHmacSha256Signature(message, secret)
    .map((b) => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
