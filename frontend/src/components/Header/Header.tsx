import { ConnectButton } from "./ConnectButton"

const Header = () => {
  return (
    <header className='fixed left-0 top-0 z-[1] flex h-12 w-full flex-row justify-center border-b-[1px] border-tertiary bg-default px-4 py-2 lg:h-[72px]'>
      <div
        className={
          "flex w-full max-w-[1180px] flex-row items-center justify-between"
        }
      >
        <div className='flex items-center gap-2 py-2'>
          <div className='h-[19px] w-[19px] rounded-full bg-brand-primary' />
          <span className='font-bold text-fg-primary'>BorgPad</span>
        </div>

        <ConnectButton />
        {/* v2: Navbar is already created */}
      </div>
    </header>
  )
}

export default Header
