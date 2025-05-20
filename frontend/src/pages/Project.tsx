import { ScrollRestoration } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { useProjectDataContext } from "@/hooks/useProjectData"
import backdropImg from "@/assets/backdropImgMin.png"
import Img from "@/components/Image/Img"
import Text from "@/components/Text"
import { Icon } from "@/components/Icon/Icon"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
// import TokenChart from "@/components/TokenChart/TokenChart"
// import TokenStats from "@/components/TokenStats/TokenStats"
// import DAOInfo from "@/components/DAOInfo/DAOInfo"

const Project = () => {
  const { id } = useParams()
  const { projectData, isLoading } = useProjectDataContext()
  const { t } = useTranslation()

  return (
    <main className="z-[10] flex w-full max-w-full select-none flex-col items-center gap-4 overflow-y-hidden py-[72px] font-normal text-fg-primary md:py-[100px]">
      <div className="max-w-screen absolute left-0 top-10 z-[-11] w-full overflow-hidden md:top-16">
        <img src={backdropImg} className="h-[740px] min-w-[1440px] md:h-auto md:w-screen" />
      </div>

      <section className="flex w-full flex-col items-center gap-8 px-4 md:max-w-[792px]">
        {/* Header with logo and name */}
        <div className="flex w-full items-center gap-4">
          <Img
            src={projectData?.info.logoUrl}
            isFetchingLink={isLoading}
            imgClassName="scale-[102%]"
            isRounded={true}
            size="20"
          />
          <div className="flex flex-col gap-1">
            <Text
              text={projectData?.info.title || `Project ${id}`}
              as="h1"
              className="font-semibold"
              isLoading={isLoading}
              loadingClass="max-w-[120px]"
            />
            <Text
              text={projectData?.info.subtitle || `$${id}`}
              as="span"
              className="text-fg-primary text-opacity-75"
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Price Chart */}
        <div className="w-full rounded-lg bg-bg-secondary p-4">
          <div className="h-[300px] flex items-center justify-center">
            <Text text="Price Chart Coming Soon" as="p" className="text-fg-primary text-opacity-75" />
          </div>
        </div>

        {/* Description */}
        <div className="w-full">
          <Text
            text="Project details coming soon. Check back later for more information."
            as="p"
            className="text-fg-primary text-opacity-90"
            isLoading={isLoading}
          />
        </div>

        {/* DAO Info */}
        <div className="w-full">
          {/* <DAOInfo /> */}
        </div>

        {/* Token Stats */}
        <div className="w-full rounded-lg bg-bg-secondary p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text text="Market Cap" as="h3" className="text-fg-primary text-opacity-75" />
              <Text text="Coming Soon" as="p" className="font-semibold" />
            </div>
            <div>
              <Text text="Token Price" as="h3" className="text-fg-primary text-opacity-75" />
              <Text text="Coming Soon" as="p" className="font-semibold" />
            </div>
          </div>
        </div>
      </section>

      <ScrollRestoration />
    </main>
  )
}

export default Project
