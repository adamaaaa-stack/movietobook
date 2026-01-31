/**
 * One-time script: create a PayPal product + subscription plan and print the Plan ID.
 * Loads PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE from .env.local (or .env).
 *
 * Run from movie2book:  node scripts/create-paypal-plan.js
 */

const fs = require('fs');
const path = require('path');

function loadEnv() {
  const dir = path.resolve(__dirname, '..');
  for (const file of ['.env.local', '.env']) {
    const p = path.join(dir, file);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      for (const line of content.split('\n')) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
      }
      return;
    }
  }
}

loadEnv();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const BASE = PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.error('Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in .env.local');
  process.exit(1);
}

async function getToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`Auth failed: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

async function createProduct(token) {
  const res = await fetch(`${BASE}/v1/catalogs/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Movie2Book Monthly',
      description: 'Unlimited video conversions',
      type: 'SERVICE',
    }),
  });
  if (!res.ok) throw new Error(`Create product failed: ${await res.text()}`);
  const data = await res.json();
  return data.id;
}

async function createPlan(token, productId) {
  const res = await fetch(`${BASE}/v1/billing/plans`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      name: 'Movie2Book $10/month',
      description: 'Unlimited conversions',
      billing_cycles: [
        {
          frequency: { interval_unit: 'MONTH', interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: '10', currency_code: 'USD' },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  });
  if (!res.ok) throw new Error(`Create plan failed: ${await res.text()}`);
  const data = await res.json();
  return data.id;
}

async function main() {
  console.log('Using PAYPAL_MODE:', PAYPAL_MODE);
  const token = await getToken();
  const productId = await createProduct(token);
  console.log('Product ID:', productId);
  const planId = await createPlan(token, productId);
  console.log('\nPlan ID (set as PAYPAL_PLAN_ID):', planId);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
