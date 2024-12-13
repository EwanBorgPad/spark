type FormatOptions = { withDollarSign?: boolean; customDecimals?: number; customSignificantDecimals?: number }

export const formatCurrencyAmount = (amount: string | number | undefined | null, options: FormatOptions = {}) => {
  if (!amount) return "0"
  const { customDecimals, customSignificantDecimals, withDollarSign } = options
  let decimals: number

  if (!!customDecimals || customDecimals === 0) {
    decimals = customDecimals
  } else {
    const decimalPart = amount.toString().split(".")[1] || ""
    const leadingZeroes = decimalPart.match(/^0+/)?.[0]?.length || 0
    const numOfSignificantDecimals = customSignificantDecimals || 2
    decimals = Math.min(numOfSignificantDecimals + leadingZeroes, 9) // Prevent too large decimals
  }

  const value = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(Number(amount))
  if (!withDollarSign) return value.substring(1)

  return value
}
