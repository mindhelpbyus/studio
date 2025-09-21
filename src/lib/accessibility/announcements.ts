/**
 * Screen reader announcements and live regions
 */

export type AnnouncementPriority = 'polite' | 'assertive';

export class AnnouncementManager {
  private static instance: AnnouncementManager;
  private politeRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;

  static getInstance(): AnnouncementManager {
    if (!AnnouncementManager.instance) {
      AnnouncementManager.instance = new AnnouncementManager();
    }
    return AnnouncementManager.instance;
  }

  /**
   * Initialize live regions for announcements
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Create polite live region
    if (!this.politeRegion) {
      this.politeRegion = this.createLiveRegion('polite');
      document.body.appendChild(this.politeRegion);
    }

    // Create assertive live region
    if (!this.assertiveRegion) {
      this.assertiveRegion = this.createLiveRegion('assertive');
      document.body.appendChild(this.assertiveRegion);
    }
  }

  /**
   * Create a live region element
   */
  private createLiveRegion(priority: AnnouncementPriority): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute('role', 'status');
    region.style.position = 'absolute';
    region.style.left = '-10000px';
    region.style.width = '1px';
    region.style.height = '1px';
    region.style.overflow = 'hidden';
    return region;
  }

  /**
   * Announce a message to screen readers
   */
  announce(message: string, priority: AnnouncementPriority = 'polite'): void {
    if (typeof window === 'undefined') return;

    this.init(); // Ensure regions are initialized

    const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;
    
    if (region) {
      // Clear previous message
      region.textContent = '';
      
      // Set new message after a brief delay to ensure it's announced
      setTimeout(() => {
        region.textContent = message;
      }, 100);

      // Clear message after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }

  /**
   * Announce form validation errors
   */
  announceError(message: string): void {
    this.announce(`Error: ${message}`, 'assertive');
  }

  /**
   * Announce success messages
   */
  announceSuccess(message: string): void {
    this.announce(`Success: ${message}`, 'polite');
  }

  /**
   * Announce loading states
   */
  announceLoading(message: string = 'Loading'): void {
    this.announce(message, 'polite');
  }

  /**
   * Announce navigation changes
   */
  announceNavigation(pageName: string): void {
    this.announce(`Navigated to ${pageName}`, 'polite');
  }

  /**
   * Cleanup live regions
   */
  cleanup(): void {
    if (this.politeRegion && this.politeRegion.parentNode) {
      this.politeRegion.parentNode.removeChild(this.politeRegion);
      this.politeRegion = null;
    }
    
    if (this.assertiveRegion && this.assertiveRegion.parentNode) {
      this.assertiveRegion.parentNode.removeChild(this.assertiveRegion);
      this.assertiveRegion = null;
    }
  }
}

// Singleton instance
export const announcer = AnnouncementManager.getInstance();

// React hook for announcements
export function useAnnouncements() {
  return {
    announce: (message: string, priority?: AnnouncementPriority) => 
      announcer.announce(message, priority),
    announceError: (message: string) => announcer.announceError(message),
    announceSuccess: (message: string) => announcer.announceSuccess(message),
    announceLoading: (message?: string) => announcer.announceLoading(message),
    announceNavigation: (pageName: string) => announcer.announceNavigation(pageName),
  };
}

// Initialize on module load in browser
if (typeof window !== 'undefined') {
  announcer.init();
}