/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import {
  NewPopoverAlignment,
  useTheme,
  usePrefix as useCarbonPrefix,
} from '@carbon/react';
import React, { HTMLProps, useLayoutEffect, useRef } from 'react';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';

import {
  autoUpdate,
  computePosition,
  flip,
  shift,
  offset,
  arrow,
} from '@floating-ui/react';

interface BubbleProps extends Omit<HTMLProps<HTMLDivElement>, 'target'> {
  /**
   * 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-end' | 'left-start' | 'right-end' | 'right-start';
   **/
  align: NewPopoverAlignment;
  /**
   * Values can range from an Element, a ref of an Element, a string which will use queryselector to select an Element.
   **/
  target: Element | React.RefObject<Element> | string | null | undefined;
  dropShadow?: boolean;
  highContrast?: boolean;
  open: boolean;
}

const Bubble = ({
  children,
  align,
  target,
  className: customClassName,
  dropShadow = true,
  highContrast = false,
  open,
  // onClose,
  ...rest
}: BubbleProps) => {
  const { theme } = useTheme();
  const labsPrefix = usePrefix();
  const prefix = `${labsPrefix}--whats-new`;
  const carbonPrefix = useCarbonPrefix();
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<Element | null>(null);

  useLayoutEffect(() => {
    if (target) {
      if (typeof target === 'string') {
        targetRef.current = document.querySelector(target);
      } else if ('current' in target) {
        targetRef.current = target.current;
      } else {
        targetRef.current = target;
      }

      if (targetRef.current && tooltipRef.current && arrowRef.current && open) {
        targetRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });

        // const middlewares = align ? [flip()] : [autoPlacement()];

        const middlewares = [
          offset(10),
          flip(),
          shift({ padding: 5 }),
          arrow({ element: arrowRef.current }),
        ];

        const cleanup = autoUpdate(
          targetRef.current,
          tooltipRef.current,
          () => {
            if (targetRef.current && tooltipRef.current) {
              computePosition(targetRef.current, tooltipRef.current, {
                placement: align,
                strategy: 'fixed',
                middleware: middlewares,
              }).then(({ x, y, placement, middlewareData }) => {
                if (tooltipRef.current) {
                  Object.assign(tooltipRef.current.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                  });
                }

                const arrowX = middlewareData.arrow?.x;
                const arrowY = middlewareData.arrow?.y;

                const staticSide = {
                  top: 'bottom',
                  right: 'left',
                  bottom: 'top',
                  left: 'right',
                }[placement.split('-')[0]];

                if (staticSide && arrowRef.current) {
                  Object.assign(arrowRef.current.style, {
                    left: arrowX != null ? `${arrowX}px` : '',
                    top: arrowY != null ? `${arrowY}px` : '',
                    right: '',
                    bottom: '',
                    [staticSide]: '-4px',
                  });
                }
              });
            }
          },
          { animationFrame: true }
        );

        return () => {
          cleanup();
        };
      }
    }
  }, [target, open, align]);

  if (!target) {
    return null;
  }

  return (
    <div
      {...rest}
      ref={tooltipRef}
      className={cx(
        {
          [`${carbonPrefix}--g100`]:
            (theme === 'white' && highContrast) ||
            (theme === 'g100' && !highContrast),
          [`${carbonPrefix}--g90`]:
            (theme === 'g10' && highContrast) ||
            (theme === 'g90' && !highContrast),
          [`${carbonPrefix}--g10`]:
            (theme === 'g90' && highContrast) ||
            (theme === 'g10' && !highContrast),
          [`${carbonPrefix}--white`]:
            (theme === 'g100' && highContrast) ||
            (theme === 'white' && !highContrast),
          [`${prefix}__bubble`]: true,
          [`${prefix}__bubble-open`]: open,
          [`${prefix}__bubble-drop-shadow`]: dropShadow,
          [`${prefix}__bubble-high-contrast`]: highContrast,
          [`${prefix}__bubble-hidden`]: !targetRef.current,
        },
        customClassName
      )}>
      <div ref={arrowRef} className={`${prefix}__bubble__arrow`}></div>
      {children}
    </div>
  );
};

Bubble.displayName = 'Bubble';

export { Bubble };
