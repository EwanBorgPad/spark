import { useCountDown } from "@/hooks/useCountDown"

export type CountDownType = {
  endOfEvent: Date
  callbackWhenTimeExpires?: () => void
  callbackAsPerInterval?: () => void
  interval?: number // interval in milliseconds
}

export const CountDownCallback = ({
  endOfEvent,
  callbackWhenTimeExpires,
}: CountDownType) => {
  useCountDown({ endOfEvent, callbackWhenTimeExpires })
  return null
}
