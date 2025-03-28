import AnalysisTable from "@/components/Tables/AnalysisTable"
import { SimpleModal } from "../SimpleModal"
import { GetListOfAnalysisResponse } from "shared/schemas/analysis-schema"
import AnalysisCard from "@/components/Tables/AnalysisCard"
import { useProjectDataContext } from "@/hooks/useProjectData"

type Props = {
  onClose: () => void
  analysisList: GetListOfAnalysisResponse["analysisList"] | undefined
}

const ProjectAnalysisModal = ({ onClose, analysisList }: Props) => {
  const { projectData } = useProjectDataContext()

  return (
    <SimpleModal
      showCloseBtn
      onClose={onClose}
      className="relative w-full max-w-[840px] overflow-y-hidden bg-default"
      headerClass="bg-default"
    >
      <div className="flex max-h-[90vh] w-full flex-col items-center overflow-y-auto px-4 pb-[40px] md:max-h-[90vh] md:overflow-y-hidden md:px-[40px] md:pb-6">
        <span className="mb-3 text-center text-2xl font-semibold text-white">
          See what CT&apos;s sharpest minds have to say
        </span>
        <span className="mb-[36px] text-center text-base font-normal text-fg-secondary">
          All analyses are personal opinions and not financial advice.
        </span>

        {/* desktop component */}
        {projectData?.id && <AnalysisTable projectId={projectData.id} />}

        {/* mobile component */}
        <div className="flex w-full flex-col gap-4 md:hidden">
          {analysisList?.map((item) => <AnalysisCard key={item.analysis.id} card={item} />)}
        </div>
      </div>
    </SimpleModal>
  )
}

export default ProjectAnalysisModal
