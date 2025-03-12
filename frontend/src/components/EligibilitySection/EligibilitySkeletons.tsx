import { twMerge } from "tailwind-merge"
import Text from "@/components/Text"
import SimpleLoader from "../Loaders/SimpleLoader"
import { Button } from "../Button/Button"
import { useProjectDataContext } from "@/hooks/useProjectData"

const ComplianceSkeleton = () => {
  return (
    <div
      className={twMerge(
        "flex w-full flex-col justify-start gap-1 rounded-lg border-b-[1px] border-b-bd-primary bg-emphasis p-4 text-sm",
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <Text isLoading={true} className="h-[20px] max-w-[220px]" />
        <SimpleLoader className="text-lg opacity-50" />
      </div>
      <div className="mt-2 flex w-full justify-start">
        <Button color="secondary" size="xs" className="w-[118px] rounded-lg px-3" disabled>
          <Text isLoading={true} />
        </Button>
      </div>
    </div>
  )
}
export const TierQuestSkeleton = () => {
  return (
    <div
      className={twMerge(
        "flex w-full flex-col justify-start gap-1 rounded-lg border-b-[1px] border-b-bd-primary bg-emphasis p-4 text-sm",
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <Text isLoading={true} className="h-[18px] max-w-[220px]" />
        <SimpleLoader className="max-h-[20px] text-lg opacity-50" />
      </div>
    </div>
  )
}

export const TierSkeletonContainer = () => {
  const { projectData, isFetching } = useProjectDataContext()

  // arbitrary number of quests before projectData is fetched
  const skeletonArray = Array.from({ length: 3 }, (_, i) => i)

  if (isFetching) {
    return (
      <>
        <div className="flex w-full flex-col gap-2 rounded-lg p-2">
          <Text isLoading className="!max-w-[240px]" />
          <div className="flex flex-col gap-2 rounded-2xl">
            {skeletonArray.map((item) => (
              <Skeleton.TierQuest key={item} />
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 rounded-lg p-2">
          <Text isLoading className="!max-w-[240px]" />
          <div className="flex flex-col gap-2 rounded-2xl">
            {skeletonArray.map((item) => (
              <Skeleton.TierQuest key={item} />
            ))}
          </div>
        </div>
      </>
    )
  }

  return projectData?.info?.tiers.map((tier) => {
    return (
      // tier container
      <div key={tier.id} className="flex flex-col gap-2 rounded-lg p-2">
        <span>{tier.label}</span>
        {tier.description && <span className="text-xs text-fg-secondary">{tier.description}</span>}
        <div className="flex flex-col gap-2 rounded-2xl">
          {/* singular tier */}
          {tier.quests.map((_, index) => (
            <Skeleton.TierQuest key={index} />
          ))}
        </div>
      </div>
    )
  })
}

export const Skeleton = {
  Compliance: ComplianceSkeleton,
  TierQuest: TierQuestSkeleton,
}
