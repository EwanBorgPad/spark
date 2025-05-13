import { Button } from "@/components/Button/Button"
import { useState } from "react"

import { Icon } from "@/components/Icon/Icon"
import UpdateProjectJson from "@/components/BackOffice/UpdateProjectJson"
import { useWalletContext } from "@/hooks/useWalletContext"
import { ConnectButton } from "@/components/Header/ConnectButton"
import AnalysisApprovalDashboard from "@/components/BackOffice/AnalysisApprovalDashboard"
import AfterSaleUpdate from "@/components/BackOffice/AfterSaleUpdate"
import ProjectStatus from "@/components/BackOffice/ProjectStatus"
import TokenDistribution from "@/components/BackOffice/TokenDistribution"

const BACK_OFFICE_FEATURES = ["AFTER_SALE_UPDATE", "UPDATE_JSON_FILE", "PROJECT_STATUS", "TOKEN_DISTRIBUTION"] as const
type BackOfficeFeatureType = (typeof BACK_OFFICE_FEATURES)[number]

const BackOfficeDashboard = () => {
  const { isWalletConnected } = useWalletContext()

  const [renderedFeature, setRenderedFeature] = useState<BackOfficeFeatureType | null>(null)

  const renderFeature = () => {
    if (renderedFeature === "AFTER_SALE_UPDATE") {
      return <AfterSaleUpdate />
    } else if (renderedFeature === "UPDATE_JSON_FILE") {
      return <UpdateProjectJson />
    } else if (renderedFeature === "PROJECT_STATUS") {
      return <ProjectStatus />
    } else if (renderedFeature === "TOKEN_DISTRIBUTION") {
      return <TokenDistribution />
    }
  }

  return (
    <div className="relative flex min-h-[70vh] w-full max-w-[1400px] flex-col gap-6 px-20 py-4 pt-[86px]">
      {/* Header */}
      {!renderedFeature && (
        <header className="flex w-full items-center justify-between p-4 pt-5 shadow">
          <h1 className="w-full text-center text-2xl font-semibold">Back Office Dashboard</h1>
        </header>
      )}

      {isWalletConnected ? (
        <div className="flex flex-1 flex-col gap-4">
          {/* Content Area */}
          {!renderedFeature ? (
            <div className="flex w-full flex-col gap-6">
              <div className="flex w-full gap-4">
                <div
                  className="flex max-w-[300px] flex-1 cursor-pointer justify-center rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-primary/30 p-10 ring-[1px] ring-brand-primary/40 hover:bg-brand-secondary/40"
                  onClick={() => setRenderedFeature("AFTER_SALE_UPDATE")}
                >
                  <span className="w-full text-center text-xl">💸 After Sale Update</span>
                </div>
                <div
                  className="flex max-w-[300px] flex-1 cursor-pointer justify-center rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-primary/30 p-10 ring-[1px] ring-brand-primary/40 hover:bg-brand-secondary/40"
                  onClick={() => setRenderedFeature("UPDATE_JSON_FILE")}
                >
                  <span className="w-full text-center text-xl">📝 Update JSON files</span>
                </div>
                <div
                  className="flex max-w-[300px] flex-1 cursor-pointer justify-center rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-primary/30 p-10 ring-[1px] ring-brand-primary/40 hover:bg-brand-secondary/40"
                  onClick={() => setRenderedFeature("PROJECT_STATUS")}
                >
                  <span className="w-full text-center text-xl">✅ Projects Status</span>
                </div>
                <div
                  className="flex max-w-[300px] flex-1 cursor-pointer justify-center rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-primary/30 p-10 ring-[1px] ring-brand-primary/40 hover:bg-brand-secondary/40"
                  onClick={() => setRenderedFeature("TOKEN_DISTRIBUTION")}
                >
                  <span className="w-full text-center text-xl">💰 Token Distribution</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute left-[10%] top-[100px] z-[11]">
              <Button
                btnText="Back"
                color="tertiary"
                onClick={() => setRenderedFeature(null)}
                prefixElement={<Icon icon="SvgArrowLeft" />}
              />
            </div>
          )}
          {renderFeature()}
          {!renderedFeature && <AnalysisApprovalDashboard />}
        </div>
      ) : (
        <div className="flex justify-center">
          <ConnectButton btnClassName="px-10 py-2" customBtnText="Connect Admin Wallet" />
        </div>
      )}
    </div>
  )
}

export default BackOfficeDashboard
