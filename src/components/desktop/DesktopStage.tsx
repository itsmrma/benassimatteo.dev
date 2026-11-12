import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { Stack } from '@astryxdesign/core';
import { isMobileViewport } from '../../utils/mobileAdaptation';

export interface StageContextValue {
  stageW: number;
  stageH: number;
  stageRef: React.RefObject<HTMLElement | null>;
  isMobile: boolean;
}

export const DesktopStageContext = createContext<StageContextValue | null>(null);

export function useDesktopStage() {
  const ctx = useContext(DesktopStageContext);
  if (!ctx) {
    throw new Error('useDesktopStage must be used within a DesktopStage');
  }
  return ctx;
}

export interface DesktopStageProps {
  children: React.ReactNode;
  height?: string | number;
  className?: string;
  mobileBreakpoint?: number;
}

export function DesktopStage({
  children,
  height,
  className = '',
  mobileBreakpoint = 1024,
}: DesktopStageProps) {
  const stageRef = useRef<HTMLElement | null>(null);
  const [dimensions, setDimensions] = useState({ stageW: 0, stageH: 0 });
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? isMobileViewport(undefined, undefined, mobileBreakpoint)
      : false,
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileViewport(undefined, undefined, mobileBreakpoint));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height: h } = entry.contentRect;
        if (width > 0 && h > 0) {
          setDimensions({
            stageW: Math.round(width),
            stageH: Math.round(h),
          });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <DesktopStageContext.Provider
      value={{
        stageW: dimensions.stageW,
        stageH: dimensions.stageH,
        stageRef,
        isMobile,
      }}
    >
      <Stack
        ref={stageRef}
        className={`livrea-desktop-stage ${className}`}
        style={{
          height: height ?? 'min(68svh, 540px)',
        }}
      >
        {children}
      </Stack>
    </DesktopStageContext.Provider>
  );
}
