import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import { VStack, HStack, Button, Text, Heading } from '@astryxdesign/core';
import { useDesktopStage } from './DesktopStage';
import {
  OXIDE_SHOWCASE_PILLARS,
  getAppPreviewMode,
} from '../../utils/mobileAdaptation';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activePillarKey, setActivePillarKey] = useState<string>('worktrees');
    const [dimensions, setDimensions] = useState({ vw: 1140, vh: 720 });

    const previewMode = getAppPreviewMode({ isMobile, isModalOpen });
    const activePillar =
      OXIDE_SHOWCASE_PILLARS.find((p) => p.key === activePillarKey) ??
      OXIDE_SHOWCASE_PILLARS[0];

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

    // 1. Lazy load trigger via IntersectionObserver (desktop only)
    useEffect(() => {
      if (isMobile) return;
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
    }, [isMobile]);

    // 2. Measure viewport within window (desktop scaling)
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

    // 4. Modal escape key listener and scroll locking
    useEffect(() => {
      if (!isModalOpen) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsModalOpen(false);
        }
      };

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [isModalOpen]);

    // Desktop scaling calculation (§4.5)
    const { vw, vh } = dimensions;
    const scale = Math.min(1, vw / logicalMinW, vh / logicalMinH);
    const iframeW = Math.round(vw / scale);
    const iframeH = Math.round(vh / scale);

    const shouldMountIframe = !isMobile && isNearViewport;

    const handleIframeLoad = useCallback(() => {
      const timer = setTimeout(() => setIsLoaded(true), 800);
      return () => clearTimeout(timer);
    }, []);

    // Render mobile touch-safe showcase
    if (previewMode.showcaseActive) {
      return (
        <VStack
          ref={containerRef}
          className={`livrea-app-preview livrea-app-preview-mobile ${className}`}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#090A0E',
            touchAction: 'pan-y',
          }}
        >
          {/* Subtle CAD / poster backdrop */}
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            className="livrea-showcase-backdrop"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.16,
              filter: 'contrast(1.15) brightness(0.7)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Foreground Showcase Content */}
          <VStack
            justify="between"
            height="100%"
            width="100%"
            gap={1.5}
            className="livrea-showcase-content"
            style={{
              position: 'relative',
              zIndex: 1,
              padding: '10px 12px',
              boxSizing: 'border-box',
              minHeight: '200px',
            }}
          >
            {/* Top Telemetry Header & Pillar Tabs */}
            <VStack gap={1} width="100%">
              <HStack justify="between" align="center" width="100%">
                <HStack align="center" gap={1.5}>
                  <Text as="span" className="livrea-red-indicator" aria-hidden="true">
                    {'\u00A0'}
                  </Text>
                  <Text type="code" size="xsm" color="accent" weight="bold">
                    TOUCH-SAFE SHOWCASE // ARCHITECTURE
                  </Text>
                </HStack>
                <Text type="code" size="xsm" color="secondary">
                  TAURI 2 · RUST
                </Text>
              </HStack>

              {/* Pillar Selector Tabs */}
              <HStack
                gap={1}
                wrap="wrap"
                className="livrea-showcase-pills"
                role="tablist"
                aria-label="Architecture pillars"
              >
                {OXIDE_SHOWCASE_PILLARS.map((pillar) => {
                  const isSelected = pillar.key === activePillarKey;
                  return (
                    <button
                      key={pillar.key}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setActivePillarKey(pillar.key)}
                      className={`livrea-showcase-pill ${isSelected ? 'is-active' : ''}`}
                    >
                      <HStack align="center" gap={1}>
                        <Text
                          type="code"
                          size="xsm"
                          color={isSelected ? 'accent' : 'secondary'}
                          weight="bold"
                        >
                          {pillar.num}
                        </Text>
                        <Text
                          size="xsm"
                          color={isSelected ? 'primary' : 'secondary'}
                          weight={isSelected ? 'bold' : 'normal'}
                        >
                          {pillar.title.split(' ')[0]}
                        </Text>
                      </HStack>
                    </button>
                  );
                })}
              </HStack>
            </VStack>

            {/* Active Pillar Detail Box */}
            <VStack gap={0.5} width="100%" className="livrea-showcase-detail">
              <HStack align="center" gap={1.5}>
                <Text type="code" size="sm" color="accent" weight="bold">
                  {activePillar.num}.
                </Text>
                <Heading level={3} weight="bold" color="primary">
                  {activePillar.title}
                </Heading>
              </HStack>

              <Text size="sm" color="secondary" className="livrea-showcase-desc">
                {activePillar.description}
              </Text>

              <Text type="code" size="xsm" color="accent" className="livrea-showcase-spec">
                {activePillar.spec}
              </Text>
            </VStack>

            {/* Bottom Action Bar */}
            <HStack
              justify="between"
              align="center"
              width="100%"
              wrap="wrap"
              gap={2}
              className="livrea-showcase-actions"
            >
              <Button
                label="Launch Fullscreen Web Demo ↗"
                variant="primary"
                onClick={() => setIsModalOpen(true)}
                className="livrea-fullscreen-demo-btn"
              />
              <Text type="code" size="xsm" color="secondary" className="livrea-showcase-note">
                Swipe over preview to scroll
              </Text>
            </HStack>
          </VStack>

          {/* Dedicated Fullscreen Web Demo Modal */}
          {isModalOpen && (
            <VStack
              className="livrea-fullscreen-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Oxide Interactive Web Demo"
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                backgroundColor: '#090A0E',
                width: '100vw',
                height: '100vh',
              }}
            >
              {/* Modal Header Bar with Explicit Exit Control */}
              <HStack
                justify="between"
                align="center"
                width="100%"
                className="livrea-modal-header"
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#0E0F14',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                  boxSizing: 'border-box',
                  flexShrink: 0,
                }}
              >
                <HStack align="center" gap={2}>
                  <Text as="span" className="livrea-red-indicator" aria-hidden="true">
                    {'\u00A0'}
                  </Text>
                  <Text type="code" size="sm" color="primary" weight="bold">
                    OXIDE // FULLSCREEN WEB DEMO
                  </Text>
                  <Text type="code" size="xsm" className="livrea-win-tag-badge">
                    TAURI 2
                  </Text>
                </HStack>

                <Button
                  label="✕ Exit Demo"
                  variant="primary"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Exit interactive demo and return to portfolio"
                  className="livrea-modal-exit-btn"
                />
              </HStack>

              {/* Modal Full-Screen Interactive IFrame */}
              <VStack
                width="100%"
                height="100%"
                style={{
                  flex: 1,
                  minHeight: 0,
                  position: 'relative',
                  backgroundColor: '#1C1C1E',
                }}
              >
                <iframe
                  src={src}
                  title="Oxide Interactive Fullscreen Demo"
                  className="livrea-modal-iframe"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    colorScheme: 'dark',
                  }}
                />
              </VStack>
            </VStack>
          )}
        </VStack>
      );
    }

    // Desktop rendering (preserves scale, drag, and traffic light behavior)
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
