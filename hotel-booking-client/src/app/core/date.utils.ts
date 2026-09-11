// პატარა დამხმარე ფუნქციები თარიღებისთვის.
// <input type="date"> "yyyy-MM-dd" ფორმატს იყენებს.

export function toInputDate(d: Date): string {
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day   = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function today(): string {
  return toInputDate(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toInputDate(d);
}

// ღამეების რაოდენობა ორ თარიღს შორის
export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const nights = Math.round(ms / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
}
