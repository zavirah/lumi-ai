# Set up Lumi accounts and saved chats

Lumi uses Supabase Auth for accounts and a private Supabase table for conversation history. The free Supabase plan is enough to start. The website uses only the public publishable/anon key; do not put a Supabase secret or service-role key in the website.

## 1. Create the Supabase project

Create a project at [supabase.com](https://supabase.com). In Project Settings → API, copy the Project URL and the publishable key (or legacy anon key).

## 2. Create the chat-history table

Open the Supabase SQL Editor, paste the contents of `supabase/schema.sql`, and run it. The table enables row-level security so each account can only read and change its own chats.

To sync class courses and lesson progress, also run `supabase/course_progress.sql` once. It creates a separate per-user progress table with row-level security. Existing progress saved in this browser is copied into the account the next time Lumi loads it.

## 3. Configure local development

Add these values to the root `.env` file (the file is ignored by Git):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

Restart the Vite development server after changing `.env`.

## 4. Configure GitHub Pages

In the Lumi repository on GitHub, open Settings → Secrets and variables → Actions and add repository secrets named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values. The Pages workflow uses these when it builds the site. Push the code to `master` to publish it.

## 5. Configure account email behavior

In Supabase Authentication → URL Configuration, add the deployed Lumi site URL to the allowed redirect URLs. For local development, add `http://localhost:5173/lumi-ai/` as well. Email confirmation can stay enabled; new accounts will be asked to confirm their email before signing in.

Lumi conversations are saved in Supabase. Gemini and Pollinations keys stay on the Render server as they do today. Existing course progress remains in the browser on the current device.
