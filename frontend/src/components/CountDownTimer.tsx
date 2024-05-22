import { differenceInDays } from "date-fns"
import { differenceInHours } from "date-fns/differenceInHours"
import { differenceInMilliseconds } from "date-fns/differenceInMilliseconds"
import { differenceInMinutes } from "date-fns/differenceInMinutes"
import { isAfter } from "date-fns/isAfter"
import { isBefore } from "date-fns/isBefore"
import { millisecondsToHours } from "date-fns/millisecondsToHours"
import { millisecondsToMinutes } from "date-fns/millisecondsToMinutes"
import { subDays } from "date-fns/subDays"
import { subHours } from "date-fns/subHours"
import { useEffect, useState } from "react"

type CountDownTimerProps = {
  endsIn: Date
}

type TUseTimer = {
  days: string
  hours: string
  minutes: string
  seconds: string
}

const DAYS_IN_MS = 1000 * 60 * 60 * 24
const HOURS_IN_MS = 1000 * 60 * 60
const MIN_IN_MS = 1000 * 60
const SEC_IN_MS = 1000

const formatNumber = (num: number) => {
  return num < 10 ? `0${num}` : `${num}`
}

const getCountdownTime = (timeLeft: number): TUseTimer => {
  const days = Math.floor(timeLeft / DAYS_IN_MS) // Give the remaining days
  timeLeft -= days * DAYS_IN_MS // Subtract passed days
  const hours = Math.floor(timeLeft / HOURS_IN_MS) // Give remaining hours
  timeLeft -= hours * HOURS_IN_MS // Subtract hours
  const minutes = Math.floor(timeLeft / MIN_IN_MS) // Give remaining minutes
  timeLeft -= minutes * MIN_IN_MS // Subtract minutes
  const seconds = Math.floor(timeLeft / SEC_IN_MS) // Give remaining seconds
  return {
    days: formatNumber(days),
    hours: formatNumber(hours),
    minutes: formatNumber(minutes),
    seconds: formatNumber(seconds),
  }
}

const CountDownTimer = ({ endsIn }: CountDownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(endsIn.getTime() - Date.now())

  const isEventFinished = isAfter(new Date(), endsIn)
  useEffect(() => {
    if (isEventFinished) return
    const timerId = setTimeout(() => {
      setTimeLeft((prev) => prev - 1000)
    }, 1000)

    return () => {
      clearTimeout(timerId)
    }
  })
  const { days, hours, minutes, seconds } = getCountdownTime(timeLeft)

  return (
    <div className="flex h-[120px] w-full flex-col items-center rounded-t-xl bg-[radial-gradient(50%_65%_at_50%_0%,rgba(188,254,143,0.15)_0%,rgba(0,0,0,0.0)_100%)] pt-8">
      <span className="text-sm text-fg-primary/60">Distribution starts in</span>
      {isEventFinished ? (
        <span className="text-xl text-fg-primary/60">Distribution ended</span>
      ) : (
        <div className="flex items-start font-geist-mono text-2xl">
          <div className="flex flex-col items-center">
            <span className="font-semibold">{days}</span>
            <span className="text-[10px] leading-none opacity-60">days</span>
          </div>
          <span className="opacity-50">:</span>
          <div className="flex flex-col items-center">
            <span className="font-semibold">{hours}</span>
            <span className="text-[10px] leading-none opacity-60">hrs</span>
          </div>
          <span className="opacity-50">:</span>
          <div className="flex flex-col items-center">
            <span className="font-semibold">{minutes}</span>
            <span className="text-[10px] leading-none opacity-60">mins</span>
          </div>
          <span className="opacity-50">:</span>
          <div className="flex flex-col items-center">
            <span className="font-semibold">{seconds}</span>
            <span className="text-[10px] leading-none opacity-60">secs</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CountDownTimer
