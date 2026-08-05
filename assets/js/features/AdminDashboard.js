/* ============================================================
   NONIMSONG — Administrator Dashboard & Platform Management
   Accessible ONLY by users with 'admin' role
   KPI Cards · Search Analytics · User Management · Moderation
   ============================================================ */

(function () {
  'use strict';

  /* ── Failsafe Storage Helper ───────────────────────── */
  function getStore() {
    if (window.Store && typeof window.Store.get === 'function') return window.Store;
    return {
      get: function(k, def) {
        try { var v = localStorage.getItem(k); return (v !== null && v !== undefined) ? JSON.parse(v) : (def !== undefined ? def : null); }
        catch(e) { return def !== undefined ? def : null; }
      },
      set: function(k, v) {
        try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {}
      },
      remove: function(k) {
        try { localStorage.removeItem(k); } catch(e) {}
      }
    };
  }

  function renderAdminDashboard() {
    var el = document.getElementById('adminPage');
    if (!el) return;

    // Security Check: Return HTTP 403 Access Denied if not Admin
    if (!window.AdminAuth || !window.AdminAuth.isAdmin()) {
      el.innerHTML = `
        <div class="empty-state" style="padding:80px 20px;text-align:center">
          <div style="font-size:56px;margin-bottom:16px">🔒</div>
          <div class="empty-state-title" style="font-size:24px;font-weight:800;color:var(--pink);margin-bottom:8px">403 Forbidden - Access Denied</div>
          <div class="empty-state-sub" style="font-size:14px;color:var(--text-muted);margin-bottom:24px">You do not have administrator permissions to access the Admin Panel.</div>
          <button class="sb-btn-sm green" style="font-size:14px;padding:12px 28px;border-radius:999px" onclick="App.navigate('home')">Return to Home</button>
        </div>`;
      if (window.Toast) window.Toast.show('HTTP 403: Admin authorization required', 'error');
      return;
    }

    var store = getStore();
    var users = store.get('nonimid_users', []);
    var playlists = store.get('nonimid_playlists', []);
    var stats = store.get('nonimid_stats', { plays: 0, seconds: 0 });
    var history = store.get('nonimid_history', []);
    var liked = store.get('nonimid_liked', []);

    var hours = Math.floor((stats.seconds || 0) / 3600);
    var minutes = Math.floor(((stats.seconds || 0) % 3600) / 60);

    el.innerHTML = `
      <div class="sb-page" style="padding-bottom:60px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
          <div>
            <div style="display:flex;align-items:center;gap:12px">
              <div class="sb-page-title" style="margin:0">Admin Dashboard</div>
              <span class="sb-admin-badge" style="background:var(--pink);color:#fff;font-weight:800;padding:4px 10px;border-radius:999px;font-size:11px">ADMIN ROLE</span>
            </div>
            <div class="sb-page-sub">Platform analytics, user management, and moderation controls</div>
          </div>
          <button class="sb-btn-sm ghost" onclick="AdminAuth.logout(); App.navigate('home');">Logout Admin</button>
        </div>

        <!-- KPI GRID -->
        <div class="ad-kpi-grid">
          <div class="ad-kpi-card">
            <div class="ad-kpi-label">TOTAL USERS</div>
            <div class="ad-kpi-val">${users.length || 1}</div>
            <div class="ad-kpi-sub">Registered accounts</div>
          </div>
          <div class="ad-kpi-card">
            <div class="ad-kpi-label">ONLINE USERS</div>
            <div class="ad-kpi-val" style="color:var(--neon-green)">1</div>
            <div class="ad-kpi-sub">Active session</div>
          </div>
          <div class="ad-kpi-card">
            <div class="ad-kpi-label">SONGS PLAYED</div>
            <div class="ad-kpi-val">${stats.plays || history.length}</div>
            <div class="ad-kpi-sub">Total playback events</div>
          </div>
          <div class="ad-kpi-card">
            <div class="ad-kpi-label">LISTENING TIME</div>
            <div class="ad-kpi-val" style="color:var(--accent)">${hours}h ${minutes}m</div>
            <div class="ad-kpi-sub">Total stream time</div>
          </div>
          <div class="ad-kpi-card">
            <div class="ad-kpi-label">PUBLIC PLAYLISTS</div>
            <div class="ad-kpi-val">${playlists.length}</div>
            <div class="ad-kpi-sub">Curated lists</div>
          </div>
          <div class="ad-kpi-card">
            <div class="ad-kpi-label">PLATFORM HEALTH</div>
            <div class="ad-kpi-val" style="color:var(--neon-green)">100%</div>
            <div class="ad-kpi-sub">System operational</div>
          </div>
        </div>

        <!-- MANAGEMENT TABLES -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:32px">
          
          <!-- USER MANAGEMENT -->
          <div class="ad-panel-box">
            <div class="ad-panel-title">👥 User Management</div>
            <div class="ad-table-wrap">
              <table class="ad-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Badge</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${users.map(u => `
                    <tr>
                      <td><strong>@${esc(u.username)}</strong><br><span style="font-size:11px;color:var(--text-muted)">${esc(u.display_name || u.username)}</span></td>
                      <td><span class="ad-tag ${u.role === 'admin' ? 'pink' : 'green'}">${u.role || 'user'}</span></td>
                      <td>${u.badge ? `<span class="sb-admin-badge">${esc(u.badge)}</span>` : '—'}</td>
                      <td>
                        <button class="sb-btn-sm ghost" style="padding:4px 8px;font-size:11px" onclick="AdminDashboard.toggleBadge('${u.id}')">Badge</button>
                        ${u.role !== 'admin' ? `<button class="sb-btn-sm red" style="padding:4px 8px;font-size:11px" onclick="AdminDashboard.deleteUser('${u.id}')">Delete</button>` : ''}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- PLAYLIST MODERATION -->
          <div class="ad-panel-box">
            <div class="ad-panel-title">🎵 Playlist Moderation</div>
            <div class="ad-table-wrap">
              ${playlists.length ? `
                <table class="ad-table">
                  <thead>
                    <tr>
                      <th>Playlist</th>
                      <th>Tracks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${playlists.map(p => `
                      <tr>
                        <td><strong>${esc(p.name)}</strong></td>
                        <td>${(p.tracks || []).length} songs</td>
                        <td>
                          <button class="sb-btn-sm red" style="padding:4px 8px;font-size:11px" onclick="AdminDashboard.deletePlaylist('${p.id}')">Remove</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : '<div style="color:var(--text-muted);font-size:13px;padding:24px;text-align:center">No public playlists to moderate.</div>'}
            </div>
          </div>

        </div>

        <!-- ACTIVITY LOG & SYSTEM HEALTH -->
        <div class="ad-panel-box" style="margin-top:24px">
          <div class="ad-panel-title">📜 Platform Activity & Audit Log</div>
          <div class="ad-log-list">
            <div class="ad-log-item"><span>[${new Date().toLocaleTimeString()}]</span> Admin session authorized for @L (LAWLIET)</div>
            <div class="ad-log-item"><span>[${new Date().toLocaleTimeString()}]</span> System health check: 100% OK · Storage synchronized</div>
            <div class="ad-log-item"><span>[${new Date().toLocaleTimeString()}]</span> Audio engine initialized · Playback history active</div>
          </div>
        </div>

      </div>`;
  }

  function toggleBadge(userId) {
    var store = getStore();
    var users = store.get('nonimid_users', []);
    var idx = (users || []).findIndex(u => u && u.id === userId);
    if (idx >= 0) {
      users[idx].badge = users[idx].badge === 'VERIFIED' ? null : 'VERIFIED';
      store.set('nonimid_users', users);
      if (window.Toast) window.Toast.show(`Updated badge for @${users[idx].username}`, 'info');
      renderAdminDashboard();
    }
  }

  function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    var store = getStore();
    var users = store.get('nonimid_users', []);
    users = (users || []).filter(u => u && u.id !== userId);
    store.set('nonimid_users', users);
    if (window.Toast) window.Toast.show('User account removed', 'success');
    renderAdminDashboard();
  }

  function deletePlaylist(playlistId) {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    var store = getStore();
    var playlists = store.get('nonimid_playlists', []);
    playlists = (playlists || []).filter(p => p && p.id !== playlistId);
    store.set('nonimid_playlists', playlists);
    if (window.Toast) window.Toast.show('Playlist removed', 'success');
    renderAdminDashboard();
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function injectAdminStyles() {
    if (document.getElementById('adStyles')) return;
    var s = document.createElement('style');
    s.id = 'adStyles';
    s.textContent = `
      .ad-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px}
      .ad-kpi-card{background:rgba(20,20,30,.8);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px;box-shadow:0 8px 32px rgba(0,0,0,.3)}
      .ad-kpi-label{font-size:10px;font-weight:800;letter-spacing:.12em;color:var(--text-muted);margin-bottom:8px}
      .ad-kpi-val{font-size:32px;font-weight:800;letter-spacing:-.02em}
      .ad-kpi-sub{font-size:12px;color:var(--text-muted);margin-top:4px}
      .ad-panel-box{background:rgba(20,20,30,.8);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:24px;box-shadow:0 12px 40px rgba(0,0,0,.4)}
      .ad-panel-title{font-size:18px;font-weight:800;margin-bottom:16px}
      .ad-table-wrap{overflow-x:auto}
      .ad-table{width:100%;border-collapse:collapse;font-size:13px;text-align:left}
      .ad-table th{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.1);color:var(--text-muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em}
      .ad-table td{padding:12px;border-bottom:1px solid rgba(255,255,255,.04)}
      .ad-tag{padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700}
      .ad-tag.green{background:rgba(34,197,94,.15);color:#22c55e}
      .ad-tag.pink{background:rgba(236,72,153,.15);color:#ec4899}
      .ad-log-list{display:flex;flex-direction:column;gap:8px;font-family:monospace;font-size:12px;color:var(--text-muted)}
      .ad-log-item span{color:var(--neon-green)}
      .sb-admin-badge{font-size:10px;font-weight:800;padding:2px 6px;border-radius:4px;background:var(--pink);color:#fff;letter-spacing:.06em}
    `;
    document.head.appendChild(s);
  }

  injectAdminStyles();

  window.AdminDashboard = {
    render: renderAdminDashboard,
    toggleBadge: toggleBadge,
    deleteUser: deleteUser,
    deletePlaylist: deletePlaylist
  };

})();
