# User Sync Solution

## Problem Solved
Users signing up through Clerk were not being added to the PostgreSQL database.

## Solution Implemented

### 1. Clerk Webhook (Primary Solution)
- Created `/api/webhooks/clerk` endpoint
- Handles `user.created`, `user.updated`, and `user.deleted` events
- Automatically syncs Clerk users to your database

### 2. Fallback Mechanism (Backup Solution)
- Created `getOrCreateUser()` helper function
- Automatically creates database user if they don't exist
- Used in all API routes that need user data
- Handles existing users who signed up before webhook was configured

## Files Created/Modified

### New Files:
1. `src/app/api/webhooks/clerk/route.ts` - Webhook handler
2. `src/lib/get-or-create-user.ts` - Fallback user creation
3. `CLERK_WEBHOOK_SETUP.md` - Detailed setup instructions

### Modified Files:
1. `src/app/api/dashboard/stats/route.ts` - Uses getOrCreateUser()
2. `src/app/api/assessments/recent/route.ts` - Uses getOrCreateUser()
3. `.env.local` - Added CLERK_WEBHOOK_SECRET placeholder

## Setup Required

### Step 1: Install Dependencies (Already Done)
```bash
npm install svix
```

### Step 2: Configure Clerk Webhook

1. **For Local Development:**
   - Install ngrok: `npm install -g ngrok`
   - Run: `ngrok http 3003`
   - Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

2. **In Clerk Dashboard:**
   - Go to https://dashboard.clerk.com
   - Navigate to Webhooks
   - Add endpoint: `https://abc123.ngrok.io/api/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
   - Copy the Signing Secret

3. **Add to .env.local:**
   ```env
   CLERK_WEBHOOK_SECRET=whsec_your_secret_here
   ```

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

### Step 3: Test

1. **Create a new account** - User should appear in database
2. **Check terminal logs** - Should see "User created in database"
3. **Check database** - Run `npx prisma studio` to verify

## How It Works

### Webhook Flow (New Users):
```
User signs up → Clerk → Webhook → Your API → Database
```

### Fallback Flow (Existing Users):
```
User logs in → API call → getOrCreateUser() → Check DB → Create if missing
```

## Benefits

1. ✅ **Automatic Sync**: New users automatically added to database
2. ✅ **Fallback Protection**: Existing users handled gracefully
3. ✅ **Real-time Updates**: User info stays in sync with Clerk
4. ✅ **Deletion Handling**: Users removed from DB when deleted in Clerk
5. ✅ **Role Management**: All users start with CLIENT role

## Troubleshooting

### Users Still Not Created?
1. Check if `CLERK_WEBHOOK_SECRET` is set
2. Verify webhook URL is correct in Clerk Dashboard
3. Check terminal for webhook errors
4. Test with ngrok for local development

### Webhook Returns 400?
- Secret mismatch - verify the secret in .env.local
- Restart your dev server after adding the secret

### Need to Backfill Existing Users?
The fallback mechanism (`getOrCreateUser()`) will automatically create users when they first access the dashboard after this update.

## For Production

When deploying:
1. Update webhook URL to production domain
2. Set `CLERK_WEBHOOK_SECRET` in production environment
3. Ensure `/api/webhooks/clerk` is publicly accessible
4. Monitor webhook logs in Clerk Dashboard
