import { useEffect } from "react"

export const useAsyncEffect = (
  asyncEffect: () => Promise<unknown>,
  deps?: unknown[],
): void => {
  useEffect(() => {
    asyncEffect().catch(console.error)
  }, [asyncEffect, ...(deps || [])])
}
