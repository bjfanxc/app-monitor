# App Monitor (上架宝)

A monitoring system for Google Play and App Store applications to track their status and send alerts via Telegram when an app is removed.

## Tech Stack
- **Frontend**: Vite + Vue 3 + TypeScript
- **Styling**: Tailwind CSS + shadcn-vue (compatible components)
- **Backend/Database**: Supabase
- **Deployment**: Vercel

## Project Structure
- `src/views`: Main page views (Dashboard, Alerts, Settings)
- `src/components`: Reusable UI components
- `src/lib`: Utilities and Supabase client
- `supabase/schema.sql`: Database schema definition

## Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup**
   - Create a new project on [Supabase](https://supabase.com).
   - Go to the SQL Editor in Supabase dashboard.
   - Copy the content of `supabase/schema.sql` and run it to create the tables.

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## Features
- **Dashboard**: View status of all monitored apps (Online, Removed, Error).
- **Alerts**: History of status change alerts.
- **Settings**: Configure notification channels (Email, Telegram).

## Monitoring Logic
The monitoring logic is designed to run as a separate service or scheduled task (Cron).
A placeholder script is located at `scripts/monitor.js` which outlines the logic for:
1. Fetching apps from Supabase.
2. Checking their store status (scraping or API).
3. Sending Telegram alerts if status changes.
