import { ScrollRestoration, useNavigate } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { Input } from "@/components/Input/Input"
import { Icon } from "@/components/Icon/Icon"
import { useLoginWithEmail } from '@privy-io/react-auth';
import { useLoginWithOAuth } from '@privy-io/react-auth';
import { Provider, useState } from 'react';
import { ROUTES } from "@/utils/routes"


const Connection = () => {
  const navigate = useNavigate();


  const [email, setEmail] = useState('');
  const { sendCode } = useLoginWithEmail();
  const { state, loading } = useLoginWithOAuth();

  const { initOAuth } = useLoginWithOAuth({
    onComplete: ({ user, isNewUser }) => {
      console.log('User logged in successfully', user);
      if (isNewUser) {
        navigate(ROUTES.USERNAME)
      } else {
        navigate(ROUTES.LANDING_PAGE)
      }
    },
    onError: (error) => {
      console.error('Login failed', error);
    }
  });


  return (
    <main className="relative z-[10] flex min-h-screen w-full max-w-[100vw] flex-col items-center bg-accent pt-[48px] font-normal text-fg-primary lg:pt-[72px]">
      <section className="z-[1] flex h-full w-full flex-1 flex-col items-center justify-between px-5 pb-[60px] pt-10 md:pb-[56px] md:pt-[40px]">
        <div className="flex w-full flex-col items-center mt-[15vh]">
          <h1 className="text-[40px] font-medium leading-[48px] tracking-[-0.4px] md:text-[68px] md:leading-[74px] mb-4">
            <span className="text-brand-primary">Spark-it</span>
          </h1>

          <h2 className="text-xl md:text-2xl text-center mb-12 opacity-75">
            Make your idea become real
          </h2>

          <div className="w-full max-w-[400px] space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter your email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="your@email.com"
                className="w-full"
              />
              <p className="text-sm text-fg-secondary">We&apos;ll use this to create your account</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-bd-primary"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-accent px-2 text-fg-secondary">Or connect with</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  initOAuth({ provider: 'google' })
                }}
                size="lg"
                className="flex-1 bg-black hover:bg-gray-900"
                textClassName="text-black"
              >
                <Icon icon="SvgGoogle" className="text-xl text-fg-primary" />
              </Button>
              <Button
                onClick={() => {
                  initOAuth({ provider: 'twitter' });
                }}
                size="lg"
                className="flex-1 bg-black hover:bg-gray-900"
                textClassName="text-white"
              >
                <Icon icon="SvgTwitter" className="text-xl text-fg-primary" />
              </Button>
              <Button
                onClick={() => {
                  initOAuth({ provider: 'apple' });
                }}
                size="lg"
                className="flex-1 bg-black hover:bg-gray-900"
                textClassName="text-white"
              >
                <Icon icon="SvgApple" className="text-xl text-fg-primary" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 w-full max-w-[400px]">
          <Button
            onClick={() => {
              sendCode({ email })
              navigate(ROUTES.EMAIL_CONNECTION)
            }}
            btnText="Continue"
            size="xl"
            className={twMerge(
              "mt-[2px] w-full px-7 py-4 text-lg font-medium leading-normal md:mt-[24px]",
            )}
            textClassName="text-sm font-medium"
          />
        </div>
      </section>
      <ScrollRestoration />
    </main>
  )
}

export default Connection
