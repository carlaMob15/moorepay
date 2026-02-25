# Moorepay — Document verification review demo

A prototype for reviewing flagged document verifications. When the system detects a mismatch (e.g. passport name vs HR record), a reviewer can **request a correction** from the employee or **override and approve** with a justification. Built with Next.js and in-memory state for a controlled demo.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo flow

1. **Home** — You’ll see a task card: “Passport verification required” with confidence 75% (medium).
2. **Open the task** — Click the card (or “Review document”) to go to the document review page.
3. **Review** — See the flagged document, data comparison, and activity log. Choose one:
   - **Request Correction** — Sends a request to the employee; you’ll see a short transition, then the “task pending” view with a “Return to task queue” button.
   - **Override and Approve** — Open the modal, enter a justification, then “Override and Approve”. After a short transition, you’ll see the “Document approved” view.
4. **Return** — Use “Return to task queue” to go back to the home page (the task is removed from the list).
5. **Reset demo** — On the home page, if the task was removed, use **Reset demo** to restore the task and run the flow again without refreshing.

## Tech

- **Next.js** (App Router), **React**, **TypeScript**
- **Context** for demo state (task status, activity log, toasts, modal)
- Semantic HTML and visible focus for keyboard use

## Project structure

- `app/page.tsx` — Home (task queue)
- `app/review/page.tsx` — Document review, pending/completed views, modal, toast
- `app/context/TaskContext.tsx` — Shared state and reset

## Deploy

You can deploy with [Vercel](https://vercel.com) or any Node host. No environment variables required for the demo.
