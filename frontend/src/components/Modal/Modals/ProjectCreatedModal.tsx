import { Link } from "react-router-dom"

import { Button } from "@/components/Button/Button"
import { SimpleModal } from "../SimpleModal"

type Props = {
  onClose: () => void
  projectId: string
}
const ProjectCreatedModal = ({ onClose, projectId }: Props) => {
  return (
    <SimpleModal
      showCloseBtn
      onClose={onClose}
      className="rounded-xl bg-gray-600/80 shadow-sm"
      headerClass="bg-gray-600/80"
    >
      <div className="flex w-full max-w-[460px] flex-col items-center justify-center gap-4 p-8 text-fg-primary max-sm:h-full">
        <span className="text-2xl text-brand-primary">🎉 Project has been created! 🎉</span>
        <span>You can find it at the following link:</span>
        <span className="w-fit rounded-lg bg-secondary px-2 py-1 text-sm ring-1 ring-brand-secondary/50">{`${window.location.origin}/launch-pools/${projectId}`}</span>
        <div className="flex w-full justify-center gap-4 pt-2">
          <Button btnText="Create New Project" color="secondary" size="sm" onClick={onClose} />
          <Link to={`${window.location.origin}/launch-pools/${projectId}`}>
            <Button btnText="Go To Page" size="sm" className="w-[170px]" />
          </Link>
        </div>
      </div>
    </SimpleModal>
  )
}

export default ProjectCreatedModal
