import CountDownTimer from "../CountDownTimer"
import { ProjectData } from "../../data/data"
import WhitelistingLP from "./WhitelistingLP"
import { useTranslation } from "react-i18next"

type Props = {
  data: ProjectData
}

const ProvideLiquiditySection = ({ data }: Props) => {
  const { t } = useTranslation()

  return (
    <section className="relative mt-3 flex w-full max-w-[400px] flex-col items-center rounded-3xl border border-bd-secondary bg-secondary bg-texture-zoomed-out bg-cover bg-blend-multiply">
      <span className="absolute -top-[18px] rounded-full bg-brand-primary px-4 py-2 text-fg-alt-default">
        {t("whitelisting")}
      </span>
      <CountDownTimer endsIn={data.distributionStartDate} />
      <WhitelistingLP data={data.whitelisting} />
    </section>
  )
}

export default ProvideLiquiditySection
