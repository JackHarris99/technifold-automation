/**
 * Global View Mode Management
 * Handles "All Companies" vs "My Customers" vs specific rep views
 */

export type ViewMode = 'all' | 'my_customers' | 'view_as_lee' | 'view_as_steve' | 'view_as_callum';

const VIEW_MODE_KEY = 'admin_view_mode';

/**
 * Get current view mode from localStorage
 */
export function getViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'all';

  try {
    const stored = localStorage.getItem(VIEW_MODE_KEY);

    if (stored === 'my_customers') return 'my_customers';
    if (stored === 'view_as_lee') return 'view_as_lee';
    if (stored === 'view_as_steve') return 'view_as_steve';
    if (stored === 'view_as_callum') return 'view_as_callum';

    return 'all';
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

/**
 * Get view mode from cookies (for server components)
 */
export async function getViewModeFromCookies(): Promise<ViewMode> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const viewModeCookie = cookieStore.get('view_mode');
    const value = viewModeCookie?.value;

    if (value === 'my_customers') return 'my_customers';
    if (value === 'view_as_lee') return 'view_as_lee';
    if (value === 'view_as_steve') return 'view_as_steve';
    if (value === 'view_as_callum') return 'view_as_callum';

    return 'all';
  } catch {
    return 'all';
  }
}

/**
 * Get sales rep ID from view mode
 * Returns the sales_rep_id to filter by, or null for "all" view
 */
export function getSalesRepFromViewMode(viewMode: ViewMode, currentUserRepId: string): string | null {
  if (viewMode === 'my_customers') return currentUserRepId;
  if (viewMode === 'view_as_lee') return 'Lee';
  if (viewMode === 'view_as_steve') return 'Steve';
  if (viewMode === 'view_as_callum') return 'Callum';
  return null; // 'all' view - no filter
}

/**
 * Get display label for view mode
 */
export function getViewModeLabel(viewMode: ViewMode): string {
  const labels: Record<ViewMode, string> = {
    'all': 'All Companies (Team)',
    'my_customers': 'My Customers Only',
    'view_as_lee': "Lee's Customers",
    'view_as_steve': "Steve's Customers",
    'view_as_callum': "Callum's Customers",
  };
  return labels[viewMode];
}
