import { RefObject, useCallback, useEffect, useState } from "react"

type Props = {
  ref: RefObject<HTMLDivElement>
  stickyRef: RefObject<HTMLDivElement>
  arrayLength: number
  width?: number
}

// Create an array with n sequential incremental values - thresholds (e.g., [0, 0.25, 0.5, 0.75, 1]).
const getThresholds = (arrayLength: number) => {
  const arr0 = Array.from(Array(arrayLength + 1).keys()) // [0,1,2...]
  const incrementalValue = 1 / arrayLength // e.g. 1/4 = 0.25
  const arr1: number[] = []
  arr0.forEach((item) => {
    const thresholdMid = item * incrementalValue
    arr1.push(thresholdMid)
  })
  return arr1
}

const useVerticalTimeline = ({ ref, arrayLength, stickyRef, width }: Props) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [overlayHeight, setOverlayHeight] = useState(500)

  const thresholds = getThresholds(arrayLength)

  const setStickyOverlayStyle = useCallback(
    (rect: DOMRect, viewportHeight: number) => {
      if (!stickyRef.current || !width) return

      const activationCircleOffset = 48
      const headerHeight = 72
      const paddingBottom = 24
      const optimizationHeight = width > 1024 ? 16 : 0
      const stickyOverlayHeight =
        (rect.height - paddingBottom) / 4 +
        activationCircleOffset -
        headerHeight -
        paddingBottom -
        optimizationHeight
      const positionTop = viewportHeight - stickyOverlayHeight
      setOverlayHeight(stickyOverlayHeight)
      stickyRef.current.style.setProperty("height", stickyOverlayHeight + "px")
      stickyRef.current.style.setProperty("top", positionTop + "px")
    },
    [stickyRef, width],
  )
  const handleScroll = useCallback(() => {
    const element = ref.current
    if (!element || !width) return

    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const distanceFromTop = rect.top - viewportHeight

    if (overlayHeight === 500) {
      setStickyOverlayStyle(rect, viewportHeight)
    }

    const intersectionRatio = +((distanceFromTop / rect.height) * -1).toFixed(3)
    // console.log("intersectionRatio: ", intersectionRatio)

    if (intersectionRatio < 0) {
      setActiveIndex(null)
      return
    }

    // Determine which threshold is met
    const activeItemIndex =
      thresholds.findLastIndex((t) => intersectionRatio + thresholds[0] > t) - 1

    if (activeItemIndex < 0) {
      setActiveIndex(null)
      return
    }
    setActiveIndex(activeItemIndex)
  }, [overlayHeight, ref, setStickyOverlayStyle, thresholds, width])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Attach the scroll event listener
    window.addEventListener("scroll", handleScroll)

    // Clean up the listener on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [ref, handleScroll])

  return { activeIndex }
}

export default useVerticalTimeline
