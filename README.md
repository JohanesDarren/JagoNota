<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/572fcc61-e2b0-455f-ac34-0c29091ebdce

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set required environment variables in `.env` (copy from `.env.example`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `EMAIL_SMTP_USER`
   - `EMAIL_SMTP_PASS`
   - `FRONTEND_URL`
   - `GEMINI_API_KEY`
3. Install backend dependencies:
   `cd backend && npm install`
4. Start the backend server:
   `cd backend && npm start`
5. Start the frontend app:
   `npm run dev`
