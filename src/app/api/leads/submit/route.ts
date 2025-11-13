/**
 * POST /api/leads/submit
 * Handles inbound lead submissions from machine/problem pages
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 submissions per hour per IP
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`lead-submit:${clientIP}`, {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
          }
        }
      );
    }

    const body = await request.json();
    const {
      name,
      company,
      email,
      phone,
      urgency,
      notes,
      machine_id,
      solution_id,
      problem_id
    } = body;

    // Validate required fields
    if (!name || !company || !email || !urgency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Try to find existing company by name (fuzzy match)
    let companyId = null;
    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .ilike('company_name', `%${company}%`)
      .limit(5);

    // If we find a close match, use it (exact match preferred)
    if (existingCompanies && existingCompanies.length > 0) {
      const exactMatch = existingCompanies.find(
        (c) => c.company_name.toLowerCase() === company.toLowerCase()
      );
      companyId = exactMatch ? exactMatch.company_id : existingCompanies[0].company_id;
    }

    // If no company found and we have machine_id, create basic company record
    if (!companyId && machine_id) {
      const newCompanyId = `LEAD-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          company_id: newCompanyId,
          company_name: company,
          source: 'inbound_lead',
          type: 'prospect'
        });

      if (!companyError) {
        companyId = newCompanyId;
      } else {
        console.error('[leads/submit] Company creation error:', companyError);
      }
    }

    // If we have both company_id and machine_id, create company_machine record
    if (companyId && machine_id) {
      // Check if record already exists
      const { data: existingMachine } = await supabase
        .from('company_machine')
        .select('company_machine_id')
        .eq('company_id', companyId)
        .eq('machine_id', machine_id)
        .single();

      if (!existingMachine) {
        const { error: machineError } = await supabase
          .from('company_machine')
          .insert({
            company_id: companyId,
            machine_id,
            source: 'self_report',
            confirmed: false,
            confidence_score: 5,
            notes: `Self-reported via lead capture form - ${urgency}`
          });

        if (machineError) {
          console.error('[leads/submit] company_machine creation error:', machineError);
        }
      }
    }

    // Create engagement event
    const { error: eventError } = await supabase
      .from('engagement_events')
      .insert({
        company_id: companyId || null,
        source: 'vercel',
        event_type: 'inbound_lead',
        event_name: 'inbound_lead',
        session_id: crypto.randomUUID(),
        url: '/api/leads/submit',
        meta: {
          lead_data: {
            name,
            company,
            email,
            phone,
            urgency,
            notes,
            machine_id,
            solution_id,
            problem_id
          }
        }
      });

    if (eventError) {
      console.error('[leads/submit] Engagement event error:', eventError);
    }

    // Enqueue alert job in outbox
    const { error: outboxError } = await supabase
      .from('outbox')
      .insert({
        job_type: 'inbound_lead_alert',
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
        payload: {
          lead: {
            name,
            company,
            email,
            phone,
            urgency,
            notes
          },
          machine_id,
          solution_id,
          problem_id,
          submitted_at: new Date().toISOString()
        }
      });

    if (outboxError) {
      console.error('[leads/submit] Outbox error:', outboxError);
      // Don't fail the request if outbox fails - lead is still captured in engagement_events
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[leads/submit] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
