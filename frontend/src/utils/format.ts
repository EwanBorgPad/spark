export const getRatioPercentage = (filled: number, total: number) => {
  return Math.floor((filled / total) * 100)
}
export const formatCurrencyAmount = (
  amount: number,
  withSymbol: boolean = true,
  decimals: number = 2,
) => {
  const value = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: decimals,
  }).format(amount)
  if (!withSymbol) return value.substring(1)
  return value
}
