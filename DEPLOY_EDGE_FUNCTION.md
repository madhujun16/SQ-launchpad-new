# How to Deploy the create-user Edge Function

Since you can only run scripts on Supabase, here are your options:

## Option 1: Deploy via Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Edge Functions** in the left sidebar
4. Click **Create a new function** (or if `create-user` already exists, select it)
5. Copy the entire contents of `supabase/functions/create-user/index.ts`
6. Paste it into the function editor
7. Click **Deploy** or **Save**

## Option 2: Use Supabase CLI in Supabase Cloud (if available)

If you have access to a terminal in Supabase environment:

```bash
supabase functions deploy create-user
```

## Option 3: Manual Copy-Paste Method

1. Open `supabase/functions/create-user/index.ts` in your local editor
2. Copy all the code
3. Go to Supabase Dashboard → Edge Functions
4. Create/Edit the `create-user` function
5. Paste the code
6. Deploy

## Important Notes:

- The function name must be exactly: `create-user`
- Make sure all environment variables are set in Supabase Dashboard:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ANON_KEY`

These are usually set automatically, but you can verify in:
Dashboard → Settings → Edge Functions → Secrets

## After Deployment:

1. Test from your User Management page
2. Check logs in Dashboard → Edge Functions → create-user → Logs
3. Look for error messages if issues persist

