import React from "react"
import { Button } from "../../Button/Button"
import { ProjectModel } from "shared/models"

interface UpcomingProjectCardProps {
  nextProjectToGoLive: ProjectModel
  currentProjectIndex: number
  upcomingProjects: ProjectModel[]
  goToPreviousProject: () => void
  goToNextProject: () => void
  selectProject: (projectId: string) => void
  formatDate: (date: Date | string | null) => string
}

export const UpcomingProjectCard: React.FC<UpcomingProjectCardProps> = ({
  nextProjectToGoLive,
  currentProjectIndex,
  upcomingProjects,
  goToPreviousProject,
  goToNextProject,
  selectProject,
  formatDate,
}) => {
  return (
    <div className="w-full max-w-3xl bg-bg-secondary p-4 mb-4 rounded-lg border border-bd-secondary">
      <div className="flex justify-between items-center mb-2">
        <button
          className={`p-2 rounded text-xl ${currentProjectIndex === 0 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-bg-tertiary'}`}
          onClick={goToPreviousProject}
          disabled={currentProjectIndex === 0}
        >
          ←
        </button>
        <h2 className="text-xl font-medium">
          {`Upcoming Project ${currentProjectIndex + 1}/${upcomingProjects.length}`}
        </h2>
        <button
          className={`p-2 rounded text-xl ${currentProjectIndex >= upcomingProjects.length - 1 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-bg-tertiary'}`}
          onClick={goToNextProject}
          disabled={currentProjectIndex >= upcomingProjects.length - 1}
        >
          →
        </button>
      </div>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">Project:</span>
          <span>{nextProjectToGoLive.info.title}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Sale Opens:</span>
          <span>
            {(() => {
              const saleOpensDate = nextProjectToGoLive.info.timeline.find(event => event.id === "SALE_OPENS")?.date;
              if (!saleOpensDate) return "N/A";
              const now = new Date()
              return new Date(saleOpensDate) < now ? "LIVE" : formatDate(saleOpensDate);
            })()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Cluster:</span>
          <span>
            {nextProjectToGoLive.config.cluster || "Not set"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">LBP Wallet:</span>
          <span className="truncate">
            {nextProjectToGoLive.config.lbpWalletAddress ? (
              <>
                <a
                  href={`https://solscan.io/account/${nextProjectToGoLive.config.lbpWalletAddress}?cluster=${nextProjectToGoLive.config.cluster || 'devnet'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  {nextProjectToGoLive.config.lbpWalletAddress}
                </a>
              </>
            ) : (
              "Not set"
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">NFT Collection:</span>
          <span className="truncate">
            {nextProjectToGoLive.config.nftConfig?.collection ? (
              <a
                href={`https://solscan.io/token/${nextProjectToGoLive.config.nftConfig.collection}?cluster=${nextProjectToGoLive.config.cluster || 'devnet'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                {nextProjectToGoLive.config.nftConfig.collection}
              </a>
            ) : (
              "Not set"
            )}
          </span>
        </div>
        <Button
          btnText="Select This Project"
          size="sm"
          className="mt-2"
          onClick={() => selectProject(nextProjectToGoLive.id)}
        />
      </div>
    </div>
  )
} 