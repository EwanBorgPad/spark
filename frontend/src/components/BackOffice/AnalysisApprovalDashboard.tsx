import React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { backendApi, UpdateAnalysisApproval } from "@/data/backendApi"
import { toast } from "react-toastify"
import { useWalletContext } from "@/hooks/useWalletContext"
import ApproveAnalysisTable from "../Tables/ApproveAnalysisTable"

const AnalysisApprovalDashboard = () => {
  const queryClient = useQueryClient()
  const { address, signMessage } = useWalletContext()

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
      <h1 className="text-xl">Analysis for Approval</h1>
      <span className="text-xs text-fg-secondary">
        Note: <em className="underline">Impressions</em> & <em className="underline">Likes</em> stats are real time.
        They are fetched periodically.
      </span>
      <ApproveAnalysisTable onUpdateStatusSubmit={onUpdateStatusSubmit} />
    </div>
  )
}

export default AnalysisApprovalDashboard
