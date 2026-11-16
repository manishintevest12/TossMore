# TossMore

All-in-one athletic training, coaching, tournament, performance-analytics and sports-equipment platform.
React + Vite front end, Express + WebSocket back end (`server.ts`), state persisted to `.data/`.

## Local development

```bash
npm install
npm run dev          # Express + Vite middleware on http://localhost:3000
```

## Production build

```bash
npm install
npm run build        # vite build -> dist/  +  server.ts -> server.js
npm start            # NODE_ENV=production node server.js
```

`npm run build` produces two artifacts:

- `dist/` – the built client (served statically by the server)
- `server.js` – the Express/WebSocket server bundled from `server.ts` so a plain
  Node process can run it. It is committed to the repo so the entry file always
  exists on the host; the build regenerates it, so never edit it by hand.

The server reads `PORT` (default `3000`) from the environment and serves `dist/`
whenever a build is present. Without a build it falls back to the Vite dev
middleware.

## Hostinger (Node.js) deployment

| Setting        | Value                          |
| -------------- | ------------------------------ |
| Node.js        | 22.x                           |
| Branch         | `main`                         |
| Build command  | `npm install && npm run build` |
| Entry file     | `server.js`                    |

`server.js` at the repository root is the startup file Hostinger runs. An
entry file of `server.ts` cannot be used because the host starts the file with
plain Node, which has no TypeScript loader for the `./server/store.js` import.

Environment variables (optional): `PORT` (injected by the host), `NODE_ENV=production`.

## Scripts

| Command              | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | Dev server with Vite middleware             |
| `npm run build`      | Build client + server                       |
| `npm run build:server` | Rebuild only `server.js`                  |
| `npm start`          | Run the production server                   |
| `npm run lint`       | `tsc --noEmit` type check                   |
| `npm run clean`      | Remove `dist/` and `server.js`              |
