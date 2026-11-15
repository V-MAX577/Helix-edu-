# HELIXEDU

A free, installable learning workspace designed to run on phones and work offline.

## Device-only architecture

- Learner profile, lesson progress, quiz attempts, flashcard reviews, notes, bookmarks, study plans, reminders and assistant history are stored in the browser's IndexedDB.
- Learner records stay in this browser and are not synced between devices. Study reminder alerts work while HELIXEDU is open; background push delivery is not included.
- Curriculum and the Helix Offline Engine are bundled with the app.
- No database server, database URL, API key or payment method is required for the local learning experience.
- The study assistant runs the built-in Helix Engine in the browser. There is no external AI API integration or API-key requirement.

## Backups

Open **Settings → Device data & backup** to export a JSON backup or import one on this browser. Import replaces the existing HELIXEDU records on that browser. Keep a backup before clearing browser data, reinstalling the browser or changing devices.

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run test:unit
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

## Deploy

Deploy the Next.js application as a static-capable web app on a supported host. No PostgreSQL service or `DATABASE_URL` is needed. The service worker and web app manifest provide installable PWA support.
