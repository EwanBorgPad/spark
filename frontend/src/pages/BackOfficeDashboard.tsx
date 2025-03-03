import { Button } from "@/components/Button/Button"
import { useState } from "react"
import BackOffice2 from "./BackOffice2"
import { Icon } from "@/components/Icon/Icon"
import UpdateProjectJson from "@/components/BackOffice/UpdateProjectJson"

const BACK_OFFICE_FEATURES = ["UPDATE_PROJECT_AFTER_SALE", "UPDATE_JSON_FILE"] as const
type BackOfficeFeatureType = (typeof BACK_OFFICE_FEATURES)[number]

const BackOfficeDashboard = () => {
  const [renderedFeature, setRenderedFeature] = useState<BackOfficeFeatureType | null>(null)

  const renderFeature = () => {
    if (renderedFeature === "UPDATE_PROJECT_AFTER_SALE") {
      return <BackOffice2 />
    } else if (renderedFeature === "UPDATE_JSON_FILE") {
      return <UpdateProjectJson />
    }
  }

  const isStagingOrDevelop = import.meta.env.VITE_ENVIRONMENT_TYPE === "develop"

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 px-20 py-4 pt-[86px]">
      <div className="flex flex-1 flex-col">
        {/* Header */}

        {/* Content Area */}
        {!renderedFeature ? (
          <div className="flex w-full flex-col gap-6">
            <header className="flex max-w-[400px] items-center justify-between p-4 shadow">
              <h1 className="text-2xl font-semibold">Back Office Dashboard</h1>
            </header>
            <div className="flex w-full gap-4">
              <div
                className="flex max-w-[300px] flex-1 cursor-pointer justify-center rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-primary/30 p-10 ring-[1px] ring-brand-primary/40 hover:bg-brand-secondary/40"
                onClick={() => setRenderedFeature("UPDATE_PROJECT_AFTER_SALE")}
              >
                <span className="w-full text-center text-base">Update Project After Sale</span>
              </div>
              {isStagingOrDevelop && (
                <div
                  className="flex max-w-[300px] flex-1 cursor-pointer justify-center rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-primary/30 p-10 ring-[1px] ring-brand-primary/40 hover:bg-brand-secondary/40"
                  onClick={() => setRenderedFeature("UPDATE_JSON_FILE")}
                >
                  <span className="w-full text-center text-base">Update JSON files</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex">
            <Button
              btnText="BACK"
              color="secondary"
              onClick={() => setRenderedFeature(null)}
              prefixElement={<Icon icon="SvgArrowLeft" />}
            />
          </div>
        )}
        {renderFeature()}
      </div>
    </div>
  )
}

export default BackOfficeDashboard
