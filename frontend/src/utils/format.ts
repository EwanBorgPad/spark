export const getRatioPercantage = (filled: number, total: number) => {
  return Math.floor((filled / total) * 100)
}
