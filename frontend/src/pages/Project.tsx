import Avatar from "../components/Avatar/Avatar"
import { Button } from "../components/Button/Button"
import { ExternalLink } from "../components/Button/ExternalLink"
import { dummyData } from "../data/data"
import avatarExample from "../assets/avatarExample.png"
import { formatDateForDisplay } from "../utils/date-helpers"
import { Icon } from "../components/Icon/Icon"
import { getRatioPercantage } from "../utils/format"
import ProgressBar from "../components/ProgressBar"

const Project = () => {
  return (
    <main className='z-0 flex w-full flex-col items-center gap-10 px-4 py-[72px] font-normal text-fg-primary lg:max-w-[760px] lg:py-[100px]'>
      <div className='flex w-full flex-col justify-between gap-6 lg:flex-row'>
        <div className='flex flex-col gap-6 lg:flex-row'>
          <Avatar imgUrl={avatarExample} size='large' />
          <div className='flex flex-col gap-1'>
            <h1 className='font-semibold'>{dummyData.title}</h1>
            <span className='text-fg-primary text-opacity-75'>
              {dummyData.subtitle}
            </span>
          </div>
        </div>
        <div className='flex items-start gap-2'>
          {dummyData.projectLinks.map((link, index) => (
            <ExternalLink.Icon key={index} externalLink={link} />
          ))}
        </div>
      </div>

      <div className='flex w-full flex-wrap gap-x-5 gap-y-3 text-sm'>
        <div className='flex gap-5'>
          <div className='flex items-center gap-2 border-r-[1px] border-r-fg-gray-line pr-5'>
            <span className='text-fg-primary text-opacity-50'>Chain</span>
            <img className='h-4 w-4' src={dummyData.chain.picUrl} />
            <span>{dummyData.chain.name}</span>
          </div>
          <div className='flex items-center gap-2 border-r-fg-gray-line pr-5 lg:border-r-[1px] lg:border-fg-primary/50'>
            <span className='text-fg-primary text-opacity-50'>LBP Type</span>
            <span>{dummyData.lbpType}</span>
          </div>
        </div>
        <div className='flex gap-5'>
          <div className='flex items-center gap-2 border-r-[1px] border-r-fg-gray-line pr-5'>
            <span className='text-fg-primary text-opacity-50'>Origin</span>
            <span>{dummyData.origin}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-fg-primary text-opacity-50'>Created</span>
            <span>{formatDateForDisplay(new Date())}</span>
          </div>
        </div>
      </div>

      <div className='flex w-full flex-col gap-3'>
        <h4 className='text-sm font-normal'>Deal curated by</h4>
        <div className='w-full rounded-lg bg-gradient-to-r from-brand-primary/50 to-brand-secondary/15 p-[1px]'>
          <div className='flex h-full w-full flex-col items-start justify-between gap-4 rounded-[7px] bg-gradient-to-br from-brand-dimmed-1 via-brand-dimmed-2 via-50% to-brand-dimmed-2 px-4 py-3 lg:flex-row lg:items-center lg:bg-gradient-to-r'>
            <div className='flex items-center gap-4'>
              <Avatar imgUrl={dummyData.curator.avatarUrl} size='medium' />
              <div className='flex flex-col'>
                <span className='text-base'>{dummyData.curator.fullName}</span>
                <span className='text-sm opacity-50'>
                  {dummyData.curator.position}
                </span>
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              {dummyData.curator.socials.map((social) => (
                <ExternalLink key={social.linkType} externalLink={social} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <hr className='w-full border-bd-primary'></hr>
      <div className='flex w-full max-w-[400px] flex-col gap-[25px]'>
        <div className='mt-[28px] flex w-full justify-between gap-4'>
          <div className='flex flex-1 flex-col gap-2'>
            <span className='text-sm text-fg-tertiary'>Marketcap</span>
            <span className='font-geist-mono text-base text-fg-primary'>
              ${dummyData.marketcap.toFixed(2)}
            </span>
          </div>
          <div className='flex flex-1 flex-col gap-2'>
            <span className='text-sm text-fg-tertiary'>FDV</span>
            <span className='font-geist-mono text-base text-fg-primary'>
              ${dummyData.fdv.toFixed(2)}
            </span>
          </div>
        </div>
        <div className='flex flex-col gap-3 rounded-xl bg-secondary px-4 py-3'>
          <div className='flex w-full items-center justify-between gap-4'>
            <span className='text-base'>Tokens Available</span>
            <div className='flex flex-col items-end'>
              <span className='text-sm text-fg-tertiary'>
                {`${getRatioPercantage(
                  dummyData.tokens.available,
                  dummyData.tokens.total,
                )}%`}
              </span>
              <span className='text-base text-fg-primary'>
                {`${dummyData.tokens.available}/${dummyData.tokens.total}`}
              </span>
            </div>
          </div>
          <ProgressBar tokens={dummyData.tokens} />
        </div>
      </div>

      <hr className='mt-[200px] w-full border-bd-primary'></hr>
      <h2>Icons & Buttons</h2>
      {/* All icons */}
      <div className='flex gap-3 text-xl'>
        <Icon icon='SvgArrowDown' />
        <Icon icon='SvgArrowRight' />
        <Icon icon='SvgBorgCoin' />
        <Icon icon='SvgChartLine' />
        <Icon icon='SvgChevronDown' />
        <Icon icon='SvgDocument' />
        <Icon icon='SvgLinkedin' />
        <Icon icon='SvgLock' />
        <Icon icon='SvgMedium' />
        <Icon icon='SvgTwitter' />
        <Icon icon='SvgWalletFilled' />
        <Icon icon='SvgWeb' />
      </div>
      <div className='flex flex-wrap items-start gap-3'>
        <Button size='xs' color='primary'>
          Label
        </Button>
        <Button size='sm' color='primary'>
          Label
        </Button>
        <Button size='md' color='primary'>
          Label
        </Button>
        <Button size='lg' color='primary'>
          Label
        </Button>
        <Button size='xl' color='primary'>
          Label
        </Button>
      </div>

      <div className='flex flex-wrap items-start gap-3'>
        <Button size='xs' color='secondary'>
          Label
        </Button>
        <Button size='sm' color='secondary'>
          Label
        </Button>
        <Button size='md' color='secondary'>
          Label
        </Button>
        <Button size='lg' color='secondary'>
          Label
        </Button>
        <Button size='xl' color='secondary'>
          Label
        </Button>
      </div>

      <div className='flex flex-wrap items-start gap-3'>
        <Button size='xs' color='tertiary'>
          Label
        </Button>
        <Button size='sm' color='tertiary'>
          Label
        </Button>
        <Button size='md' color='tertiary'>
          Label
        </Button>
        <Button size='lg' color='tertiary'>
          Label
        </Button>
        <Button size='xl' color='tertiary'>
          Label
        </Button>
      </div>

      <div className='flex flex-wrap items-start gap-3'>
        <Button size='xs' color='danger'>
          Label
        </Button>
        <Button size='sm' color='danger'>
          Label
        </Button>
        <Button size='md' color='danger'>
          Label
        </Button>
        <Button size='lg' color='danger'>
          Label
        </Button>
        <Button size='xl' color='danger'>
          Label
        </Button>
      </div>

      <div className='flex flex-wrap items-start gap-3'>
        <Button size='xs' color='plain'>
          Label
        </Button>
        <Button size='sm' color='plain'>
          Label
        </Button>
        <Button size='md' color='plain'>
          Label
        </Button>
        <Button size='lg' color='plain'>
          Label
        </Button>
        <Button size='xl' color='plain'>
          Label
        </Button>
      </div>

      <div className='flex flex-wrap items-start gap-3'>
        <Button size='xs' color='primary'>
          Label
        </Button>
        <Button size='sm' color='primary'>
          Label
        </Button>
        <Button size='md' color='primary'>
          Label
        </Button>
        <Button size='lg' color='primary'>
          Label
        </Button>
        <Button size='xl' color='primary'>
          Label
        </Button>
      </div>
    </main>
  )
}

export default Project
