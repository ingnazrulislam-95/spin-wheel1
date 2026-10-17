# Spin Wheel

Zero-dependency Node app (built-in `http` only). Run: `ADMIN_KEY=yourkey npm start` then open http://localhost:3000

## Layout
- `server.js`        API + static file server. Winner is chosen here, never in the browser.
- `public/index.html` Frontend (canvas wheel). Calls the API, animates to the index the server returns.
- `data.json`        Runtime state (git-ignored). Names, weights, rig settings.

## API
- `GET    /api/names`            list names
- `POST   /api/names`            body `{names:["a","b"]}`
- `DELETE /api/names/:i`         remove one
- `DELETE /api/names`            clear all
- `POST   /api/spin`             returns `{index,name}`
- `GET/PUT /api/admin/rig`       header `x-admin-key`; body `{alwaysIndex, forceNext, weights}` (0-based index, null = off)

## Rules for AI agents
- Keep zero dependencies unless asked.
- Run `npm run check` before committing.
- Small commits, imperative messages (e.g. "Add weight editing endpoint").
- Never commit `data.json` or real admin keys.
