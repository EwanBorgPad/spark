import { ScrollRestoration, useNavigate } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { Input } from "@/components/Input/Input"
import { Icon } from "@/components/Icon/Icon"
import { useLoginWithEmail } from '@privy-io/react-auth';
import { useState } from 'react';
import { ROUTES } from "@/utils/routes"


const Profile = () => {
  const navigate = useNavigate();

  return (
    <main className="relative z-[10] flex min-h-screen w-full max-w-[100vw] flex-col items-center bg-accent pt-[48px] font-normal text-fg-primary lg:pt-[72px]">
      <div className="absolute left-4 top-4 z-50">
        <Button
          onClick={() => {
            navigate(ROUTES.PROJECTS)
          }}
          size="lg"
          className="flex-1 bg-brand-primary hover:bg-brand-primary/80"
        >
          <Icon icon="SvgArrowLeft" className="text-xl text-fg-primary" />
        </Button>
      </div>
      <section className="z-[1] flex h-full w-full flex-1 flex-col items-center justify-between px-5 pb-[60px] pt-10 md:pb-[56px] md:pt-[40px]">
        <div className="flex w-full flex-col items-center mt-[15vh]">
          <h2 className="text-[40px] font-medium leading-[48px] tracking-[-0.4px] md:text-[68px] md:leading-[74px] mb-4">
            <span className="text-brand-primary">Search</span>
          </h2>

          <h2 className="text-xl md:text-2xl text-center mb-12 opacity-75">
            Search for projects
          </h2>

          <div className="w-full max-w-[400px] space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Landing Page</label>
            </div>
          </div>
        </div>
      </section>
      <ScrollRestoration />
    </main>
  )
}

export default Profile
