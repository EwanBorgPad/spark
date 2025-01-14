import CurrencyInput, { CurrencyInputProps } from "react-currency-input-field"
import { FieldError, UseFormSetError } from "react-hook-form"
import { formatCurrencyAmount } from "shared/utils/format"

type FormInputs = {
  borgInputValue: string
}

type Props = {
  minBorgInput: number
  maxBorgInput: number
  onChange: (event: unknown) => void
  setError: UseFormSetError<FormInputs>
  error?: FieldError
  clearError: () => void
  borgPriceInUSD: number | null
} & CurrencyInputProps

// type OnChangeParameters = {value: string | undefined, name?: string, values?: CurrencyInputOnChangeValues}

const LiveNowInput = ({
  minBorgInput,
  maxBorgInput,
  onChange,
  setError,
  clearError,
  error,
  borgPriceInUSD,
  ...props
}: Props) => {
  const onChangeHandler = (newValue: string | undefined) => {
    onChange(newValue)
    if (!newValue) return
    if (+newValue > maxBorgInput) {
      {
        /* @MOEMATE - removed this for Moemate launch since sale is in USDC */
      }
      // onChange(maxBorgInput.toFixed(2).toString())
      onChange(maxBorgInput.toString())
      return
    }
    clearError()
  }

  {
    /* @MOEMATE - remove this for Moemate launch since sale is in USDC */
  }
  // const equivalentUsdValue = formatCurrencyAmount(borgPriceInUSD && props.value ? +props.value * borgPriceInUSD : 0, {
  //   withDollarSign: true,
  // })

  return (
    <div className="flex flex-col items-start">
      <CurrencyInput
        value={props.value}
        allowNegativeValue={false}
        placeholder="0"
        maxLength={16}
        // @MOEMATE - added this for Moemate launch since sale is in USDC
        allowDecimals={false}
        autoFocus
        className={"max-w-[242px] bg-transparent text-2xl focus:outline-none"}
        decimalsLimit={0}
        onValueChange={onChangeHandler}
        {...props}
      />
      {/* @MOEMATE - removed this for Moemate launch since sale is in USDC */}
      {/* <span className="text-fg-tertiary">{equivalentUsdValue}</span> */}
      {error && <span className="text-fg-error-primary">{error.message}</span>}
    </div>
  )
}

export default LiveNowInput
