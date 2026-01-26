# Clerk Webhook Setup Guide

## Problem
Users are not being added to the database when they sign up through Clerk.

## Solution
Set up a Clerk webhook to sync user data to your database.

## Setup Steps

### 1. Get Your Webhook Endpoint URL

Your webhook endpoint is:
```
https://your-domain.com/api/webhooks/clerk
```

For local development, you'll need to use a tunneling service like:
- **ngrok**: `ngrok http 3003`
- **Cloudflare Tunnel**: `cloudflared tunnel --url http://localhost:3003`

Example ngrok URL:
```
https://abc123.ngrok.io/api/webhooks/clerk
```

### 2. Configure Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Enter your webhook URL: `https://your-domain.com/api/webhooks/clerk`
6. Subscribe to these events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
7. Click **Create**

### 3. Get Your Webhook Secret

After creating the webhook:
1. Click on your webhook endpoint
2. Copy the **Signing Secret** (starts with `whsec_`)

### 4. Add Webhook Secret to Environment Variables

Add this to your `.env.local` file:

```env
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
```

### 5. Restart Your Development Server

```bash
npm run dev
```

## Testing the Webhook

### Option 1: Create a New User
1. Sign up with a new account
2. Check your database to see if the user was created
3. Check the terminal logs for "User created in database"

### Option 2: Use Clerk Dashboard Testing
1. Go to your webhook in Clerk Dashboard
2. Click **Testing** tab
3. Send a test `user.created` event
4. Check the response and logs

## Troubleshooting

### Webhook Returns 400 Error
- Make sure `CLERK_WEBHOOK_SECRET` is set in `.env.local`
- Verify the secret matches the one in Clerk Dashboard
- Restart your dev server after adding the secret

### User Not Created in Database
- Check terminal logs for errors
- Verify your database connection (DATABASE_URL)
- Make sure Prisma schema is synced: `npx prisma db push`

### Local Development Issues
- Use ngrok or similar tunneling service
- Make sure your local server is running
- Update the webhook URL in Clerk Dashboard with your ngrok URL

## For Production

When deploying to production:
1. Update the webhook URL in Clerk Dashboard to your production domain
2. Make sure `CLERK_WEBHOOK_SECRET` is set in your production environment variables
3. Ensure your production server can receive POST requests at `/api/webhooks/clerk`

## Webhook Events Handled

- **user.created**: Creates a new user in your database with role "CLIENT"
- **user.updated**: Updates user information (name, email, avatar)
- **user.deleted**: Removes user from your database

## Security

The webhook uses Svix to verify that requests are actually coming from Clerk. Never skip webhook verification in production!
