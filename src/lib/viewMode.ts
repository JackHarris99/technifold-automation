/**
 * Global View Mode Management
 * Handles "All Companies" vs "My Customers" toggle across entire admin
 */

export type ViewMode = 'all' | 'my_customers';

const VIEW_MODE_KEY = 'admin_view_mode';

/**
 * Get current view mode from localStorage
 */
export function getViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'all';

  try {
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    return (stored === 'my_customers' ? 'my_customers' : 'all') as ViewMode;
  } catch {
    return 'all';
  }
}

/**
 * Set view mode in localStorage
 */
export function setViewMode(mode: ViewMode): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(VIEW_MODE_KEY, mode);
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: VIEW_MODE_KEY,
      newValue: mode,
    }));
  } catch (error) {
    console.error('Failed to save view mode:', error);
  }
}

/**
 * Add view mode to API URL
 */
export function addViewModeToUrl(url: string, viewMode: ViewMode): string {
  const separator = url.includes('?') ? '&' : '?';
  return viewMode === 'my_customers' ? `${url}${separator}viewMode=my_customers` : url;
}
