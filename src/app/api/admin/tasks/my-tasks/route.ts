/**
 * GET /api/admin/tasks/my-tasks
 * Fetch tasks for the current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Fetch pending tasks for current user
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user_id)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true })
      .limit(20);

    if (error) {
      console.error('[tasks/my-tasks] Error fetching tasks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }

    // Enrich with company names
    const companyIds = [...new Set(tasks?.map(t => t.company_id).filter(Boolean))];
    let companies: any[] = [];

    if (companyIds.length > 0) {
      const { data: companiesData } = await supabase
        .from('companies')
        .select('company_id, company_name')
        .in('company_id', companyIds);

      companies = companiesData || [];
    }

    const companyMap = new Map(companies.map(c => [c.company_id, c.company_name]));

    const enrichedTasks = tasks?.map(task => ({
      ...task,
      company_name: task.company_id ? companyMap.get(task.company_id) : null,
    })) || [];

    return NextResponse.json({
      success: true,
      tasks: enrichedTasks,
    });
  } catch (error) {
    console.error('[tasks/my-tasks] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
