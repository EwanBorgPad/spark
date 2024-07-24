import { ConnectButton } from "@/components/Header/ConnectButton"
import { useWalletContext } from "@/hooks/useWalletContext"
import { formatCurrencyAmount } from "@/utils/format"
import { useTranslation } from "react-i18next"
import { Icon } from "@/components/Icon/Icon"
import TokenRewards from "./TokenRewards"

import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi.ts"
import { useProjectDataContext } from "@/hooks/useProjectData.tsx"

const WhitelistingContent = () => {
  const { t } = useTranslation()

  const { walletState } = useWalletContext()
  const { projectData } = useProjectDataContext()
  const tgeData = projectData.tge

  const baseCurrency = "swissborg"
  const targetCurrency = "usd"
  // TODO @hardcoded swissborg coin, replace with project's token later
  const { data: projectTokenData } = useQuery({
    queryFn: () =>
      backendApi.getExchange({
        baseCurrency,
        targetCurrency,
      }),
    queryKey: ["getExchange", baseCurrency, targetCurrency],
  })

  const { data: borgData } = useQuery({
    queryFn: () =>
      backendApi.getExchange({
        baseCurrency,
        targetCurrency,
      }),
    queryKey: ["getExchange", baseCurrency, targetCurrency],
  })

  if (!projectTokenData || !borgData) {
    return null
  }

  const tokenPriceInBORG = projectTokenData.currentPrice / borgData.currentPrice

  return (
    <div
      className={
        "relative flex w-full flex-col items-center gap-2 rounded-3xl border border-bd-secondary bg-secondary bg-texture bg-cover p-4 pt-[26px] text-sm text-fg-primary bg-blend-multiply"
      }
    >
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center justify-start gap-2 text-base">
          <Icon icon="SvgBorgCoin" />
          <p className="flex gap-1">
            <span className="font-geist-mono">1</span>
            <span className="font-geist-mono">BORG</span>
          </p>
          <span className="text-fg-tertiary">Gives you:</span>
        </div>
        <TokenRewards borgCoinInput={"1"} isWhitelistingEvent={true} />
      </div>

      <div className="flex w-full flex-col">
        <div className="flex w-full items-center justify-between py-3">
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
              className={"h-[24px] w-[24px] rounded-full object-cover"}
            />
            <span>{tgeData.projectCoin.ticker}</span>
            <span>{t("tge.price")}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-geist-mono">
              {formatCurrencyAmount(projectTokenData.currentPrice, true, 5)}
            </span>
            <div className="flex gap-2">
              <span className="font-geist-mono">
                {formatCurrencyAmount(tokenPriceInBORG, false, 5)}
              </span>
              <span>BORG</span>
            </div>
          </div>
        </div>
        <hr className="w-full border-bd-primary opacity-50"></hr>

        <div className="flex w-full items-center justify-between py-3">
          <span>{t("tge.registrations")}</span>
          <span className="font-geist-mono">
            {formatCurrencyAmount(tgeData.registrations, false, 0)}
          </span>
        </div>
        <hr className="w-full border-bd-primary opacity-50"></hr>
      </div>

      <div className="flex w-full flex-col">
        <span className="pb-2 pt-3 text-xs font-semibold uppercase text-fg-tertiary">
          {t("tge.liquidity_pool_details")}
        </span>
        <hr className="w-full border-bd-primary opacity-50"></hr>

        <div className="flex w-full items-center justify-between py-3">
          <span>{t("tge.defi_protocol")}</span>
          <div className="flex items-center gap-2">
            <img
              src={tgeData.liquidityPool.iconUrl}
              alt="liquidity pool - defi protocol"
              className="h-5 w-5 rounded-full"
            />
            <span>{tgeData.liquidityPool.name}</span>
          </div>
        </div>
        <hr className="w-full border-bd-primary opacity-50"></hr>

        <div className="flex w-full items-center justify-between py-3">
          <span>{t("tge.lbp_type")}</span>
          <span>{tgeData.liquidityPool.lbpType}</span>
        </div>
        <hr className="w-full border-bd-primary opacity-50"></hr>

        <div className="flex w-full items-center justify-between py-3">
          <span>{t("tge.locking_period")}</span>
          <span>{tgeData.liquidityPool.lockingPeriod}</span>
        </div>
      </div>

      {walletState !== "CONNECTED" && (
        <>
          <div className="mt-2 flex w-full flex-col truncate rounded-xl bg-brand-primary/10">
            <div className="flex w-full flex-col rounded-xl bg-brand-primary/10">
              <span className="max-w-full text-wrap py-3 text-center">
                {t("tge.whitelisting.connect_wallet_to_see")}
              </span>
              <ConnectButton
                btnClassName="text-base py-3"
                customBtnText={t("tge.select_wallet")}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default WhitelistingContent
