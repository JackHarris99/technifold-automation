/**
 * Simple role-based auth for sales team
 * Stores current user in cookie
 */

import { cookies } from 'next/headers';

export interface User {
  rep_id: string;
  rep_name: string;
  email: string;
  role: 'director' | 'sales_rep';
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
 * Get user's rep_id for filtering
 * Returns null if director (sees all)
 */
export async function getUserRepFilter(): Promise<string | null> {
  const user = await getCurrentUser();

  if (!user) return null;
  if (user.role === 'director') return null;  // Directors see all

  return user.rep_id;  // Sales reps see only theirs
}
