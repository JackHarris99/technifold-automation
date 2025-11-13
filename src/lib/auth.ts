/**
 * Simple role-based auth for sales team
 * Stores current user in cookie
 */

import { cookies } from 'next/headers';

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: 'director' | 'sales_rep';
  sales_rep_id?: string | null;
}

/**
 * Get current logged-in user from cookie
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('current_user');

  if (!userCookie) {
    return null;
  }

  try {
    return JSON.parse(userCookie.value) as User;
  } catch {
    return null;
  }
}

/**
 * Check if user is director (sees everything)
 */
export async function isDirector(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'director';
}

/**
 * Get user's sales_rep_id for filtering
 * Returns null if director (sees all)
 */
export async function getUserRepFilter(): Promise<string | null> {
  const user = await getCurrentUser();

  if (!user) return null;
  if (user.role === 'director') return null;  // Directors see all

  return user.sales_rep_id || null;  // Sales reps see only theirs
}

/**
 * Check if current user can act on a company (create quotes, send emails, edit)
 * Directors can act on any company
 * Sales reps can only act on companies assigned to them
 * Returns { allowed: true } or { allowed: false, error: string, assignedTo: string }
 */
export async function canActOnCompany(companyId: string): Promise<{
  allowed: boolean;
  error?: string;
  assignedTo?: string;
}> {
  const user = await getCurrentUser();

  if (!user) {
    return { allowed: false, error: 'Not authenticated' };
  }

  // Directors can do everything
  if (user.role === 'director') {
    return { allowed: true };
  }

  // Sales reps need to check company assignment
  const { getSupabaseClient } = await import('./supabase');
  const supabase = getSupabaseClient();

  const { data: company } = await supabase
    .from('companies')
    .select('account_owner')
    .eq('company_id', companyId)
    .single();

  if (!company) {
    return { allowed: false, error: 'Company not found' };
  }

  // Check if company is assigned to this sales rep
  if (company.account_owner === user.sales_rep_id) {
    return { allowed: true };
  }

  return {
    allowed: false,
    error: `This company is assigned to ${company.account_owner || 'another rep'}. Contact them or a director for assistance.`,
    assignedTo: company.account_owner || 'Unknown',
  };
}
