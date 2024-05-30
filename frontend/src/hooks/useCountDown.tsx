import { useEffect, useState } from "react"

const calculateTimeLeft = (endOfEvent: Date) =>
  endOfEvent.getTime() - Date.now()

export const useCountDown = (
  endOfEvent: Date,
  callbackWhenTimeExpires: () => void,
) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endOfEvent))

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(endOfEvent))
  }, [endOfEvent])

  useEffect(() => {
    if (timeLeft <= 0) {
      callbackWhenTimeExpires()
      return
    }
    const timerId = setTimeout(() => {
      setTimeLeft((prev) => prev - 1000)
    }, 1000)

    return () => {
      clearTimeout(timerId)
    }
  })
}
