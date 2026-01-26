/**
 * Find ESP Colour's missing invoice from Stripe
 */

const Stripe = require('stripe');

async function findInvoice() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY required');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });

  const customerId = 'cus_Temp7fuLKGUlii';

  console.log('Fetching invoices for ESP Colour (', customerId, ')...');

  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit: 10,
  });

  console.log('\nFound', invoices.data.length, 'invoices:\n');

  for (const invoice of invoices.data) {
    const createdDate = new Date(invoice.created * 1000);
    const paidDate = invoice.status_transitions.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000)
      : null;

    console.log('---');
    console.log('Invoice ID:', invoice.id);
    console.log('Status:', invoice.status);
    console.log('Amount:', (invoice.amount_due / 100).toFixed(2), invoice.currency.toUpperCase());
    console.log('Created:', createdDate.toISOString());
    console.log('Paid:', paidDate ? paidDate.toISOString() : 'Not paid');
    console.log('Metadata:', invoice.metadata);

    if (invoice.lines && invoice.lines.data.length > 0) {
      console.log('Line items:');
      for (const item of invoice.lines.data) {
        console.log('  -', item.description, '×', item.quantity, '@', (item.unit_amount / 100).toFixed(2));
      }
    }
  }
}

findInvoice().catch(console.error);
