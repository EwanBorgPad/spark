import React, { ChangeEvent, useLayoutEffect, useRef, useState } from "react"
import { SimpleModal } from "../SimpleModal"
import { twMerge } from "tailwind-merge"
import { Icon } from "@/components/Icon/Icon"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { ContributionAndRewardsType } from "@/data/contributionAndRewardsData"
import { formatCurrencyAmount } from "@/utils/format"
import { CustomInputSlider } from "@/components/InputField/CustomInputSlider"
import { Button } from "@/components/Button/Button"

type ClaimYourPositionModalProps = {
  onClose: () => void
  mainPosition: ContributionAndRewardsType["claimPositions"]["mainPosition"]
}

const claimBtnValues = [25, 50, 75, 100]

const ClaimYourPositionModal = ({
  onClose,
  mainPosition,
}: ClaimYourPositionModalProps) => {
  const numberInputRef = useRef<HTMLInputElement>(null)
  const [claimPercent, setClaimPercent] = useState<number>(100)
  const { projectData } = useProjectDataContext()

  const claimChosenValueHandler = () => {
    console.log("Claim amount: ", claimPercent)
    // @TODO - add API for claiming main position
    onClose()
  }

  useLayoutEffect(() => {
    if (!numberInputRef.current?.clientWidth) return
    if (claimPercent < 10) numberInputRef.current.style.width = 1 + "ch"
    if (claimPercent >= 10 && claimPercent < 20)
      numberInputRef.current.style.width = 17 + "px"
    if (claimPercent >= 20 && claimPercent < 100)
      numberInputRef.current.style.width = 2 + "ch"
    if (claimPercent >= 100) numberInputRef.current.style.width = 3 + "ch"
  }, [claimPercent])

  const onNumberInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!numberInputRef.current?.clientWidth) return
    const inputValue = +event.target.value.toString()
    if (inputValue > 100) {
      setClaimPercent(100)
      return
    }
    if (inputValue < 0) {
      setClaimPercent(0)
      return
    }
    setClaimPercent(inputValue)
  }

  const availableForClaim = {
    borg: mainPosition.borg.total - mainPosition.borg.claimed,
    projectTokens:
      mainPosition.projectTokens.total - mainPosition.projectTokens.claimed,
  }
  const toBeClaimed = {
    borg: (availableForClaim.borg * claimPercent) / 100,
    projectTokens: (availableForClaim.projectTokens * claimPercent) / 100,
  }

  return (
    <SimpleModal showCloseBtn={true} onClose={onClose} className="bg-secondary">
      <div className="flex w-full max-w-[460px] flex-col items-center justify-center max-sm:h-full">
        <>
          {/* Heading */}
          <div className="w-full p-4 text-center">
            <h1 className="text-body-xl-semibold text-white">
              Claim Your Main Position
            </h1>
          </div>
          {/* Body */}
          <div
            className={twMerge(
              "flex w-full grow flex-col justify-start gap-5 px-6 pb-10 pt-3",
            )}
          >
            <p className="text-center text-base text-fg-tertiary">
              Select how much do you want to claim
            </p>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 flex-col items-start justify-start gap-[34px] rounded-lg border border-bd-primary bg-tertiary p-4">
                <div className="flex items-center justify-center gap-2">
                  <Icon icon="SvgBorgCoin" className="text-xl" />
                  <div className="text-base font-medium leading-tight text-neutral-100">
                    BORG
                  </div>
                </div>
                <div className="flex flex-col items-start justify-start gap-2 self-stretch">
                  <div className="flex flex-col items-start justify-center self-stretch">
                    <div className="text-lg font-medium leading-snug text-neutral-100">
                      {formatCurrencyAmount(toBeClaimed.borg, false)}
                    </div>
                    <div className="text-base font-medium leading-snug text-neutral-400">
                      /{formatCurrencyAmount(availableForClaim.borg, false)}
                    </div>
                  </div>
                  {!!mainPosition.borg.claimed && (
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-medium text-fg-secondary">
                        Already Claimed:
                      </span>
                      <span className="text-sm text-fg-tertiary">
                        {formatCurrencyAmount(mainPosition.borg.claimed, false)}
                        /{formatCurrencyAmount(mainPosition.borg.total, false)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Icon icon="SvgPlus" className="rounded-full text-fg-disabled" />
              <div className="flex flex-1 flex-col items-start justify-start gap-[34px] rounded-lg border border-bd-primary bg-tertiary p-4">
                <div className="flex items-center justify-center gap-2">
                  <img
                    src={projectData.tge.projectCoin.iconUrl}
                    className="h-5 w-5 object-cover"
                  />
                  <span className="text-base font-medium leading-tight text-neutral-100">
                    {projectData.tge.projectCoin.ticker}
                  </span>
                </div>
                <div className="flex flex-col items-start justify-start gap-2 self-stretch">
                  <div className="flex flex-col items-start justify-center self-stretch">
                    <div className="text-lg font-medium leading-snug text-neutral-100">
                      {formatCurrencyAmount(toBeClaimed.projectTokens, false)}
                    </div>
                    <div className="text-base font-medium leading-snug text-neutral-400">
                      /
                      {formatCurrencyAmount(
                        availableForClaim.projectTokens,
                        false,
                      )}
                    </div>
                  </div>
                  {!!mainPosition.borg.claimed && (
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-medium text-fg-secondary">
                        Already Claimed:
                      </span>
                      <span className="text-sm text-fg-tertiary">
                        {formatCurrencyAmount(
                          mainPosition.projectTokens.claimed,
                          false,
                        )}
                        /
                        {formatCurrencyAmount(
                          mainPosition.projectTokens.total,
                          false,
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col gap-5">
              <CustomInputSlider
                value={claimPercent}
                setValue={setClaimPercent}
              />
              <div className="flex justify-between gap-2">
                <div className="flex-1 rounded-lg border-[1px] border-bd-primary bg-default py-3.5 text-center text-fg-primary">
                  <input
                    ref={numberInputRef}
                    type="number"
                    className="w-fit max-w-[26px] bg-transparent text-base text-white outline-none"
                    value={Number(claimPercent).toString()}
                    onChange={onNumberInputChange}
                    max={100}
                    step={1}
                    min={0}
                  />
                  %
                </div>
                {claimBtnValues.map((value) => (
                  <Button
                    key={value}
                    btnText={`${value}%`}
                    color="secondary"
                    size="md"
                    className="flex-1 rounded-lg bg-secondary px-0 py-3"
                    onClick={() => setClaimPercent(value)}
                  />
                ))}
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-3">
              <Button
                onClick={claimChosenValueHandler}
                size="lg"
                className="w-full py-3 font-normal"
                btnText={"Claim"}
              />
              <span className="text-fg-tertiary">
                The transaction will continue in your wallet.
              </span>
            </div>
          </div>
        </>
      </div>
    </SimpleModal>
  )
}

export default ClaimYourPositionModal
