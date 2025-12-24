/**
 * Responsive Breakpoint Hook
 * Follows the core breakpoint system for proper responsive design
 */

import { useState, useEffect } from 'react';

const breakpoints = {
  xs: 0,      // 0-480px (phones)
  sm: 481,    // 481-768px (large phones / small tablets)
  md: 769,    // 769-1024px (tablets)
  lg: 1025,   // 1025-1440px (laptops)
  xl: 1441    // 1441px+ (desktop / ultrawide)
};

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const width = windowSize.width;

  const breakpoint = {
    isXs: width >= breakpoints.xs && width < breakpoints.sm,
    isSm: width >= breakpoints.sm && width < breakpoints.md,
    isMd: width >= breakpoints.md && width < breakpoints.lg,
    isLg: width >= breakpoints.lg && width < breakpoints.xl,
    isXl: width >= breakpoints.xl,
    isMobile: width < breakpoints.md,  // xs + sm
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isDesktop: width >= breakpoints.lg
  };

  return {
    ...breakpoint,
    width,
    height: windowSize.height,
    breakpointName: breakpoint.isXs ? 'xs' : 
                   breakpoint.isSm ? 'sm' : 
                   breakpoint.isMd ? 'md' : 
                   breakpoint.isLg ? 'lg' : 'xl'
  };
};