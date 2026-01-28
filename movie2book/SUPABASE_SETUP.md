# Supabase Email Confirmation Setup

To disable email confirmation in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Find the **"Confirm email"** toggle
4. **Turn it OFF**
5. Save changes

This will allow users to sign up and immediately use the app without needing to confirm their email.

Alternatively, you can disable it via SQL:

```sql
UPDATE auth.config 
SET enable_signup = true, 
    enable_email_confirmations = false;
```

After disabling email confirmation, users will be automatically signed in after signup.
