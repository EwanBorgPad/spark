import { Button } from "@/components/Button/Button"
import React from "react"
import { Link } from "react-router-dom"
// import { testAnchorJson } from "@/anchor/AnchorJson.ts"
import { initializeLpb } from "../../shared/anchor.ts"

const Homepage = () => {
  return (
    <div className="z-[10] flex h-screen items-center justify-center">
      <Link to={"/project/puffer-finance"}>
        <Button size="xl" color="primary" btnText="Go To Puffer Finance" />
      </Link>
      {/*<Button size="xl" color="primary" btnText="Test Anchor" onClick={testAnchorJson} />*/}
      <Button size="xl" color="primary" btnText="Test Anchor" onClick={async ()=> {
        const me = '5oY4RHVH4PBS3YDCuQ86gnaM27KvdC9232TpB71wLi1W'
        await initializeLpb({
          args: {
            uid: 118,
            projectOwner: me,
            projectTokenMint: me,
            projectTokenLpDistribution: 50, // Example percentage
            projectMaxCap: 1_000_000,
            userTokenMint: me,
            userMinCap: 100,
            userMaxCap: 10_000,
            fundCollectionPhaseStartTime: new Date(1_700_000_000 * 1000),
            fundCollectionPhaseEndTime: new Date(1_710_000_000 * 1000),
            lpLockedPhaseLockingTime: new Date(1_720_000_000 * 1000),
            lpLockedPhaseVestingTime: new Date(1_730_000_000 * 1000),
            bump: 1,
          },
          adminSecretKey: '229,115,145,93,61,101,91,135,44,216,28,212,190,37,97,147,22,163,118,213,87,124,189,238,24,24,169,167,226,178,154,242,252,218,231,172,153,149,10,93,77,180,135,172,10,40,84,48,20,155,243,242,111,172,188,220,238,204,30,208,74,243,71,75'.split(',').map(Number),
        })
      }} />
    </div>
  )
}

export default Homepage
