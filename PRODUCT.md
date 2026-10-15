# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Inferred from the current interface: people who listen to music regularly and need to discover, play, save, and organize tracks from a single web app.

## Product Purpose

Inferred from the current routes and copy: NONIMSONG helps a listener find music, play it continuously, manage a personal library, and return to listening history or liked songs. Success means the listener can reach a track or playback control quickly without losing context.

## Positioning

Inferred from the current product surface: personal music discovery is the primary position, supported by taste-based recommendations, playlists, queue controls, and an optional listening-party experience.

## Operating Context

The app is a responsive web experience with a desktop sidebar, mobile bottom navigation, a persistent player, search suggestions, playlist/library views, a queue, and modal-based settings. Users may switch between dark and light themes.

## Capabilities and Constraints

- Preserve existing playback, search, queue, playlist, liked-song, history, library, profile, party, wrapped, settings, and theme-toggle behavior.
- The current implementation is a React/Vite app with Zustand stores and Tailwind utility classes.
- The requested visual change is to remove the photo wallpaper background and use a neumorphic UI treatment.
- No new product feature or data source is required for this task.

## Brand Commitments

- Preserve the NONIMSONG name and existing logo assets.
- For this task, the user explicitly requires a photo-free background and a neumorphic visual direction.

## Evidence on Hand

- Existing routes and UI: `src/App.jsx`, `src/pages/`, and `src/components/`.
- Existing theme tokens and surface styles: `src/index.css`.
- Existing logo assets: `src/assets/` and `public/icons/`.
- No supplied testimonials, customer claims, or external brand evidence; future work must not fabricate them.

## Product Principles

- Keep playback close at hand.
- Make discovery feel personal without hiding core controls.
- Preserve listening context while users navigate.
- Use clear states and tactile feedback for frequent actions.

