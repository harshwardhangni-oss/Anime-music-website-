# Nostalgia — Anime Music

## Run it

```bash
npm install
npm run dev
```

Drop your two background images at:
- `public/bg/scene-wide.png`
- `public/bg/scene-tall.png`

## About the track list

The tracklist you provided (`lib/tracks.ts`) is 30 commercial anime openings/
endings from major-label artists — RADWIMPS, LiSA, YOASOBI, King Gnu, Kenshi
Yonezu, and others. That's not something I searched for and added video IDs
for automatically: your own build spec says to only add songs you have the
right to use or that stream from the rights holder's own upload with
embedding enabled, and to warn before adding anything that looks copyrighted
rather than picking it for you. All 30 entries are wired up with full
metadata (title/artist/film/year/duration) but an empty `videoId`.

To finish a track: find the official/label channel's upload on YouTube
yourself, confirm embedding isn't disabled, and paste the 11-character video
ID into that track's `videoId` field. Tracks with no ID are automatically
skipped by prev/next and marked unavailable — the rest of the app (player,
playlists, clock, background, grain, glass UI) works fully once you have at
least one real ID in each playlist you want to use.

## Structure

- `app/page.tsx` — page layout (server component)
- `app/layout.tsx` — root layout, `viewportFit: "cover"`, Analytics/Speed Insights
- `app/globals.css` — Tailwind v4 `@theme` tokens, hero-bg, keyframes
- `components/Player.tsx` — playback engine (context) + desktop pill / mobile
  card UI, module-scope subcomponents (Vinyl, SeekBar, Transport, etc.)
- `components/Clock.tsx`, `components/TopRow.tsx`, `components/SceneBackground.tsx`
- `lib/tracks.ts` — playlists/track metadata, `videoId` placeholders
- `lib/youtube-types.ts` — minimal typings for the YouTube IFrame API

## Notes on choices made

- Only one live YouTube iframe ever exists. Its host `<div>` is created once
  and reparented between the desktop and mobile artwork slots depending on
  which layout is visible, so there's never a hidden/duplicate player.
- Seeking uses `onPointerDown`/`onPointerMove`/`onPointerUp` with `touch-none`
  on the hit area.
- The play button is never gated behind a `canplay`-style readiness check.
- `onError` on the YT player auto-advances to the next track and logs a
  console warning (video ID no longer playable). Wire up your analytics
  provider in `components/Player.tsx` where marked.
