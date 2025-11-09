/**
 * Permission helpers for company actions
 */

import { getCurrentUser, isDirector } from './auth';

export interface Company {
  company_id: string;
  account_owner: string | null;
  type?: string;
  category?: string;
}

/**
 * Check if current user can perform actions on this company
 * Directors: can do everything
 * Sales reps: can only act on their own companies
 */
export async function canActOnCompany(company: Company): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // Directors can act on any company
  if (user.role === 'director') return true;

  // Sales reps can only act on companies they own
  return company.account_owner === user.rep_id;
}

/**
 * Check if current user can change account_owner field
 * Only directors can change ownership
 */
export async function canChangeOwnership(): Promise<boolean> {
  return await isDirector();
}

/**
 * Check if current user can change company type/category
 * Only directors can change company classification
 */
export async function canChangeCompanyType(): Promise<boolean> {
  return await isDirector();
}

/**
 * Get permission status for a company (for UI display)
 */
export async function getCompanyPermissions(company: Company) {
  const canAct = await canActOnCompany(company);
  const canChangeOwner = await canChangeOwnership();
  const canChangeType = await canChangeCompanyType();

  return {
    canSendMarketing: canAct,
    canCreateQuote: canAct,
    canEditContacts: canAct,
    canViewDetails: true, // Everyone can view
    canChangeAccountOwner: canChangeOwner,
    canChangeCompanyType: canChangeType,
  };
}
