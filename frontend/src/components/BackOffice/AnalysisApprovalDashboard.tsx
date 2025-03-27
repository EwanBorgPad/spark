import React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { backendApi, UpdateAnalysisApproval } from "@/data/backendApi"
import { toast } from "react-toastify"
import { useWalletContext } from "@/hooks/useWalletContext"
import ApproveAnalysisTable from "../Tables/ApproveAnalysisTable"

const AnalysisApprovalDashboard = () => {
  const queryClient = useQueryClient()
  const { address, signMessage } = useWalletContext()

  const { data, isLoading } = useQuery({
    queryFn: () => backendApi.getAnalysisList({ isApproved: false }),
    queryKey: ["getAnalysisList", `isApproved=false`],
    refetchOnWindowFocus: false,
  })
  // API request - postNewAnalysis
  const { mutate: updateAnalysisStatus } = useMutation({
    mutationFn: async (args: UpdateAnalysisApproval) => backendApi.updateAnalysisApproval(args),
    onSuccess: async (_, _variables) => {
      toast.success(`Analysis ${_variables.action}d!`, { theme: "colored" })
      queryClient.invalidateQueries({ queryKey: ["getAnalysisList", `isApproved=false`] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onUpdateStatusSubmit = async ({
    action,
    analysisId,
  }: Pick<UpdateAnalysisApproval, "analysisId" | "action">) => {
    const message = "I confirm I am an admin by signing this message."
    const signature = Array.from(await signMessage(message))
    const auth = { address, message, signature }

    updateAnalysisStatus({ auth, action, analysisId })
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border border-bd-primary p-4">
      <h1 className="text-xl">Analysis for Approval</h1>
      {!isLoading &&
        (data?.analysisList.length ? (
          <ApproveAnalysisTable list={data?.analysisList} onUpdateStatusSubmit={onUpdateStatusSubmit} />
        ) : (
          <span className="text-fg-secondary">No analyses for approval yet.</span>
        ))}
    </div>
  )
}

export default AnalysisApprovalDashboard
