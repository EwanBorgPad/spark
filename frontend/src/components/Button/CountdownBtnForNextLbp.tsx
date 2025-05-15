import SmallCountDownTimer from "../SmallCountdownTimer"
import { Icon } from "../Icon/Icon"
import Img from "../Image/Img"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/api/backendApi"
import Text from "@/components/Text"
import { Link } from "react-router-dom"
import { getProjectRoute } from "@/utils/routes"

const CountdownBtnForNextLbp = () => {
  const { data: projectsData, isLoading } = useQuery({
    queryFn: () => backendApi.getProjects({
      page: 1,
      limit: 99,
      projectType: "launch-pool",
      completionStatus: "active",
      sortBy: "date",
      sortDirection: "asc"
    }),
    queryKey: ["getProjects", "launch-pool", "active", "date", "asc"],
  })

  if (isLoading || !projectsData?.projects?.length) {
    return <></>
  }

  const now = new Date()

  // Find projects that are either:
  // 1. Upcoming (SALE_OPENS in the future)
  // 2. Currently active (SALE_OPENS in the past but SALE_CLOSES in the future)
  const nextProject = projectsData.projects.find(project => {
    const saleOpensDate = project.info.timeline.find((tgeEvent) => tgeEvent.id === "SALE_OPENS")?.date
    const saleClosesDate = project.info.timeline.find((tgeEvent) => tgeEvent.id === "SALE_CLOSES")?.date
    
    if (!saleOpensDate) return false

    const opensDate = new Date(saleOpensDate)
    const closesDate = saleClosesDate ? new Date(saleClosesDate) : null

    // Project is upcoming if SALE_OPENS is in the future
    if (opensDate > now) return true

    // Project is active if SALE_OPENS is in the past and SALE_CLOSES is in the future
    if (opensDate <= now && closesDate && closesDate > now) return true

    return false
  })

  if (!nextProject) {
    return <></>
  }

  const saleOpensDate = nextProject.info.timeline.find((tgeEvent) => tgeEvent.id === "SALE_OPENS")?.date
  const saleClosesDate = nextProject.info.timeline.find((tgeEvent) => tgeEvent.id === "SALE_CLOSES")?.date

  // Determine which countdown to show
  const opensDate = saleOpensDate ? new Date(saleOpensDate) : null
  const closesDate = saleClosesDate ? new Date(saleClosesDate) : null

  let countdownDate: Date | null = null
  let countdownLabel = ""

  if (opensDate && opensDate > now) {
    countdownDate = opensDate
    countdownLabel = "Sale Starts in"
  } else if (closesDate && closesDate > now) {
    countdownDate = closesDate
    countdownLabel = "Sale Ends in"
  }

  return (
    <Link to={getProjectRoute(nextProject)}>
      <div className="group relative min-w-full overflow-hidden rounded-[13px] bg-[#abff73]/25 p-[2px] transition-colors hover:bg-[#abff73]/50 md:min-w-[328px] md:max-w-[520px]">
        <div className="animated-conic-gradient absolute z-[-1] animate-rotate-border" />
        <div className="z-[10] flex h-[40px] items-center justify-between gap-2 rounded-xl bg-[#16231e] p-3">
          <div className="flex items-center gap-2">
            <Img src={nextProject?.info?.logoUrl} size="6" isFetchingLink={isLoading} isRounded />
            <Text text={nextProject?.info.title} isLoading={isLoading} className="text-nowrap text-sm" />
            <span className="font-thin opacity-40">|</span>
            {countdownDate ? (
              <SmallCountDownTimer countdownEventDate={countdownDate} labelDuringCountdown={countdownLabel} />
            ) : (
              <span className="opacity-40">Get Whitelisted</span>
            )}
          </div>
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
