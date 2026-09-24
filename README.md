# Streamlite

**Live:** [streamlite-pink.vercel.app](https://streamlite-pink.vercel.app/)

Streamlite is a lightweight overlay builder for [Kick.com](https://kick.com) streamers. Drag widgets onto a canvas — chat, alerts, goals, viewer/sub counts, clock, Spotify, and more — then copy a single link into OBS as a browser source and go live. There's no backend and no database: the entire overlay configuration is serialized into the URL itself.

## How it works

- **Builder** (`/builder.html`) — a drag-and-drop canvas where a streamer picks widgets, positions them, and styles them (colors, presets, custom themes).
- **Overlay** (`/overlay.html`) — a transparent, chrome-less page meant to be loaded as an OBS browser source. It reads the same config from the URL hash and renders the live widgets.
- **Landing / Support / Feature Request** pages — marketing and feedback surfaces for the product.

Because layout and style state lives entirely in a compressed URL hash (via `lz-string`), there's nothing to host besides static files — the builder link *is* the save file, and the overlay link *is* the deployment.

### Widgets

Chat, Alerts, Follower Goal, Sub Goal, Viewer Count, Sub Count, Recent Events, Stream Labels, Clock, Countdown, Ticker, Goals/To-Do list, QR Code, Spotify now-playing, Date & Time, Weather.

### Live data

Chat, follows, subs, and viewer count are sourced from Kick's public Pusher channels in the browser — no server round-trip required for the overlay to update live.

## Project structure

```
src/
  builder/    # drag-and-drop overlay editor
  overlay/    # OBS browser-source renderer
  landing/    # marketing site
  support/    # support page
  feature-request/
  shared/     # types, adapters (Kick Pusher client), marketing bits
worker/       # Cloudflare Worker — Kick OAuth + sub count via app token
```

This is a multi-page Vite app; each `.html` file at the repo root (`index.html`, `builder.html`, `overlay.html`, `support.html`, `feature-request.html`) is a separate entry point built independently.

## Stack

SolidJS + TypeScript + Vite, Tailwind CSS v4, `lz-string` for URL-hash state, `pusher-js` for Kick real-time events. A small Cloudflare Worker (`worker/`) handles the pieces that need an app-level OAuth token (like sub count), since Kick's follow/sub webhooks require streamer-level OAuth that the frontend can't hold.
