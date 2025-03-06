import { Icon } from "../Icon/Icon"
import CountdownBtnForNextLbp from "../Button/CountdownBtnForNextLbp"

const HeroCtaSection = () => {
  return (
    <div className="z-[2] flex w-full flex-col md:items-center justify-center gap-6">
      {/* <CountdownBtnForNextLbp projectId="bitdoctor" /> */}
      <div className="flex flex-col items-center gap-3">
        <span className="text-left md:text-center text-sm text-fg-secondary">Follow us to hear announcements for the upcoming projects</span>
        <div className="flex gap-4 flex-row flex-wrap items-start md:items-center md:justify-center">
          <a
            href={"https://t.me/borgpad"}
            target={"_blank"}
            rel="noreferrer"
            className={
              "group flex items-center justify-center gap-2 rounded-xl border-[1px] border-bd-primary bg-[#060a1440] px-4 py-2 text-fg-primary backdrop-blur hover:bg-[#20212168] active:scale-[98%]"
            }
          >
            <Icon icon={"SvgTelegram"} className={"text-2xl leading-none"} />
            <span className="text-nowrap text-sm font-medium">Join Our Telegram</span>
          </a>
          <a
            href={"https://x.com/BorgPadHQ"}
            target={"_blank"}
            rel="noreferrer"
            className={
              "group flex items-center md:justify-center gap-2 rounded-xl border-[1px] border-bd-primary bg-[#060a1440] px-4 py-2 text-fg-primary backdrop-blur hover:bg-[#20212168] active:scale-[98%] min-w-[187px]"
            }
          >
            <Icon icon={"SvgTwitter"} className={"text-2xl leading-none"} />
            <span className="text-nowrap text-sm font-medium">Follow us on X</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default HeroCtaSection
