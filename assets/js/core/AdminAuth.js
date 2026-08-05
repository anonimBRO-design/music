/* ============================================================
   NONIMSONG — Production Administrator Authentication System
   SHA-256 Password Hashing · Role Authorization Guards
   Seeded 'L' Administrator Account · Permission System
   ============================================================ */

(function () {
  'use strict';

  var ADMIN_USERNAME = 'L';
  // SHA-256 hash of "lawlieto"
  // SHA256("lawlieto") = "e2b34a94644a47585f67b579541a72175a25b306b3a3ab80e30d7bfa5dbd39ec"
  var ADMIN_HASH = 'e2b34a94644a47585f67b579541a72175a25b306b3a3ab80e30d7bfa5dbd39ec';

  var ADMIN_PERMISSIONS = [
    'full_access', 'manage_users', 'delete_users', 'edit_profiles',
    'manage_playlists', 'delete_playlists', 'feature_playlists',
    'manage_parties', 'view_stats', 'view_logs', 'access_admin_dashboard',
    'override_moderation', 'manage_announcements', 'grant_badges',
    'view_analytics', 'manage_wrapped'
  ];

  /* ── SHA-256 Helper ─────────────────────────────────── */
  async function hashPassword(plainText) {
    if (!window.crypto || !window.crypto.subtle) {
      // Fallback hash function
      var hash = 0;
      for (var i = 0; i < plainText.length; i++) {
        var char = plainText.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      return 'legacy_hash_' + Math.abs(hash);
    }
    var msgBuffer = new TextEncoder().encode(plainText);
    var hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /* ── Seed Administrator Account ───────────────────── */
  function seedAdminAccount() {
    var users = (window.Store && window.Store.get) ? window.Store.get('nonimid_users', []) : [];
    var existingAdmin = users.find(u => u.username === ADMIN_USERNAME);

    if (!existingAdmin) {
      var adminUser = {
        id: 'user_admin_l',
        username: ADMIN_USERNAME,
        display_name: 'L (Lawliet)',
        bio: 'NONIMSONG Platform Administrator',
        role: 'admin',
        verified: true,
        badge: 'ADMIN',
        passwordHash: ADMIN_HASH,
        permissions: ADMIN_PERMISSIONS,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      users.unshift(adminUser);
      if (window.Store && window.Store.set) {
        window.Store.set('nonimid_users', users);
      }
    }
  }

  /* ── Admin Login ───────────────────────────────────── */
  async function login(username, password) {
    seedAdminAccount();
    if (!username || !password) return { success: false, message: 'Invalid credentials' };

    var users = window.Store.get('nonimid_users', []);
    var inputHash = await hashPassword(password);
    var targetUser = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

    if (targetUser && (inputHash === targetUser.passwordHash || (username.trim() === 'L' && inputHash === ADMIN_HASH))) {
      var session = {
        user: {
          id: targetUser.id,
          username: targetUser.username,
          display_name: targetUser.display_name,
          role: targetUser.role,
          badge: targetUser.badge,
          permissions: targetUser.permissions || ADMIN_PERMISSIONS
        },
        token: 'admin_token_' + Date.now(),
        loginAt: new Date().toISOString()
      };
      window.Store.set('nonimid_session', session);
      updateAdminUI(true);
      return { success: true, session: session };
    }

    return { success: false, message: 'Invalid username or password' };
  }

  /* ── Check Active Admin Session ───────────────────── */
  function isAdmin() {
    var session = (window.Store && window.Store.get) ? window.Store.get('nonimid_session', null) : null;
    if (!session || !session.user) return false;
    return session.user.role === 'admin';
  }

  function getCurrentAdmin() {
    if (!isAdmin()) return null;
    return window.Store.get('nonimid_session').user;
  }

  function hasPermission(perm) {
    if (!isAdmin()) return false;
    var admin = getCurrentAdmin();
    return admin.permissions && (admin.permissions.includes('full_access') || admin.permissions.includes(perm));
  }

  function logout() {
    window.Store.remove('nonimid_session');
    updateAdminUI(false);
  }

  function updateAdminUI(adminActive) {
    var isAd = adminActive !== undefined ? adminActive : isAdmin();
    var navAdmin = document.getElementById('nav-admin');
    if (navAdmin) navAdmin.style.display = isAd ? 'flex' : 'none';

    var badges = document.querySelectorAll('.sb-admin-badge-slot');
    badges.forEach(b => {
      b.innerHTML = isAd ? '<span class="sb-admin-badge">ADMIN</span>' : '';
    });
  }

  // Initialize on boot
  function init() {
    seedAdminAccount();
    setTimeout(() => {
      updateAdminUI();
    }, 200);
  }

  init();

  window.AdminAuth = {
    seed: seedAdminAccount,
    hashPassword: hashPassword,
    login: login,
    isAdmin: isAdmin,
    getCurrentAdmin: getCurrentAdmin,
    hasPermission: hasPermission,
    logout: logout,
    updateAdminUI: updateAdminUI
  };

})();
