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
2. In the app, go to **Budget → Backup → Restore** and pick the file.

## Backups

Your budget is only on this phone, so if you delete the app or lose the phone, it's gone.
Use **Budget → Backup → Save backup** every so often and save the file to **Files → iCloud Drive**.
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

Moving from the home-screen app to the App Store app: Save backup → Restore in the new app.
