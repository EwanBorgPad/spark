import { format } from "date-fns"

export const formatDateForDisplay = (date: Date) => {
  return format(date, "do MMMM, yyyy")
}
export const formatDateMonthDateHours = (date: Date) => {
  return format(date, "MMMM do, ha")
}
export const formatDateForTimer = (date: Date) => {
  return format(date, "do MMMM, h a")
}
export const formatDateForSnapshot = (date: Date) => {
  return format(date, "do MMMM yyyy, H:m OOOO")
}
export const formatDateAndMonth = (date: Date) => {
  return format(date, "do MMMM")
}
