import { useState, useEffect, useCallback } from 'react';
import {
  HStack,
  VStack,
  Button,
  Text,
} from '@astryxdesign/core';
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

export function MobileWaypointHud({
  activeSector,
  onScrollToSector,
  scrollProgress = 0,
}: MobileWaypointHudProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeMenu]);

  const currentWaypoint = getSectorWaypoint(activeSector);
  const kickerLabel = formatSectorTelemetryKicker(activeSector, isOpen);
  const contactId = getContactSectorId();

  const handleSectorSelect = (targetId: string) => {
    handleWaypointJump(targetId, onScrollToSector, closeMenu);
  };

  const handleContactDirect = () => {
    handleWaypointJump(contactId, onScrollToSector, closeMenu);
  };

  return (
    <VStack
      className="livrea-mobile-hud"
      gap={0}
      aria-label="Mobile Telemetry Waypoint Navigation"
    >
      {/* Sticky Telemetry HUD Bar */}
      <HStack
        align="center"
        justify="between"
        width="100%"
        className="livrea-mobile-hud-bar"
      >
        {/* Active Sector Kicker Dropdown Trigger */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMenu}
          className="livrea-hud-kicker-btn"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={`Current sector: ${currentWaypoint.num} ${currentWaypoint.title}. Tap to open sector waypoint menu.`}
          label={kickerLabel}
        >
          <HStack align="center" gap={1} className="livrea-hud-kicker-content">
            <Text type="code" size="xsm" color="accent" className="livrea-hud-kicker-badge">
              SEC {currentWaypoint.num}
            </Text>
            <Text type="code" size="sm" weight="bold" color="primary" className="livrea-hud-kicker-title">
              {currentWaypoint.title}
            </Text>
            <Text type="code" size="xsm" color="secondary" className="livrea-hud-kicker-chevron">
              {isOpen ? '▴' : '▾'}
            </Text>
          </HStack>
        </Button>

        {/* Telemetry Progress & Direct Contact Action */}
        <HStack align="center" gap={2} className="livrea-hud-actions">
          <Text
            type="code"
            size="xsm"
            color="secondary"
            className="livrea-hud-lap-counter"
            aria-hidden="true"
          >
            {Math.round(scrollProgress)}%
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleContactDirect}
            className="livrea-hud-contact-shortcut"
            aria-label="Jump directly to Contact sector"
            label="CONTACT ↗"
          >
            <Text type="code" size="xsm" weight="bold" color="secondary">
              CONTACT ↗
            </Text>
          </Button>
        </HStack>
      </HStack>

      {/* Quick-Jump Waypoint Drawer / Dropdown Ribbon */}
      {isOpen && (
        <VStack
          className="livrea-hud-drawer"
          gap={2}
          role="dialog"
          aria-modal="true"
          aria-label="Sector Waypoint Quick-Jump"
        >
          {/* Drawer Header */}
          <HStack
            align="center"
            justify="between"
            width="100%"
            className="livrea-hud-drawer-header"
          >
            <HStack align="center" gap={1}>
              <Text type="code" size="xsm" color="accent">
                [ WAYPOINTS
              </Text>
              <Text type="code" size="xsm" color="secondary">
                // 9 SECTORS ]
              </Text>
            </HStack>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeMenu}
              className="livrea-hud-close-btn"
              aria-label="Close waypoint navigation menu"
              label="CLOSE ✕"
            >
              <Text type="code" size="xsm" color="secondary">
                CLOSE ✕
              </Text>
            </Button>
          </HStack>

          {/* 9 Sector Waypoint Buttons */}
          <VStack gap={1} width="100%" className="livrea-hud-sector-list">
            {SECTOR_WAYPOINTS.map((sector) => {
              const isActive = activeSector === sector.index;
              return (
                <Button
                  key={sector.id}
                  variant={isActive ? 'primary' : 'ghost'}
                  size="md"
                  onClick={() => handleSectorSelect(sector.id)}
                  className={`livrea-hud-sector-btn ${isActive ? 'is-active' : ''}`}
                  aria-current={isActive ? 'location' : undefined}
                  label={`Sector ${sector.num}: ${sector.title} - ${sector.label}`}
                >
                  <HStack
                    align="center"
                    justify="between"
                    width="100%"
                    className="livrea-hud-sector-row"
                  >
                    <HStack align="center" gap={2}>
                      <Text
                        type="code"
                        size="xsm"
                        color={isActive ? 'accent' : 'secondary'}
                        className="livrea-hud-sector-pill"
                      >
                        {sector.num}
                      </Text>
                      <VStack align="start" gap={0} className="livrea-hud-sector-meta">
                        <Text
                          size="sm"
                          weight="bold"
                          color={isActive ? 'accent' : 'primary'}
                          className="livrea-hud-sector-name"
                        >
                          {sector.title}
                        </Text>
                        <Text
                          size="xsm"
                          color="secondary"
                          className="livrea-hud-sector-desc"
                        >
                          {sector.label}
                        </Text>
                      </VStack>
                    </HStack>
                    {isActive ? (
                      <Text
                        type="code"
                        size="xsm"
                        color="accent"
                        className="livrea-hud-active-flag"
                      >
                        [ CURRENT ]
                      </Text>
                    ) : (
                      <Text
                        type="code"
                        size="xsm"
                        color="secondary"
                        className="livrea-hud-jump-arrow"
                      >
                        →
                      </Text>
                    )}
                  </HStack>
                </Button>
              );
            })}
          </VStack>

          {/* Direct Shortcut to Contact Downlink */}
          <Button
            variant="primary"
            size="md"
            onClick={handleContactDirect}
            className="livrea-hud-bottom-contact"
            label="JUMP TO CONTACT DOWNLINK [ 09 ] ↗"
          >
            <HStack align="center" justify="center" gap={1} width="100%">
              <Text type="code" size="sm" weight="bold" color="primary">
                TRANSMIT MESSAGE // CONTACT [ 09 ] ↗
              </Text>
            </HStack>
          </Button>
        </VStack>
      )}
    </VStack>
  );
}
