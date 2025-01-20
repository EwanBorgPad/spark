import CurrencyInput, { CurrencyInputProps } from "react-currency-input-field"
import { FieldError, UseFormSetError } from "react-hook-form"
import { formatCurrencyAmount } from "shared/utils/format"

type FormInputs = {
  raisedTokenInputValue: string
}

type Props = {
  minRaisedTokenInput: number
  maxRaisedTokenInput: number
  onChange: (event: unknown) => void
  setError: UseFormSetError<FormInputs>
  error?: FieldError
  clearError: () => void
  raisedTokenPriceInUSD: number | null
} & CurrencyInputProps

const LiveNowInput = ({
  minRaisedTokenInput,
  maxRaisedTokenInput,
  onChange,
  setError,
  clearError,
  error,
  raisedTokenPriceInUSD,
  ...props
}: Props) => {
  const onChangeHandler = (newValue: string | undefined) => {
    onChange(newValue)
    if (!newValue) return
    if (+newValue > maxRaisedTokenInput) {
      onChange(maxRaisedTokenInput)
      return
    }
    clearError()
  }

  const equivalentUsdValue = formatCurrencyAmount(
    raisedTokenPriceInUSD && props.value ? +props.value * raisedTokenPriceInUSD : 0,
    {
      withDollarSign: true,
    },
  )

  return (
    <div className="flex flex-col items-start">
      <CurrencyInput
        value={props.value}
        allowNegativeValue={false}
        placeholder="0"
        maxLength={16}
        allowDecimals={true}
        autoFocus
        className={"max-w-[242px] bg-transparent text-2xl focus:outline-none"}
        decimalsLimit={0}
        onValueChange={onChangeHandler}
        {...props}
      />
      <span className="text-fg-tertiary">{equivalentUsdValue}</span>
      {error && <span className="text-fg-error-primary">{error.message}</span>}
    </div>
  )
}

export default LiveNowInput
