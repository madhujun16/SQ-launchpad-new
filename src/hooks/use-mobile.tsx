import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024
const LARGE_MOBILE_BREAKPOINT = 640

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)
  const [isLargeMobile, setIsLargeMobile] = React.useState<boolean | undefined>(undefined)
  const [isTouchDevice, setIsTouchDevice] = React.useState<boolean>(false)
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait')

  React.useEffect(() => {
    // Check if device supports touch
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

    // Initial checks
    checkTouchDevice()
    checkOrientation()
    updateScreenStates()

    // Event listeners
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const mqlTablet = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`)
    const mqlLargeMobile = window.matchMedia(`(min-width: ${LARGE_MOBILE_BREAKPOINT}px) and (max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const handleResize = () => {
      updateScreenStates()
      checkOrientation()
    }

    const handleOrientationChange = () => {
      checkOrientation()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
    mql.addEventListener('change', updateScreenStates)
    mqlTablet.addEventListener('change', updateScreenStates)
    mqlLargeMobile.addEventListener('change', updateScreenStates)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
      mql.removeEventListener('change', updateScreenStates)
      mqlTablet.removeEventListener('change', updateScreenStates)
      mqlLargeMobile.removeEventListener('change', updateScreenStates)
    }
  }, [])

  return {
    isMobile: !!isMobile,
    isTablet: !!isTablet,
    isLargeMobile: !!isLargeMobile,
    isTouchDevice,
    orientation,
    isSmallScreen: isMobile || isLargeMobile,
    isMediumScreen: isTablet,
    isLargeScreen: !isMobile && !isTablet
  }
}

// Hook for responsive values
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

// Hook for responsive breakpoints
export function useBreakpoint() {
  const { isMobile, isTablet, isLargeMobile } = useIsMobile()
  
  return {
    isMobile,
    isTablet,
    isLargeMobile,
    isDesktop: !isMobile && !isTablet,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  }
}
