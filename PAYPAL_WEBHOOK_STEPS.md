# Add PayPal Webhook (so subscription activates after payment)

## 1. Create webhook in PayPal

1. Go to **https://developer.paypal.com** and sign in.
2. Open **Apps & Credentials** and select your app (or create one).
3. Scroll to **Webhooks** and click **Add Webhook**.
4. **Webhook URL:**  
   `https://movietobook.onrender.com/api/webhook/paypal`  
   (No trailing slash.)
5. **Event types** – subscribe to:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `PAYMENT.SALE.COMPLETED`
6. Click **Save**.
7. **Copy the Webhook ID** (e.g. `8XXXXXX`) – you need it for Render.

## 2. Add Webhook ID on Render

1. **Render Dashboard** → your service (e.g. movietobook) → **Environment**.
2. Add a variable:
   - **Key:** `PAYPAL_WEBHOOK_ID`
   - **Value:** the Webhook ID you copied (e.g. `8XXXXXX`).
3. Click **Save Changes** (Render will redeploy).

## 3. Check it works

- Make a test payment; user should land on `/thanks` and then get access when the webhook runs.
- In **PayPal Developer** → **Webhooks** → your webhook → **Webhook events**: check that events show **Delivered**.
- In **Render** → **Logs**: look for `POST /api/webhook/paypal` and any errors.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Webhook URL not found (404) | Ensure the URL is exactly `https://YOUR-APP.onrender.com/api/webhook/paypal` and the app is deployed. |
| 500 from webhook | Ensure `PAYPAL_WEBHOOK_ID` is set on Render and matches the ID in PayPal. |
| Subscription not activating | Check Render logs for webhook errors; ensure Supabase `user_subscriptions` table and RLS allow updates. |
