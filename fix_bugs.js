const fs = require('fs');
const path = require('path');

const socialPath = path.join(__dirname, 'social.js');
let social = fs.readFileSync(socialPath, 'utf8');

// 1. Rename _friendTab var to _currentFriendTab
social = social.replace(/var _friendTab = 'friends';/g, "var _currentFriendTab = 'friends';");
social = social.replace(/if \(_friendTab === /g, "if (_currentFriendTab === ");

// 2. Fix XSS Vulnerability in esc()
social = social.replace(
  /replace\(\/"\/g,'&quot;'\);/g,
  "replace(/\"/g,'&quot;').replace(/'/g,'&#39;');"
);

// 3. Fix _session null guards
social = social.replace(
  /if \(!q\) return;/g,
  "if (!q) return;\n    if (!_session) return;"
);
social = social.replace(
  /var uid = _session\.user\.id;/g,
  "if (!_session) return;\n    var uid = _session.user.id;"
);
social = social.replace(
  /db\.from\('friend_requests'\)\.update/g,
  "if (!_session) return;\n    db.from('friend_requests').update"
);

// 4. Memory Leaks: Clear intervals
social = social.replace(
  /function onLoggedOut\(\) \{/g,
  "function onLoggedOut() {\n  if (window._sbPresenceInterval) clearInterval(window._sbPresenceInterval);\n  _currentPlaylistId = null;\n  _currentTracks = [];\n  _currentCollabs = [];"
);

social = social.replace(
  /var interval = setInterval\(function \(\) \{/g,
  "var attempts = 0;\n    var interval = setInterval(function () {\n      if (++attempts > 100) return clearInterval(interval);"
);

social = social.replace(
  /db\.auth\.getSession\(\)\.then\(function \(r\) \{([\s\S]*?)\}\);/g,
  "db.auth.getSession().then(function (r) {$1}).catch(console.error);"
);

social = social.replace(
  /\.then\(function \(\) \{ return loadProfile\(\); \}\);/g,
  ".then(function () { return loadProfile(); }).catch(console.error);"
);

social = social.replace(
  /loadFriendsData\(\)\.then\(function \(\) \{ renderFriendsPage\(\); \}\);/g,
  "loadFriendsData().then(function () { renderFriendsPage(); }).catch(console.error);"
);

social = social.replace(
  /loadCollabData\(\)\.then\(function \(\) \{ renderCollabPage\(\); \}\);/g,
  "loadCollabData().then(function () { renderCollabPage(); }).catch(console.error);"
);

// Add null check for Store.set
social = social.replace(
  /window\.Store\.set\('nonimid_profile', /g,
  "if (window.Store && window.Store.set) window.Store.set('nonimid_profile', "
);

// Fix precedence
social = social.replace(
  /var title  = \(document\.getElementById\('sbTrackTitle'\)  && document\.getElementById\('sbTrackTitle'\)\.value  \|\| ''\)\.trim\(\);/g,
  "var el = document.getElementById('sbTrackTitle');\n    var title = (el ? el.value || '' : '').trim();"
);

fs.writeFileSync(socialPath, social);


const premiumPath = path.join(__dirname, 'premium.js');
let premium = fs.readFileSync(premiumPath, 'utf8');

// 1. Max retries for tryHook
premium = premium.replace(
  /function tryHook\(\) \{/g,
  "var _tryHookAttempts = 0;\nfunction tryHook() {\n  if (++_tryHookAttempts > 50) return;"
);
premium = premium.replace(
  /if \(\!window\.Player\?\.play\) \{ setTimeout\(tryHook, 100\); return; \}/g,
  "if (!window.Player || !window.Player.play) { setTimeout(tryHook, 100); return; }"
);

// 2. Memory leak cancelAnimationFrame
premium = premium.replace(
  /if \(state === 2 \|\| state === 0\) isActive = false;/g,
  "if (state === 2 || state === 0) { isActive = false; if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }"
);

// 3. Oscillator leak
premium = premium.replace(
  /const osc = audioCtx\.createOscillator\(\);\n\s*osc\.frequency\.value = 0;\n\s*osc\.connect\(analyser\);\n\s*osc\.start\(\);/g,
  "" // Remove oscillator completely as it was a hack and causing leak
);

// 4. Keyboard shortcuts with altKey
premium = premium.replace(
  /if \(e\.key === 'w' \|\| e\.key === 'W'\) Wrapped\.open\(\);/g,
  "if (e.altKey && (e.key === 'w' || e.key === 'W')) Wrapped.open();"
);
premium = premium.replace(
  /if \(e\.key === 'a' \|\| e\.key === 'A'\) Achievements\.open\(\);/g,
  "if (e.altKey && (e.key === 'a' || e.key === 'A')) Achievements.open();"
);
premium = premium.replace(
  /if \(e\.key === 'd' \|\| e\.key === 'D'\) AIDj\.showPanel\(\);/g,
  "if (e.altKey && (e.key === 'd' || e.key === 'D')) AIDj.showPanel();"
);

// 5. Unhandled rejections
premium = premium.replace(
  /navigator\.clipboard\?\.writeText\(text\);/g,
  "navigator.clipboard?.writeText(text).catch(console.error);"
);

premium = premium.replace(
  /document\.head\.appendChild\(script\);/g,
  "script.onerror = function() { console.error('Failed to load html2canvas'); };\n      document.head.appendChild(script);"
);

premium = premium.replace(
  /const c = await window\.html2canvas\(card, \{ backgroundColor: '#0a0a14', scale: 2 \}\);/g,
  "let c;\n      try { c = await window.html2canvas(card, { backgroundColor: '#0a0a14', scale: 2 }); } catch(err) { console.error(err); return; }"
);

// 6. Queue.clear() destroys user tracks
premium = premium.replace(
  /window\.Queue\?\.clear\(\);/g,
  "// window.Queue?.clear(); // Prevent destroying user queue"
);

// 7. Remove empty element
premium = premium.replace(
  /document\.getElementById\('installBanner'\)\.remove\(\)/g,
  "var b = document.getElementById('installBanner'); if(b) b.remove();"
);
premium = premium.replace(
  /setTimeout\(\(\) => banner\.remove\(\), 8000\);/g,
  "setTimeout(() => { if(banner.parentNode) banner.remove(); }, 8000);"
);

// 8. Idempotency for hooks
premium = premium.replace(
  /const origPlay = window\.Player\.play\.bind\(window\.Player\);/g,
  "if (window._isPremiumHooked) return;\n    window._isPremiumHooked = true;\n    const origPlay = window.Player.play.bind(window.Player);"
);
premium = premium.replace(
  /const orig = window\.Player\?\.addToHistory\?\.bind\(window\.Player\);/g,
  "if (window._isAchievementsHooked) return;\n      window._isAchievementsHooked = true;\n      const orig = window.Player?.addToHistory?.bind(window.Player);"
);

// 9. Fix custom property transition
premium = premium.replace(
  /body \{ transition: --dyn-accent 1s ease; \}/g,
  "@property --dyn-accent { syntax: '<color>'; inherits: true; initial-value: transparent; }\nbody { transition: --dyn-accent 1s ease; }"
);

fs.writeFileSync(premiumPath, premium);

console.log("Fixes applied.");
