import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VStack, HStack, Text } from '@astryxdesign/core';
import { useDesktopStage } from './DesktopStage';
import {
  type Dir,
  type Rect,
  type PresetPlacement,
  rectWidth,
  rectHeight,
  clampToStage,
  computePreset,
  applyDrag,
} from './geometry';
import { useWindowDrag } from './useWindowDrag';
import { getDesktopWindowConfig } from '../../utils/mobileAdaptation';

export interface DesktopWindowProps {
  title: string;
  tag?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onReset?: () => void;
  className?: string;
  minW?: number;
  minH?: number;
  initialPlacement?: PresetPlacement;
  aspectRatio?: string;
}

const RESIZE_HANDLES: { dir: Dir; className: string }[] = [
  { dir: 'n', className: 'livrea-win-handle-n' },
  { dir: 's', className: 'livrea-win-handle-s' },
  { dir: 'e', className: 'livrea-win-handle-e' },
  { dir: 'w', className: 'livrea-win-handle-w' },
  { dir: 'ne', className: 'livrea-win-handle-ne' },
  { dir: 'nw', className: 'livrea-win-handle-nw' },
  { dir: 'se', className: 'livrea-win-handle-se' },
  { dir: 'sw', className: 'livrea-win-handle-sw' },
];

export function DesktopWindow({
  title,
  tag,
  icon,
  children,
  onReset,
  className = '',
  minW = 360,
  minH = 240,
  initialPlacement = 'right',
  aspectRatio = '16 / 10',
}: DesktopWindowProps) {
  const { stageW, stageH, stageRef, isMobile } = useDesktopStage();
  const config = getDesktopWindowConfig(isMobile, aspectRatio);
  const windowRef = useRef<HTMLElement | null>(null);
  const hasMeasuredRef = useRef(false);

  const [rect, setRect] = useState<Rect>(() =>
    computePreset('initial', stageW, stageH, minW, minH, initialPlacement),
  );
  const [prevRect, setPrevRect] = useState<Rect | null>(null);
  const [isFilled, setIsFilled] = useState(false);

  // Re-clamp or re-align on stage dimensions change
  useEffect(() => {
    if (stageW > 0 && stageH > 0 && !isMobile) {
      setRect((current) => {
        if (!hasMeasuredRef.current) {
          hasMeasuredRef.current = true;
          return computePreset('initial', stageW, stageH, minW, minH, initialPlacement);
        }
        return clampToStage(current, stageW, stageH, minW, minH);
      });
    }
  }, [stageW, stageH, minW, minH, isMobile, initialPlacement]);

  const limits = { stageW, stageH, minW, minH };

  const handleRectChange = useCallback((newRect: Rect) => {
    setRect(newRect);
    setIsFilled(
      newRect.left === 0 &&
        newRect.top === 0 &&
        newRect.right === stageW &&
        newRect.bottom === stageH,
    );
  }, [stageW, stageH]);

  const { startDrag, handlePointerMove, endDrag } = useWindowDrag({
    rect,
    limits,
    onRectChange: handleRectChange,
    windowRef,
    stageRef,
  });

  // Action Buttons
  const handleReset = useCallback(() => {
    const initial = computePreset('initial', stageW, stageH, minW, minH, initialPlacement);
    setRect(initial);
    setIsFilled(false);
    onReset?.();
  }, [stageW, stageH, minW, minH, initialPlacement, onReset]);

  const handleCompact = useCallback(() => {
    const compact = computePreset('compact', stageW, stageH, minW, minH, initialPlacement);
    setRect(compact);
    setIsFilled(false);
  }, [stageW, stageH, minW, minH, initialPlacement]);

  const handleToggleFill = useCallback(() => {
    if (isFilled && prevRect) {
      setRect(clampToStage(prevRect, stageW, stageH, minW, minH));
      setIsFilled(false);
    } else {
      setPrevRect(rect);
      setRect(computePreset('fill', stageW, stageH, minW, minH));
      setIsFilled(true);
    }
  }, [isFilled, prevRect, rect, stageW, stageH, minW, minH]);

  // Keyboard resizing on SE handle
  const handleSeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const step = e.shiftKey ? 64 : 16;
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else return;

      e.preventDefault();
      const updated = applyDrag(rect, 'se', dx, dy, limits);
      setRect(updated);
    },
    [rect, limits],
  );

  const w = isMobile ? '100%' : `${rectWidth(rect)}px`;
  const h = isMobile ? 'auto' : `${rectHeight(rect)}px`;
  const transform = isMobile
    ? 'none'
    : `translate3d(${rect.left}px, ${rect.top}px, 0)`;

  return (
    <VStack
      ref={windowRef}
      className={`livrea-desktop-window ${className} ${isMobile ? 'is-mobile' : ''}`}
      style={{
        width: w,
        height: h,
        aspectRatio: isMobile && config.aspectRatio ? config.aspectRatio : undefined,
        minHeight: isMobile ? `${minH}px` : undefined,
        transform,
      }}
    >
      {/* Titlebar */}
      <HStack
        align="center"
        justify="between"
        className="livrea-win-titlebar"
        onPointerDown={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('button') || target.closest('.livrea-win-controls')) {
            return;
          }
          if (!isMobile) startDrag('move', e);
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={!isMobile ? handleToggleFill : undefined}
      >
        <HStack align="center" gap={1.5}>
          {/* Traffic light control dots (suppressed on mobile/touch mode) */}
          {!config.hideTrafficLights && (
            <HStack align="center" gap={1} className="livrea-win-controls" onPointerDown={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="livrea-win-dot dot-reset"
                aria-label="Reset window and demo state"
                title="Reset window (Red)"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleReset}
              />
              <button
                type="button"
                className="livrea-win-dot dot-compact"
                aria-label="Compact window view (60%)"
                title="Compact preset (Yellow)"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleCompact}
              />
              <button
                type="button"
                className="livrea-win-dot dot-fill"
                aria-label={isFilled ? 'Restore window size' : 'Fill stage'}
                title={isFilled ? 'Restore window (Green)' : 'Fill stage (Green)'}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleToggleFill}
              />
            </HStack>
          )}

          <HStack align="center" gap={1} className="livrea-win-title-group">
            {icon}
            <Text type="code" size="sm" className="livrea-win-title-text">
              {title}
            </Text>
          </HStack>
        </HStack>

        {tag && (
          <Text type="code" size="xsm" className="livrea-win-tag-badge">
            {tag}
          </Text>
        )}
      </HStack>

      {/* Window Content Container */}
      <VStack className="livrea-win-content" isScrollable={false}>
        {children}
      </VStack>

      {/* Resize Handles (Desktop Only) */}
      {!config.hideResizeHandles &&
        RESIZE_HANDLES.map(({ dir, className: handleClass }) => (
          <Text
            as="span"
            key={dir}
            role={dir === 'se' ? 'slider' : undefined}
            tabIndex={dir === 'se' ? 0 : undefined}
            aria-label={dir === 'se' ? 'Resize window with arrow keys' : undefined}
            className={`livrea-win-handle ${handleClass}`}
            onPointerDown={(e) => startDrag(dir, e)}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={dir === 'se' ? handleSeKeyDown : undefined}
          >
            {dir === 'se' && (
              <Text as="span" className="livrea-win-grip-indicator" aria-hidden="true">
                {'\u00A0'}
              </Text>
            )}
          </Text>
        ))}
    </VStack>
  );
}
