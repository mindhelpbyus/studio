/**
 * Focus management utilities for accessibility
 */

export class FocusManager {
  private static instance: FocusManager;
  private focusStack: HTMLElement[] = [];
  private trapStack: HTMLElement[] = [];

  static getInstance(): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager();
    }
    return FocusManager.instance;
  }

  /**
   * Save the currently focused element
   */
  saveFocus(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      this.focusStack.push(activeElement);
    }
  }

  /**
   * Restore the last saved focus
   */
  restoreFocus(): void {
    const element = this.focusStack.pop();
    if (element && element.isConnected) {
      element.focus();
    }
  }

  /**
   * Focus the first focusable element in a container
   */
  focusFirst(container: HTMLElement): boolean {
    const focusable = this.getFocusableElements(container);
    if (focusable.length > 0) {
      focusable[0].focus();
      return true;
    }
    return false;
  }

  /**
   * Focus the last focusable element in a container
   */
  focusLast(container: HTMLElement): boolean {
    const focusable = this.getFocusableElements(container);
    if (focusable.length > 0) {
      focusable[focusable.length - 1].focus();
      return true;
    }
    return false;
  }

  /**
   * Get all focusable elements in a container
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    const elements = Array.from(
      container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    return elements.filter(element => {
      return (
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        !element.hasAttribute('hidden') &&
        window.getComputedStyle(element).visibility !== 'hidden'
      );
    });
  }

  /**
   * Trap focus within a container
   */
  trapFocus(container: HTMLElement): () => void {
    this.trapStack.push(container);
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusable = this.getFocusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus the first element
    this.focusFirst(container);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      const index = this.trapStack.indexOf(container);
      if (index > -1) {
        this.trapStack.splice(index, 1);
      }
    };
  }

  /**
   * Check if focus is currently trapped
   */
  isFocusTrapped(): boolean {
    return this.trapStack.length > 0;
  }

  /**
   * Get the current focus trap container
   */
  getCurrentTrap(): HTMLElement | null {
    return this.trapStack[this.trapStack.length - 1] || null;
  }
}

// Singleton instance
export const focusManager = FocusManager.getInstance();

// React hook for focus management
export function useFocusManagement() {
  return {
    saveFocus: () => focusManager.saveFocus(),
    restoreFocus: () => focusManager.restoreFocus(),
    focusFirst: (container: HTMLElement) => focusManager.focusFirst(container),
    focusLast: (container: HTMLElement) => focusManager.focusLast(container),
    trapFocus: (container: HTMLElement) => focusManager.trapFocus(container),
    getFocusableElements: (container: HTMLElement) => 
      focusManager.getFocusableElements(container),
  };
}