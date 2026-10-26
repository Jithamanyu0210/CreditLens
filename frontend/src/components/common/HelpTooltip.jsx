import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

/**
 * HelpTooltip Component
 * Displays a subtle help icon (?) that reveals explanatory feature descriptions
 * immediately on hover (or focus for keyboard users).
 * Rendered via React Portal directly into document.body with position: fixed,
 * preventing clipping by parent overflow containers, cards, tables, or sidebar.
 */
export const HelpTooltip = ({
  text,
  placement = 'top',
  size = 14,
  ariaLabel = 'More information',
  style = {}
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, actualPlacement: placement });
  const triggerRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;
    let actualPlacement = placement;

    if (placement === 'right') {
      top = rect.top + rect.height / 2;
      left = rect.right + 8;
      // If overflowing right edge of viewport, flip to top or bottom
      if (left + 260 > window.innerWidth - 12) {
        if (rect.top > 80) {
          actualPlacement = 'top';
          top = rect.top - 8;
          left = rect.left + rect.width / 2;
        } else {
          actualPlacement = 'bottom';
          top = rect.bottom + 8;
          left = rect.left + rect.width / 2;
        }
      }
    } else {
      // Default 'top' placement
      top = rect.top - 8;
      left = rect.left + rect.width / 2;
      // If overflowing top of viewport, flip to bottom
      if (rect.top < 70) {
        actualPlacement = 'bottom';
        top = rect.bottom + 8;
      }
    }

    // Clamp horizontal position so tooltip remains comfortably within viewport
    left = Math.max(140, Math.min(window.innerWidth - 140, left));

    setCoords({ top, left, actualPlacement });
  }, [placement]);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    calculatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 120);
  };

  const handleFocus = () => {
    calculatePosition();
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  if (!text) return null;

  return (
    <>
      <span
        ref={triggerRef}
        className="cl-help-trigger"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-haspopup="tooltip"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'help',
          verticalAlign: 'middle',
          ...style
        }}
      >
        <HelpCircle size={size} />
      </span>

      {isVisible &&
        createPortal(
          <div
            className={`cl-floating-tooltip cl-floating-tooltip-${coords.actualPlacement}`}
            role="tooltip"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform:
                coords.actualPlacement === 'top'
                  ? 'translate(-50%, -100%)'
                  : coords.actualPlacement === 'bottom'
                  ? 'translate(-50%, 0)'
                  : coords.actualPlacement === 'right'
                  ? 'translateY(-50%)'
                  : 'translate(-50%, -100%)'
            }}
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
};
