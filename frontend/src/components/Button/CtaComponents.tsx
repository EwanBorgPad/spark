import SmallCountDownTimer from "../SmallCountdownTimer"
import { Icon } from "../Icon/Icon"
import Img from "../Image/Img"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi"
import Text from "@/components/Text"
import { Link } from "react-router-dom"

export const CtaComponentForLp = ({ projectId }: { projectId: string }) => {
  const { data: projectData, isLoading } = useQuery({
    queryFn: () => backendApi.getProject({ projectId }),
    queryKey: ["backendApi", "getProject", projectId],
    enabled: Boolean(projectId),
  })

  if ((!isLoading && !projectData) || !projectId) {
    return <></>
  }

  const saleOpensDate = projectData?.info.timeline.find((tgeEvent) => tgeEvent.id === "SALE_OPENS")?.date
  if (!saleOpensDate) return <></>

  return (
    <Link to={`/launch-pools/${projectId}`}>
      <div className="relative overflow-hidden rounded-[13px] bg-[#abff73]/25 p-[2px]">
        <div className="animated-conic-gradient absolute z-[-1] animate-rotate-border" />
        <div className="z-[10] flex h-[40px] items-center gap-2 rounded-xl bg-[#16231e] p-3">
          <Img src={projectData?.config.launchedTokenData.iconUrl} size="6" isFetchingLink={isLoading} isRounded />
          <Text text={projectData?.info.title} isLoading={isLoading} className="text-nowrap text-sm" />
          <span className="font-thin opacity-40">|</span>
          <SmallCountDownTimer countdownEventDate={saleOpensDate} labelDuringCountdown="Sale Starts in" />
          <div className="w-[20px]">
            <Icon icon="SvgArrowRight" className="w-[20px] text-xl opacity-50" />
          </div>
        </div>
      </div>
    </Link>
  )
}

type UpcomingLpCtaProps = {
  logoUrl: string
  projectName: string
  projectUrl: string
}

export const UpcomingLpCta = ({ logoUrl, projectName, projectUrl }: UpcomingLpCtaProps) => {
  return (
    <section className="mt-10 flex w-full max-w-[400px] flex-col items-center gap-6">
      <h3 className="z-[1] px-4 text-center text-3xl font-semibold  leading-tight">Upcoming Launch Pool</h3>
      <Link to={projectUrl} className="w-full">
        <div className="relative w-full overflow-hidden rounded-[13px] bg-[#abff73]/25 p-[1px]">
          <div className="animated-conic-gradient absolute z-[-1] animate-rotate-border" />
          <div className="z-[10] flex h-[40px] items-center justify-between gap-2 rounded-xl bg-[#16231e] p-3">
            <div className="flex items-center gap-3">
              <Img src={logoUrl} size="6" isRounded />
              <Text text={projectName} isLoading={false} className="text-nowrap text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-normal">Get Whitelisted</span>
              <div className="w-[20px]">
                <Icon icon="SvgArrowRight" className="w-[20px] text-xl opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </section>
  )
}
