export const formatCurrencyAmount = (
  amount: number | undefined | null,
  withDollarSign: boolean = true,
  customDecimals?: number,
) => {
  if (!amount) return "0"
  let decimals: number

  if (customDecimals === 0 || !!customDecimals) {
    decimals = customDecimals
  } else {
    const decimalPart = amount.toString().split(".")[1] || ""
    const leadingZeroes = decimalPart.match(/^0+/)?.[0]?.length || 0
    decimals = Math.min(3 + leadingZeroes, 12) // Prevent too large decimals
  }

  const value = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
  if (!withDollarSign) return value.substring(1)
  return value
}
