import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import { VStack, HStack, Button, Text } from '@astryxdesign/core';
import { useDesktopStage } from './DesktopStage';

export interface AppPreviewRef {
  reset: () => void;
  reload: () => void;
}

export interface AppPreviewProps {
  src: string;
  poster: string;
  title: string;
  logicalMinW?: number;
  logicalMinH?: number;
  className?: string;
}

export const AppPreview = forwardRef<AppPreviewRef, AppPreviewProps>(
  function AppPreview(
    {
      src,
      poster,
      title,
      logicalMinW = 1140,
      logicalMinH = 720,
      className = '',
    },
    ref,
  ) {
    const { isMobile } = useDesktopStage();
    const containerRef = useRef<HTMLElement | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    const [isNearViewport, setIsNearViewport] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [mobileInteractive, setMobileInteractive] = useState(false);
    const [dimensions, setDimensions] = useState({ vw: 1140, vh: 720 });

    // Imperative API for parent (e.g. Red reset button)
    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'demo:reset' }, '*');
          }
        },
        reload: () => {
          if (iframeRef.current) {
            iframeRef.current.src = src;
            setIsLoaded(false);
          }
        },
      }),
      [src],
    );

    // 1. Lazy load trigger via IntersectionObserver
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setIsNearViewport(true);
              observer.disconnect();
            }
          }
        },
        { rootMargin: '400px' },
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    // 2. Measure viewport within window
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            setDimensions({
              vw: Math.round(width),
              vh: Math.round(height),
            });
          }
        }
      });

      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    // 3. postMessage listener for 'demo:ready'
    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'demo:ready') {
          setIsLoaded(true);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Scaling calculation (§4.5)
    const { vw, vh } = dimensions;
    const scale = Math.min(1, vw / logicalMinW, vh / logicalMinH);
    const iframeW = Math.round(vw / scale);
    const iframeH = Math.round(vh / scale);

    const shouldMountIframe = (!isMobile && isNearViewport) || (isMobile && mobileInteractive);

    const handleIframeLoad = useCallback(() => {
      // Fallback in case postMessage is not emitted by iframe
      const timer = setTimeout(() => setIsLoaded(true), 800);
      return () => clearTimeout(timer);
    }, []);

    return (
      <VStack
        ref={containerRef}
        className={`livrea-app-preview ${className}`}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: '#1C1C1E',
        }}
      >
        {/* Poster Image */}
        <img
          src={poster}
          alt={title}
          className={`livrea-app-poster ${isLoaded ? 'is-faded' : ''}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: isLoaded ? 'none' : 'auto',
            transition: 'opacity 0.25s ease-out',
            opacity: isLoaded ? 0 : 1,
            zIndex: 1,
          }}
        />

        {/* Mobile controls overlay when not yet interactive */}
        {isMobile && !mobileInteractive && (
          <VStack
            align="center"
            justify="center"
            gap={2}
            className="livrea-app-mobile-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              backgroundColor: 'rgba(10, 10, 10, 0.65)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Text type="code" size="sm" color="primary">
              Interactive Preview Available
            </Text>
            <HStack gap={2}>
              <Button
                label="Try it here"
                variant="primary"
                onClick={() => setMobileInteractive(true)}
              />
              <Button
                label="Open full screen ↗"
                variant="secondary"
                href={src}
                target="_blank"
                rel="noopener noreferrer"
              />
            </HStack>
          </VStack>
        )}

        {/* Lazy Iframe */}
        {shouldMountIframe && (
          <iframe
            ref={iframeRef}
            src={src}
            title={title}
            className="livrea-app-iframe"
            onLoad={handleIframeLoad}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${iframeW}px`,
              height: `${iframeH}px`,
              border: 'none',
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
              zIndex: 0,
              colorScheme: 'dark',
            }}
          />
        )}
      </VStack>
    );
  },
);
