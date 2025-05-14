import { TableCell } from "./TableCell"
import { TableHeader } from "./TableHeader"
import Text from "@/components/Text"
import Img from "../Image/Img"
import { useWalletContext } from "@/hooks/useWalletContext"
import { twMerge } from "tailwind-merge"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { formatCurrencyAmount } from "shared/utils/format"

type LeaderboardData = {
  referrer_by: string;
  total_invested: number;
  result_type?: 'ranking' | 'raffle' | 'lost' | null;
}

type TotalTicketsDistributed = {
  referrer_by: string;
  total_invested: number; // or string
};

type Props = {
  data?: LeaderboardData[]
  prizeAmount?: number
  totalTicketsDistributed?:TotalTicketsDistributed[]
  isLoading?: boolean
}

const LeaderboardTable = ({ data = [], prizeAmount=0, totalTicketsDistributed=[], isLoading = false }: Props) => {
  const totalInvest = totalTicketsDistributed[0]?.total_invested
  const { address } = useWalletContext()
  const { projectData } = useProjectDataContext()
  
  // Color mapping for different positions
  const positionColors = {
    "1": "text-[#ACFF73]", // 1st - green
    "2": "text-[#F2BF7E]", // 2nd - gold
    "3": "text-[#E1E7EF]", // 3rd - silver
    "default": "text-[#D38160]" // other top positions - bronze
  }

  // Helper function to get prize amount
  const getPrizeAmount = (item: LeaderboardData, position: string) => {
    // If we have final results, use the configured amounts
    if (item.result_type === 'ranking') {
      // For ranking winners, use the position in the leaderboard to determine prize
      if (projectData?.config.referralDistribution?.ranking && position in projectData.config.referralDistribution.ranking) {
        return projectData.config.referralDistribution.ranking[position];
      }
    } else if (item.result_type === 'raffle') {
      // For raffle winners, use the raffle prize amount
      if (projectData?.config.referralDistribution?.raffle) {
        const raffleValues = Object.values(projectData.config.referralDistribution.raffle);
        const totalRaffleAmount = raffleValues.reduce((sum, amount) => sum + amount, 0);
        const raffleWinners = Object.keys(projectData.config.referralDistribution.raffle).length;
        return raffleWinners > 0 ? totalRaffleAmount / raffleWinners : 0;
      }
    }
    
    // For ongoing results or no result_type, show potential prize
    if (projectData?.config.referralDistribution?.ranking && position in projectData.config.referralDistribution.ranking) {
      return projectData.config.referralDistribution.ranking[position];
    } 
    else if (projectData?.config.referralDistribution?.raffle) {
      const raffleValues = Object.values(projectData.config.referralDistribution.raffle);
      const totalRaffleAmount = raffleValues.reduce((sum, amount) => sum + amount, 0);
      const raffleWinners = Object.keys(projectData.config.referralDistribution.raffle).length;
      return raffleWinners > 0 ? totalRaffleAmount / raffleWinners : 0;
    }
    return 0;
  }

  return (
    <div className="w-full">
      <div className="w-full">
        <div className="min-h-[200px] md:h-[500px] overflow-y-auto">
          {!isLoading ? (
            <table className="w-full divide-y divide-bd-secondary/15">
              <thead className="sticky top-0 z-10">
                <tr className="max-h-[24px]">
                  <TableHeader className="px-3 w-[15%]">
                    Pos. 
                  </TableHeader>
                  <TableHeader className="px-0.5 w-[35%]">
                    <span className="w-full pl-2">User</span>
                  </TableHeader>
                  <TableHeader className="px-0.5 w-[25%]">
                    Tickets
                  </TableHeader>
                  <TableHeader className="px-0.5 w-[25%]">
                    Prize
                  </TableHeader>
                </tr>
                <tr>
                  <td colSpan={4} className="px-3">
                    <div className="h-[1px] bg-bd-primary"></div>
                  </td>
                </tr>
              </thead>
              {data.length ? (
                <tbody className="divide-y divide-bd-secondary/5 pb-10">
                  {data.map((item, index) => {
                    const isCurrentUser = address && item.referrer_by === address?.substring(0, 4);
                    const position = (index + 1).toString();
                    
                    // Get the appropriate color for this position
                    let textColorClass = "";
                    if (item.result_type === 'ranking') {
                      // For ranking winners, use position-based colors
                      textColorClass = positionColors[position as keyof typeof positionColors] || positionColors.default;
                    } else if (item.result_type === 'raffle') {
                      // Raffle winners get bronze color
                      textColorClass = positionColors.default;
                    } else {
                      // For ongoing results, use the original color logic
                      const isInRanking = projectData?.config.referralDistribution?.ranking && 
                                        position in projectData.config.referralDistribution.ranking;
                      textColorClass = isInRanking ? 
                        positionColors[position as keyof typeof positionColors] || positionColors.default :
                        positionColors.default;
                    }
                    
                    return (
                      <tr 
                        className="h-[36px] min-h-[36px] max-h-[36px]"
                        key={item.referrer_by}
                      >
                        <TableCell className="px-5 py-[2px]">
                          <span className={`text-xs ${textColorClass}`}>
                            {position}
                          </span>
                        </TableCell>
                        <TableCell className="py-[2px]">
                          <div className="flex w-full flex-row items-center gap-1">
                            <div className="flex flex-col flex-nowrap items-start">
                              <span className={twMerge(
                                "truncate text-xs font-semibold text-fg-primary",
                                isCurrentUser && "font-bold"
                              )}>
                                {isCurrentUser ? "You" : item.referrer_by}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-[2px]">
                          <span className="text-xs text-fg-primary">{item.total_invested}</span>
                        </TableCell>
                        <TableCell className="py-[2px]">
                          <span className={`text-xs ${textColorClass}`}>
                            {item.result_type === 'ranking' ? formatCurrencyAmount(getPrizeAmount(item, position)) + '$' : ''}
                            {item.result_type === 'raffle' ? formatCurrencyAmount(getPrizeAmount(item, position)) + '$' : ''}
                            {item.result_type === 'lost' ? '0$' : ''}
                            {item.result_type === null ? (() => {
                              const isInRanking = projectData?.config.referralDistribution?.ranking && 
                                position in projectData.config.referralDistribution.ranking;
                              if (isInRanking && projectData?.config.referralDistribution?.ranking) {
                                const rankingAmount = projectData.config.referralDistribution.ranking[position];
                                return formatCurrencyAmount(rankingAmount) + '$';
                              } 
                              else if (projectData?.config.referralDistribution?.raffle) {
                                const raffleValues = Object.values(projectData.config.referralDistribution.raffle);
                                const totalRaffleAmount = raffleValues.reduce((sum, amount) => sum + amount, 0);
                                const raffleWinners = Object.keys(projectData.config.referralDistribution.raffle).length;
                                const avgRaffleAmount = raffleWinners > 0 ? totalRaffleAmount / raffleWinners : 0;
                                return formatCurrencyAmount(avgRaffleAmount) + '$';
                              }
                              return '0$';
                            })() : ''}
                          </span>
                        </TableCell>
                      </tr>
                    );
                  })}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td colSpan={4} className="py-8">
                      <div className="flex flex-col items-center justify-center text-center">
                        <span className="text-fg-secondary mb-2">
                          No one in leaderboard yet
                        </span>
                        <span className="text-fg-tertiary text-sm">
                          Be the first to join the leaderboard!
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          ) : (
            <TableSkeleton />
          )}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardTable

const TableSkeleton = () => {
  return (
    <table className="min-h-[200px] w-full divide-y divide-bd-secondary/15">
      <thead className="sticky top-0 z-[2] bg-transparent">
        <tr className="max-h-[52px] bg-default">
          <TableHeader>Pos.</TableHeader>
          <TableHeader>
            <div className="w-[220px] pl-12">User</div>
          </TableHeader>
          <TableHeader>Tickets</TableHeader>
          <TableHeader>Prize</TableHeader>
        </tr>
      </thead>
      <tbody className="divide-y divide-bd-secondary/5 pb-10">
        {[1, 2, 3, 4, 5].map((item) => (
          <tr className="h-[36px] min-h-[36px] max-h-[36px]" key={item}>
            <TableCell className="py-[2px]">
              <Text isLoading className="w-[40px] opacity-50" />
            </TableCell>
            <TableCell className="py-[2px]">
              <div className="flex w-[220px] flex-row items-center gap-4">
                <Img size="8" src={""} isFetchingLink isRounded />
                <div className="flex flex-col flex-nowrap items-start">
                  <Text isLoading className="w-[60px] opacity-50" />
                  <Text isLoading className="w-[60px] opacity-50" />
                </div>
              </div>
            </TableCell>
            <TableCell className="py-[2px]">
              <Text isLoading className="w-[80px] opacity-50" />
            </TableCell>
            <TableCell className="py-[2px]">
              <Text isLoading className="w-[80px] opacity-50" />
            </TableCell>
          </tr>
        ))}
      </tbody>
    </table>
  )
}