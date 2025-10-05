// lib/slots.js

export function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export function alignSlots(windowStart, windowEnd, slotMinutes) {
  const slots = [];
  const stepMs = slotMinutes * 60 * 1000;
  let cursor = new Date(windowStart.getTime());
  while (cursor.getTime() + stepMs <= windowEnd.getTime()) {
    const end = new Date(cursor.getTime() + stepMs);
    slots.push({ start: new Date(cursor), end });
    cursor = end;
  }
  return slots;
}

/** ISO helper (UTC). Keep UI aware to render local TZ. */
export function toISO(d) {
  return new Date(d).toISOString();
}
