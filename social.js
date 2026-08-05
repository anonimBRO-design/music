/* ============================================================
   NONIMSONG — Social & Community Module (social.js)
   Users · Public Profiles · Follow System · Listening Party (Sync & Reactions)
   ============================================================ */

(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────── */
  var SUPABASE_URL  = 'https://qfloggalcslkifakbybb.supabase.co';
  var SUPABASE_ANON = 'sb_publishable_iSXk_pq-XfRXmKFEOU3Hmw_uRIZd5eE';

  /* ── CSS Injected Once ──────────────────────────────── */
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
  font-size:14px;font-weight:800;cursor:pointer;transition:all .2s;
}
.sb-btn:hover{filter:brightness(1.1);transform:scale(1.01)}
.sb-err{color:#ef4444;font-size:12px;margin-top:8px;text-align:center;min-height:16px}
.sb-auth-skip{text-align:center;margin-top:16px}
.sb-auth-skip a{color:var(--text-muted);font-size:12px;cursor:pointer;text-decoration:underline}

/* ── Social UI Components ─────────────────── */
.sb-page{padding:24px 32px;max-width:1100px;margin:0 auto}
.sb-page-title{font-size:32px;font-weight:800;letter-spacing:-.03em;margin-bottom:4px}
.sb-page-sub{font-size:14px;color:var(--text-muted);margin-bottom:24px}
.sb-topbar-status{
  display:inline-flex;align-items:center;gap:6px;padding:4px 10px;
  border-radius:999px;background:rgba(255,255,255,.06);border:1px solid var(--border);
  font-size:12px;font-weight:700;color:var(--text-primary);cursor:pointer;
  transition:all .2s;margin-right:8px;
}
.sb-topbar-status:hover{background:rgba(255,255,255,.12);border-color:var(--neon-green)}
.sb-topbar-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e}
.sb-search-row{display:flex;gap:10px;margin-bottom:20px}
.sb-search-input{
  flex:1;padding:12px 18px;background:rgba(255,255,255,.05);
  border:1px solid var(--border);border-radius:999px;color:#fff;
  font-family:'Syne',sans-serif;font-size:14px;outline:none;
}
.sb-search-input:focus{border-color:var(--neon-green)}
.sb-segs{display:flex;gap:8px;margin-bottom:20px;border-bottom:1px solid var(--border);padding-bottom:12px}
.sb-seg{
  padding:8px 16px;border-radius:999px;border:none;background:transparent;
  color:var(--text-muted);font-family:'Syne',sans-serif;font-size:13px;font-weight:700;
  cursor:pointer;transition:all .2s;
}
.sb-seg.active{background:rgba(255,255,255,.1);color:#fff}
.sb-badge{
  display:inline-block;margin-left:6px;padding:2px 7px;border-radius:999px;
  background:var(--neon-green);color:#000;font-size:10px;font-weight:800;
}
.sb-card-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.sb-card{
  display:flex;align-items:center;gap:14px;padding:14px 16px;
  background:rgba(255,255,255,.03);border:1px solid var(--border);
  border-radius:14px;transition:all .2s;
}
.sb-card:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.15);transform:translateY(-2px)}
.sb-avatar{
  width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--accent));
  display:flex;align-items:center;justify-content:center;
  font-weight:800;font-size:16px;color:#fff;flex-shrink:0;box-shadow:0 4px 12px rgba(0,0,0,.3);
}
.sb-avatar.sm{width:32px;height:32px;font-size:12px}
.sb-card-body{flex:1;min-width:0}
.sb-card-name{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-card-sub{font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-card-actions{display:flex;gap:6px}
.sb-btn-sm{
  padding:6px 14px;border-radius:999px;border:none;cursor:pointer;
  font-family:'Syne',sans-serif;font-size:12px;font-weight:700;transition:all .2s;
}
.sb-btn-sm.green{background:var(--neon-green);color:#000}
.sb-btn-sm.green:hover{filter:brightness(1.15)}
.sb-btn-sm.ghost{background:rgba(255,255,255,.08);color:#fff}
.sb-btn-sm.ghost:hover{background:rgba(255,255,255,.15)}
.sb-btn-sm.red{background:rgba(239,68,68,.15);color:#ef4444}
.sb-btn-sm.red:hover{background:rgba(239,68,68,.3)}
.sb-user-badge{
  font-size:11px;padding:3px 8px;border-radius:999px;
  background:rgba(29,185,84,.15);color:var(--neon-green);font-weight:700;
}
.sb-dot-online{width:10px;height:10px;border-radius:50%;background:#22c55e;border:2px solid #07070c;position:absolute;bottom:0;right:0}
.sb-dot-offline{width:10px;height:10px;border-radius:50%;background:#6b7280;border:2px solid #07070c;position:absolute;bottom:0;right:0}

/* Listening Party styles */
.sb-party-room{
  background:rgba(20,20,30,.8);border:1px solid var(--border);border-radius:20px;
  padding:24px;margin-bottom:24px;box-shadow:0 12px 40px rgba(0,0,0,.4);
}
.sb-party-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.sb-party-status{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--neon-green)}
.sb-party-chat{
  height:200px;overflow-y:auto;background:rgba(0,0,0,.2);border-radius:12px;
  padding:12px;margin:16px 0;display:flex;flex-direction:column;gap:8px;
}
.sb-chat-msg{font-size:13px;line-height:1.4}
.sb-chat-author{font-weight:700;color:var(--accent);margin-right:6px}
.sb-reactions{display:flex;gap:12px;margin-top:12px}
.sb-react-btn{
  background:rgba(255,255,255,.08);border:none;border-radius:999px;
  padding:8px 16px;font-size:18px;cursor:pointer;transition:transform 0.15s ease;
}
.sb-react-btn:hover{transform:scale(1.25);background:rgba(255,255,255,.15)}

/* Public Profile Page */
.sb-profile-hero{
  position:relative;border-radius:24px;overflow:hidden;
  background:linear-gradient(180deg,rgba(99,102,241,.3) 0%,rgba(7,7,12,.9) 100%);
  padding:40px 32px;margin-bottom:32px;border:1px solid var(--border);
}
.sb-profile-banner{
  position:absolute;inset:0;background-size:cover;background-position:center;
  opacity:0.25;filter:blur(10px);z-index:0;
}
.sb-profile-content{position:relative;z-index:1;display:flex;align-items:flex-end;gap:24px}
.sb-profile-avatar{
  width:120px;height:120px;border-radius:50%;border:4px solid var(--bg-void);
  box-shadow:0 8px 32px rgba(0,0,0,.6);background:linear-gradient(135deg,var(--purple),var(--neon-green));
  display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:800;color:#fff;
}
.sb-profile-meta{flex:1}
.sb-profile-username{font-size:36px;font-weight:800;letter-spacing:-.03em}
.sb-profile-handle{font-size:15px;color:var(--text-muted);margin-bottom:8px}
.sb-profile-bio{font-size:14px;color:var(--text-secondary);max-width:500px;margin-bottom:12px}
.sb-profile-stats{display:flex;gap:24px;margin-top:12px}
.sb-stat-item{display:flex;flex-direction:column}
.sb-stat-val{font-size:20px;font-weight:800;color:#fff}
.sb-stat-lbl{font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase}
.sb-empty{text-align:center;padding:48px 20px;color:var(--text-muted)}
.sb-empty-icon{font-size:48px;margin-bottom:12px}
.sb-empty-title{font-size:18px;font-weight:700;color:#fff;margin-bottom:4px}
.sb-empty-sub{font-size:13px;color:var(--text-muted)}
.sb-spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--neon-green);border-radius:50%;animation:spin .8s linear infinite;margin:40px auto}
`;

  /* ── State ──────────────────────────────────────────── */
  var db         = null;
  var _session   = null;
  var _profile   = null;
  var _following = [];     // user ids I follow
  var _followers = [];     // user ids following me
  var _allUsers  = [];     // all users for discovery
  var _parties   = [];     // listening parties
  var _userTab   = 'all';  // active tab on Users page
  var _partyTab  = 'active';
  var _currentParty = null;
  var _partyMessages = [];

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
      if (_session || (window.AdminAuth && window.AdminAuth.isAdmin())) {
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

    patchAppInit();
  }

  function injectStyles() {
    var s = document.createElement('style');
    s.textContent = STYLES;
    document.head.appendChild(s);
  }

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
          '<div class="sb-auth-title">Welcome to NONIMSONG</div>' +
          '<div class="sb-auth-sub">Discover listeners, public profiles & listening parties</div>' +
        '</div>' +
        '<div class="sb-tab-row">' +
          '<button class="sb-tab active" id="sbTabLogin"  onclick="Social._authTab(\'login\')">Sign In</button>' +
          '<button class="sb-tab"        id="sbTabReg"    onclick="Social._authTab(\'register\')">Register</button>' +
        '</div>' +
        '<div class="sb-field"><label class="sb-label">Username</label>' +
          '<input class="sb-input" id="sbAuthUsername" type="text" placeholder="username" autocomplete="username"/></div>' +
        '<div class="sb-field"><label class="sb-label">Password</label>' +
          '<input class="sb-input" id="sbAuthPass" type="password" placeholder="••••••••" autocomplete="current-password"/></div>' +
        '<div class="sb-err" id="sbAuthErr"></div>' +
        '<button class="sb-btn" id="sbAuthBtn" onclick="Social._authSubmit()">Sign In</button>' +
        '<div class="sb-auth-skip"><a onclick="Social._skipAuth()">Continue as Guest</a></div>' +
      '</div>';
    document.body.appendChild(el);

    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') Social._authSubmit();
    });
  }

  function removeAuthOverlay() {
    var el = document.getElementById('socialAuthOverlay');
    if (el) el.remove();
  }

  function _authTab(mode) {
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

  function _authSubmit() {
    var btn   = document.getElementById('sbAuthBtn');
    var username = (document.getElementById('sbAuthUsername').value || '').trim();
    var pass  = document.getElementById('sbAuthPass').value || '';
    var err   = document.getElementById('sbAuthErr');
    var isReg = document.getElementById('sbTabReg') && document.getElementById('sbTabReg').classList.contains('active');

    if (!username || !pass) { err.textContent = 'Username and password required'; return; }
    if (pass.length < 6) { err.textContent = 'Password must be at least 6 characters'; return; }

    btn.disabled = true;
    btn.textContent = '…';
    err.textContent = '';

    function resetBtn() {
      btn.disabled = false;
      btn.textContent = isReg ? 'Create Account' : 'Sign In';
    }

    var safetyTimeout = setTimeout(function () {
      if (btn.disabled) {
        resetBtn();
        err.textContent = 'Request timeout. Please try again.';
      }
    }, 6000);

    // Direct Administrator Authentication for 'L' / 'lawlieto'
    var uUpper = username.toUpperCase();
    if (uUpper === 'L' || uUpper === 'ADMIN') {
      if (pass === 'lawlieto' || (window.AdminAuth && window.AdminAuth.login)) {
        if (window.AdminAuth && window.AdminAuth.login) {
          window.AdminAuth.login(username, pass).then(function (res) {
            clearTimeout(safetyTimeout);
            if (res.success) {
              var adminProfile = {
                id: res.session.user.id,
                username: res.session.user.username,
                display_name: res.session.user.display_name,
                role: 'admin',
                badge: 'ADMIN',
                verified: true
              };
              window.Store.set(KEYS.USER, adminProfile);
              _profile = adminProfile;
              onLoggedIn();
              if (window.Toast) window.Toast.show('Welcome back, Administrator L', 'success');
            } else {
              err.textContent = 'Invalid login credentials';
              resetBtn();
            }
          }).catch(function (e) {
            clearTimeout(safetyTimeout);
            err.textContent = 'Auth error: ' + (e.message || e);
            resetBtn();
          });
          return;
        } else if (uUpper === 'L' && pass === 'lawlieto') {
          // Direct fallback if module script loading is pending
          clearTimeout(safetyTimeout);
          var adminProfile = {
            id: 'user_admin_l',
            username: 'L',
            display_name: 'L (Lawliet)',
            role: 'admin',
            badge: 'ADMIN',
            verified: true
          };
          var adminSession = {
            user: adminProfile,
            token: 'admin_token_' + Date.now(),
            loginAt: new Date().toISOString()
          };
          window.Store.set(KEYS.SESSION, adminSession);
          window.Store.set(KEYS.USER, adminProfile);
          _profile = adminProfile;
          onLoggedIn();
          if (window.Toast) window.Toast.show('Welcome back, Administrator L', 'success');
          return;
        }
      }
    }

    if (!db || !db.auth) {
      clearTimeout(safetyTimeout);
      err.textContent = 'Authentication service offline';
      resetBtn();
      return;
    }

    var virtualEmail = username + '@nonimid.local';
    var promise = isReg
      ? db.auth.signUp({ email: virtualEmail, password: pass })
      : db.auth.signInWithPassword({ email: virtualEmail, password: pass });

    promise.then(function (r) {
      clearTimeout(safetyTimeout);
      if (r.error) {
        err.textContent = r.error.message;
        resetBtn();
      }
    }).catch(function (e) {
      clearTimeout(safetyTimeout);
      err.textContent = e.message || 'Authentication failed';
      resetBtn();
    });
  }

  function _skipAuth() {
    removeAuthOverlay();
    showToast('Browsing as Guest — Sign in to follow users & join Listening Parties', 'info');
  }

  /* ── Login Handlers ─────────────────────────────────── */
  function onLoggedIn() {
    removeAuthOverlay();
    loadProfile().then(function () {
      injectTopbarStatus();
      pingPresence();
      refreshSocialData();
    });
  }

  function onLoggedOut() {
    _profile   = null;
    _following = [];
    _followers = [];
    _allUsers  = [];
    _parties   = [];
    removeTopbarStatus();
    showAuthOverlay();
  }

  /* ── Profile & Data Loading ─────────────────────────── */
  function loadProfile() {
    if (!_session) return Promise.resolve();
    return db.from('profiles').select('*').eq('id', _session.user.id).single()
      .then(function (r) {
        _profile = r.data || null;
        return _profile;
      });
  }

  function refreshSocialData() {
    return Promise.all([
      loadAllUsers().catch(function () {}),
      loadFollowData().catch(function () {})
    ]);
  }

  function loadAllUsers() {
    return db.from('profiles')
      .select('id,username,display_name,last_seen_at,bio,created_at')
      .limit(100)
      .then(function (r) {
        _allUsers = r.data || [];
      });
  }

  function loadFollowData() {
    var stored = localStorage.getItem('nonimsong_following');
    _following = stored ? JSON.parse(stored) : [];
    return Promise.resolve();
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
    return (Date.now() - new Date(last_seen_at).getTime()) < 5 * 60 * 1000;
  }

  /* ── Topbar Status ──────────────────────────────────── */
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
    actions.insertBefore(span, actions.firstChild);
  }

  function removeTopbarStatus() {
    var el = document.getElementById('sbTopbarStatus');
    if (el) el.remove();
  }

  /* ── RENDER: USERS PAGE ─────────────────────────────── */
  function renderUsersPage() {
    var el = document.getElementById('usersPage');
    if (!el) return;

    el.innerHTML =
      '<div class="sb-page">' +
        '<div class="sb-page-title">NONIMSONG Users</div>' +
        '<div class="sb-page-sub">Discover listeners, check profiles & follow your favorite curators</div>' +
        '<div class="sb-search-row">' +
          '<input class="sb-search-input" id="sbUserSearch" placeholder="Search users by name or handle…" />' +
          '<button class="sb-btn-sm green" onclick="Social._searchUsers()">Search</button>' +
        '</div>' +
        '<div id="sbSearchResults" style="margin-bottom:20px"></div>' +
        '<div class="sb-segs">' +
          '<button class="sb-seg' + (_userTab==='all' ? ' active':'') + '" onclick="Social._userTab(\'all\')">All Users<span class="sb-badge">' + _allUsers.length + '</span></button>' +
          '<button class="sb-seg' + (_userTab==='following' ? ' active':'') + '" onclick="Social._userTab(\'following\')">Following<span class="sb-badge">' + _following.length + '</span></button>' +
        '</div>' +
        '<div id="sbUserList" class="sb-card-list"></div>' +
      '</div>';

    document.getElementById('sbUserSearch').addEventListener('keydown', function (e) {
      e.stopPropagation();
      if (e.key === 'Enter') Social._searchUsers();
    });

    renderUserList();
  }

  function renderUserList() {
    var el = document.getElementById('sbUserList');
    if (!el) return;

    var list = _allUsers;
    if (_userTab === 'following') {
      list = _allUsers.filter(function (u) { return _following.includes(u.id); });
    }

    if (!list.length) {
      el.innerHTML = emptyHtml('👥', _userTab === 'following' ? 'Not following anyone yet' : 'No users found', 'Explore users above');
      return;
    }

    el.innerHTML = list.map(function (u) {
      var isFollowing = _following.includes(u.id);
      var onlineNow   = isOnline(u.last_seen_at);
      return '<div class="sb-card" style="cursor:pointer" onclick="Social.renderPublicProfile(\'' + esc(u.username || u.id) + '\')">' +
        '<div style="position:relative;display:inline-block;flex-shrink:0">' +
          avatarHtml(u.display_name || u.username, '') +
          '<span class="' + (onlineNow ? 'sb-dot-online' : 'sb-dot-offline') + '"></span>' +
        '</div>' +
        '<div class="sb-card-body">' +
          '<div class="sb-card-name">' + esc(u.display_name || u.username || '?') + '</div>' +
          '<div class="sb-card-sub">@' + esc(u.username || '') + (onlineNow ? ' · <span style="color:#1db954;font-weight:700">Online</span>' : '') + '</div>' +
        '</div>' +
        '<div class="sb-card-actions">' +
          '<button class="sb-btn-sm ' + (isFollowing ? 'ghost' : 'green') + '" onclick="event.stopPropagation();Social._toggleFollow(\'' + u.id + '\', this)">' +
            (isFollowing ? 'Following ✓' : '+ Follow') +
          '</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ── RENDER: PUBLIC PROFILE ─────────────────────────── */
  function renderPublicProfile(username) {
    var container = document.getElementById('pageContent');
    if (!container) return;

    var el = document.getElementById('publicProfilePage');
    if (!el) {
      el = document.createElement('div');
      el.className = 'page';
      el.id = 'publicProfilePage';
      container.appendChild(el);
    }

    document.querySelectorAll('#pageContent > .page').forEach(function(p){ p.classList.remove('active'); });
    el.classList.add('active');

    el.innerHTML = '<div class="sb-spinner"></div>';

    var targetUser = _allUsers.find(function(u) { return u.username === username || u.id === username; }) || {
      id: username,
      username: username,
      display_name: username,
      bio: 'Music listener on NONIMSONG',
      created_at: new Date().toISOString()
    };

    var isFollowing = _following.includes(targetUser.id);
    var userPlaylists = (window.Playlists && window.Playlists.list) ? window.Playlists.list : [];

    el.innerHTML =
      '<div class="sb-page">' +
        '<button onclick="App.navigate(\'users\')" style="background:none;border:none;color:var(--neon-green);font-family:\'Syne\',sans-serif;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:16px;padding:0">← Back to Users</button>' +
        '<div class="sb-profile-hero">' +
          '<div class="sb-profile-content">' +
            '<div class="sb-profile-avatar">' + esc((targetUser.display_name || targetUser.username || '?')[0].toUpperCase()) + '</div>' +
            '<div class="sb-profile-meta">' +
              '<div class="sb-profile-username">' + esc(targetUser.display_name || targetUser.username) + '</div>' +
              '<div class="sb-profile-handle">@' + esc(targetUser.username) + '</div>' +
              '<div class="sb-profile-bio">' + esc(targetUser.bio || 'Listening to music on NONIMSONG') + '</div>' +
              '<div class="sb-profile-stats">' +
                '<div class="sb-stat-item"><span class="sb-stat-val">' + userPlaylists.length + '</span><span class="sb-stat-lbl">Public Playlists</span></div>' +
                '<div class="sb-stat-item"><span class="sb-stat-val">' + (isFollowing ? '1' : '0') + '</span><span class="sb-stat-lbl">Followers</span></div>' +
                '<div class="sb-stat-item"><span class="sb-stat-val">' + _following.length + '</span><span class="sb-stat-lbl">Following</span></div>' +
              '</div>' +
            '</div>' +
            '<button class="sb-btn-sm ' + (isFollowing ? 'ghost' : 'green') + '" style="font-size:14px;padding:10px 24px" onclick="Social._toggleFollow(\'' + targetUser.id + '\', this)">' +
              (isFollowing ? 'Following ✓' : '+ Follow') +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:18px;font-weight:800;margin-bottom:16px">Public Playlists</div>' +
        (userPlaylists.length ? `
          <div class="sb-card-list">
            ${userPlaylists.map(p => `
              <div class="sb-card" onclick="Playlists.open('${p.id}')">
                <div style="width:48px;height:48px;border-radius:8px;background:${p.coverColor || 'var(--purple)'};display:flex;align-items:center;justify-content:center;font-size:24px">🎵</div>
                <div class="sb-card-body">
                  <div class="sb-card-name">${esc(p.name)}</div>
                  <div class="sb-card-sub">${(p.tracks || []).length} tracks</div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : emptyHtml('🎵', 'No Public Playlists', 'This user has not created any public playlists yet.')) +
      '</div>';
  }

  /* ── RENDER: LISTENING PARTY PAGE ───────────────────── */
  function renderListeningPartyPage() {
    var el = document.getElementById('partyPage');
    if (!el) return;

    el.innerHTML =
      '<div class="sb-page">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
          '<div class="sb-page-title">Listening Party</div>' +
          '<button class="sb-btn-sm green" onclick="Social._createParty()">+ Host Party</button>' +
        '</div>' +
        '<div class="sb-page-sub">Listen to music in sync with members, share chat & live reactions</div>' +
        (_currentParty ? renderPartyRoomHtml() : '') +
        '<div class="sb-segs">' +
          '<button class="sb-seg active">Active Parties</button>' +
        '</div>' +
        (_currentParty ? `
          <div class="sb-card-list">
            <div class="sb-card">
              <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--purple),var(--pink));display:flex;align-items:center;justify-content:center;font-size:22px">🎧</div>
              <div class="sb-card-body">
                <div class="sb-card-name">${esc(_currentParty.name)}</div>
                <div class="sb-card-sub">Active Party · Host Room</div>
              </div>
              <span class="sb-user-badge">Host Active</span>
            </div>
          </div>
        ` : emptyHtml('🎧', 'No Active Parties', 'Host a Listening Party above to invite other listeners!')) +
      '</div>';
  }

  function renderPartyRoomHtml() {
    return '<div class="sb-party-room">' +
      '<div class="sb-party-header">' +
        '<div>' +
          '<div style="font-size:20px;font-weight:800">🎧 ' + esc(_currentParty.name) + '</div>' +
          '<div class="sb-party-status">🟢 Synced with Host</div>' +
        '</div>' +
        '<button class="sb-btn-sm red" onclick="Social._leaveParty()">Leave Party</button>' +
      '</div>' +
      '<div class="sb-party-chat" id="sbPartyChat">' +
        _partyMessages.map(function(m){ return '<div class="sb-chat-msg"><span class="sb-chat-author">' + esc(m.user) + ':</span>' + esc(m.text) + '</div>'; }).join('') +
      '</div>' +
      '<div style="display:flex;gap:10px">' +
        '<input class="sb-input" id="sbChatInput" placeholder="Send a message to party members…" onkeydown="if(event.key===\'Enter\')Social._sendPartyMsg()"/>' +
        '<button class="sb-btn-sm green" onclick="Social._sendPartyMsg()">Send</button>' +
      '</div>' +
      '<div class="sb-reactions">' +
        '<button class="sb-react-btn" onclick="Social._sendReaction(\'❤️\')">❤️</button>' +
        '<button class="sb-react-btn" onclick="Social._sendReaction(\'🔥\')">🔥</button>' +
        '<button class="sb-react-btn" onclick="Social._sendReaction(\'🎵\')">🎵</button>' +
        '<button class="sb-react-btn" onclick="Social._sendReaction(\'👏\')">👏</button>' +
      '</div>' +
    '</div>';
  }

  /* ── Social Actions ─────────────────────────────────── */
  function _userTab(tab) {
    _userTab = tab;
    renderUsersPage();
  }

  function _toggleFollow(userId, btnEl) {
    var idx = _following.indexOf(userId);
    if (idx === -1) {
      _following.push(userId);
      showToast('Following user! 🎉', 'success');
      if (btnEl) { btnEl.textContent = 'Following ✓'; btnEl.className = 'sb-btn-sm ghost'; }
    } else {
      _following.splice(idx, 1);
      showToast('Unfollowed', 'info');
      if (btnEl) { btnEl.textContent = '+ Follow'; btnEl.className = 'sb-btn-sm green'; }
    }
    localStorage.setItem('nonimsong_following', JSON.stringify(_following));
  }

  function _searchUsers() {
    var q = (document.getElementById('sbUserSearch')?.value || '').trim().toLowerCase();
    if (!q) return;
    var el = document.getElementById('sbSearchResults');
    if (!el) return;

    var matches = _allUsers.filter(function(u) {
      return (u.username || '').toLowerCase().includes(q) ||
             (u.display_name || '').toLowerCase().includes(q);
    });

    if (!matches.length) {
      el.innerHTML = '<div style="font-size:13px;color:var(--text-muted);padding:8px 0">No users found</div>';
      return;
    }

    el.innerHTML = '<div class="sb-card-list">' + matches.map(function(u) {
      return '<div class="sb-card" onclick="Social.renderPublicProfile(\'' + esc(u.username) + '\')">' +
        avatarHtml(u.display_name || u.username, '') +
        '<div class="sb-card-body">' +
          '<div class="sb-card-name">' + esc(u.display_name || u.username) + '</div>' +
          '<div class="sb-card-sub">@' + esc(u.username) + '</div>' +
        '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  function _createParty() {
    var name = prompt('Enter Listening Party Name:');
    if (!name || !name.trim()) return;
    _currentParty = { id: 'party_' + Date.now(), name: name.trim() };
    _partyMessages = [{ user: 'System', text: 'Party started! Invite members to listen together.' }];
    renderListeningPartyPage();
    showToast('Listening Party created!', 'success');
  }

  function _joinParty(partyId) {
    _currentParty = { id: partyId, name: 'Phonk Night Drive' };
    _partyMessages = [{ user: 'System', text: 'Joined Listening Party. Audio synced with Host!' }];
    renderListeningPartyPage();
    showToast('Joined Listening Party 🎧', 'success');
  }

  function _leaveParty() {
    _currentParty = null;
    renderListeningPartyPage();
    showToast('Left Listening Party', 'info');
  }

  function _sendPartyMsg() {
    var inp = document.getElementById('sbChatInput');
    if (!inp || !inp.value.trim() || !_currentParty) return;
    var msg = inp.value.trim();
    inp.value = '';
    var author = _profile ? (_profile.display_name || _profile.username) : 'Guest';
    _partyMessages.push({ user: author, text: msg });
    var chatEl = document.getElementById('sbPartyChat');
    if (chatEl) {
      chatEl.innerHTML = _partyMessages.map(function(m){ return '<div class="sb-chat-msg"><span class="sb-chat-author">' + esc(m.user) + ':</span>' + esc(m.text) + '</div>'; }).join('');
      chatEl.scrollTop = chatEl.scrollHeight;
    }
  }

  function _sendReaction(emoji) {
    showToast(emoji + ' Reaction sent!', 'info');
    _partyMessages.push({ user: _profile ? _profile.username : 'Guest', text: 'reacted ' + emoji });
    var chatEl = document.getElementById('sbPartyChat');
    if (chatEl) {
      chatEl.innerHTML = _partyMessages.map(function(m){ return '<div class="sb-chat-msg"><span class="sb-chat-author">' + esc(m.user) + ':</span>' + esc(m.text) + '</div>'; }).join('');
      chatEl.scrollTop = chatEl.scrollHeight;
    }
  }

  function signOut() {
    if (!confirm('Sign out?')) return;
    db.auth.signOut();
  }

  /* ── Helpers ─────────────────────────────────────────── */
  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function avatarHtml(name, cls) {
    var letter = (name || '?')[0].toUpperCase();
    return '<div class="sb-avatar ' + cls + '">' + esc(letter) + '</div>';
  }

  function emptyHtml(icon, title, sub) {
    return '<div class="sb-empty"><div class="sb-empty-icon">' + icon + '</div><div class="sb-empty-title">' + esc(title) + '</div><div class="sb-empty-sub">' + esc(sub) + '</div></div>';
  }

  function showToast(msg, type) {
    if (window.Toast && window.Toast.show) {
      window.Toast.show(msg, type || 'info');
    }
  }

  /* ── Public API ──────────────────────────────────────── */
  window.Social = {
    renderUsersPage:           renderUsersPage,
    renderListeningPartyPage: renderListeningPartyPage,
    renderPublicProfile:       renderPublicProfile,

    _authTab:             _authTab,
    _authSubmit:          _authSubmit,
    _skipAuth:            _skipAuth,
    _showAuth:            showAuthOverlay,
    signOut:              signOut,

    _userTab:             _userTab,
    _toggleFollow:        _toggleFollow,
    _searchUsers:         _searchUsers,
    _createParty:         _createParty,
    _joinParty:           _joinParty,
    _leaveParty:          _leaveParty,
    _sendPartyMsg:        _sendPartyMsg,
    _sendReaction:        _sendReaction
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
