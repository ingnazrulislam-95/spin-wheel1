# Spin Wheel

A spin-the-wheel app with a small Node backend. Add names, spin, and the server picks the winner. Zero dependencies.

## Requirements

- Node.js 18 or newer
- Git (optional, for version control)

## Quick start

```bash
git clone <your-repo-url> spin-wheel   # or unzip the archive
cd spin-wheel
ADMIN_KEY=choose-a-secret npm start
```

Open http://localhost:3000.

On Windows PowerShell:

```powershell
$env:ADMIN_KEY="choose-a-secret"; npm start
```

## Configuration

| Variable    | Default     | Purpose                                  |
|-------------|-------------|------------------------------------------|
| `PORT`      | `3000`      | Port the server listens on               |
| `ADMIN_KEY` | `change-me` | Key required for the hidden admin routes |

Always set your own `ADMIN_KEY`. Never commit it.

## Using the app

- Type a name and press Enter, or paste several separated by commas or new lines.
- Click the centre button or **Spin**.
- **Remove last winner** is useful for elimination rounds.
- **Clear all** empties the wheel.

Names and settings are saved to `data.json` (git-ignored), so they survive restarts.

## Hidden controls

These need the `ADMIN_KEY` and are invisible to anyone watching the page.

| Shortcut       | Action                                                        |
|----------------|---------------------------------------------------------------|
| Ctrl+Shift+K   | Enter the admin key for this browser tab                      |
| Ctrl+Shift+L   | Set an always-win position (1-based). Blank turns it off      |
| `1`-`9`        | Force that name to win the next spin only                     |
| `0`            | Cancel a forced winner                                        |

Out of the box, the 3rd name added wins every spin. Change or disable that with Ctrl+Shift+L.

The winner is chosen on the server, so the browser never receives the settings.

> Use this for games, pranks and demos. Do not use it for real raffles or draws where other people rely on the result being fair.

## API

| Method | Path                | Description                              |
|--------|---------------------|------------------------------------------|
| GET    | `/api/names`        | List names                               |
| POST   | `/api/names`        | Add names: `{"names": ["Ann", "Bob"]}`   |
| DELETE | `/api/names/:i`     | Remove the name at index `i`             |
| DELETE | `/api/names`        | Remove all names                         |
| POST   | `/api/spin`         | Returns `{"index": 2, "name": "Cara"}`   |
| GET    | `/api/admin/rig`    | Current settings (needs `x-admin-key`)   |
| PUT    | `/api/admin/rig`    | Update settings (needs `x-admin-key`)    |

`PUT /api/admin/rig` body (all fields optional, indexes are 0-based, `null` turns a setting off):

```json
{ "alwaysIndex": 2, "forceNext": null, "weights": [1, 1, 5] }
```

Example:

```bash
curl -X PUT http://localhost:3000/api/admin/rig \
  -H "x-admin-key: choose-a-secret" \
  -H "Content-Type: application/json" \
  -d '{"alwaysIndex": null, "weights": [1, 1, 10]}'
```

Order of precedence when spinning: `forceNext`, then `alwaysIndex`, then weighted random.

## Project structure

```
server.js          API and static file server
public/index.html  Frontend (canvas wheel)
CLAUDE.md          Notes for AI coding agents
data.json          Runtime state (created automatically, git-ignored)
```

## Working with Git and AI agents

```bash
git init -b main      # skip if you unzipped the provided repo
git add -A
git commit -m "Initial commit"
claude                # or any AI coding tool, run from the project folder
```

`CLAUDE.md` explains the layout and rules so an agent can make changes safely. Run `npm run check` before each commit.

## Deploying

Any host that runs Node works (Render, Railway, Fly.io, a VPS). Set `ADMIN_KEY` and `PORT` as environment variables and use `npm start` as the start command. Serve it over HTTPS so the admin key is not sent in plain text.

## Licence

MIT
