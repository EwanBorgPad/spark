import { formatDateForDisplay } from "@/utils/date-helpers"
import { formatCurrencyAmount } from "@/utils/format"
import { Button } from "@/components/Button/Button"
import { useTranslation } from "react-i18next"
import { ProjectData } from "@/data/data"

type WhitelistingLPProps = {
  tgeData: ProjectData["tge"]
}

const WhitelistingLP = ({ tgeData }: WhitelistingLPProps) => {
  const { t } = useTranslation()

  return (
    <div className="relative flex w-full flex-col items-center gap-2 rounded-3xl border border-bd-secondary bg-secondary bg-texture bg-cover p-6 pt-[26px] text-sm text-fg-primary bg-blend-multiply">
      <div className="flex w-full items-center justify-between py-2.5">
        <span>{t("tge.raise_target")}</span>
        <div className="flex gap-2">
          <span className="font-geist-mono">
            {formatCurrencyAmount(tgeData.raiseTarget, false, 0)}
          </span>
          <span>BORG</span>
        </div>
      </div>
      <hr className="w-full border-bd-primary opacity-50"></hr>

      <div className="flex w-full items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <img
            src={tgeData.projectCoin.iconUrl}
            className={"h-[28px] w-[28px] rounded-full object-cover"}
          />
          <span>{tgeData.projectCoin.ticker}</span>
          <span>{t("tge.price")}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-geist-mono">
            {formatCurrencyAmount(tgeData.price.dollarPrice, true, 5)}
          </span>
          <div className="flex gap-2">
            <span className="font-geist-mono">
              {formatCurrencyAmount(tgeData.price.borgPrice, false, 5)}
            </span>
            <span>BORG</span>
          </div>
        </div>
      </div>
      <hr className="w-full border-bd-primary opacity-50"></hr>

      <div className="flex w-full items-center justify-between py-2.5">
        <span>{t("tge.registrations")}</span>
        <span className="font-geist-mono">
          {formatCurrencyAmount(tgeData.registrations, false, 0)}
        </span>
      </div>
      <hr className="w-full border-bd-primary opacity-50"></hr>

      <div className="flex w-full items-center justify-between py-2.5">
        <span>{t("tge.vesting")}</span>
        <span>
          {`${tgeData.vesting.tgePercentage}% TGE, ${tgeData.vesting.cliffPercentage}% cliff`}
        </span>
      </div>
      <hr className="w-full border-bd-primary opacity-50"></hr>

      <div className="flex w-full items-center justify-between py-2.5">
        <span>{t("tge.token_generation_event")}</span>
        <span>{formatDateForDisplay(tgeData.tokenGenerationEventDate)}</span>
      </div>

      <div className="flex w-full flex-col truncate rounded-xl bg-brand-primary/10">
        <span className="py-3 text-center">
          {t("tge.whitelisting.connect_wallet_to_see")}
        </span>
        <Button
          size="xl"
          color="primary"
          className="w-full"
          btnText={t("tge.select_wallet")}
        />
      </div>
    </div>
  )
}

export default WhitelistingLP
