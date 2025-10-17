# Database Setup Instructions

## Step 1: Get Your Neon Password

1. Go to your Neon dashboard
2. In the "Connect to your database" dialog, click **"Show password"**
3. Copy the actual password (not the asterisks)

## Step 2: Update Environment Variables

1. Copy `.env.local.template` to `.env.local`:
   ```bash
   cp .env.local.template .env.local
   ```

2. Edit `.env.local` and replace `YOUR_ACTUAL_PASSWORD_HERE` with your real password:
   ```
   DATABASE_URL=postgresql://neondb_owner:YOUR_REAL_PASSWORD@ep-summer-pond-ad39b1bg-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

## Step 3: Initialize Database

Run the database initialization script:
```bash
node scripts/init-db.js
```

You should see:
```
🔗 Connecting to database...
✅ Database schema initialized successfully!
📊 Created table: signups
🕐 Database time: [current time]
🎉 Database setup complete!
```

## Step 4: Test the Connection

Start the development server:
```bash
npm run dev
```

The signup form should now work and store data in your Neon database!

## Troubleshooting

- **SSL Error**: Make sure you're using the correct connection string with SSL parameters
- **Password Error**: Double-check the password from Neon dashboard
- **Connection Timeout**: Verify your Neon database is active (not paused)
