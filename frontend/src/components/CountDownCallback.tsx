import { useCountDown } from "@/hooks/useCountDown"

type Props = {
  endOfEvent: Date
  callbackWhenTimeExpires: () => void
}

const CountDownCallback = ({ endOfEvent, callbackWhenTimeExpires }: Props) => {
  useCountDown(endOfEvent, callbackWhenTimeExpires)
  return null
}

export default CountDownCallback
