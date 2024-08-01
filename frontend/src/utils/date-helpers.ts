import { format } from "date-fns/format"

export const formatDateForDisplay = (date: Date) => {
  return format(date, "do MMMM, yyyy")
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

