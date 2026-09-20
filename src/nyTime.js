// "Now" in New York, where every ride runs — never the browser's own clock zone.
// Intl ships the tz database, so DST is handled with no library.
const NY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/New_York',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

// A 24h HH:MM, which is what <input type="time"> produces.
export const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export function nyNow(at = new Date()) {
  const p = Object.fromEntries(NY.formatToParts(at).map(({ type, value }) => [type, value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/** `min` for the time input: only today (in New York) has a floor. */
export function minTimeFor(date, at = new Date()) {
  const now = nyNow(at);
  return date === now.date ? now.time : undefined;
}

/** True when date+time is before the current New York minute. ISO strings sort as times. */
export function isPastInNY(date, time, at = new Date()) {
  const now = nyNow(at);
  return `${date}T${time.slice(0, 5)}` < `${now.date}T${now.time}`;
}
