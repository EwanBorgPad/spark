import CurrencyInput, { CurrencyInputProps } from "react-currency-input-field"
import { FieldError, UseFormSetError } from "react-hook-form"
import { formatCurrencyAmount } from "shared/utils/format"

type FormInputs = {
  borgInputValue: string
}

type Props = {
  minValue: number // USD value
  maxValue: number // USD value
  onChange: (event: unknown) => void
  setError: UseFormSetError<FormInputs>
  error?: FieldError
  clearError: () => void
  borgPriceInUSD: number | null
} & CurrencyInputProps

// type OnChangeParameters = {value: string | undefined, name?: string, values?: CurrencyInputOnChangeValues}

const LiveNowInput = ({
  minValue,
  maxValue,
  onChange,
  setError,
  clearError,
  error,
  borgPriceInUSD,
  ...props
}: Props) => {
  const maxBorgInput = borgPriceInUSD ? maxValue / borgPriceInUSD : 0

  const onChangeHandler = (newValue: string | undefined) => {
    onChange(newValue)
    if (!newValue) return
    if (+newValue > maxBorgInput) {
      onChange(maxBorgInput.toFixed(2).toString())
      return
    }
    clearError()
  }

  const equivalentUsdValue = formatCurrencyAmount(borgPriceInUSD && props.value ? +props.value * borgPriceInUSD : 0, {
    withDollarSign: true,
  })

  return (
    <div className="flex flex-col items-start">
      <CurrencyInput
        value={props.value}
        allowNegativeValue={false}
        placeholder="0"
        maxLength={16}
        autoFocus
        className={"max-w-[242px] bg-transparent text-2xl focus:outline-none"}
        decimalsLimit={6}
        onValueChange={onChangeHandler}
        {...props}
      />
      <span className="text-fg-tertiary">{equivalentUsdValue}</span>
      {error && <span className="text-fg-error-primary">{error.message}</span>}
    </div>
  )
}

export default LiveNowInput
