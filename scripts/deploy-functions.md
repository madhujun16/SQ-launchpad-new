# Deploy Edge Functions

## Quick Deploy Command

To deploy the `create-user` edge function:

```bash
npx supabase functions deploy create-user
```

## Using the Deployment Script

For a more automated approach with error checking:

```bash
./scripts/deploy-create-user-function.sh
```

## Prerequisites

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   npx supabase login
   ```

3. **Link your project** (if not already linked):
   ```bash
   npx supabase link --project-ref <your-project-ref>
   ```
   
   You can find your project reference ID in your Supabase dashboard URL:
   - URL format: `https://supabase.com/dashboard/project/<project-ref>`

## Verify Deployment

After deployment, you can verify the function is working by checking:
- Supabase Dashboard → Edge Functions → `create-user`
- Test it from the User Management page in your app

