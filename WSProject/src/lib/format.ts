const vndFormatter = new Intl.NumberFormat("vi-VN");

// 350000 -> "350.000₫"
export function formatVnd(amount: number): string {
  return `${vndFormatter.format(amount)}₫`;
}
