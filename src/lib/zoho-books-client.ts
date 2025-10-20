/**
 * Zoho Books API client for invoice and payment creation
 * Implements OAuth2 refresh token flow and invoice/payment sync
 */

import axios, { AxiosInstance } from 'axios';
import { getSupabaseClient } from './supabase';

const ZOHO_API_BASE = process.env.ZOHO_BOOKS_API_BASE || 'https://books.zoho.com/api/v3';
const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID;
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;

if (!ZOHO_ORGANIZATION_ID || !ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
  console.warn('[zoho] Missing Zoho Books configuration. Zoho sync will be disabled.');
}

interface ZohoTokenResponse {
  access_token: string;
  expires_in: number;
  api_domain: string;
  token_type: string;
}

/**
 * Zoho Books client with automatic token refresh
 */
class ZohoBooksClient {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ZOHO_API_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to ensure fresh access token
    this.client.interceptors.request.use(async (config) => {
      await this.ensureAccessToken();
      config.headers.Authorization = `Zoho-oauthtoken ${this.accessToken}`;
      config.params = {
        ...config.params,
        organization_id: ZOHO_ORGANIZATION_ID,
      };
      return config;
    });
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureAccessToken(): Promise<void> {
    // Check if token is still valid (with 5 min buffer)
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 300000) {
      return;
    }

    console.log('[zoho] Refreshing access token...');

    const response = await axios.post<ZohoTokenResponse>(
      'https://accounts.zoho.com/oauth/v2/token',
      null,
      {
        params: {
          refresh_token: ZOHO_REFRESH_TOKEN,
          client_id: ZOHO_CLIENT_ID,
          client_secret: ZOHO_CLIENT_SECRET,
          grant_type: 'refresh_token',
        },
      }
    );

    this.accessToken = response.data.access_token;
    this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);
    console.log('[zoho] Access token refreshed successfully');
  }

  /**
   * Ensure customer (account) exists in Zoho Books
   * Returns Zoho contact/customer ID
   */
  async ensureCustomer(companyId: string): Promise<string> {
    const supabase = getSupabaseClient();

    // Check if we already have Zoho account ID
    const { data: company } = await supabase
      .from('companies')
      .select('company_id, company_name, zoho_account_id')
      .eq('company_id', companyId)
      .single();

    if (!company) {
      throw new Error(`Company not found: ${companyId}`);
    }

    if (company.zoho_account_id) {
      return company.zoho_account_id;
    }

    // Create customer in Zoho Books
    console.log(`[zoho] Creating customer for company ${companyId}`);

    const response = await this.client.post('/contacts', {
      contact_name: company.company_name,
      company_name: company.company_name,
      contact_type: 'customer',
      custom_fields: [
        {
          customfield_id: 'cf_company_id', // Adjust to your Zoho custom field ID
          value: companyId,
        },
      ],
    });

    const zohoAccountId = response.data.contact.contact_id;

    // Update database
    await supabase
      .from('companies')
      .update({ zoho_account_id: zohoAccountId })
      .eq('company_id', companyId);

    return zohoAccountId;
  }

  /**
   * Create an invoice in Zoho Books
   */
  async createInvoice(params: {
    companyId: string;
    orderId: string;
    items: Array<{
      product_code: string;
      description: string;
      quantity: number;
      rate: number;
    }>;
    reference_number?: string;
  }): Promise<{ invoice_id: string; invoice_number: string }> {
    const { companyId, orderId, items, reference_number } = params;

    // Ensure customer exists
    const customerId = await this.ensureCustomer(companyId);

    console.log(`[zoho] Creating invoice for order ${orderId}`);

    const response = await this.client.post('/invoices', {
      customer_id: customerId,
      reference_number: reference_number || orderId,
      line_items: items.map(item => ({
        item_id: item.product_code, // Assumes Zoho item IDs match product codes
        name: item.description,
        description: item.description,
        rate: item.rate,
        quantity: item.quantity,
      })),
      custom_fields: [
        {
          customfield_id: 'cf_order_id', // Adjust to your Zoho custom field ID
          value: orderId,
        },
      ],
    });

    const invoice = response.data.invoice;

    return {
      invoice_id: invoice.invoice_id,
      invoice_number: invoice.invoice_number,
    };
  }

  /**
   * Record a payment against an invoice
   */
  async recordPayment(params: {
    invoiceId: string;
    amount: number;
    paymentDate: string; // YYYY-MM-DD format
    paymentMode: string; // e.g., 'creditcard', 'stripe'
    reference: string;
  }): Promise<{ payment_id: string }> {
    const { invoiceId, amount, paymentDate, paymentMode, reference } = params;

    console.log(`[zoho] Recording payment for invoice ${invoiceId}`);

    const response = await this.client.post('/customerpayments', {
      customer_id: '', // Will be filled from invoice
      payment_mode: paymentMode,
      amount,
      date: paymentDate,
      reference_number: reference,
      invoices: [
        {
          invoice_id: invoiceId,
          amount_applied: amount,
        },
      ],
    });

    return {
      payment_id: response.data.payment.payment_id,
    };
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId: string) {
    const response = await this.client.get(`/invoices/${invoiceId}`);
    return response.data.invoice;
  }
}

// Singleton instance
let zohoClient: ZohoBooksClient | null = null;

export function getZohoBooksClient(): ZohoBooksClient {
  if (!zohoClient) {
    zohoClient = new ZohoBooksClient();
  }
  return zohoClient;
}

/**
 * Check if Zoho Books integration is configured
 */
export function isZohoConfigured(): boolean {
  return !!(
    ZOHO_ORGANIZATION_ID &&
    ZOHO_CLIENT_ID &&
    ZOHO_CLIENT_SECRET &&
    ZOHO_REFRESH_TOKEN
  );
}
