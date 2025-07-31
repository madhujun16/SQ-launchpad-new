# Supabase Edge Function Deployment Guide

## Deploy the First-Time Password Function

To deploy the Edge Function for handling first-time password setup:

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project** (if not already linked):
   ```bash
   supabase link --project-ref ngzvoekvwgjinagdvdhf
   ```

4. **Deploy the function**:
   ```bash
   supabase functions deploy handle-first-time-password
   ```

## Function Details

The `handle-first-time-password` function:
- Accepts POST requests with a password in the request body
- Requires authentication (user must be logged in)
- Updates the user's password using Supabase Auth
- Returns success/error responses

## Usage

The function is called automatically when a user sets their password for the first time through the Auth page.

## Environment Variables

The function uses the following environment variables (automatically provided by Supabase):
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Testing

You can test the function using curl:
```bash
curl -X POST https://ngzvoekvwgjinagdvdhf.supabase.co/functions/v1/handle-first-time-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "newpassword123"}'
```

Replace `YOUR_ACCESS_TOKEN` with a valid user session token. 