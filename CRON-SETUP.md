# Auto-Reminders Cron — Setup Guide

The `cron-daily` Netlify function sends automatic email reminders for any
user with overdue or due-soon invoices. Without scheduling it, the app
still works for manual "Send Reminder" — but auto-reminders only fire
when a user opens the app.

## 1. Set up the Firebase service account

The function needs admin access to Firestore (to read all users' data).
That requires a service account JSON key from Firebase.

1. Go to [Firebase Console](https://console.firebase.google.com) → project
   `remindrr-d892c` → ⚙️ Project settings → **Service accounts** tab
2. Click **Generate new private key** → download the JSON file
3. Convert the file to a single-line base64 string:
   ```bash
   base64 -i service-account.json | tr -d '\n' | pbcopy   # macOS
   base64 -w 0 service-account.json                        # Linux
   ```

## 2. Set Netlify env vars

In Netlify → Site settings → Environment variables, add:

| Name | Value | Required |
|------|-------|----------|
| `FIREBASE_SERVICE_ACCOUNT` | the base64 string from step 1 | ✅ |
| `CRON_SECRET` | any random string (e.g. `openssl rand -hex 32`) | ✅ |
| `GMAIL_ID` | (existing) Gmail OAuth client ID | already set |
| `GMAIL_KEY` | (existing) Gmail OAuth client secret | already set |

## 3. Schedule the function

Free options (work on Netlify free tier):

### Option A — cron-job.org (recommended)
1. Sign up at [cron-job.org](https://cron-job.org) (free)
2. Create a new cron job:
   - **URL:** `https://remindrr.app/.netlify/functions/cron-daily?secret=YOUR_CRON_SECRET`
   - **Schedule:** every day at 9:00 AM (or your preferred time)
   - **Method:** GET
3. Save and enable

### Option B — GitHub Actions
1. Add a workflow file at `.github/workflows/cron-daily.yml`:
   ```yaml
   name: Remindrr daily reminder cron
   on:
     schedule:
       - cron: '0 9 * * *'  # 9:00 AM UTC every day
     workflow_dispatch:        # allow manual trigger
   jobs:
     run:
       runs-on: ubuntu-latest
       steps:
         - name: Hit cron endpoint
           run: |
             curl -fsS "https://remindrr.app/.netlify/functions/cron-daily?secret=${{ secrets.CRON_SECRET }}"
   ```
2. Add `CRON_SECRET` as a repository secret
3. Done — GitHub runs it on schedule

### Option C — Netlify Scheduled Functions (paid)
If you're on Netlify Pro or higher, you can add a `@scheduled` directive
to the function instead of an external cron. See [Netlify docs](https://docs.netlify.com/build/functions/scheduled-functions/).

## 4. Verify

After deploying, hit the endpoint manually to test:
```bash
curl "https://remindrr.app/.netlify/functions/cron-daily?secret=YOUR_CRON_SECRET"
```

You should get back:
```json
{ "ok": true, "users": 5, "reminders": 2, "errors": [], "ranAt": "..." }
```

If you see `"error": "FIREBASE_SERVICE_ACCOUNT env var is not set..."`, the
service account wasn't set correctly. Re-check step 1.

## 5. Monitor

The function returns JSON with stats. To monitor over time:
- Add the URL to a free uptime monitor (e.g. [uptime-kuma](https://github.com/louislam/uptime-kuma))
- Or pipe the response into a logging service
- Or just check the cron-job.org execution history

## What it does (summary)

1. Connects to Firestore via Admin SDK
2. Iterates every user
3. For each user with SendGrid configured, finds unpaid invoices that are
   due in ≤1 day or overdue
4. Throttles: skips invoices that had a reminder sent in the last 48h
5. Sends the reminder via the user's own SendGrid (using their stored key)
6. Updates the invoice's `lastReminderSentAt` and bumps `followupCount`

The user can override the cadence per-invoice via the
`reminderSettings` field (3 days before, on due, 3 days after). This
function currently uses a simple "send if within 1 day of due or overdue
and not sent in last 48h" rule. We can extend it to honor
`reminderSettings` per-invoice in a follow-up.
