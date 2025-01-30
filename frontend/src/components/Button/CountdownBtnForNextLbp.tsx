import SmallCountDownTimer from "../SmallCountdownTimer"
import { Icon } from "../Icon/Icon"
import Img from "../Image/Img"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi"
import Text from "@/components/Text"
import { Link } from "react-router-dom"

const CountdownBtnForNextLbp = ({ projectId }: { projectId: string }) => {
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
      <div className="group relative overflow-hidden rounded-[13px] bg-[#abff73]/25 p-[2px] transition-colors hover:bg-[#abff73]/50">
        <div className="animated-conic-gradient absolute z-[-1] animate-rotate-border" />
        <div className="z-[10] flex h-[40px] items-center gap-2 rounded-xl bg-[#16231e] p-3">
          <Img src={projectData?.config.launchedTokenData.iconUrl} size="6" isFetchingLink={isLoading} isRounded />
          <Text text={projectData?.info.title} isLoading={isLoading} className="text-nowrap text-sm" />
          <span className="font-thin opacity-40">|</span>
          <SmallCountDownTimer countdownEventDate={saleOpensDate} labelDuringCountdown="Sale Starts in" />
          <div className="w-[20px]">
            <Icon
              icon="SvgArrowRight"
              className="w-[20px] text-xl opacity-50 transition-transform group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
export default CountdownBtnForNextLbp
