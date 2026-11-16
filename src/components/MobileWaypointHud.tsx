import { useState, useRef } from 'react';
import { HStack, VStack, Button, Text, Link } from '@astryxdesign/core';
import { BottomSheet } from '@astryxdesign/core/BottomSheet';
import { Icon } from '@astryxdesign/core/Icon';
import {
  SECTOR_WAYPOINTS,
  formatSectorTelemetryKicker,
  getContactSectorId,
  handleWaypointJump,
  getSectorWaypoint,
} from '../utils/mobileAdaptation';

export interface MobileWaypointHudProps {
  activeSector: number;
  onScrollToSector: (sectorId: string) => void;
  scrollProgress?: number;
}

// The sheet locks body scroll while open; wait for it to release before
// scrolling, otherwise the jump is swallowed by the scroll restore.
const SHEET_EXIT_MS = 260;

export function MobileWaypointHud({
  activeSector,
  onScrollToSector,
}: MobileWaypointHudProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingJump = useRef<number | null>(null);

  const currentWaypoint = getSectorWaypoint(activeSector);
  const contactId = getContactSectorId();

  const jumpTo = (targetId: string) => {
    if (pendingJump.current !== null) window.clearTimeout(pendingJump.current);
    if (!isOpen) {
      handleWaypointJump(targetId, onScrollToSector);
      return;
    }
    setIsOpen(false);
    pendingJump.current = window.setTimeout(() => {
      pendingJump.current = null;
      handleWaypointJump(targetId, onScrollToSector);
    }, SHEET_EXIT_MS);
  };

  return (
    <VStack className="livrea-mobile-hud" gap={0} aria-label="Section navigation">
      <HStack align="center" justify="between" width="100%" className="livrea-mobile-hud-bar">
        <Button
          variant="ghost"
          size="md"
          onClick={() => setIsOpen(true)}
          className="livrea-hud-trigger"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          label={formatSectorTelemetryKicker(activeSector, isOpen)}
        >
          <HStack align="center" gap={2}>
            <Text type="code" size="sm" className="livrea-hud-trigger-num">
              {currentWaypoint.num}
            </Text>
            <Text size="base" weight="medium" color="primary" className="livrea-hud-trigger-title">
              {currentWaypoint.title}
            </Text>
            <Icon icon="chevronDown" size="sm" color="secondary" />
          </HStack>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => jumpTo(contactId)}
          className="livrea-hud-contact"
          label="Contact"
        />
      </HStack>

      <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Sections" height="hug" padding={0}>
        <VStack gap={0} width="100%" className="livrea-sheet">
          <HStack align="center" justify="between" className="livrea-sheet-head">
            <Text size="sm" color="secondary">
              Sections
            </Text>
            <Text type="code" size="sm" color="secondary">
              {currentWaypoint.num} / {String(SECTOR_WAYPOINTS.length).padStart(2, '0')}
            </Text>
          </HStack>

          <VStack as="nav" gap={0} width="100%" aria-label="Page sections">
            {SECTOR_WAYPOINTS.map((sector) => {
              const isActive = activeSector === sector.index;
              return (
                <Link
                  key={sector.id}
                  href={`#${sector.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    jumpTo(sector.id);
                  }}
                  aria-current={isActive ? 'location' : undefined}
                  className={`livrea-sheet-row${isActive ? ' is-active' : ''}`}
                >
                  <HStack align="center" gap={3} width="100%">
                    <Text type="code" size="sm" className="livrea-sheet-num">
                      {sector.num}
                    </Text>
                    <VStack gap={0} className="livrea-sheet-text">
                      <Text size="base" weight="medium" color="primary">
                        {sector.title}
                      </Text>
                      <Text size="sm" color="secondary">
                        {sector.label}
                      </Text>
                    </VStack>
                  </HStack>
                </Link>
              );
            })}
          </VStack>
        </VStack>
      </BottomSheet>
    </VStack>
  );
}
