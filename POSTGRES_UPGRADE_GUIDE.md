# PostgreSQL Upgrade Guide

## Current Status
- **Current Version:** `supabase-postgres-17.4.1.075`
- **Security Patches Available:** Yes
- **Recommended Action:** Upgrade when convenient

## Why Upgrade?
Security patches have been released for PostgreSQL 17.4. Upgrading applies these fixes to protect against known vulnerabilities.

## Important: Downtime Warning
⚠️ **Upgrading PostgreSQL will restart your database, causing 2-5 minutes of downtime.**

### Impact:
- Your website will be **offline** during the restart
- API requests will fail
- Users cannot place orders
- Admin dashboard unavailable

### Best Time to Upgrade:
- **Off-peak hours** (e.g., 2-4 AM UK time, Sunday morning)
- When no critical sales activity is expected
- After notifying your team

## How to Upgrade

### Via Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/infrastructure

2. Click **"Database"** section

3. Look for **"Postgres Version"** or **"Infrastructure"**

4. Click **"Upgrade"** or **"Apply Updates"**

5. Confirm the upgrade

6. Wait 2-5 minutes for restart to complete

7. Test your site:
   - Homepage loads
   - Admin login works
   - Customer portals accessible
   - Orders can be placed

### Rollback Plan:
- Supabase handles rollback automatically if upgrade fails
- Your daily backups remain available
- You can restore from backup if needed (though unlikely)

## Post-Upgrade Verification

Run these checks:

1. **Site Status:**
   - [ ] Homepage loads
   - [ ] Admin dashboard accessible
   - [ ] Distributor portal works
   - [ ] Customer reorder portals load

2. **Database Queries:**
   - [ ] Company data loads
   - [ ] Products display correctly
   - [ ] Orders can be created
   - [ ] Invoices sync from Stripe

3. **Background Jobs:**
   - [ ] Cron jobs running (check Vercel logs)
   - [ ] Emails sending (check outbox table)

## Optional: Check New Version

After upgrade, verify version:

```sql
SELECT version();
```

Should show newer version than `17.4.1.075`.

## When to Upgrade

**Priority: Medium** - Not urgent, but should do within the next month.

**Recommended Schedule:**
- Plan for a quiet weekend morning (Sunday 3-5 AM)
- Have someone available to test afterward
- Notify team of brief maintenance window

## Questions?

If you encounter issues:
1. Check Supabase dashboard for error messages
2. Review recent backups
3. Contact Supabase support if database doesn't restart
4. Restore from backup if critical (last resort)
