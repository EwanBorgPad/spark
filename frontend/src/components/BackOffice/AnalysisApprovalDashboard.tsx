import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { backendApi, UpdateAnalysisApproval } from "@/data/api/backendApi"
import { toast } from "react-toastify"
import { useWalletContext } from "@/hooks/useWalletContext"
import ApproveAnalysisTable from "../Tables/ApproveAnalysisTable"
import { Button } from "../Button/Button"
import { Icon } from "../Icon/Icon"
import ManuallyAddAnalysisModal from "../Modal/Modals/ManuallyAddAnalysisModal"

const AnalysisApprovalDashboard = () => {
  const queryClient = useQueryClient()
  const { address, signMessage } = useWalletContext()
  const [displayModal, setDisplayModal] = useState(false)

  // API request - postNewAnalysis
  const { mutate: updateAnalysisStatus } = useMutation({
    mutationFn: async (args: UpdateAnalysisApproval) => backendApi.updateAnalysisApproval(args),
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onUpdateStatusSubmit = async ({
    action,
    analysisId,
    queryKey,
  }: Pick<UpdateAnalysisApproval, "analysisId" | "action"> & { queryKey: string[] }) => {
    const message = "I confirm I am an admin by signing this message."
    const signature = Array.from(await signMessage(message))
    const auth = { address, message, signature }

    updateAnalysisStatus(
      { auth, action, analysisId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey })
          toast.success(`Analysis ${action}d!`, { theme: "colored" })
        },
      },
    )
  }

  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border border-bd-primary p-4">
      <div className="flex w-full justify-between">
        <div className="flex flex-col items-start">
          <h1 className="text-xl">Analysis for Approval</h1>
          <span className="text-xs text-fg-secondary">
            Note: <em className="underline">Impressions</em> & <em className="underline">Likes</em> stats are NOT real
            time. They are fetched periodically.
          </span>
        </div>
        <Button
          onClick={() => setDisplayModal(true)}
          prefixElement={<Icon icon="SvgPlus" className="text-xl" />}
          btnText="Add Analysis"
          color="tertiary"
        />
      </div>
      {displayModal && <ManuallyAddAnalysisModal onClose={() => setDisplayModal(false)} />}
      <ApproveAnalysisTable onUpdateStatusSubmit={onUpdateStatusSubmit} />
    </div>
  )
}

export default AnalysisApprovalDashboard
