import { format } from "date-fns"

export const formatDateForDisplay = (date: Date) => {
  return format(date, "do MMMM, yyyy")
}
export const formatDateMonthDateHours = (date: Date) => {
  return format(date, "MMMM do, ha")
}
export const formatDateForTimer = (date: Date) => {
  return format(date, "do MMMM, h a (O)")
}
export const formatDateForTimerWithTimezone = (date: Date) => {
  return format(date, "do MMMM, h a OOO")
}
export const formatDateForSnapshot = (date: Date) => {
  return format(date, "do MMM yyyy, h aa (O)")
}
export const formatDateAndMonth = (date: Date) => {
  return format(date, "do MMMM")
}
