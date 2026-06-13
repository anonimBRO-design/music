/* ============================================================
   NONIMID — Social Module  (social.js)
   Supabase Auth · Profiles · Friends · Collaborative Playlists
   Online Presence · People Discovery

   REQUIRED: Run this SQL in your Supabase SQL editor once:
   ──────────────────────────────────────────────────────────
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;
   ──────────────────────────────────────────────────────────

   HOW TO INTEGRATE INTO index.html:
   ─────────────────────────────────
   1. Before </body> add:
      <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
      <script src="social.js"></script>

   2. In the sidebar <nav> block, add the two nav buttons:
      <button class="nav-item" id="nav-friends"   onclick="App.navigate('friends')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        Friends
      </button>
      <button class="nav-item" id="nav-collab"    onclick="App.navigate('collab')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
        Collab
      </button>

   3. In #pageContent, before </div>, add:
      <div class="page" id="friendsPage"></div>
      <div class="page" id="collabPage"></div>

   4. In App.pages array, add 'friends' and 'collab'

   5. In App.navigate(), add:
      if (page === 'friends') Social.renderFriendsPage();
      if (page === 'collab')  Social.renderCollabPage();

   6. The auth modal renders itself automatically on DOMContentLoaded.
      Once the user logs in, their profile syncs with ProfilePage.

   ─── No other changes needed. ────────────────────────────────
   ============================================================ */

(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────── */
  var SUPABASE_URL  = 'https://qfloggalcslkifakbybb.supabase.co';
  var SUPABASE_ANON = 'sb_publishable_iSXk_pq-XfRXmKFEOU3Hmw_uRIZd5eE';

  /* ── CSS injected once ──────────────────────────────── */
  var STYLES = `
/* ── Auth Overlay ─────────────────────────── */
#socialAuthOverlay{
  position:fixed;inset:0;background:rgba(5,5,8,.97);z-index:9000;
  display:flex;align-items:center;justify-content:center;
  backdrop-filter:blur(20px);animation:sbFadeIn .3s ease;
}
@keyframes sbFadeIn{from{opacity:0}to{opacity:1}}
.sb-auth-box{
  width:400px;background:#0d0d14;border-radius:20px;
  padding:44px 36px;border:1px solid rgba(255,255,255,.06);
  box-shadow:0 32px 80px rgba(99,102,241,.15);
  animation:sbSlideUp .35s ease;
}
@keyframes sbSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.sb-auth-logo{text-align:center;margin-bottom:28px}
.sb-auth-logo-icon{
  width:52px;height:52px;margin:0 auto 12px;border-radius:12px;
  background:linear-gradient(135deg,var(--neon-green),var(--purple));
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 24px var(--neon-green-glow);
}
.sb-auth-logo-icon svg{width:26px;height:26px;fill:white}
.sb-auth-title{font-size:22px;font-weight:800;letter-spacing:-.02em;color:#fff}
.sb-auth-sub{font-size:13px;color:var(--text-muted);margin-top:5px}
.sb-tab-row{
  display:flex;background:rgba(255,255,255,.04);border-radius:10px;
  padding:3px;margin-bottom:24px;border:1px solid var(--border);
}
.sb-tab{
  flex:1;padding:8px;border-radius:8px;border:none;cursor:pointer;
  font-family:'Syne',sans-serif;font-size:13px;font-weight:700;
  transition:all .2s;background:transparent;color:var(--text-muted);
}
.sb-tab.active{background:var(--neon-green);color:#000;}
.sb-field{margin-bottom:14px}
.sb-label{
  display:block;font-size:11px;font-weight:700;letter-spacing:.08em;
  color:var(--text-muted);text-transform:uppercase;margin-bottom:6px;
}
.sb-input{
  width:100%;padding:11px 14px;background:rgba(255,255,255,.05);
  border:1px solid var(--border);border-radius:10px;color:#fff;
  font-family:'Syne',sans-serif;font-size:14px;font-weight:500;
  outline:none;transition:border .2s;box-sizing:border-box;
}
.sb-input:focus{border-color:var(--neon-green);background:rgba(255,255,255,.08);}
.sb-btn{
  width:100%;padding:12px;margin-top:6px;border:none;border-radius:10px;
  background:var(--neon-green);color:#000;font-family:'Syne',sans-serif;
  font-size:14px;font-weight:800;cursor:pointer;transition:opacity .2s,transform .1s;
  letter-spacing:.01em;
}
.sb-btn:disabled{opacity:.5;cursor:not-allowed}
.sb-btn:hover:not(:disabled){opacity:.9}
.sb-err{color:#ff2d78;font-size:12px;margin-top:8px;min-height:18px;font-weight:600}
.sb-auth-skip{
  text-align:center;margin-top:18px;font-size:12px;color:var(--text-muted);
}
.sb-auth-skip a{
  color:var(--neon-green);cursor:pointer;text-decoration:none;font-weight:700;
}

/* ── Social Pages ─────────────────────────── */
.sb-page{padding:32px}
.sb-page-title{
  font-size:24px;font-weight:800;letter-spacing:-.01em;margin-bottom:4px;
}
.sb-page-sub{font-size:13px;color:var(--text-muted);margin-bottom:28px}

/* Segment tabs */
.sb-segs{display:flex;gap:6px;margin-bottom:24px;flex-wrap:wrap}
.sb-seg{
  padding:8px 18px;border-radius:var(--radius-full);border:1px solid var(--border);
  background:transparent;color:var(--text-secondary);font-family:'Syne',sans-serif;
  font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.04em;
}
.sb-seg.active{background:var(--neon-green-dim);border-color:var(--border-glow);color:var(--neon-green)}
.sb-badge{
  display:inline-flex;align-items:center;justify-content:center;
  min-width:18px;height:18px;border-radius:999px;padding:0 5px;
  background:var(--neon-green);color:#000;font-size:10px;font-weight:800;
  margin-left:6px;vertical-align:middle;
}

/* Search bar */
.sb-search-row{display:flex;gap:10px;margin-bottom:20px}
.sb-search-input{
  flex:1;padding:10px 16px;background:rgba(255,255,255,.06);
  border:1px solid var(--border);border-radius:var(--radius-full);
  color:#fff;font-family:'Syne',sans-serif;font-size:13px;
  font-weight:500;outline:none;transition:all .2s;
}
.sb-search-input:focus{border-color:var(--neon-green);background:rgba(255,255,255,.09)}
.sb-btn-sm{
  padding:9px 18px;border:none;border-radius:var(--radius-full);
  font-family:'Syne',sans-serif;font-size:12px;font-weight:800;
  cursor:pointer;transition:all .2s;white-space:nowrap;
}
.sb-btn-sm.green{background:var(--neon-green);color:#000}
.sb-btn-sm.ghost{
  background:transparent;color:var(--text-secondary);
  border:1px solid var(--border);
}
.sb-btn-sm.ghost:hover{border-color:var(--neon-green);color:var(--neon-green);background:var(--neon-green-dim)}
.sb-btn-sm.red{background:rgba(255,45,120,.12);color:#ff2d78;border:1px solid rgba(255,45,120,.2)}
.sb-btn-sm.red:hover{background:rgba(255,45,120,.22)}

/* Card rows */
.sb-card-list{display:flex;flex-direction:column;gap:6px}
.sb-card{
  display:flex;align-items:center;gap:14px;padding:12px 16px;
  background:var(--bg-card);border-radius:var(--radius-md);
  border:1px solid var(--border);transition:border-color .2s,background .2s;
}
.sb-card:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1)}
.sb-avatar{
  width:40px;height:40px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-size:16px;font-weight:800;color:#fff;font-family:'Syne',sans-serif;
  background:linear-gradient(135deg,var(--purple),var(--neon-green));
  overflow:hidden;
}
.sb-avatar.sm{width:30px;height:30px;font-size:12px}
.sb-card-body{flex:1;min-width:0}
.sb-card-name{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-card-sub{font-size:11px;color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-card-actions{display:flex;gap:8px;flex-shrink:0}
.sb-collab-badge{
  font-size:10px;font-weight:700;letter-spacing:.06em;
  padding:2px 8px;border-radius:999px;border:1px solid var(--border-glow);
  color:var(--neon-green);background:var(--neon-green-dim);
}

/* Playlist detail header */
.sb-pl-hero{
  display:flex;align-items:flex-end;gap:24px;padding:32px 0 28px;
  margin-bottom:24px;border-bottom:1px solid var(--border);
}
.sb-pl-art{
  width:130px;height:130px;border-radius:var(--radius-lg);flex-shrink:0;
  display:flex;align-items:center;justify-content:center;font-size:48px;
  box-shadow:0 16px 48px rgba(0,0,0,.4);
}
.sb-pl-hero-info{flex:1;min-width:0}
.sb-pl-hero-type{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin-bottom:6px}
.sb-pl-hero-title{font-size:28px;font-weight:800;letter-spacing:-.02em;word-break:break-word}
.sb-pl-hero-meta{font-size:13px;color:var(--text-muted);margin:6px 0 16px}
.sb-pl-hero-actions{display:flex;gap:10px;flex-wrap:wrap}

/* Add track form */
.sb-add-track-box{
  background:var(--bg-card);border:1px solid var(--border);
  border-radius:var(--radius-lg);padding:20px;margin-bottom:20px;
  display:none;
}
.sb-add-track-box.open{display:block}
.sb-add-track-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
@media(max-width:540px){.sb-add-track-grid{grid-template-columns:1fr}}

/* Track rows (reuse existing NONIMID classes) */
.sb-track-row{
  display:flex;align-items:center;gap:14px;padding:8px 12px;
  border-radius:var(--radius-md);cursor:pointer;transition:background .2s;
}
.sb-track-row:hover{background:var(--bg-hover)}
.sb-track-num{width:20px;text-align:center;font-size:12px;color:var(--text-muted);font-family:'Space Mono',monospace;flex-shrink:0}
.sb-track-body{flex:1;min-width:0}
.sb-track-title{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-track-artist{font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-track-dur{font-size:12px;color:var(--text-muted);font-family:'Space Mono',monospace;flex-shrink:0}
.sb-track-del{
  background:none;border:none;color:var(--text-muted);cursor:pointer;
  padding:4px 6px;border-radius:4px;opacity:0;transition:all .2s;flex-shrink:0;
}
.sb-track-row:hover .sb-track-del{opacity:1}
.sb-track-del:hover{color:#ff2d78;background:rgba(255,45,120,.08)}

/* Collaborator picker inside playlist */
.sb-collab-list{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}

/* Empty state */
.sb-empty{
  text-align:center;padding:56px 20px;color:var(--text-muted);
}
.sb-empty-icon{font-size:40px;margin-bottom:14px}
.sb-empty-title{font-size:15px;font-weight:700;color:var(--text-secondary);margin-bottom:6px}
.sb-empty-sub{font-size:13px}

/* Loading spinner */
.sb-spinner{
  display:flex;justify-content:center;padding:40px;
}
.sb-spinner::after{
  content:'';width:28px;height:28px;border-radius:50%;
  border:2px solid var(--border);border-top-color:var(--neon-green);
  animation:sbSpin .7s linear infinite;
}
@keyframes sbSpin{to{transform:rotate(360deg)}}

/* Online / presence dots */
.sb-dot-online{
  display:inline-block;width:10px;height:10px;border-radius:50%;
  background:#1db954;box-shadow:0 0 6px rgba(29,185,84,.7);
  position:absolute;bottom:1px;right:1px;
  border:2px solid var(--bg-card);
}
.sb-dot-offline{
  display:inline-block;width:10px;height:10px;border-radius:50%;
  background:rgba(255,255,255,.2);
  position:absolute;bottom:1px;right:1px;
  border:2px solid var(--bg-card);
}

/* Section label */
.sb-section-label{
  font-size:11px;font-weight:800;letter-spacing:.1em;
  color:var(--text-muted);text-transform:uppercase;
  margin-bottom:10px;display:flex;align-items:center;gap:8px;
}
.sb-online-count{
  font-size:11px;color:var(--neon-green);font-weight:700;letter-spacing:.02em;
}
.sb-friend-badge{
  font-size:11px;color:var(--neon-green);font-weight:700;white-space:nowrap;
}

/* Online strip (chips for collab page) */
.sb-online-strip{
  display:flex;flex-wrap:wrap;gap:10px;margin-bottom:24px;
}
.sb-online-chip{
  display:flex;align-items:center;gap:7px;
  background:rgba(255,255,255,.04);border:1px solid var(--border);
  border-radius:24px;padding:6px 10px 6px 6px;
  transition:background .2s;
}
.sb-online-chip:hover{background:rgba(255,255,255,.07)}
.sb-avatar-sm{
  width:28px!important;height:28px!important;
  font-size:12px!important;
}
.sb-online-name{font-size:12px;font-weight:700;color:var(--text-secondary)}
.sb-chip-add{
  background:var(--neon-green);color:#000;border:none;border-radius:50%;
  width:18px;height:18px;font-size:13px;font-weight:900;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:opacity .15s;padding:0;line-height:1;
}
.sb-chip-add:hover{opacity:.85}
.sb-chip-friends{
  font-size:11px;color:var(--neon-green);font-weight:700;
}

/* Signin indicator in topbar */
.sb-topbar-status{
  display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;
  color:var(--text-muted);letter-spacing:.04em;cursor:pointer;
  padding:6px 10px;border-radius:var(--radius-full);transition:all .2s;
}
.sb-topbar-status:hover{background:var(--bg-hover);color:var(--text-primary)}
.sb-topbar-dot{width:6px;height:6px;border-radius:50%;background:var(--neon-green);animation:pulse 2s infinite}
`;

  /* ── State ──────────────────────────────────────────── */
  var db         = null;   // supabase client
  var _session   = null;   // current auth session
  var _profile   = null;   // current user's profile row
  var _friends   = [];     // [{id, friend_id, profile:{...}}]
  var _incoming  = [];     // friend_requests pending for me
  var _outgoing  = [];     // friend_requests I sent
  var _collabs   = [];     // playlists I own + I collaborate on
  var _activeFriendTab = 'friends';   // active segment on friends page
  var _collabTab = 'mine';      // active segment on collab page
  var _allUsers  = [];          // all profiles for "people online" section
  var _onlinePresence = {};     // uid -> last_seen timestamp

  /* ── Boot ──────────────────────────────────────────── */
  function boot() {
    if (!window.supabase) {
      console.warn('[Social] @supabase/supabase-js not loaded');
      return;
    }
    injectStyles();
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

    db.auth.getSession().then(function (r) {
      _session = r.data.session;
      if (_session) {
        onLoggedIn();
      } else {
        showAuthOverlay();
      }
    });

    db.auth.onAuthStateChange(function (event, session) {
      _session = session;
      if (event === 'SIGNED_IN')  onLoggedIn();
      if (event === 'SIGNED_OUT') onLoggedOut();
    });

    patchAppNavigate();
    patchAppInit();
  }

  /* ── Style injection ───────────────────────────────── */
  function injectStyles() {
    var s = document.createElement('style');
    s.textContent = STYLES;
    document.head.appendChild(s);
  }

  /* ── Patch App.navigate to know about social pages ─── */
  function patchAppNavigate() {
    // Wait for App to exist (script loads after main bundle)
    var orig = null;
    var interval = setInterval(function () {
      if (!window.App) return;
      clearInterval(interval);

      // Extend pages list
      if (window.App.pages && window.App.pages.indexOf('friends') === -1) {
        window.App.pages.push('friends', 'collab');
      }

      orig = window.App.navigate.bind(window.App);
      window.App.navigate = function (page) {
        orig(page);
        if (page === 'friends') Social.renderFriendsPage();
        if (page === 'collab')  Social.renderCollabPage();
      };
    }, 50);
  }

  /* ── Patch App.init to inject social topbar status ─── */
  function patchAppInit() {
    var interval = setInterval(function () {
      if (!window.App) return;
      clearInterval(interval);
      var origInit = window.App.init.bind(window.App);
      window.App.init = function () {
        origInit();
        injectTopbarStatus();
      };
    }, 50);
  }

  /* ── Auth Overlay ──────────────────────────────────── */
  function showAuthOverlay() {
    removeAuthOverlay();
    var el = document.createElement('div');
    el.id = 'socialAuthOverlay';
    el.innerHTML =
      '<div class="sb-auth-box">' +
        '<div class="sb-auth-logo">' +
          '<div class="sb-auth-logo-icon">' +
            '<svg viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>' +
          '</div>' +
          '<div class="sb-auth-title">Sign in to NONIMID</div>' +
          '<div class="sb-auth-sub">Friends, collab playlists & more</div>' +
        '</div>' +
        '<div class="sb-tab-row">' +
          '<button class="sb-tab active" id="sbTabLogin"  onclick="Social._authTab(\'login\')">Sign In</button>' +
          '<button class="sb-tab"        id="sbTabReg"    onclick="Social._authTab(\'register\')">Register</button>' +
        '</div>' +
        '<div class="sb-field"><label class="sb-label">Email</label>' +
          '<input class="sb-input" id="sbAuthEmail" type="email" placeholder="you@example.com" autocomplete="email"/></div>' +
        '<div class="sb-field"><label class="sb-label">Password</label>' +
          '<input class="sb-input" id="sbAuthPass" type="password" placeholder="••••••••" autocomplete="current-password"/></div>' +
        '<div class="sb-err" id="sbAuthErr"></div>' +
        '<button class="sb-btn" id="sbAuthBtn" onclick="Social._authSubmit()">Sign In</button>' +
        '<div class="sb-auth-skip"><a onclick="Social._skipAuth()">Continue without account</a></div>' +
      '</div>';
    document.body.appendChild(el);

    // Enter key
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') Social._authSubmit();
    });
  }

  function removeAuthOverlay() {
    var el = document.getElementById('socialAuthOverlay');
    if (el) el.remove();
  }

  /* public */ function _authTab(mode) {
    var login = document.getElementById('sbTabLogin');
    var reg   = document.getElementById('sbTabReg');
    var btn   = document.getElementById('sbAuthBtn');
    if (!login) return;
    if (mode === 'login') {
      login.classList.add('active');
      reg.classList.remove('active');
      btn.textContent = 'Sign In';
    } else {
      reg.classList.add('active');
      login.classList.remove('active');
      btn.textContent = 'Create Account';
    }
    document.getElementById('sbAuthErr').textContent = '';
  }

  /* public */ function _authSubmit() {
    var btn   = document.getElementById('sbAuthBtn');
    var email = (document.getElementById('sbAuthEmail').value || '').trim();
    var pass  = document.getElementById('sbAuthPass').value || '';
    var err   = document.getElementById('sbAuthErr');
    var isReg = document.getElementById('sbTabReg') && document.getElementById('sbTabReg').classList.contains('active');

    if (!email || !pass) { err.textContent = 'Email and password required'; return; }
    if (pass.length < 6) { err.textContent = 'Password must be at least 6 characters'; return; }

    btn.disabled = true;
    btn.textContent = '…';
    err.textContent = '';

    var promise = isReg
      ? db.auth.signUp({ email: email, password: pass })
      : db.auth.signInWithPassword({ email: email, password: pass });

    promise.then(function (r) {
      if (r.error) {
        err.textContent = r.error.message;
        btn.disabled = false;
        btn.textContent = isReg ? 'Create Account' : 'Sign In';
      }
      // onAuthStateChange will handle the rest
    });
  }

  /* public */ function _skipAuth() {
    removeAuthOverlay();
    showToast('Signed in as guest — social features disabled', 'info');
  }

  /* ── Post-login ─────────────────────────────────────── */
  function onLoggedIn() {
    removeAuthOverlay();
    loadProfile().then(function () {
      injectTopbarStatus();
      pingPresence();
      refreshSocialData().then(function () {
        // Re-render active social page if it is currently visible
        var fp = document.getElementById('friendsPage');
        if (fp && fp.classList.contains('active')) renderFriendsPage();
        var cp = document.getElementById('collabPage');
        if (cp && cp.classList.contains('active')) renderCollabPage();
      }).catch(function () {
        // Still render pages with empty state on total failure
        var fp = document.getElementById('friendsPage');
        if (fp && fp.classList.contains('active')) renderFriendsPage();
      });
      // Ping presence every 2 minutes
      if (window._sbPresenceInterval) clearInterval(window._sbPresenceInterval);
      window._sbPresenceInterval = setInterval(pingPresence, 2 * 60 * 1000);
      // Sync username with existing NONIMID ProfilePage if loaded
      if (window.ProfilePage && _profile) {
        var existing = window.Store && window.Store.get && window.Store.get('nonimid_profile', null);
        if (!existing || !existing.username || existing.username === 'Listener') {
          window.Store.set('nonimid_profile', {
            username: _profile.display_name || _profile.username,
            avatarUrl: null,
            memberSince: _profile.created_at || new Date().toISOString()
          });
          if (window.ProfilePage.updateTopbarAvatar) window.ProfilePage.updateTopbarAvatar();
        }
      }
    });
  }

  function onLoggedOut() {
    _profile  = null;
    _friends  = [];
    _incoming = [];
    _outgoing = [];
    _collabs  = [];
    _allUsers = [];
    _onlinePresence = {};
    removeTopbarStatus();
    showAuthOverlay();
  }

  /* ── Profile ────────────────────────────────────────── */
  function loadProfile() {
    if (!_session) return Promise.resolve();
    return db.from('profiles').select('*').eq('id', _session.user.id).single()
      .then(function (r) {
        _profile = r.data || null;
        return _profile;
      });
  }

  function saveProfile(fields) {
    if (!_session) return Promise.reject('Not signed in');
    return db.from('profiles').update(fields).eq('id', _session.user.id)
      .then(function () { return loadProfile(); });
  }

  /* ── Friends data ───────────────────────────────────── */
  function loadFriendsData() {
    if (!_session) return Promise.resolve();
    var uid = _session.user.id;

    return Promise.all([
      db.from('friends')
        .select('*, profile:profiles!friends_friend_id_fkey(id,username,display_name,bio,created_at)')
        .eq('user_id', uid)
        .then(function (r) { return r.data || []; })
        .catch(function () { return []; }),
      db.from('friend_requests')
        .select('*, profile:profiles!friend_requests_sender_id_fkey(id,username,display_name)')
        .eq('receiver_id', uid).eq('status', 'pending')
        .then(function (r) { return r.data || []; })
        .catch(function () { return []; }),
      db.from('friend_requests')
        .select('id, sender_id, receiver_id, status, created_at')
        .eq('sender_id', uid).eq('status', 'pending')
        .then(function (r) {
          var rows = r.data || [];
          if (!rows.length) return rows;
          var ids = rows.map(function (x) { return x.receiver_id; });
          return db.from('profiles')
            .select('id,username,display_name')
            .in('id', ids)
            .then(function (pr) {
              var profileMap = {};
              (pr.data || []).forEach(function (p) { profileMap[p.id] = p; });
              return rows.map(function (req) {
                return Object.assign({}, req, { profile: profileMap[req.receiver_id] || null });
              });
            })
            .catch(function () { return rows; });
        })
        .catch(function () { return []; })
    ]).then(function (results) {
      _friends  = results[0];
      _incoming = results[1];
      _outgoing = results[2];
    }).catch(function (err) {
      console.warn('[Social] loadFriendsData error:', err);
      _friends = []; _incoming = []; _outgoing = [];
    });
  }

  /* ── Collab playlists data ──────────────────────────── */
  function loadCollabData() {
    if (!_session) return Promise.resolve();
    var uid = _session.user.id;

    return Promise.all([
      db.from('playlists').select('*').eq('owner_id', uid).order('created_at', { ascending: false })
        .then(function (r) { return r.data || []; })
        .catch(function () { return []; }),
      db.from('playlist_collaborators')
        .select('*, playlist:playlists(*)')
        .eq('user_id', uid)
        .then(function (r) { return r.data || []; })
        .catch(function () { return []; })
    ]).then(function (results) {
      var owned  = results[0];
      var collab = results[1].map(function (c) {
        return c.playlist ? Object.assign({}, c.playlist, { _collab: true }) : null;
      }).filter(Boolean);
      _collabs = owned.concat(collab);
    }).catch(function (err) {
      console.warn('[Social] loadCollabData error:', err);
      _collabs = [];
    });
  }

  function refreshSocialData() {
    return Promise.all([
      loadFriendsData().catch(function (e) { console.warn('[Social] friends load error', e); }),
      loadCollabData().catch(function (e) { console.warn('[Social] collab load error', e); }),
      loadAllUsers().catch(function (e) { console.warn('[Social] users load error', e); })
    ]);
  }

  /* ── All users (for "people on NONIMID") ───────────── */
  function loadAllUsers() {
    if (!_session) return Promise.resolve();
    return db.from('profiles')
      .select('id,username,display_name,last_seen_at')
      .neq('id', _session.user.id)
      .order('last_seen_at', { ascending: false })
      .limit(50)
      .then(function (r) {
        _allUsers = r.data || [];
      });
  }

  function pingPresence() {
    if (!_session) return;
    db.from('profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', _session.user.id)
      .then(function () {});
  }

  function isOnline(last_seen_at) {
    if (!last_seen_at) return false;
    return (Date.now() - new Date(last_seen_at).getTime()) < 5 * 60 * 1000; // 5 min
  }

  /* ── Topbar status ──────────────────────────────────── */
  function injectTopbarStatus() {
    removeTopbarStatus();
    if (!_session || !_profile) return;
    var actions = document.querySelector('.topbar-actions');
    if (!actions) return;
    var span = document.createElement('span');
    span.id = 'sbTopbarStatus';
    span.className = 'sb-topbar-status';
    span.title = 'Signed in as ' + (_profile.display_name || _profile.username);
    span.onclick = function () { Social.signOut(); };
    span.innerHTML =
      '<span class="sb-topbar-dot"></span>' +
      '<span>' + esc((_profile.display_name || _profile.username).slice(0, 12)) + '</span>';
    // Insert before the first child (before the api-status)
    actions.insertBefore(span, actions.firstChild);
  }

  function removeTopbarStatus() {
    var el = document.getElementById('sbTopbarStatus');
    if (el) el.remove();
  }

  /* ── Render: Friends Page ───────────────────────────── */
  function renderFriendsPage() {
    var el = document.getElementById('friendsPage');
    if (!el) return;
    if (!_session) { el.innerHTML = needLoginHtml('friends'); return; }

    el.innerHTML =
      '<div class="sb-page">' +
        '<div class="sb-page-title">Friends</div>' +
        '<div class="sb-page-sub">Connect with other listeners</div>' +
        '<div class="sb-search-row">' +
          '<input class="sb-search-input" id="sbFriendSearch" placeholder="Search by username…" />' +
          '<button class="sb-btn-sm green" onclick="Social._searchUsers()">Search</button>' +
        '</div>' +
        '<div id="sbSearchResults" style="margin-bottom:20px"></div>' +
        '<div id="sbOnlineSection">' + renderOnlineUsersHtml() + '</div>' +
        '<div class="sb-segs">' +
          '<button class="sb-seg' + (_activeFriendTab==='friends'  ? ' active':'') + '" onclick="Social._friendTab(\'friends\')">Friends<span class="sb-badge">' + _friends.length + '</span></button>' +
          '<button class="sb-seg' + (_activeFriendTab==='incoming' ? ' active':'') + '" onclick="Social._friendTab(\'incoming\')">Requests<span class="sb-badge">' + _incoming.length + '</span></button>' +
          '<button class="sb-seg' + (_activeFriendTab==='outgoing' ? ' active':'') + '" onclick="Social._friendTab(\'outgoing\')">Sent</button>' +
        '</div>' +
        '<div id="sbFriendList" class="sb-card-list"></div>' +
      '</div>';

    document.getElementById('sbFriendSearch').addEventListener('keydown', function (e) {
      e.stopPropagation();
      if (e.key === 'Enter') Social._searchUsers();
    });

    renderFriendList();
  }

  function renderOnlineUsersHtml() {
    if (!_allUsers.length) return '';

    var friendIds   = _friends.map(function (f) { return f.friend_id; });
    var outgoingIds = _outgoing.map(function (o) { return o.receiver_id; });
    var incomingMap = {};
    _incoming.forEach(function (r) {
      var sid = r.profile && r.profile.id;
      if (sid) incomingMap[sid] = r.id;
    });

    var online  = _allUsers.filter(function (u) { return isOnline(u.last_seen_at); });
    var offline = _allUsers.filter(function (u) { return !isOnline(u.last_seen_at); });
    var display = online.concat(offline).slice(0, 20);

    if (!display.length) return '';

    var html = '<div class="sb-section-label">People on NONIMID' +
      (online.length ? '<span class="sb-online-count">🟢 ' + online.length + ' online</span>' : '') +
      '</div>' +
      '<div class="sb-card-list" style="margin-bottom:24px">' +
      display.map(function (u) {
        var isFriend   = friendIds.indexOf(u.id) !== -1;
        var isPending  = outgoingIds.indexOf(u.id) !== -1;
        var incomingId = incomingMap[u.id];
        var onlineNow  = isOnline(u.last_seen_at);
        var action = isFriend
          ? '<span class="sb-friend-badge">Friends ✓</span>'
          : isPending
            ? '<span style="font-size:11px;color:var(--text-muted);font-weight:700">Pending…</span>'
            : incomingId
              ? '<button class="sb-btn-sm green" style="font-size:11px" onclick="Social._respondRequest(\'' + incomingId + '\',\'accepted\')">Accept</button>'
              : '<button class="sb-btn-sm green" style="font-size:11px" onclick="Social._addFromOnline(\'' + u.id + '\', this)">+ Add</button>';
        return '<div class="sb-card">' +
          '<div style="position:relative;display:inline-block;flex-shrink:0">' +
            avatarHtml(displayName(u), '') +
            '<span class="' + (onlineNow ? 'sb-dot-online' : 'sb-dot-offline') + '"></span>' +
          '</div>' +
          '<div class="sb-card-body">' +
            '<div class="sb-card-name">' + esc(displayName(u)) + '</div>' +
            '<div class="sb-card-sub">' + esc(subLabel(u)) + (onlineNow ? ' · <span style="color:#1db954;font-weight:700">Online</span>' : '') + '</div>' +
          '</div>' +
          '<div class="sb-card-actions">' + action + '</div>' +
        '</div>';
      }).join('') +
      '</div>';

    return html;
  }

  function renderFriendList() {
    var el = document.getElementById('sbFriendList');
    if (!el) return;
    if (_activeFriendTab === 'friends')  renderFriendCards(el);
    if (_activeFriendTab === 'incoming') renderIncomingCards(el);
    if (_activeFriendTab === 'outgoing') renderOutgoingCards(el);
  }

  function renderFriendCards(el) {
    if (!_friends.length) { el.innerHTML = emptyHtml('👥', 'No friends yet', 'Search for people above and send a request'); return; }
    el.innerHTML = _friends.map(function (f) {
      var p = f.profile || {};
      return '<div class="sb-card">' +
        avatarHtml(displayName(p), '') +
        '<div class="sb-card-body">' +
          '<div class="sb-card-name">' + esc(displayName(p)) + '</div>' +
          '<div class="sb-card-sub">' + esc(subLabel(p)) + '</div>' +
        '</div>' +
        '<div class="sb-card-actions">' +
          '<button class="sb-btn-sm red" onclick="Social._removeFriend(\'' + f.friend_id + '\')">Remove</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function renderIncomingCards(el) {
    if (!_incoming.length) { el.innerHTML = emptyHtml('📬', 'No pending requests', ''); return; }
    el.innerHTML = _incoming.map(function (r) {
      var p = r.profile || {};
      return '<div class="sb-card">' +
        avatarHtml(displayName(p), '') +
        '<div class="sb-card-body">' +
          '<div class="sb-card-name">' + esc(displayName(p)) + '</div>' +
          '<div class="sb-card-sub">' + esc(subLabel(p)) + '</div>' +
        '</div>' +
        '<div class="sb-card-actions">' +
          '<button class="sb-btn-sm green" onclick="Social._respondRequest(\'' + r.id + '\',\'accepted\')">Accept</button>' +
          '<button class="sb-btn-sm ghost" onclick="Social._respondRequest(\'' + r.id + '\',\'declined\')">Decline</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function renderOutgoingCards(el) {
    if (!_outgoing.length) { el.innerHTML = emptyHtml('📤', 'No outgoing requests', ''); return; }
    el.innerHTML = _outgoing.map(function (r) {
      var p = r.profile || {};
      return '<div class="sb-card">' +
        avatarHtml(displayName(p), '') +
        '<div class="sb-card-body">' +
          '<div class="sb-card-name">' + esc(displayName(p)) + '</div>' +
          '<div class="sb-card-sub">' + esc(subLabel(p)) + '</div>' +
        '</div>' +
        '<div class="sb-card-actions">' +
          '<span style="font-size:11px;color:var(--text-muted);font-weight:700">Pending…</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ── Render: Collab Playlists Page ──────────────────── */
  function renderCollabPage() {
    var el = document.getElementById('collabPage');
    if (!el) return;
    if (!_session) { el.innerHTML = needLoginHtml('collab'); return; }

    var online = _allUsers.filter(function (u) { return isOnline(u.last_seen_at); });
    var onlineHtml = '';
    if (online.length) {
      onlineHtml = '<div class="sb-section-label">Who\'s Online<span class="sb-online-count">🟢 ' + online.length + '</span></div>' +
        '<div class="sb-online-strip">' +
        online.slice(0, 12).map(function (u) {
          var isFriend = _friends.some(function (f) { return f.friend_id === u.id; });
          return '<div class="sb-online-chip">' +
            '<div style="position:relative;display:inline-block">' +
              avatarHtml(displayName(u), 'sb-avatar-sm') +
              '<span class="sb-dot-online" style="position:absolute;bottom:0;right:0"></span>' +
            '</div>' +
            '<span class="sb-online-name">' + esc(displayName(u).slice(0, 10)) + '</span>' +
            (!isFriend ? '<button class="sb-chip-add" onclick="Social._addFromOnline(\'' + u.id + '\', this)" title="Add friend">+</button>' : '<span class="sb-chip-friends">✓</span>') +
          '</div>';
        }).join('') +
        '</div>';
    }

    el.innerHTML =
      '<div class="sb-page">' +
        onlineHtml +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
          '<div class="sb-page-title">Collab Playlists</div>' +
          '<button class="sb-btn-sm green" onclick="Social._newPlaylist()">+ New</button>' +
        '</div>' +
        '<div class="sb-page-sub">Playlists you own or collaborate on</div>' +
        '<div class="sb-segs">' +
          '<button class="sb-seg' + (_collabTab==='mine'   ? ' active':'') + '" onclick="Social._collabSeg(\'mine\')">My Playlists</button>' +
          '<button class="sb-seg' + (_collabTab==='collab' ? ' active':'') + '" onclick="Social._collabSeg(\'collab\')">Collaborating</button>' +
        '</div>' +
        '<div id="sbCollabList" class="sb-card-list"></div>' +
      '</div>';

    renderCollabList();
  }

  function renderCollabList() {
    var el = document.getElementById('sbCollabList');
    if (!el) return;
    var uid = _session && _session.user.id;
    var list = _collabTab === 'mine'
      ? _collabs.filter(function (p) { return p.owner_id === uid; })
      : _collabs.filter(function (p) { return p._collab; });

    if (!list.length) {
      el.innerHTML = emptyHtml('🎵', _collabTab === 'mine' ? 'No playlists yet' : 'Not collaborating on any playlists', 'Create one with the + New button');
      return;
    }
    el.innerHTML = list.map(function (p) {
      return '<div class="sb-card" style="cursor:pointer" onclick="Social._openPlaylist(\'' + p.id + '\')">' +
        '<div style="width:44px;height:44px;border-radius:8px;flex-shrink:0;background:' + (p.cover_color || 'var(--purple-dim)') + ';display:flex;align-items:center;justify-content:center;font-size:20px">🎶</div>' +
        '<div class="sb-card-body">' +
          '<div class="sb-card-name">' + esc(p.name) + '</div>' +
          '<div class="sb-card-sub">' + (p.description ? esc(p.description) : 'Collab playlist') + '</div>' +
        '</div>' +
        (p._collab ? '<span class="sb-collab-badge">Collab</span>' : '') +
      '</div>';
    }).join('');
  }

  /* ── Render: Playlist Detail ────────────────────────── */
  var _currentPlaylistId = null;
  var _currentTracks = [];
  var _currentCollabs = [];
  var _addTrackOpen = false;
  var _collabPickerOpen = false;

  function renderPlaylistDetail(playlistId) {
    var el = document.getElementById('collabPage');
    if (!el) return;
    _currentPlaylistId = playlistId;

    var pl = _collabs.find(function (p) { return p.id === playlistId; });
    if (!pl) { renderCollabPage(); return; }

    var uid = _session && _session.user.id;
    var isOwner = pl.owner_id === uid;

    el.innerHTML = '<div class="sb-spinner"></div>';

    Promise.all([
      db.from('playlist_tracks')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true }),
      db.from('playlist_collaborators')
        .select('*, profile:profiles!playlist_collaborators_user_id_fkey(id,username,display_name)')
        .eq('playlist_id', playlistId)
    ]).then(function (results) {
      _currentTracks  = results[0].data || [];
      _currentCollabs = results[1].data || [];

      var collabIds = _currentCollabs.map(function (c) { return c.user_id; });
      var canEdit   = isOwner || collabIds.indexOf(uid) !== -1;

      el.innerHTML =
        '<div class="sb-page">' +
          '<button onclick="Social.renderCollabPage()" style="background:none;border:none;color:var(--neon-green);font-family:\'Syne\',sans-serif;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:16px;padding:0">← Back</button>' +
          '<div class="sb-pl-hero">' +
            '<div class="sb-pl-art" style="background:' + (pl.cover_color||'var(--purple-dim)') + '">🎶</div>' +
            '<div class="sb-pl-hero-info">' +
              '<div class="sb-pl-hero-type">' + (pl._collab ? 'Collab Playlist' : 'Your Playlist') + '</div>' +
              '<div class="sb-pl-hero-title">' + esc(pl.name) + '</div>' +
              '<div class="sb-pl-hero-meta" id="sbPlMeta">' + _currentTracks.length + ' track' + (_currentTracks.length !== 1 ? 's' : '') + '</div>' +
              '<div class="sb-pl-hero-actions">' +
                (canEdit
                  ? '<button class="sb-btn-sm green" onclick="Social._toggleAddTrack()">+ Add Track</button>'
                  : '') +
                (isOwner
                  ? '<button class="sb-btn-sm ghost" onclick="Social._toggleCollabPicker()">' +
                      '👥 Collabs (' + _currentCollabs.length + ')' +
                    '</button>' +
                    '<button class="sb-btn-sm red" onclick="Social._deletePlaylist(\'' + playlistId + '\')" style="margin-left:auto">Delete</button>'
                  : '') +
              '</div>' +
            '</div>' +
          '</div>' +

          /* Add track box */
          '<div class="sb-add-track-box" id="sbAddTrackBox">' +
            '<div class="sb-add-track-grid">' +
              '<div class="sb-field"><label class="sb-label">Title *</label><input class="sb-input" id="sbTrackTitle" placeholder="Song title"/></div>' +
              '<div class="sb-field"><label class="sb-label">Artist *</label><input class="sb-input" id="sbTrackArtist" placeholder="Artist name"/></div>' +
              '<div class="sb-field"><label class="sb-label">Album</label><input class="sb-input" id="sbTrackAlbum" placeholder="Album (optional)"/></div>' +
            '</div>' +
            '<div style="display:flex;gap:10px">' +
              '<button class="sb-btn-sm green" onclick="Social._addTrack()">Add Track</button>' +
              '<button class="sb-btn-sm ghost" onclick="Social._toggleAddTrack()">Cancel</button>' +
            '</div>' +
          '</div>' +

          /* Collab picker */
          '<div class="sb-add-track-box" id="sbCollabBox">' +
            '<div style="font-size:13px;font-weight:700;margin-bottom:12px;color:var(--text-primary)">Collaborators</div>' +
            '<div class="sb-collab-list" id="sbCollabListInner">' +
              renderCollabListHtml(isOwner) +
            '</div>' +
            (isOwner ? renderFriendPickerHtml(collabIds) : '') +
            '<button class="sb-btn-sm ghost" onclick="Social._toggleCollabPicker()" style="margin-top:10px">Close</button>' +
          '</div>' +

          /* Track list */
          '<div id="sbTrackList">' + renderTrackListHtml(canEdit) + '</div>' +
        '</div>';

      // stop keypresses bubbling to NONIMID shortcuts
      ['sbTrackTitle','sbTrackArtist','sbTrackAlbum'].forEach(function (id) {
        var inp = document.getElementById(id);
        if (inp) inp.addEventListener('keydown', function (e) { e.stopPropagation(); });
      });
    });
  }

  function renderTrackListHtml(canEdit) {
    if (!_currentTracks.length) return emptyHtml('🎵', 'No tracks yet', canEdit ? 'Add the first track above' : '');
    return _currentTracks.map(function (t, i) {
      var dur = t.duration_ms ? fmtDur(t.duration_ms) : '—';
      return '<div class="sb-track-row">' +
        '<span class="sb-track-num">' + (i+1) + '</span>' +
        '<div class="sb-track-body">' +
          '<div class="sb-track-title">' + esc(t.title) + '</div>' +
          '<div class="sb-track-artist">' + esc(t.artist) + (t.album ? ' · ' + esc(t.album) : '') + '</div>' +
        '</div>' +
        '<span class="sb-track-dur">' + dur + '</span>' +
        (canEdit ? '<button class="sb-track-del" onclick="Social._removeTrack(\'' + t.id + '\')" title="Remove">✕</button>' : '') +
      '</div>';
    }).join('');
  }

  function renderCollabListHtml(isOwner) {
    if (!_currentCollabs.length) return '<div style="font-size:12px;color:var(--text-muted)">No collaborators yet.</div>';
    return _currentCollabs.map(function (c) {
      var p = c.profile || {};
      return '<div class="sb-card" style="padding:8px 12px">' +
        avatarHtml(displayName(p), 'sm') +
        '<div class="sb-card-body">' +
          '<div class="sb-card-name" style="font-size:13px">' + esc(displayName(p)) + '</div>' +
        '</div>' +
        (isOwner ? '<button class="sb-btn-sm red" style="padding:5px 10px;font-size:11px" onclick="Social._removeCollab(\'' + c.user_id + '\')">Remove</button>' : '') +
      '</div>';
    }).join('');
  }

  function renderFriendPickerHtml(existingIds) {
    var available = _friends.filter(function (f) { return existingIds.indexOf(f.friend_id) === -1; });
    if (!available.length) return '<div style="font-size:12px;color:var(--text-muted);margin-top:8px">All friends are already collaborators.</div>';
    return '<div style="font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--text-muted);margin:12px 0 8px;text-transform:uppercase">Add from friends</div>' +
      available.map(function (f) {
        var p = f.profile || {};
        return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
          avatarHtml(displayName(p), 'sm') +
          '<span style="flex:1;font-size:13px">' + esc(displayName(p)) + '</span>' +
          '<button class="sb-btn-sm green" style="padding:5px 12px;font-size:11px" onclick="Social._addCollab(\'' + f.friend_id + '\')">Add</button>' +
        '</div>';
      }).join('');
  }

  /* ── Social actions ─────────────────────────────────── */
  /* public */ function _friendTab(seg) {
    _activeFriendTab = seg;
    renderFriendsPage();
  }

  /* public */ function _collabSeg(seg) {
    _collabTab = seg;
    renderCollabList();
    // re-render the seg buttons
    var segs = document.querySelectorAll('#collabPage .sb-seg');
    segs.forEach(function (s, i) {
      s.classList.toggle('active', (i === 0 && seg === 'mine') || (i === 1 && seg === 'collab'));
    });
  }

  /* public */ function _searchUsers() {
    var searchEl = document.getElementById('sbFriendSearch');
    var q = searchEl ? (searchEl.value || '').trim() : '';
    if (!q) return;
    var el = document.getElementById('sbSearchResults');
    if (!el) return;
    el.innerHTML = '<div class="sb-spinner"></div>';

    db.from('profiles')
      .select('id,username,display_name')
      .ilike('username', '%' + q + '%')
      .neq('id', _session.user.id)
      .limit(8)
      .then(function (r) {
        var rows = r.data || [];
        if (!rows.length) { el.innerHTML = '<div style="font-size:13px;color:var(--text-muted);padding:8px 0">No users found</div>'; return; }

        var friendIds   = _friends.map(function (f) { return f.friend_id; });
        var outgoingIds = _outgoing.map(function (o) { return o.receiver_id; });

        el.innerHTML = '<div class="sb-card-list">' +
          rows.map(function (u) {
            var isFriend  = friendIds.indexOf(u.id) !== -1;
            var isPending = outgoingIds.indexOf(u.id) !== -1;
            var action = isFriend
              ? '<span style="font-size:11px;color:var(--neon-green);font-weight:700">Friends ✓</span>'
              : isPending
                ? '<span style="font-size:11px;color:var(--text-muted);font-weight:700">Pending…</span>'
                : '<button class="sb-btn-sm green" style="padding:6px 14px;font-size:11px" onclick="Social._sendRequest(\'' + u.id + '\')">Add</button>';
            return '<div class="sb-card">' +
              avatarHtml(displayName(u), '') +
              '<div class="sb-card-body">' +
                '<div class="sb-card-name">' + esc(displayName(u)) + '</div>' +
                '<div class="sb-card-sub">' + esc(subLabel(u)) + '</div>' +
              '</div>' +
              '<div class="sb-card-actions">' + action + '</div>' +
            '</div>';
          }).join('') +
        '</div>';
      });
  }

  /* public */ function _sendRequest(toId) {
    if (!_session) return;
    db.from('friend_requests')
      .insert({ sender_id: _session.user.id, receiver_id: toId })
      .then(function (r) {
        if (r.error) { showToast(r.error.message, 'error'); return; }
        showToast('Friend request sent!', 'success');

        // Capture the current search query *before* renderFriendsPage()
        // rebuilds the DOM and wipes the input value
        var searchEl  = document.getElementById('sbFriendSearch');
        var prevQuery = searchEl ? searchEl.value.trim() : '';

        loadFriendsData().then(function () {
          renderFriendsPage();
          // Restore query and refresh search results so the "Add"
          // button updates to "Pending…"
          if (prevQuery) {
            var newSearchEl = document.getElementById('sbFriendSearch');
            if (newSearchEl) {
              newSearchEl.value = prevQuery;
              _searchUsers();
            }
          }
        });
      });
  }

  /* public */ function _addFromOnline(toId, btnEl) {
    if (!_session) return;
    if (btnEl && btnEl.tagName) {
      btnEl.disabled = true;
      btnEl.textContent = 'Sending…';
    }
    db.from('friend_requests')
      .insert({ sender_id: _session.user.id, receiver_id: toId })
      .then(function (r) {
        if (r.error) { showToast(r.error.message, 'error'); if (btnEl && btnEl.tagName) { btnEl.disabled = false; btnEl.textContent = '+ Add'; } return; }
        showToast('Friend request sent! 🎉', 'success');
        loadFriendsData().then(function () {
          var sec = document.getElementById('sbOnlineSection');
          if (sec) sec.innerHTML = renderOnlineUsersHtml();
          renderFriendList();
        });
      });
  }

  /* public */ function _respondRequest(requestId, status) {
    db.from('friend_requests')
      .update({ status: status })
      .eq('id', requestId)
      .then(function (r) {
        if (r.error) { showToast(r.error.message, 'error'); return; }
        showToast(status === 'accepted' ? 'Friend added! 🎉' : 'Request declined', 'info');
        loadFriendsData().then(function () { renderFriendsPage(); });
      });
  }

  /* public */ function _removeFriend(friendId) {
    if (!confirm('Remove this friend?')) return;
    var uid = _session.user.id;
    Promise.all([
      db.from('friends').delete().eq('user_id', uid).eq('friend_id', friendId),
      db.from('friends').delete().eq('user_id', friendId).eq('friend_id', uid)
    ]).then(function () {
      showToast('Friend removed', 'info');
      loadFriendsData().then(function () { renderFriendsPage(); });
    });
  }

  /* public */ function _newPlaylist() {
    if (!_session) return;
    var name = prompt('Playlist name:');
    if (!name || !name.trim()) return;
    var colors = ['#6366f1','#ec4899','#f59e0b','#10b981','#8b5cf6','#ef4444','#3b82f6'];
    var color  = colors[Math.floor(Math.random() * colors.length)];
    db.from('playlists')
      .insert({ owner_id: _session.user.id, name: name.trim(), cover_color: color })
      .select()
      .single()
      .then(function (r) {
        if (r.error) { showToast(r.error.message, 'error'); return; }
        showToast('"' + name.trim() + '" created!', 'success');
        loadCollabData().then(function () { renderCollabPage(); });
      });
  }

  /* public */ function _deletePlaylist(playlistId) {
    if (!confirm('Delete this playlist? This cannot be undone.')) return;
    db.from('playlists').delete().eq('id', playlistId).then(function () {
      showToast('Playlist deleted', 'info');
      loadCollabData().then(function () { renderCollabPage(); });
    });
  }

  /* public */ function _openPlaylist(playlistId) {
    renderPlaylistDetail(playlistId);
  }

  /* public */ function _toggleAddTrack() {
    _addTrackOpen = !_addTrackOpen;
    var box = document.getElementById('sbAddTrackBox');
    if (box) box.classList.toggle('open', _addTrackOpen);
    if (_addTrackOpen) {
      setTimeout(function () {
        var inp = document.getElementById('sbTrackTitle');
        if (inp) inp.focus();
      }, 60);
    }
  }

  /* public */ function _toggleCollabPicker() {
    _collabPickerOpen = !_collabPickerOpen;
    var box = document.getElementById('sbCollabBox');
    if (box) box.classList.toggle('open', _collabPickerOpen);
  }

  /* public */ function _addTrack() {
    var title  = (document.getElementById('sbTrackTitle')  && document.getElementById('sbTrackTitle').value  || '').trim();
    var artist = (document.getElementById('sbTrackArtist') && document.getElementById('sbTrackArtist').value || '').trim();
    var album  = (document.getElementById('sbTrackAlbum')  && document.getElementById('sbTrackAlbum').value  || '').trim();
    if (!title || !artist) { showToast('Title and artist are required', 'error'); return; }

    db.from('playlist_tracks')
      .insert({
        playlist_id: _currentPlaylistId,
        added_by:    _session.user.id,
        title:       title,
        artist:      artist,
        album:       album || null,
        position:    _currentTracks.length + 1
      })
      .then(function (r) {
        if (r.error) { showToast(r.error.message, 'error'); return; }
        showToast('"' + title + '" added!', 'success');
        _addTrackOpen = false;
        renderPlaylistDetail(_currentPlaylistId);
      });
  }

  /* public */ function _removeTrack(trackId) {
    db.from('playlist_tracks').delete().eq('id', trackId).then(function () {
      showToast('Track removed', 'info');
      renderPlaylistDetail(_currentPlaylistId);
    });
  }

  /* public */ function _addCollab(userId) {
    db.from('playlist_collaborators')
      .insert({ playlist_id: _currentPlaylistId, user_id: userId })
      .then(function (r) {
        if (r.error) { showToast(r.error.message, 'error'); return; }
        showToast('Collaborator added!', 'success');
        renderPlaylistDetail(_currentPlaylistId);
      });
  }

  /* public */ function _removeCollab(userId) {
    db.from('playlist_collaborators')
      .delete()
      .eq('playlist_id', _currentPlaylistId)
      .eq('user_id', userId)
      .then(function () {
        showToast('Collaborator removed', 'info');
        renderPlaylistDetail(_currentPlaylistId);
      });
  }

  /* ── Sign out ────────────────────────────────────────── */
  /* public */ function signOut() {
    if (!confirm('Sign out?')) return;
    db.auth.signOut();
  }

  /* ── Helpers ─────────────────────────────────────────── */
  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function fmtDur(ms) {
    var s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function avatarHtml(name, cls) {
    var letter = (name || '?')[0].toUpperCase();
    return '<div class="sb-avatar ' + cls + '">' + esc(letter) + '</div>';
  }

  /* Prefer display_name; if missing/empty, fall back to username — and
     if that username looks like an email (Supabase default), show only
     the local part instead of the full address (Bug 3 fix) */
  function displayName(p) {
    if (!p) return '?';
    var dn = (p.display_name || '').trim();
    if (dn && dn.indexOf('@') === -1) return dn;
    var un = (p.username || '').trim();
    if (un.indexOf('@') !== -1) return un.split('@')[0];
    return un || '?';
  }

  /* Sub-label under the name — always "@username", but if the username
     is an email address, show only the local part (Bug 3 fix) */
  function subLabel(p) {
    if (!p) return '';
    var un = (p.username || '').trim();
    if (un.indexOf('@') !== -1) return '@' + un.split('@')[0];
    return '@' + un;
  }

  function emptyHtml(icon, title, sub) {
    return '<div class="sb-empty"><div class="sb-empty-icon">' + icon + '</div><div class="sb-empty-title">' + esc(title) + '</div><div class="sb-empty-sub">' + esc(sub) + '</div></div>';
  }

  function needLoginHtml(page) {
    return '<div class="sb-page">' + emptyHtml('🔒', 'Sign in required', 'Create an account to use ' + page + ' features.') +
      '<div style="text-align:center;margin-top:20px"><button class="sb-btn-sm green" onclick="Social._showAuth()">Sign In / Register</button></div></div>';
  }

  function showToast(msg, type) {
    // Use NONIMID Toast if available, otherwise fallback
    if (window.Toast && window.Toast.show) {
      window.Toast.show(msg, type || 'info');
    } else {
      var c = document.getElementById('toastContainer');
      if (!c) return;
      var t = document.createElement('div');
      t.className = 'toast ' + (type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : 'toast-info');
      t.textContent = msg;
      c.appendChild(t);
      setTimeout(function () { t.remove(); }, 3000);
    }
  }

  /* ── Public API ──────────────────────────────────────── */
  window.Social = {
    // Page renders (called by App.navigate patch)
    renderFriendsPage:  renderFriendsPage,
    renderCollabPage:   renderCollabPage,

    // Auth
    _authTab:     _authTab,
    _authSubmit:  _authSubmit,
    _skipAuth:    _skipAuth,
    _showAuth:    showAuthOverlay,
    signOut:      signOut,

    // Friend actions
    _friendTab:       _friendTab,
    _searchUsers:     _searchUsers,
    _sendRequest:     _sendRequest,
    _addFromOnline:   _addFromOnline,
    _respondRequest:  _respondRequest,
    _removeFriend:    _removeFriend,

    // Collab playlist actions
    _collabSeg:          _collabSeg,
    _newPlaylist:        _newPlaylist,
    _deletePlaylist:     _deletePlaylist,
    _openPlaylist:       _openPlaylist,
    _toggleAddTrack:     _toggleAddTrack,
    _toggleCollabPicker: _toggleCollabPicker,
    _addTrack:           _addTrack,
    _removeTrack:        _removeTrack,
    _addCollab:          _addCollab,
    _removeCollab:       _removeCollab,

    // Accessors (for debugging / external use)
    getSession:  function () { return _session; },
    getProfile:  function () { return _profile; },
    getFriends:  function () { return _friends; },
    getCollabs:  function () { return _collabs; }
  };

  /* ── Init on DOM ready ───────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
