import { useState } from "react"
import { TextField } from "../InputField/TextField"
import { twMerge } from "tailwind-merge"
import { Button } from "../Button/Button"

const EnterReferralCode = () => {
  const [referralCode, setReferralCode] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  // @TODO - add mutate query for submitting referral. Don't forget to add prefix "@" for twitter handle
  const handleSubmitReferral = () => {}

  const isBtnDisplayed = isFocused || referralCode

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="relative flex w-full">
        <TextField
          containerClassName=""
          inputClassName={isBtnDisplayed ? "pl-[21px]" : ""}
          value={referralCode}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setReferralCode(e.target.value)}
          placeholder={!isFocused ? "Enter your referrer's X handle" : ""}
        />
        <div
          className={twMerge(
            "absolute left-2 top-0 hidden h-10 items-center text-fg-primary transition-opacity",
            isBtnDisplayed && "flex",
          )}
        >
          @
        </div>
      </div>
      {
        <Button
          // @TODO - Add API call handler
          onClick={handleSubmitReferral}
          // @TODO - Add isLoading status below
          isLoading={false}
          disabled={isBtnDisplayed ? false : true}
          className={twMerge(
            isBtnDisplayed ? "opacity-100" : "!hover:cursor-default !cursor-default opacity-0 hover:opacity-0",
          )}
          btnText="Submit"
          size="sm"
        />
      }
    </div>
  )
}

export default EnterReferralCode
