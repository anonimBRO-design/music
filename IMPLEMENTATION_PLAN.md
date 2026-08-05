# NONIMSONG Spotify-like Overhaul & Social System Refactor

## Implementation Plan

### Project Overview
Transform NONIMSONG into a Spotify-like experience with:
- 15 core player/playlist/queue/profile features
- Social system refactor (Friends → Users, Collab → Listening Party)
- Modular, maintainable architecture

---

## Phase 1: Architecture & Core Infrastructure (Week 1)

### 1.1 Modular File Structure
```
nonimsong/
├── index.html (minimal shell, loads modules)
├── assets/
│   ├── css/
│   │   ├── variables.css       # CSS custom properties
│   │   ├── reset.css           # Normalize/reset
│   │   ├── components/         # Component-specific styles
│   │   │   ├── player.css
│   │   │   ├── queue.css
│   │   │   ├── progress.css
│   │   │   ├── volume.css
│   │   │   ├── modal.css
│   │   │   ├── toast.css
│   │   │   ├── card.css
│   │   │   ├── sidebar.css
│   │   │   ├── profile.css
│   │   │   ├── playlist.css
│   │   │   └── search.css
│   │   ├── pages/              # Page-specific styles
│   │   │   ├── home.css
│   │   │   ├── search.css
│   │   │   ├── library.css
│   │   │   ├── profile.css
│   │   │   ├── playlist.css
│   │   │   └── user-public.css
│   │   └── mobile.css          # Mobile-first responsive
│   └── js/
│       ├── core/               # Core utilities
│       │   ├── store.js        # LocalStorage wrapper
│       │   ├── events.js       # Event bus
│       │   ├── api.js          # API client
│       │   ├── utils.js        # Helpers (formatDuration, etc.)
│       │   └── constants.js    # App constants
│       ├── managers/           # State managers
│       │   ├── QueueManager.js
│       │   ├── PlayerManager.js
│       │   ├── PlaylistManager.js
│       │   ├── ProfileManager.js
│       │   ├── RecommendationEngine.js
│       │   ├── SocialManager.js
│       │   └── ListeningPartyManager.js
│       ├── ui/                 # UI components
│       │   ├── PlayerBar.js
│       │   ├── FullscreenPlayer.js
│       │   ├── QueuePanel.js
│       │   ├── ProgressBar.js
│       │   ├── VolumeSlider.js
│       │   ├── TrackRow.js
│       │   ├── MusicCard.js
│       │   ├── Sidebar.js
│       │   ├── SearchDropdown.js
│       │   ├── Modal.js
│       │   ├── Toast.js
│       │   ├── ContextMenu.js
│       │   └── LyricsPanel.js
│       ├── pages/              # Page controllers
│       │   ├── HomePage.js
│       │   ├── SearchPage.js
│       │   ├── LibraryPage.js
│       │   ├── LikedPage.js
│       │   ├── HistoryPage.js
│       │   ├── PlaylistPage.js
│       │   ├── ProfilePage.js
│       │   ├── PublicProfilePage.js
│       │   ├── FriendsPage.js  (→ UsersPage.js)
│       │   └── CollabPage.js   (→ ListeningPartyPage.js)
│       ├── services/           # External services
│       │   ├── YouTubePlayer.js
│       │   ├── YouTubeAPI.js
│       │   ├── Crossfade.js
│       │   └── Visualizer.js
│       └── app.js              # Main entry point
├── server/
│   ├── server.js               # Express backend
│   ├── routes/
│   │   ├── search.js
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── playlists.js
│   │   ├── listening-party.js
│   │   └── recommendations.js
│   └── middleware/
│       ├── auth.js
│       └── rateLimit.js
└── package.json
```

### 1.2 Module System
- Use ES Modules (`type: "module"` in package.json)
- Dynamic imports for code splitting
- Single entry point loads all modules

### 1.3 State Management Pattern
```javascript
// Event-driven architecture
class EventBus {
  subscribe(event, handler)
  publish(event, data)
  unsubscribe(event, handler)
}

// Each manager is a singleton with:
// - Private state
// - Public getters
// - Action methods that publish events
// - LocalStorage persistence
```

---

## Phase 2: Core Player & Queue System (Week 1-2)

### 2.1 QueueManager (Spotify-like)
**Features:**
- `nowPlaying`, `nextInQueue`, `recommended`
- `add(track)`, `addNext(track)`, `remove(index)`, `clear()`
- `move(fromIndex, toIndex)` - drag & drop
- `rebuildFromContext(context, currentTrackId)`
- Persistence: LocalStorage + Server sync (if logged in)
- Auto-generated recommendations when queue < 5

**API:**
```javascript
QueueManager.on('change', (queue) => UI.update())
QueueManager.on('nowPlayingChange', (track) => Player.load(track))
```

### 2.2 PlayerManager
**Features:**
- YouTube IFrame API wrapper
- Crossfade support (0-12s)
- Gapless playback preparation
- Playback state persistence (position, volume, shuffle, repeat, speed)
- Smart next-track logic based on context

**Repeat Modes:**
- 0: Off
- 1: Repeat Queue
- 2: Repeat One

**Shuffle:**
- Smart Shuffle (avoid same artist, genre clustering)
- Fisher-Yates with artist separation

### 2.3 VolumeSlider (Spotify-style)
**Features:**
- Horizontal slider with drag, click, wheel, touch
- Smooth animation (CSS transition)
- Volume icon states: muted, low (<30%), medium (<70%), high
- Persistence in LocalStorage
- Keyboard: ↑/↓ arrows, M to mute

### 2.4 ProgressBar (Spotify-style)
**Features:**
- Drag to seek, click to seek
- Touch support with large hit area
- Buffer indicator (gray progress behind main)
- Time display: current / duration
- Hover preview (tooltip with timestamp)
- Smooth animation (requestAnimationFrame)

---

## Phase 3: Smart Recommendation Engine (Week 2)

### 3.1 RecommendationEngine
**Data Sources:**
- User history (play counts, timestamps)
- Liked songs
- Playlist contents
- Current context (playlist, album, search)

**Algorithm:**
```
Priority:
1. Same genre (from track metadata + keyword analysis)
2. Same artist
3. Similar artists (Last.fm style co-occurrence)
4. Popular tracks in same genre
5. Discovery: trending + user's unexplored genres

Filters:
- Exclude recently played (last 50)
- Exclude currently in queue
- Diversity: max 2 tracks per artist
- Injection: 30% discovery items
```

**Methods:**
- `getRecommendations(seedTrack, context, count)`
- `getSmartShuffle(tracks)`
- `getRadio(track)` - infinite recommendations
- `refreshCache()`

---

## Phase 4: Profile & Social System Refactor (Week 2-3)

### 4.1 Terminology Migration
| Old | New |
|-----|-----|
| Friend / Friends | User / Users |
| Friend Request | Follow Request |
| Friend Profile | User Profile |
| Friend Search | User Search |
| Friend Activity | User Activity |
| Friend Library | User Library |
| Collaborative Playlist | Listening Party |
| Collaborator | Party Member |
| Invite Collaborators | Invite Users |

### 4.2 Public Profile Page (`/user/{username}`)
**Features:**
- Avatar, Banner, Username, Bio
- Join Date, Followers, Following
- Total Likes, Public Playlists
- Favorite Genres, Favorite Artists
- Recently Played (optional, privacy setting)
- Privacy settings: Public / Followers Only / Private

### 4.3 User Search & Discovery
- Search users by username/display name
- "People on NONIMSONG" section
- Online indicator (green dot)
- Follow/Unfollow actions

### 4.4 Listening Party (Real-time Sync)
**Features:**
- Host creates party, gets invite code/link
- Host controls: play, pause, skip, queue
- Participants: synced playback, chat, reactions (❤️🔥🎵👏)
- WebSocket for real-time sync
- Rejoin capability

**Backend (Socket.io):**
```javascript
// Events:
'party:create'     // Host creates
'party:join'       // User joins
'party:leave'      // User leaves
'party:play'       // Host plays
'party:pause'      // Host pauses
'party:seek'       // Host seeks
'party:queue'      // Queue changes
'party:chat'       // Messages
'party:reaction'   // Emoji reactions
```

---

## Phase 5: Playlist System Overhaul (Week 3)

### 5.1 Playlist Visibility
- **Public**: Visible to all, searchable, likeable, shareable, savable
- **Unlisted**: Hidden from search/profile, accessible via link
- **Private**: Only owner

### 5.2 Playlist Features
- Add/Remove tracks (drag & drop reorder)
- Rename, Change Cover, Description
- Search within playlist
- Sort: A-Z, Artist, Album, Recently Added, Duration
- Bulk actions (select multiple)
- Collaborative → Listening Party conversion

### 5.3 Playlist Page
- Hero with cover, title, description, stats
- Track list with inline actions
- Play/Shuffle buttons
- Share modal (link, embed code, social)

---

## Phase 6: Crossfade & Gapless Playback (Week 3)

### 6.1 CrossfadeManager
- Settings: 0-12 seconds (slider in settings)
- Fade out current track while fading in next
- Web Audio API GainNode for smooth transitions
- Only when both tracks loaded

### 6.2 Gapless Playback
- Preload next track (cueVideoById)
- Seamless transition when possible
- Fallback to crossfade if gapless not achievable

---

## Phase 7: Mobile UX Optimization (Week 3-4)

### 7.1 Mobile-First Components
- Bottom sheet queue panel (swipe up)
- Mini player with swipe gestures
- Touch-friendly sliders (larger hit areas)
- 60fps animations (transform/opacity only)
- Haptic feedback (navigator.vibrate)

### 7.2 Gestures
- Swipe right on track → Add to queue
- Swipe left on track → Remove/Context menu
- Pull down on fullscreen → Close
- Swipe queue handle → Expand/collapse

### 7.3 Responsive Breakpoints
- < 480px: Compact mobile
- 480-768px: Tablet portrait
- 768-1024px: Tablet landscape
- > 1024px: Desktop

---

## Phase 8: Performance & Code Quality (Week 4)

### 8.1 Performance
- Virtual scrolling for long lists (queue, history, playlists)
- Lazy load images (IntersectionObserver)
- Debounced search (300ms)
- Request deduplication
- Service Worker caching
- Code splitting by route

### 8.2 Code Quality
- ESLint + Prettier config
- JSDoc for all public APIs
- TypeScript definitions (.d.ts)
- Unit tests for managers (Jest)
- No memory leaks (cleanup on destroy)
- Single event listener per element

---

## Phase 9: Backend API (Week 4)

### 9.1 Routes
```
GET  /api/search?q=...              # YouTube search
GET  /api/video?id=...              # Video details
GET  /api/users/:username           # Public profile
GET  /api/users/:username/playlists # Public playlists
POST /api/auth/register
POST /api/auth/login
GET  /api/me                        # Current user
PUT  /api/me                        # Update profile
GET  /api/me/playlists              # User playlists
POST /api/playlists                 # Create playlist
PUT  /api/playlists/:id             # Update playlist
DELETE /api/playlists/:id           # Delete playlist
POST /api/playlists/:id/tracks      # Add track
DELETE /api/playlists/:id/tracks/:trackId
POST /api/listening-party           # Create party
GET  /api/listening-party/:code     # Get party
WS   /api/listening-party/:code     # Real-time sync
GET  /api/recommendations?seed=...  # Smart recommendations
```

### 9.2 Database Schema (Supabase/PostgreSQL)
```sql
-- Users
profiles: id, username, display_name, bio, avatar_url, banner_url, 
          created_at, privacy_settings, favorite_genres, favorite_artists

-- Playlists
playlists: id, owner_id, name, description, cover_color, cover_image,
           visibility (public/unlisted/private), created_at, updated_at

playlist_tracks: id, playlist_id, added_by, title, artist, album, 
                 video_id, position, duration_ms, added_at

playlist_collaborators: playlist_id, user_id, role (host/member), joined_at

-- Listening Parties
listening_parties: id, host_id, name, invite_code, status (active/ended),
                   current_track_id, position, volume, created_at

party_members: party_id, user_id, joined_at, is_host

party_chat: id, party_id, user_id, message, created_at

party_reactions: id, party_id, user_id, emoji, created_at

-- Social
follows: follower_id, following_id, status (pending/accepted), created_at

-- Analytics
play_history: id, user_id, video_id, title, artist, played_at, 
              duration_ms, play_count
```

---

## Phase 10: Integration & Testing (Week 5)

### 10.1 Integration Checklist
- [ ] All 15 features working
- [ ] Social refactor complete (no "friend"/"collab" terms)
- [ ] Mobile UX polished
- [ ] Performance targets met (<100ms interactions)
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] PWA installable
- [ ] Offline fallback

### 10.2 Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation
- Focus indicators
- Screen reader support
- Color contrast ratios

---

## File Mapping: Current → New

| Current | New Location |
|---------|-------------|
| index.html (inline JS) | assets/js/app.js (entry) |
| Store, KEYS | assets/js/core/store.js |
| YT_API | assets/js/services/YouTubeAPI.js |
| YTPlayer | assets/js/services/YouTubePlayer.js |
| Toast | assets/js/ui/Toast.js |
| DiversityEngine | assets/js/managers/RecommendationEngine.js |
| Home | assets/js/pages/HomePage.js |
| Search | assets/js/pages/SearchPage.js |
| LikedSongs | assets/js/managers/LikedManager.js |
| LikedPage | assets/js/pages/LikedPage.js |
| HistoryPage | assets/js/pages/HistoryPage.js |
| LibraryPage | assets/js/pages/LibraryPage.js |
| Playlists | assets/js/managers/PlaylistManager.js |
| PlaylistPage | assets/js/pages/PlaylistPage.js |
| ProfilePage | assets/js/pages/ProfilePage.js + PublicProfilePage.js |
| Player | assets/js/managers/PlayerManager.js |
| Queue | assets/js/managers/QueueManager.js |
| Settings | assets/js/ui/SettingsModal.js |
| ContextMenu | assets/js/ui/ContextMenu.js |
| Lyrics | assets/js/ui/LyricsPanel.js |
| Visualizer | assets/js/services/Visualizer.js |
| Wrapped | assets/js/features/Wrapped.js |
| ThemeEngine | assets/js/services/ThemeEngine.js |
| AudioVisualizer | assets/js/services/Visualizer.js |
| PWAManager | assets/js/services/PWAManager.js |
| Social (social.js) | assets/js/managers/SocialManager.js + ListeningPartyManager.js |

---

## Dependencies to Add

```json
{
  "dependencies": {
    "socket.io-client": "^4.x",      // Listening Party real-time
    "sortablejs": "^1.x",            // Drag & drop queue/playlist
    "date-fns": "^3.x",              // Date formatting
    "idb": "^8.x"                    // IndexedDB wrapper for offline
  },
  "devDependencies": {
    "eslint": "^8.x",
    "prettier": "^3.x",
    "jest": "^29.x",
    "@types/jest": "^29.x"
  }
}
```

---

## Rollout Strategy

1. **Feature flags** for gradual rollout
2. **A/B test** recommendation algorithms
3. **Monitor** error rates, performance metrics
4. **Rollback plan** per feature

---

## Success Metrics

- Queue interactions/session > 3
- Playlist creation rate > 15%
- Profile visits > 20% of sessions
- Listening Party creation > 5% of active users
- Mobile session duration +25%
- Zero critical bugs in production