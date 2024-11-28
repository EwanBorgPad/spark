export const getRatioPercentage = (filled: number, total: number) => {
  return Math.floor((filled / total) * 100)
}
export const formatCurrencyAmount = (
  amount: number | undefined,
  withSymbol: boolean = true,
  customDecimals?: number,
) => {
  if (!amount) return undefined
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
  if (!withSymbol) return value.substring(1)
  return value
}

export const capitalizeFirstLetter = (string?: string) => {
  if (!string) return "" // handle empty or undefined strings
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupIntoPairs<T>(targetArray: T[]): ([T, T] | [T])[] {
  return targetArray.reduce(
    (acc, current, index) => {
      if (index % 2 === 0) {
        acc.push([current]) // Start a new subarray
      } else {
        acc[acc.length - 1].push(current) // Add to the last subarray
      }
      return acc
    },
    [] as ([T, T] | [T])[],
  )
}
