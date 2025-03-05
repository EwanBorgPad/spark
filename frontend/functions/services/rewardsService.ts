import { addMonths } from "date-fns/addMonths"
import { ProjectModel } from "../../shared/models"


const getPayoutSchedule = (project: ProjectModel, rewardsTotalAmount: number, rewardsDistributionStart: Date) => {
    const launchedTokenDecimals = project.config.launchedTokenData.decimals

    const rewardDistribution = getRewardDistributionConfig(project)

    const payoutOnTgeDay = rewardDistribution.atTge.rewardRatio * rewardsTotalAmount
    const payoutAfterTgeDay = rewardDistribution.afterTge.rewardRatio * rewardsTotalAmount
    const numberOfPaymentsAfterTgeDay = rewardDistribution.afterTge.numberOfPayments

    const claimablePerMonthAfterTge = payoutAfterTgeDay / numberOfPaymentsAfterTgeDay
    console.log({ claimablePerMonthAfterTge, rewardsTotalAmount })

    const payoutAtTge = {
      amount: String(payoutOnTgeDay / Math.pow(10, launchedTokenDecimals)),
      // TODO @claimsStreamFlowIntegration
      isClaimed: false,
      date: rewardsDistributionStart,
    }
    const payoutsAfterTge = [
      ...Array(numberOfPaymentsAfterTgeDay).keys(),
    ].map((index) => {
      const payoutDate = addMonths(new Date(rewardsDistributionStart), index + 1)
      return {
        amount: String(claimablePerMonthAfterTge / Math.pow(10, launchedTokenDecimals)),
        // TODO @claimsStreamFlowIntegration
        isClaimed: false,
        date: payoutDate,
      }
    })
    const payoutSchedule = [payoutAtTge, ...payoutsAfterTge]

    return { payoutSchedule, payoutOnTgeDay, claimablePerMonthAfterTge }
}

const getRewardDistributionConfig = (project: ProjectModel) => {
    if (project.config?.rewardDistribution) {
      return project.config.rewardDistribution
    }
    if (!project.config?.rewardsDistributionTimeInMonths) {
      throw new Error("Project reward distribution misconfigured.")
    }
    
    // avoid breaking changes
    const numberOfPayments = project.config.rewardsDistributionTimeInMonths
    const rewardDistributionPerOnePayout = 1 / numberOfPayments
    const numberOfPaymentsAfterTge = numberOfPayments - 1

    return {
      atTge:{
          rewardRatio: rewardDistributionPerOnePayout,
      },
      afterTge:{
          rewardRatio: rewardDistributionPerOnePayout * numberOfPaymentsAfterTge,
          numberOfPayments: numberOfPaymentsAfterTge,
      },
    }
}


export const RewardsService = {
    getPayoutSchedule
}
