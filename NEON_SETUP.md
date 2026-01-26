# Neon Database Setup Guide

## Steps to configure Neon with your project:

### 1. Create a Neon Account
- Go to https://console.neon.tech
- Sign up or log in to your account

### 2. Create a New Project
- Click "Create Project"
- Choose a name for your project
- Select a region close to your users

### 3. Get Your Connection String
- After creating the project, you'll see your connection string
- It will look like: `postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require`

### 4. Update .env.local
Replace the placeholder values in `.env.local` with your actual Neon connection strings:
```env
DATABASE_URL="your_neon_connection_string_here"
DIRECT_URL="your_neon_connection_string_here"
```

### 5. Run Prisma Migrations
After updating the connection strings, run:
```bash
npx prisma generate
npx prisma db push
```

### 6. (Optional) View Your Database
To open Prisma Studio and view your database:
```bash
npx prisma studio
```

## What Changed:
- ✅ Changed database provider from MongoDB to PostgreSQL
- ✅ Removed MongoDB-specific `@map("_id")` decorator
- ✅ Removed `relationMode = "prisma"` (not needed for PostgreSQL)
- ✅ Added `directUrl` for Neon's connection pooling
- ✅ Updated .env.local with Neon connection string placeholders

## Notes:
- Neon provides connection pooling automatically
- The `DIRECT_URL` is used for migrations and can be the same as `DATABASE_URL`
- Make sure to keep your connection strings secure and never commit them to git
