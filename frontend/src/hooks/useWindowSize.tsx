import { useEffect, useState } from "react"

type WindowSize = {
  width: number | undefined
  height: number | undefined
}

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  })
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isMobile = windowSize?.width ? windowSize?.width < 768 : false

  return { ...windowSize, isMobile }
}
