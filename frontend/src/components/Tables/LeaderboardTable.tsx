import React from "react"
import { TableCell } from "./TableCell"
import { TableHeader } from "./TableHeader"
import { Icon } from "../Icon/Icon"
import Text from "@/components/Text"
import Img from "../Image/Img"

type LeaderboardData = {
  id: string
  position: number
  user: {
    name: string
    username: string
    avatar?: string
  }
  tickets: number
  prize: string
}

type Props = {
  data?: LeaderboardData[]
  isLoading?: boolean
}

const LeaderboardTable = ({ data = [], isLoading = false }: Props) => {

  return (
    <div className="w-full">
      <div className="w-full">
        <div className="min-h-[200px] md:h-[500px] overflow-y-auto">
          {!isLoading ? (
            <table className="w-full divide-y divide-bd-secondary/15">
              <thead className="sticky top-0 z-10">
                <tr className="max-h-[24px]">
                  <TableHeader className="px-2 w-[15%]"> {/* Added padding to the left */}
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
                  {data.map((item) => (
                    <tr className="h-[64px]" key={item.id}>
                      <TableCell className="py-0">
                        <span className="text-xs text-fg-primary">#{item.position}</span>
                      </TableCell>
                      <TableCell className="py-0">
                        <div className="flex w-full flex-row items-center gap-2">
                          <Img size="6" src={item.user.avatar} isRounded />
                          <div className="flex flex-col flex-nowrap items-start">
                            <span className="truncate text-xs font-semibold text-fg-primary">
                              {item.user.name}
                            </span>
                            <span className="truncate text-xs font-normal text-fg-tertiary">
                              @{item.user.username}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-0">
                        <span className="text-xs text-fg-primary">{item.tickets.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="py-0">
                        <span className="text-xs text-fg-primary">{item.prize}</span>
                      </TableCell>
                    </tr>
                  ))}
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
          <tr className="h-[64px]" key={item}>
            <TableCell className="py-0">
              <Text isLoading className="w-[40px] opacity-50" />
            </TableCell>
            <TableCell className="py-0">
              <div className="flex w-[220px] flex-row items-center gap-4">
                <Img size="8" src={""} isFetchingLink isRounded />
                <div className="flex flex-col flex-nowrap items-start">
                  <Text isLoading className="w-[60px] opacity-50" />
                  <Text isLoading className="w-[60px] opacity-50" />
                </div>
              </div>
            </TableCell>
            <TableCell className="py-0">
              <Text isLoading className="w-[80px] opacity-50" />
            </TableCell>
            <TableCell className="py-0">
              <Text isLoading className="w-[80px] opacity-50" />
            </TableCell>
          </tr>
        ))}
      </tbody>
    </table>
  )
}