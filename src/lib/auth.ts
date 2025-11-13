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
