# Spending Tracker

A budgeting app for your phone: income, expenses, repeating bills, and what's still pending at your bank.
Everything is saved on the phone itself. Nothing is sent anywhere.

## What's in this folder

| File | What it does |
|---|---|
| `index.html` | The whole app |
| `manifest.webmanifest` | App name, icon and colors for your home screen |
| `sw.js` | Lets the app open with no internet |
| `icons/` | App icons (`icon-1024.png` is for the App Store later) |
| `vercel.json` | Tells Vercel to always serve the newest version |
| `neon.ts` | Neon project config (branch policy) |
| `api/sync.js` | Vercel serverless function — syncs app data to Neon Postgres |
| `scripts/db-init.js` | One-time schema setup: `npm run db:init` |
| `.env.local` | Local env vars from `neon deploy` (not committed) |

## Run locally

No build step — it's a static site. You do need a local server (the service worker won't work over `file://`).

**Python (comes with macOS/Linux/WSL):**
```bash
python3 -m http.server 8080
```
Then open [http://localhost:8080](http://localhost:8080).

**Node:**
```bash
npx serve .
```

---

## 1. Put it on Vercel (free Hobby plan)

**Option A: no terminal, using GitHub**
1. Go to github.com and create a new **private** repository called `spending-tracker`.
2. Click **uploading an existing file** and drag in everything from this folder (including the `icons` folder). Click **Commit changes**.
3. In Vercel, click **Add New → Project**, pick the `spending-tracker` repo, and click **Deploy**. No settings to change; it's a static site.
4. Vercel gives you a link like `spending-tracker-xxxx.vercel.app`.

To update later, upload the changed files to the same GitHub repo. Vercel redeploys on its own in about a minute.

**Option B: Vercel CLI (needs Node.js installed)**
```
cd spending-tracker
npx vercel        # first time: log in and accept the defaults
npx vercel --prod # publishes to your live link
```

## 2. Install it on your iPhone

1. Open your Vercel link in **Safari** (it has to be Safari).
2. Tap **Share** (the square with an arrow) → **Add to Home Screen** → **Add**.
3. Open it from the new **Spending** icon. It runs full screen, like a regular app, and works offline.

Your data lives in that home-screen app. If you also open the link in Safari, that's a separate, empty copy.

## 3. Bring over what you entered in the Claude version (optional)

1. Save `spending-tracker-backup-from-claude.json` (sent separately, so it never gets uploaded to Vercel where anyone with the link could open it) to your iPhone (AirDrop, email it to yourself, or iCloud Drive → Files).
2. In the app, go to **Account → Restore** (the cloud button at the top of Home) and pick the file.

## On a computer

Open your Vercel link in Chrome or Edge. Wider than a tablet, the app switches to the desktop layout: a sidebar, a two-column Home and Budget, and entries open in a side panel.
Press **N** to add an entry, **Esc** to close the panel.
To install it like a desktop app: click the install icon at the right end of the address bar (or **⋮ → Install Spending Tracker**).
The computer keeps its own copy of your data. Move data between devices with **Account → Save backup / Restore** until cloud sync is added.

## Backups

Your budget is only on this phone, so if you delete the app or lose the phone, it's gone.
Use **Account → Save backup** every so often and save the file to **Files → iCloud Drive**.
Restore puts it back on any phone.

## Updating the app

- Change the files, upload them (Option A or B above). The installed app picks up the new version the next time you open it with internet.
- If you change the icon or the app name, also change `VERSION` at the top of `sw.js` (for example `v1` → `v2`).

## Later: the App Store version

The plan, with no Mac needed:
1. Join the Apple Developer Program ($99/year) at developer.apple.com.
2. Wrap this same folder with **Capacitor** (the app files go inside the iPhone app, so it works offline and passes Apple's review rules).
3. Build in the cloud with a service like **Codemagic** or **Ionic Appflow** instead of Xcode on a Mac.
4. Install it on your phone with **TestFlight** first, then submit for App Store review when you're happy with it.
5. Screen and feature changes can be pushed with an over-the-air update tool. Native changes (icon, Face ID, notifications) need a new build and review.

Moving from the home-screen app to the App Store app: Account → Save backup, then Restore in the new app.
