import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024
const LARGE_MOBILE_BREAKPOINT = 640

// Throttle function to limit how often resize events are processed
function throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout | null = null
  let lastExecTime = 0
  
  return ((...args: any[]) => {
    const currentTime = Date.now()
    
    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    } else {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func(...args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }) as T
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)
  const [isLargeMobile, setIsLargeMobile] = React.useState<boolean | undefined>(undefined)
  const [isTouchDevice, setIsTouchDevice] = React.useState<boolean>(false)
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait')

  React.useEffect(() => {
    // Check if device supports touch - only run once
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    // Check device orientation
    const checkOrientation = () => {
      if (window.innerHeight > window.innerWidth) {
        setOrientation('portrait')
      } else {
        setOrientation('landscape')
      }
    }

    // Check screen size and update states
    const updateScreenStates = () => {
      const width = window.innerWidth
      setIsMobile(width < MOBILE_BREAKPOINT)
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
      setIsLargeMobile(width >= LARGE_MOBILE_BREAKPOINT && width < MOBILE_BREAKPOINT)
    }

    // Initial checks - run immediately
    checkTouchDevice()
    checkOrientation()
    updateScreenStates()

    // Throttled resize handler for better performance
    const throttledResizeHandler = throttle(() => {
      updateScreenStates()
      checkOrientation()
    }, 100) // Throttle to 100ms

    // Use ResizeObserver for better performance than resize events
    let resizeObserver: ResizeObserver | null = null
    
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(throttledResizeHandler)
      resizeObserver.observe(document.body)
    } else {
      // Fallback to resize event if ResizeObserver is not available
      window.addEventListener('resize', throttledResizeHandler, { passive: true })
    }

    // Only add orientation change listener if it's supported
    if ('onorientationchange' in window) {
      window.addEventListener('orientationchange', checkOrientation, { passive: true })
    }

    // Use matchMedia for more efficient breakpoint detection
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const mqlTablet = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`)
    const mqlLargeMobile = window.matchMedia(`(min-width: ${LARGE_MOBILE_BREAKPOINT}px) and (max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const handleMediaQueryChange = () => {
      updateScreenStates()
    }

    // Add media query listeners
    mql.addEventListener('change', handleMediaQueryChange)
    mqlTablet.addEventListener('change', handleMediaQueryChange)
    mqlLargeMobile.addEventListener('change', handleMediaQueryChange)

    return () => {
      // Cleanup ResizeObserver
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      
      // Cleanup resize event listener
      window.removeEventListener('resize', throttledResizeHandler)
      
      // Cleanup orientation change listener
      if ('onorientationchange' in window) {
        window.removeEventListener('orientationchange', checkOrientation)
      }
      
      // Cleanup media query listeners
      mql.removeEventListener('change', handleMediaQueryChange)
      mqlTablet.removeEventListener('change', handleMediaQueryChange)
      mqlLargeMobile.removeEventListener('change', handleMediaQueryChange)
    }
  }, [])

  // Memoize the return object to prevent unnecessary re-renders
  return React.useMemo(() => ({
    isMobile: !!isMobile,
    isTablet: !!isTablet,
    isLargeMobile: !!isLargeMobile,
    isTouchDevice,
    orientation,
    isSmallScreen: isMobile || isLargeMobile,
    isMediumScreen: isTablet,
    isLargeScreen: !isMobile && !isTablet
  }), [isMobile, isTablet, isLargeMobile, isTouchDevice, orientation])
}

// Hook for responsive values - optimized with useMemo
export function useResponsiveValue<T>(
  mobile: T,
  tablet: T,
  desktop: T
): T {
  const { isMobile, isTablet } = useIsMobile()
  
  if (isMobile) return mobile
  if (isTablet) return tablet
  return desktop
}

// Hook for responsive breakpoints - optimized with useMemo
export function useBreakpoint() {
  const { isMobile, isTablet, isLargeMobile } = useIsMobile()
  
  return {
    isMobile,
    isTablet,
    isLargeMobile,
    isSmallScreen: isMobile || isLargeMobile,
    isMediumScreen: isTablet,
    isLargeScreen: !isMobile && !isTablet
  }
}
