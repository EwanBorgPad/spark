import { ProjectModel, rewardsSchema } from "../../shared/models"
import { capitalizeFirstLetter } from "./format"
import { externalLinkObj } from "@/components/Button/ExternalLink"

// helpers for Back Office
export const distributionTypeOptions =
  rewardsSchema.shape.distributionType.options.map((id) => ({
    id,
    label: capitalizeFirstLetter(id),
  }))
export const payoutIntervalOptions =
  rewardsSchema.shape.payoutInterval.options.map((id) => ({
    id,
    label: capitalizeFirstLetter(id),
  }))
export const iconOptions = Object.entries(externalLinkObj).map(
  ([key, value]) => ({
    id: key,
    label: value.label,
  }),
)
export const setValueOptions = {
  shouldDirty: true,
  shouldValidate: true,
}
export const initialSaleData: ProjectModel["saleData"] = {
  availableTokens: undefined,
  saleSucceeded: undefined,
  totalAmountRaised: undefined,
  sellOutPercentage: undefined,
  participantCount: undefined,
  averageInvestedAmount: undefined,
}
