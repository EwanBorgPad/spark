import React, { useState } from 'react'
import Img from '../Image/Img';
import { formatNumber } from 'react-tweet';
import { Button } from '../Button/Button';
import { twMerge } from 'tailwind-merge';
import BecomeAnAnalystModal from '../Modal/Modals/BecomeAnAnalystModal';

const DUMMY_AVATAR = "https://files.staging.borgpad.com/images/madagascar-social-yacht-club/curator-avatar-295950502"
const dummyLength = 24
const dummyArray = Array.from({ length: dummyLength }, (_, i) => `Item ${i + 1}`);

type Props = {
  isFullWidth?: boolean
}

const Analysts = ({ isFullWidth }:Props) => {
  const [showBecomeAnalystModal, setShowBecomeAnalystModal] = useState(true)

  return (
    <div className="flex flex-[1] flex-col items-start gap-3 w-full max-w-[792px]">
      <h4 className="text-sm font-normal">Analyzed by</h4>
      <div className="w-full flex flex-col rounded-lg border-[1px] border-bd-secondary p-[1px] py-3 px-4 gap-4 bg-default">
        <div className="flex flex-wrap gap-1">
          {dummyArray.map(item => <Img size='6' isRounded key={item} src={DUMMY_AVATAR} />)}
        </div>
        <div className={twMerge("flex w-full gap-4 flex-col", isFullWidth ? "md:flex-row" : "")}>
          <div className="flex w-full gap-4">
            <div className="flex flex-col flex-1">
              <span className='text-fg-tertiary text-sm'>Analysts</span>
              <span className='text-fg-primary'>{dummyLength}</span>
            </div>
            <div className="flex flex-col flex-1">
              <span className='text-fg-tertiary text-sm'>Impressions</span>
              <span className='text-fg-primary'>{formatNumber(123113)}</span>
            </div>
            <div className="flex flex-col flex-1">
              <span className='text-fg-tertiary text-sm'>Likes</span>
              <span className='text-fg-primary'>{dummyLength}</span>
            </div>
          </div>
          <div className="flex w-full gap-4 flex-wrap items-end">
            <Button btnText='View Analyses' color='tertiary' className='h-fit text-sm flex-[1] py-2' onClick={() => setShowBecomeAnalystModal(true)} />
            <Button btnText='Become an Analyst' color='plain' className='h-fit text-sm flex-[1] py-2' onClick={() => setShowBecomeAnalystModal(true)} />
          </div>
        </div>
      </div>
      {showBecomeAnalystModal && <BecomeAnAnalystModal onClose={() => setShowBecomeAnalystModal(false)} />}
    </div>
  )
}

export default Analysts