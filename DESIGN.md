# NONIMSONG Design

## Direction

Neumorphic Listening Desk: a matte, tactile music workspace where depth comes from paired soft highlights and offset shadows. The interface should feel calm and physical without hiding familiar music controls.

## Palette

- Dark shell: slate graphite surfaces on `#27313c`, with mint `#72d29d` reserved for active and positive states.
- Light shell: cool mist surfaces on `#dce5ed`, with deeper mint `#2f9e70` for the same states.
- Supporting state colors stay muted: cyan for discovery, lavender for secondary features, rose for danger.
- No photographic wallpaper, ambient photo layer, or decorative color wash behind the app shell.

## Depth and Surfaces

- Raised surfaces use a soft lower-right shadow paired with a cool upper-left highlight.
- Inputs, scrubbers, toggles, and pressed controls use inset wells.
- Cards do not rely on glass blur or ornamental borders; artwork images remain content media only.
- The signature interaction is tactile press-in feedback on controls and active surfaces.

## Typography

- `Syne` carries display headings and product navigation.
- `Space Mono` remains reserved for playback time and compact measurement values.
- Body and secondary text use the theme tokens so contrast stays readable in both themes.

## Composition

- Desktop keeps the persistent sidebar, top search bar, work area, and player dock visible as separate jobs.
- Mobile collapses navigation into the existing bottom bar and keeps playback controls reachable.
- Category tiles, recommendation cards, and settings rows use a shared surface language without turning every region into a nested card.

## Motion and States

- Page, modal, and queue entrances keep the existing authored transitions but lose glass blur decoration.
- Hover raises a surface slightly; active and pressed states settle into an inset well.
- Reduced-motion users receive the same hierarchy without long transitions.

## Media Policy

The application shell is photo-free. Track thumbnails and playlist artwork are retained where they communicate the music content or playback context.

