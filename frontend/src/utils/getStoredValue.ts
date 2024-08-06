export const getStoredValue = (key: string) => {
  const storedValue = localStorage.getItem(key)
  if (!storedValue) return
  return JSON.parse(storedValue)
}
