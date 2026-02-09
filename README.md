# IDET - Important Documents Expiry Tracker

A modern, responsive React application designed to track document expiries and manage alert notifications via Google Calendar and Gmail.

## Features

- **📊 Dashboard**: Real-time overview of total, active, and expiring documents.
- **🔔 Smart Alerts**: 
  - **Gmail**: Automated email notifications via Node.js backend (`nodemailer`).
  - **Google Calendar**: Create calendar events directly from the app.
- **live Sync**: Real-time updates across devices using Supabase Realtime.
- **📅 Interactive Calendar**: View expiry dates on a monthly grid.
- **📱 Fully Responsive**: Optimized for specialized mobile views.
- **👤 User Profiles**: Manage contact details and preferences.
- **☁️ Cloud Sync**: Data persisted securely via Supabase.

## Tech Stack

- **Frontend**: React (Vite), TypeScript, Lucide React
- **Backend**: Node.js (Express) - handles email sending & serving the app
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Deployment**: Render Web Service (recommended)

## Getting Started

### 1. Prerequisites
-   Node.js (v18+)
-   Supabase Project

### 2. Database Setup
1.  Go to your Supabase Dashboard via SQL Editor.
2.  Copy the contents of `supabase_schema.sql` and run it.

### 3. Environment Variables
Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### 4. Install & Run
```bash
# Install dependencies
npm install

# Run Frontend (Dev Mode)
npm run dev

# Run Full Stack (Production Preview)
npm run build
npm start
```

## Deployment (Render)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to Render as a Web Service.

## Project Structure

- `/src`: React Frontend
- `/server.js`: Node.js Backend for Email API
- `/dist`: Production build output
