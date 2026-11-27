const vndFormatter = new Intl.NumberFormat("vi-VN");

// 350000 -> "350.000₫"
export function formatVnd(amount: number): string {
  return `${vndFormatter.format(amount)}₫`;
}

const timeParts = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Ho_Chi_Minh",
});

// ISO date -> "24/11 · 16:04" (Vietnam time), or "24/11/2026 · 16:04" with the year.
export function formatOrderTime(iso: string, withYear = false): string {
  const p = Object.fromEntries(timeParts.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.day}/${p.month}${withYear ? `/${p.year}` : ""} · ${p.hour}:${p.minute}`;
}
