import { ScrollRestoration, useNavigate } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { Input } from "@/components/Input/Input"
import { Icon } from "@/components/Icon/Icon"
import { useLoginWithEmail } from '@privy-io/react-auth';
import { useState } from 'react';
import { ROUTES } from "@/utils/routes"
import { useQuery } from "@tanstack/react-query"
import { GetTokensResponse } from "shared/models"
import { backendSparkApi } from "@/data/api/backendSparkApi"
import Img from "@/components/Image/Img"

const Projects = () => {
  const { data: sparksData, isLoading: sparksLoading, refetch: sparksRefetch } = useQuery<GetTokensResponse>({
    queryFn: () =>
      backendSparkApi.getTokens({
        isGraduated: "false",
      }),
    queryKey: ["getTokens", "isGraduated", "false"],
  })
  const { data: blazesData, isLoading: blazesLoading, refetch: blazesRefetch } = useQuery<GetTokensResponse>({
    queryFn: () =>
      backendSparkApi.getTokens({
        isGraduated: "true",
      }),
    queryKey: ["getTokens", "isGraduated", "true"],
  })

  console.log(sparksData)
  console.log(blazesData)
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sparks');

  return (
    <main className="relative z-[10] flex min-h-screen w-full max-w-[100vw] flex-col items-center bg-accent pt-[48px] font-normal text-fg-primary lg:pt-[72px]">
      <div className="absolute left-4 top-4 z-50">
        <Button
          onClick={() => {
            navigate(ROUTES.PROFILE)
          }}
          size="lg"
          className="flex-1 bg-brand-primary hover:bg-brand-primary/80"
        >
          <Icon icon="SvgGear" className="text-xl text-fg-primary" />
        </Button>
      </div>
      <div className="absolute right-4 top-4 z-50">
        <Button
          onClick={() => {
            navigate(ROUTES.SEARCH)
          }}
          size="lg"
          className="flex-1 bg-brand-primary hover:bg-brand-primary/80"
        >
          <Icon icon="SvgLoupe" className="text-xl text-fg-primary" />
        </Button>
      </div>
      <section className="z-[1] flex h-full w-full flex-1 flex-col items-center justify-between px-5 pb-[60px] pt-10 md:pb-[56px] md:pt-[40px]">
        <div className="flex w-full flex-col items-center">
          <h2 className="text-[40px] font-medium leading-[48px] tracking-[-0.4px] md:text-[68px] md:leading-[74px] mb-4">
            <span className="text-brand-primary">Explore</span>
          </h2>

          <img 
            src="/src/assets/landing-page-banner.png" 
            alt="Explore Banner"
            className="w-full max-w-[800px] h-[250px] mb-6 object-cover rounded-lg"
          />

          {/* Mobile Tabs */}
          <div className="flex md:hidden w-full mb-4">
            <button
              className={twMerge(
                "flex-1 py-2 text-sm font-vcr border-b-2 transition-colors uppercase",
                activeTab === 'sparks'
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-fg-secondary"
              )}
              onClick={() => setActiveTab('sparks')}
            >
              Sparks
            </button>
            <button
              className={twMerge(
                "flex-1 py-2 text-sm font-vcr border-b-2 transition-colors uppercase",
                activeTab === 'blazes'
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-fg-secondary"
              )}
              onClick={() => setActiveTab('blazes')}
            >
              Blazes
            </button>
          </div>

          {/* Content for Mobile Tabs */}
          <div className="md:hidden w-full mt-4">
            {activeTab === 'sparks' ? (
              <div className="bg-default rounded-lg overflow-hidden">
                <div className="w-full">
                  <h3 className="text-2xl font-medium mb-6">Sparks</h3>
                  <div className="grid gap-6">
                    {sparksData?.tokens.map((token) => (
                      <div 
                        key={token.mint} 
                        className="flex items-center gap-4 p-4 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors"
                        onClick={() => navigate(`${ROUTES.PROJECTS}/${token.mint}`)}
                      >
                        <Img
                          src={token.imageUrl}
                          isFetchingLink={sparksLoading}
                          imgClassName="w-16 h-16 rounded-full object-cover"
                          isRounded={true}
                          size="20"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{token.name}</h4>
                          <div className="flex gap-4 text-sm opacity-75">
                            <span>Market Cap: $1.2M</span>
                            <span>Token Price: $0.12</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-default rounded-lg overflow-hidden">
                <div className="w-full">
                  <h3 className="text-2xl font-medium mb-6">Blazes</h3>
                  <div className="grid gap-6">
                    {blazesData?.tokens.map((token) => (
                      <div 
                        key={token.mint} 
                        className="flex items-center gap-4 p-4 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors"
                        onClick={() => navigate(`${ROUTES.PROJECTS}/${token.mint}`)}
                      >
                        <Img
                          src={token.imageUrl}
                          isFetchingLink={blazesLoading}
                          imgClassName="w-16 h-16 rounded-full object-cover"
                          isRounded={true}
                          size="20"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{token.name}</h4>
                          <div className="flex gap-4 text-sm opacity-75">
                            <span>Market Cap: $1.5M</span>
                            <span>Token Price: $0.15</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex w-full gap-4">
            {/* Sparks Section */}
            <div className="w-full">
              <h3 className="text-2xl font-medium mb-6">Sparks</h3>
              <div className="grid gap-6">
                {sparksData?.tokens.map((token) => (
                  <div 
                    key={token.mint} 
                    className="flex items-center gap-4 p-4 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors"
                    onClick={() => navigate(`${ROUTES.PROJECTS}/${token.mint}`)}
                  >
                    <Img
                      src={token.imageUrl}
                      isFetchingLink={sparksLoading}
                      imgClassName="w-16 h-16 rounded-full object-cover"
                      isRounded={true}
                      size="20"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{token.name}</h4>
                      <div className="flex gap-4 text-sm opacity-75">
                        <span>Market Cap: $1.2M</span>
                        <span>Token Price: $0.12</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blazes Section */}
            <div className="w-full">
              <h3 className="text-2xl font-medium mb-6">Blazes</h3>
              <div className="grid gap-6">
                {blazesData?.tokens.map((token) => (
                  <div 
                    key={token.mint} 
                    className="flex items-center gap-4 p-4 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors"
                    onClick={() => navigate(`${ROUTES.PROJECTS}/${token.mint}`)}
                  >
                    <Img
                      src={token.imageUrl}
                      isFetchingLink={blazesLoading}
                      imgClassName="w-16 h-16 rounded-full object-cover"
                      isRounded={true}
                      size="20"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{token.name}</h4>
                      <div className="flex gap-4 text-sm opacity-75">
                        <span>Market Cap: $1.5M</span>
                        <span>Token Price: $0.15</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <ScrollRestoration />
    </main>
  )
}

export default Projects
