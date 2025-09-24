'use client';

import { useState, useCallback, useRef } from 'react';
import { CalendarAppointment, TimeSlot, ContextMenuAction } from '@/lib/calendar-types';

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  target: CalendarAppointment | TimeSlot | null;
  actions: ContextMenuAction[];
}

interface UseContextMenuReturn {
  contextMenu: ContextMenuState;
  openContextMenu: (
    event: React.MouseEvent,
    target: CalendarAppointment | TimeSlot,
    actions: ContextMenuAction[]
  ) => void;
  closeContextMenu: () => void;
  handleActionClick: (action: ContextMenuAction) => void;
}

export function useContextMenu(): UseContextMenuReturn {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    target: null,
    actions: [],
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const openContextMenu = useCallback((
    event: React.MouseEvent,
    target: CalendarAppointment | TimeSlot,
    actions: ContextMenuAction[]
  ) => {
    event.preventDefault();
    event.stopPropagation();

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      target,
      actions,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({
      ...prev,
      isOpen: false,
    }));

    // Clear target after animation completes
    timeoutRef.current = setTimeout(() => {
      setContextMenu(prev => ({
        ...prev,
        target: null,
        actions: [],
      }));
    }, 150);
  }, []);

  const handleActionClick = useCallback((action: ContextMenuAction) => {
    if (contextMenu.target) {
      action.action(contextMenu.target);
    }
    closeContextMenu();
  }, [contextMenu.target, closeContextMenu]);

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
    handleActionClick,
  };
}

// Keyboard navigation hook for context menu
export function useContextMenuKeyboard(
  isOpen: boolean,
  actions: ContextMenuAction[],
  onActionClick: (action: ContextMenuAction) => void,
  onClose: () => void
) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    const enabledActions = actions.filter(action => !action.disabled && !action.separator);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < enabledActions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : enabledActions.length - 1
        );
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (enabledActions[selectedIndex]) {
          onActionClick(enabledActions[selectedIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        onClose();
        break;

      default:
        // Handle letter key navigation
        const key = event.key.toLowerCase();
        const actionIndex = enabledActions.findIndex(action => 
          action.label.toLowerCase().startsWith(key)
        );
        if (actionIndex !== -1) {
          setSelectedIndex(actionIndex);
        }
        break;
    }
  }, [isOpen, actions, onActionClick, onClose, selectedIndex]);

  // Reset selected index when menu opens
  useState(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  });

  return {
    selectedIndex,
    handleKeyDown,
  };
}