import React from "react"
import Logo from "../Logo"
import { Link } from "react-router-dom"
import { ExternalLink } from "../Button/ExternalLink"
import backdropImg from "@/assets/backdropImgMin.png"
import { Button } from "../Button/Button"
import { useTranslation } from "react-i18next"
import { twMerge } from "tailwind-merge"

type Props = {
  showBackground?: boolean
}

const Footer = ({ showBackground = true }: Props) => {
  const { t } = useTranslation()
  return (
    <footer
      className={twMerge(
        "relative flex h-[300px] w-full flex-col items-center justify-center overflow-hidden border-t border-t-bd-primary",
        !showBackground && "border-none",
      )}
    >
      {showBackground && (
        <div className="max-w-screen absolute bottom-0 left-0 -z-[0] w-full rotate-180 overflow-hidden">
          <img
            src={backdropImg}
            className="h-[740px] min-w-[1440px] lg:h-auto lg:w-screen"
          />
        </div>
      )}
      <div className="z-[0] flex flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Logo />
          <span className="text-sm">© 2024</span>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <Link to="/terms-of-service">
            <Button
              color="plain"
              btnText={t("terms_of_service")}
              className="text-sm font-normal"
            />
          </Link>
          <div className="h-5 border-l-[1px] border-l-fg-primary/50"></div>
          <ExternalLink.Icon
            externalLink={{ linkType: "X_TWITTER", url: "#" }}
            className="mx-2 h-[1em] w-[1em] border-none p-0 text-3xl"
            iconClassName="text-xl"
          />
        </div>
      </div>
    </footer>
  )
}

export default Footer
