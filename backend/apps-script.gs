/**
 * The Founder Mafia — bookings & pitches backend (Google Apps Script)
 *
 * Saves every seat booking and guest pitch from the website into the Google Sheet
 * "The Founder Mafia — Bookings & Pitches" (tabs: "Seat bookings", "Guest pitches", "Community members").
 *
 * One-time setup (about 2 minutes):
 *   1. Open the Google Sheet → Extensions → Apps Script.
 *   2. Delete what is there, paste this whole file, click Save.
 *   3. Deploy → New deployment → type "Web app".
 *        Execute as: Me        Who has access: Anyone
 *      → Deploy → allow access → copy the "Web app URL".
 *   4. Put that URL in content.js →  booking.endpoint: 'https://script.google.com/macros/s/…/exec'
 *
 * After you change this script, use Deploy → Manage deployments → Edit → Version: New version,
 * so the same URL keeps working.
 */

const SHEETS = {
  booking: 'Seat bookings',
  pitch: 'Guest pitches',
  join: 'Community members',
};
const SEAT_PRICE = 199; // ₹ per seat — keep in sync with content.js

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Spam trap: real people never fill the hidden "website" field.
    if (data.website) return json({ ok: true, id: 'ignored' });

    const type = SHEETS[data.type] ? data.type : 'booking';
    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEETS[type]);
    if (!sheet) return json({ ok: false, error: 'Sheet tab "' + SHEETS[type] + '" not found.' });

    const clean = (v, max) => String(v == null ? '' : v).replace(/^[=+\-@]/, "'$&").trim().slice(0, max || 200);
    const now = new Date();
    const id = ({ pitch: 'P-', join: 'M-', booking: 'S-' })[type] + Utilities.formatDate(now, 'Asia/Kolkata', 'yyMMdd') + '-' +
      Math.random().toString(36).slice(2, 6).toUpperCase();

    if (type === 'booking' || type === 'join') {
      const name = clean(data.name, 80), email = clean(data.email, 120), mobile = clean(data.mobile, 20);
      const age = parseInt(data.age, 10);
      if (!name || !/^\S+@\S+\.\S+$/.test(email) || !/^[0-9+\-\s]{8,16}$/.test(mobile) || !(age >= 13 && age <= 100)) {
        return json({ ok: false, error: 'Please fill in your name, a valid age, email and mobile number.' });
      }
      if (type === 'join') sheet.appendRow([now, id, name, age, email, mobile, clean(data.startup, 120), 'New']);
      else sheet.appendRow([now, id, name, age, email, mobile, clean(data.startup, 120), 1, SEAT_PRICE, 'Pending', false]);
    } else {
      const name = clean(data.name, 80), email = clean(data.email, 120);
      if (!name || !/^\S+@\S+\.\S+$/.test(email)) return json({ ok: false, error: 'Please fill in your name and a valid email.' });
      sheet.appendRow([now, id, name, clean(data.company, 120), email, clean(data.stage, 60), clean(data.story, 4000), 'Pending']);
    }
    return json({ ok: true, id: id });
  } catch (err) {
    return json({ ok: false, error: 'Could not save right now. Please try again.' });
  } finally {
    lock.releaseLock();
  }
}

// GET ?action=stats → how many seats are booked (no personal data), for a "seats left" counter.
function doGet(e) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEETS.booking);
  const booked = sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
  return json({ ok: true, booked: booked });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
