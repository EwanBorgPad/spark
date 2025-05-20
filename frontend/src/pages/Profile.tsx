import { ScrollRestoration, useNavigate } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { Input } from "@/components/Input/Input"
import { Icon } from "@/components/Icon/Icon"
import { useLoginWithEmail, useSolanaWallets } from '@privy-io/react-auth';
import { useState, startTransition } from 'react';
import { ROUTES } from "@/utils/routes"
import { useQuery } from "@tanstack/react-query"
import { backendSparkApi } from "@/data/api/backendSparkApi"


const Profile = () => {
  const navigate = useNavigate();
  const { wallets } = useSolanaWallets();
  const address = wallets[0]?.address
  const [userId, setUserId] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userId ? backendSparkApi.getUser({ address: userId }) : Promise.resolve(null),
    enabled: !!userId,
  });

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUserId = e.target.value;
    setUserId(newUserId);
    
    startTransition(() => {
      setUserId(newUserId);
    });
  };

  console.log("user", user)

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
            <span className="text-brand-primary">Profile</span>
          </h2>

          <h2 className="text-xl md:text-2xl text-center mb-12 opacity-75">
            Your Account Details
          </h2>

          <div className="w-full max-w-[400px] space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Icon icon="SvgTwoAvatars" className="text-brand-primary" />
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <p className="text-lg">{user?.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Icon icon="SvgDocument" className="text-brand-primary" />
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-lg">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Icon icon="SvgWalletFilled" className="text-brand-primary" />
                <div>
                  <label className="text-sm font-medium">Wallet Address</label>
                  <p className="text-lg break-all">{user?.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ScrollRestoration />
    </main>
  )
}

export default Profile
