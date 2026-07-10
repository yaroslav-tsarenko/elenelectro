export function formatPrice(
  amount: number | string,
  currency: string = "EUR",
  locale: string = "en-US"
): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(numericAmount);
}
