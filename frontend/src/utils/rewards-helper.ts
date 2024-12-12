import { formatCurrencyAmount } from "shared/utils/format"
import { UserInvestedRewardsResponse } from "shared/models"

export const getTotalToBeReceived = (data: UserInvestedRewardsResponse) => {
  const raisedTokenAmount = formatCurrencyAmount(data.lpPosition.raisedTokenAmount.uiAmount, false)
  const launchedTokenAmountUnformatted =
    data.lpPosition.launchedTokenAmount.uiAmount + data.rewards.totalAmount.uiAmount
  const launchedTokenAmount = formatCurrencyAmount(launchedTokenAmountUnformatted, false)

  return {
    raisedTokenAmount,
    launchedTokenAmount,
  }
}
