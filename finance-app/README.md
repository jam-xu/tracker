# Finance Tracker

A personal finance tracker with multi-user support, built with React + Supabase + Vercel.

---

## One-time setup (~30 minutes)

### 1. Supabase (your database)

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name (e.g. `finance-tracker`) and a strong database password → **Create project**
3. Once ready, go to **SQL Editor** → **New query**
4. Paste the contents of `supabase-schema.sql` → **Run**
5. Go to **Settings → API** and copy:
   - **Project URL** → this is your `VITE_SUPABASE_URL`
   - **anon / public key** → this is your `VITE_SUPABASE_ANON_KEY`

### 2. GitHub (your code)

1. Create a new repo at [github.com/new](https://github.com/new) (e.g. `finance-tracker`)
2. Push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/YOUR_USERNAME/finance-tracker.git
   git push -u origin main
   ```

### 3. Vercel (your hosting)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Under **Environment Variables**, add:
   ```
   VITE_SUPABASE_URL        = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY   = your-anon-key
   ```
4. Click **Deploy** → done ✓

Your app is now live at `https://your-project.vercel.app`.

---

## Daily maintenance

### Update the UI
```bash
# Edit any file in src/components/
git add .
git commit -m "update dashboard"
git push
# Vercel auto-deploys in ~30 seconds
```

### Add a new user
They just visit your URL and sign up. Each user gets their own isolated data.

### Import existing data (first time)
On first login, users are shown an onboarding screen where they can upload their `seed-data.json`.
They can also do this anytime from **Settings → Import data**.

---

## Project structure

```
src/
├── App.jsx                  ← root: auth, routing, nav
├── main.jsx                 ← React entry point
├── components/
│   ├── ui.jsx               ← Card, KpiCard, Pill, Field, etc.
│   ├── Dashboard.jsx        ← Dashboard tab
│   ├── LogTab.jsx           ← Expenses / Income tabs
│   ├── InvestTab.jsx        ← Investments tab
│   └── EntryList.jsx        ← Row list with inline edit + bulk select
├── hooks/
│   ├── useAuth.js           ← login / logout / session
│   └── useData.js           ← all Supabase reads + writes
├── lib/
│   ├── supabase.js          ← DB client (reads from .env)
│   └── constants.js         ← design tokens, formatters, helpers
└── pages/
    ├── AuthPage.jsx         ← sign in / sign up
    └── OnboardingPage.jsx   ← first-run data import
```

---

## Environment variables

| Variable | Where to get it |
|----------|----------------|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key |

Never commit `.env` — it's in `.gitignore`.

---

## Local development (optional)

```bash
cp .env.example .env        # fill in your keys
npm install
npm run dev                 # opens at http://localhost:5173
```
