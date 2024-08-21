export const getRatioPercentage = (filled: number, total: number) => {
  return Math.floor((filled / total) * 100)
}
export const formatCurrencyAmount = (
  amount: number | undefined,
  withSymbol: boolean = true,
  decimals: number = 2,
) => {
  if (!amount) return undefined
  const value = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: decimals,
  }).format(amount)
  if (!withSymbol) return value.substring(1)
  return value
}


export const capitalizeFirstLetter = (string?: string) => {
  if (!string) return "" // handle empty or undefined strings
  return string.charAt(0).toUpperCase() + string.slice(1)
}