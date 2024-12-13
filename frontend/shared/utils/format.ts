type FormatOptions = { withDollarSign?: boolean; customDecimals?: number }

export const formatCurrencyAmount = (amount: string | number | undefined | null, options: FormatOptions = {}) => {
  if (!amount) return "0"
  const { customDecimals, withDollarSign } = options
  let decimals = 2

  if (!!customDecimals || customDecimals === 0) {
    decimals = customDecimals
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
