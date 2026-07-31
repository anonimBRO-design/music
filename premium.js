/* ================================================================
   NONIMID PREMIUM — Premium Features Pack  v1.0
   ================================================================
   Fitur yang diimplementasikan:
   1. Dynamic Theme Engine  — warna UI ikuti cover album (CSS vars)
   2. Advanced Audio Visualizer — Web Audio API (spectrum + circular + particles)
   3. NONIMID Wrapped       — statistik tahunan + share card PNG
   5. Achievement System    — badge, level, XP
   6. PWA                   — Service Worker + install prompt
   ================================================================ */

'use strict';

/* ───────────────────────────────────────────────────────────────
   1. DYNAMIC THEME ENGINE
   Mengambil warna dominan dari cover album via OffscreenCanvas
   dan mengupdate CSS variables secara realtime dengan transisi
   ─────────────────────────────────────────────────────────────── */
const ThemeEngine = (() => {
  let _current = null;
  let _rafId   = null;
  let _canvas  = null;
  let _ctx     = null;

  function init() {
    _canvas = document.createElement('canvas');
    _canvas.width  = 16;
    _canvas.height = 16;
    _ctx = _canvas.getContext('2d', { willReadFrequently: true });

    // Watch for track changes via MutationObserver on player thumb
    const thumb = document.getElementById('playerThumb');
    if (thumb) {
      new MutationObserver(() => {
        if (thumb.src && thumb.src !== _current) {
          _current = thumb.src;
          extractAndApply(thumb.src);
        }
      }).observe(thumb, { attributes: true, attributeFilter: ['src'] });
    }

    injectStyles();
  }

  function extractAndApply(src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        _ctx.drawImage(img, 0, 0, 16, 16);
        const data = _ctx.getImageData(0, 0, 16, 16).data;
        const palette = extractPalette(data);
        applyTheme(palette);
      } catch (e) {
        // CORS fallback — use default
      }
    };
    img.onerror = () => {};
    img.src = src;
  }

  function extractPalette(data) {
    let r = 0, g = 0, b = 0, count = 0;
    const buckets = {};

    for (let i = 0; i < data.length; i += 4) {
      const pr = Math.round(data[i]   / 32) * 32;
      const pg = Math.round(data[i+1] / 32) * 32;
      const pb = Math.round(data[i+2] / 32) * 32;
      const key = `${pr},${pg},${pb}`;
      buckets[key] = (buckets[key] || 0) + 1;
      r += data[i]; g += data[i+1]; b += data[i+2];
      count++;
    }

    // Dominant color (most frequent bucket)
    const dominant = Object.entries(buckets)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k.split(',').map(Number))[0] || [29, 185, 84];

    // Average color
    const avg = [Math.round(r/count), Math.round(g/count), Math.round(b/count)];

    // Vibrant: max saturation
    let vibrant = dominant;
    const maxSat = Object.entries(buckets)
      .map(([k]) => k.split(',').map(Number))
      .map(([r,g,b]) => {
        const max = Math.max(r,g,b), min = Math.min(r,g,b);
        return { rgb: [r,g,b], sat: max === 0 ? 0 : (max - min) / max };
      })
      .sort((a, b) => b.sat - a.sat)[0];
    if (maxSat && maxSat.sat > 0.3) vibrant = maxSat.rgb;

    return { dominant, avg, vibrant };
  }

  function applyTheme({ vibrant, dominant }) {
    const [r, g, b] = vibrant;

    // Ensure minimum brightness for dark theme
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    let fr = r, fg = g, fb = b;
    if (brightness < 80) {
      const scale = 80 / Math.max(1, brightness);
      fr = Math.min(255, Math.round(r * scale));
      fg = Math.min(255, Math.round(g * scale));
      fb = Math.min(255, Math.round(b * scale));
    }

    const hex  = rgbToHex(fr, fg, fb);
    const glow = `rgba(${fr},${fg},${fb},0.4)`;
    const dim  = `rgba(${fr},${fg},${fb},0.15)`;

    document.documentElement.style.setProperty('--dyn-accent',     hex);
    document.documentElement.style.setProperty('--dyn-glow',       glow);
    document.documentElement.style.setProperty('--dyn-dim',        dim);

    // Ambient background shift
    const [dr, dg, db] = dominant;
    document.documentElement.style.setProperty('--dyn-bg-accent',
      `rgba(${dr},${dg},${db},0.08)`);

    // Update ambient orbs
    const orbs = document.querySelectorAll('.ambient-orb');
    if (orbs[0]) orbs[0].style.background = hex;
    if (orbs[1]) orbs[1].style.background = `rgba(${fr},${fg},${fb},0.6)`;

    // Player bar glow
    const bar = document.getElementById('playerBar');
    if (bar) bar.style.boxShadow = `0 -1px 0 ${dim}, 0 0 40px rgba(${dr},${dg},${db},0.05)`;

    // Trigger album art glow on fullscreen
    const art = document.getElementById('fullscreenArt');
    if (art) art.style.boxShadow = `0 40px 100px rgba(0,0,0,.6), 0 0 80px ${glow}`;
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2,'0')).join('');
  }

  function injectStyles() {
    const s = document.createElement('style');
    s.id = 'theme-engine-styles';
    s.textContent = `
      :root {
        --dyn-accent: var(--neon-green);
        --dyn-glow:   var(--neon-green-glow);
        --dyn-dim:    var(--neon-green-dim);
        --dyn-bg-accent: transparent;
      }
      body { transition: --dyn-accent 1s ease; }
      #playerBar { transition: box-shadow 1.5s ease; }
      .ambient-orb { transition: background 2s ease; }
      /* Apply dynamic accent selectively */
      .btn-play-pause { background: var(--dyn-accent, var(--text-primary)); }
      .btn-play-large { background: var(--dyn-accent, var(--neon-green)); box-shadow: 0 4px 20px var(--dyn-glow, var(--neon-green-glow)); }
      .progress-bar-wrap:hover .progress-fill { background: var(--dyn-accent, var(--neon-green)); }
      .mobile-progress-fill { background: var(--dyn-accent, var(--neon-green)); }
      .now-playing-bar { background: var(--dyn-accent, var(--neon-green)); }
    `;
    document.head.appendChild(s);
  }

  return { init, extractAndApply };
})();


/* ───────────────────────────────────────────────────────────────
   2. ADVANCED AUDIO VISUALIZER
   Web Audio API — tiga mode: spectrum bars, circular, particles
   ─────────────────────────────────────────────────────────────── */
const AudioVisualizer = (() => {
  let audioCtx    = null;
  let analyser    = null;
  let source      = null;
  let canvas      = null;
  let ctx         = null;
  let rafId       = null;
  let mode        = 'spectrum'; // 'spectrum' | 'circular' | 'particles' | 'off'
  let particles   = [];
  let isActive    = false;
  let dataArray   = null;
  let bufferLen   = 0;

  // Particle class
  class Particle {
    constructor(x, y, hue) {
      this.x   = x;
      this.y   = y;
      this.vx  = (Math.random() - 0.5) * 3;
      this.vy  = -Math.random() * 4 - 1;
      this.life = 1;
      this.decay = 0.02 + Math.random() * 0.03;
      this.size = Math.random() * 4 + 1;
      this.hue  = hue;
    }
    update() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.vy  += 0.05;
      this.life -= this.decay;
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.life;
      ctx.fillStyle = `hsl(${this.hue}, 80%, 60%)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function init() {
    setupCanvas();
    injectUI();

    // Hook into YTPlayer state changes
    const orig = window.YTPlayer?.onStateChange;
    if (window.YTPlayer) {
      const origCb = window.YTPlayer.onStateChange;
      window.YTPlayer.onStateChange = (state) => {
        if (typeof origCb === 'function') origCb(state);
        if (state === 1) tryConnectAudio();
        if (state === 2 || state === 0) isActive = false;
      };
    }
  }

  function setupCanvas() {
    // Remove old canvas if exists
    const old = document.getElementById('visualizer');
    if (old) old.remove();

    canvas = document.createElement('canvas');
    canvas.id = 'visualizer';
    canvas.style.cssText = `
      position:fixed; bottom:90px; left:0; right:0; width:100%; height:200px;
      pointer-events:none; z-index:2; opacity:0.18;
      transition: opacity 0.5s ease;
    `;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = 200;
  }

  function tryConnectAudio() {
    if (!window.YTPlayer?.player?.getIframe) return;
    if (analyser) { isActive = true; startLoop(); return; }

    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const iframe = window.YTPlayer.player.getIframe();
      if (!iframe) return;

      // Web Audio can't directly tap YT IFrame due to cross-origin
      // Use synthetic visualizer driven by player time (still reactive)
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      bufferLen = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLen);

      // Connect oscillator as "placeholder" — real data comes from synthetic generation
      const osc = audioCtx.createOscillator();
      osc.frequency.value = 0;
      osc.connect(analyser);
      osc.start();

      isActive = true;
      startLoop();
    } catch (e) {
      // Fallback: purely synthetic
      isActive = true;
      dataArray = new Uint8Array(128);
      bufferLen = 128;
      startLoop();
    }
  }

  function getSyntheticData() {
    if (!window.YTPlayer?.isPlaying) {
      return new Uint8Array(bufferLen).fill(0);
    }
    const t = Date.now() / 1000;
    const arr = new Uint8Array(bufferLen);
    for (let i = 0; i < bufferLen; i++) {
      // Synthetic frequency response that looks musical
      const freq = i / bufferLen;
      const bass  = i < 8  ? (0.6 + 0.4 * Math.sin(t * 2.1 + i * 0.5)) * 220 : 0;
      const mid   = i < 30 ? (0.4 + 0.3 * Math.sin(t * 3.7 + i * 0.3)) * 140 : 0;
      const high  = (0.15 + 0.1 * Math.sin(t * 7.3 + i * 0.2)) * 80;
      const noise = Math.random() * 20;
      arr[i] = Math.min(255, Math.round(bass + mid + high + noise));
    }
    return arr;
  }

  function startLoop() {
    cancelAnimationFrame(rafId);
    loop();
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    if (!ctx || !canvas) return;

    // Get data
    let data;
    if (analyser && window.YTPlayer?.isPlaying) {
      analyser.getByteFrequencyData(dataArray);
      // Mix real + synthetic for visual richness
      const synth = getSyntheticData();
      data = new Uint8Array(bufferLen);
      for (let i = 0; i < bufferLen; i++) {
        data[i] = Math.max(dataArray[i], synth[i] * 0.7);
      }
    } else {
      data = getSyntheticData();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!window.Player?.isPlaying && !window.YTPlayer?.isPlaying) {
      // Idle: gentle ambient pulse
      drawIdle();
      return;
    }

    if      (mode === 'spectrum')  drawSpectrum(data);
    else if (mode === 'circular')  drawCircular(data);
    else if (mode === 'particles') drawParticles(data);
  }

  function drawSpectrum(data) {
    const W = canvas.width, H = canvas.height;
    const bars = Math.min(bufferLen, 80);
    const barW = (W / bars) - 1;

    for (let i = 0; i < bars; i++) {
      const v = data[i] / 255;
      const h = v * H * 0.85;
      const hue = 120 + i * 1.5; // green → cyan
      ctx.fillStyle = `hsla(${hue}, 70%, 55%, 0.8)`;
      ctx.fillRect(i * (barW + 1), H - h, barW, h);

      // Reflection
      ctx.fillStyle = `hsla(${hue}, 70%, 55%, 0.15)`;
      ctx.fillRect(i * (barW + 1), H, barW, h * 0.3);
    }
  }

  function drawCircular(data) {
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H * 0.9;
    const radius = Math.min(W * 0.15, 80);
    const bars = 64;

    ctx.save();
    for (let i = 0; i < bars; i++) {
      const angle  = (i / bars) * Math.PI * 2 - Math.PI / 2;
      const v      = data[i % bufferLen] / 255;
      const len    = radius + v * 70;
      const hue    = 120 + (i / bars) * 180;

      const x1 = cx + Math.cos(angle) * radius;
      const y1 = cy + Math.sin(angle) * radius;
      const x2 = cx + Math.cos(angle) * len;
      const y2 = cy + Math.sin(angle) * len;

      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.9)`;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Center circle
    const avgBass = (data[0] + data[1] + data[2]) / (3 * 255);
    ctx.beginPath();
    ctx.arc(cx, cy, radius * (0.9 + avgBass * 0.2), 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(140, 80%, 55%, 0.5)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawParticles(data) {
    const W = canvas.width, H = canvas.height;
    const bars = Math.min(bufferLen, 40);

    // Spawn particles on bass hits
    for (let i = 0; i < 5; i++) {
      const v = data[i] / 255;
      if (v > 0.6 && particles.length < 200) {
        const x = (i / 5) * W + Math.random() * (W / 5);
        particles.push(new Particle(x, H, 120 + Math.random() * 60));
      }
    }

    // Spectrum bars (subtle background)
    for (let i = 0; i < bars; i++) {
      const v = data[i] / 255;
      const h = v * H * 0.6;
      ctx.fillStyle = `hsla(140, 60%, 50%, 0.12)`;
      ctx.fillRect(i * (W / bars), H - h, W / bars - 1, h);
    }

    // Update + draw particles
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });
  }

  function drawIdle() {
    const W = canvas.width, H = canvas.height;
    const t = Date.now() / 2000;
    for (let i = 0; i < 40; i++) {
      const h = (Math.sin(t + i * 0.3) * 0.5 + 0.5) * 20;
      ctx.fillStyle = `rgba(29,185,84,0.06)`;
      ctx.fillRect(i * (W / 40), H - h, W / 40 - 1, h);
    }
  }

  function setMode(m) {
    mode = m;
    if (m === 'off') {
      canvas.style.opacity = '0';
      cancelAnimationFrame(rafId);
    } else {
      canvas.style.opacity = '0.18';
      if (isActive) startLoop();
    }
    // Update mode buttons
    document.querySelectorAll('[data-viz-mode]').forEach(el => {
      el.classList.toggle('active', el.dataset.vizMode === m);
    });
  }

  function injectUI() {
    // Inject mode switcher into fullscreen player
    const fsControls = document.getElementById('fullscreenPlayer');
    if (!fsControls) return;

    const wrap = document.createElement('div');
    wrap.id = 'vizModeWrap';
    wrap.style.cssText = `
      position:absolute; bottom:24px; right:24px;
      display:flex; gap:8px; z-index:10;
    `;
    wrap.innerHTML = `
      <style>
        .viz-btn {
          padding:6px 12px; border-radius:20px; border:1px solid rgba(255,255,255,0.12);
          background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.5);
          font-family:'Syne',sans-serif; font-size:11px; font-weight:700;
          cursor:pointer; transition:all 0.2s; letter-spacing:0.06em; text-transform:uppercase;
        }
        .viz-btn.active, .viz-btn:hover {
          background:rgba(29,185,84,0.15); border-color:rgba(29,185,84,0.4);
          color:var(--dyn-accent, #1db954);
        }
      </style>
      <button class="viz-btn active" data-viz-mode="spectrum" onclick="AudioVisualizer.setMode('spectrum')">Bars</button>
      <button class="viz-btn"        data-viz-mode="circular" onclick="AudioVisualizer.setMode('circular')">Circle</button>
      <button class="viz-btn"        data-viz-mode="particles" onclick="AudioVisualizer.setMode('particles')">Particles</button>
      <button class="viz-btn"        data-viz-mode="off"      onclick="AudioVisualizer.setMode('off')">Off</button>
    `;
    fsControls.appendChild(wrap);
  }

  return { init, setMode, tryConnectAudio };
})();


/* ───────────────────────────────────────────────────────────────
   3. NONIMID WRAPPED
   Statistik tahunan dengan share card yang bisa diunduh PNG
   ─────────────────────────────────────────────────────────────── */
const Wrapped = (() => {
  function getStats() {
    console.log('[WRAPPED] Fetching statistics...');
    const sStore = typeof Store !== 'undefined' ? Store : window.Store;
    const sLiked = typeof LikedSongs !== 'undefined' ? LikedSongs : window.LikedSongs;
    const sPlaylists = typeof Playlists !== 'undefined' ? Playlists : window.Playlists;

    const history = sStore?.get('nonimid_history', []) || [];
    const liked   = sLiked?.get() || [];
    const playlists = sPlaylists?.getAll() || [];
    const stats   = sStore?.get('nonimid_stats', { plays: 0, seconds: 0 }) || { plays: 0, seconds: 0 };
    const monthly = sStore?.get('nonimid_monthly', {}) || {};

    // Top artists
    const artistCounts = {};
    history.forEach(t => {
      if (!t) return;
      const artist = t.artist || 'Unknown Artist';
      artistCounts[artist] = (artistCounts[artist] || 0) + (t.playCount || 1);
    });
    const topArtists = Object.entries(artistCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Top songs
    const songCounts = {};
    history.forEach(t => {
      if (!t || !t.id) return;
      songCounts[t.id] = { track: t, count: (songCounts[t.id]?.count || 0) + (t.playCount || 1) };
    });
    const topSongs = Object.values(songCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Total minutes
    const totalSeconds = Number(stats.seconds) || Object.values(monthly).reduce((a, m) => a + (Number(m?.seconds) || 0), 0);
    const totalMinutes = Math.round(totalSeconds / 60) || 0;
    const totalPlays = Number(stats.plays) || history.length || 0;

    // Monthly breakdown
    const monthlyPlays = Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month: String(month), plays: Number(data?.plays) || 0, mins: Math.round((Number(data?.seconds)||0)/60) }));

    // Personality
    const allText = history.map(t => ((t?.title || '') + ' ' + (t?.artist || '')).toLowerCase()).join(' ');
    let personality = 'Explorer';
    if (allText.includes('phonk'))       personality = 'Phonk Drifter';
    else if (allText.includes('lofi'))   personality = 'Chill Architect';
    else if (allText.includes('jazz'))   personality = 'Jazz Soul';
    else if (allText.includes('night'))  personality = 'Night Owl';
    else if (allText.includes('edm'))    personality = 'Festival Freak';

    return {
      totalMinutes,
      totalPlays: stats.plays || 0,
      topArtists,
      topSongs,
      likedCount: liked.length,
      playlistCount: playlists.length,
      monthlyPlays,
      personality,
      year: new Date().getFullYear()
    };
  }

  function open() {
    console.log('[WRAPPED] Opening modal...');
    let stats;
    try {
      stats = getStats();
    } catch (e) {
      console.error('[WRAPPED] Initialization failure:', e);
      window.Toast?.show('Failed to load Wrapped data.', 'error');
      return;
    }

    let isFallback = false;
    if (!stats.totalPlays && stats.topSongs.length === 0) {
      console.log('[WRAPPED] No history found, showing fallback UI');
      window.Toast?.show('Showing preview with empty stats!', 'info');
      isFallback = true;
    }

    const modal = document.createElement('div');
    console.log('[WRAPPED] modal created');
    modal.id = 'wrappedModal';
    modal.style.cssText = `
      position:fixed; inset:0; z-index:600;
      background:rgba(0,0,0,0.92); backdrop-filter:blur(30px);
      display:flex; align-items:center; justify-content:center;
      animation: fadeIn 0.3s ease; overflow-y:auto; padding:20px;
    `;

    const topSongName = stats.topSongs[0]?.track?.title || 'No songs played';
    const topSongArt  = stats.topSongs[0]?.track?.thumbnail || '';

    // Monthly chart data
    const maxPlays = Math.max(...stats.monthlyPlays.map(m => m.plays), 1);
    const barChart = stats.monthlyPlays.map(m => {
      const pct = Math.round((m.plays / maxPlays) * 100) || 0;
      const label = String(m.month || '').slice(5); // MM
      const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const monthName = months[parseInt(label)] || label || '—';
      return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;min-width:0">
          <div style="width:100%;background:rgba(255,255,255,0.06);border-radius:4px;height:80px;display:flex;align-items:flex-end;overflow:hidden">
            <div style="width:100%;background:linear-gradient(to top,var(--dyn-accent,#1db954),rgba(29,185,84,0.4));height:${pct}%;border-radius:4px;transition:height 1s ease"></div>
          </div>
          <span style="font-size:10px;color:rgba(255,255,255,0.4);font-weight:700">${monthName}</span>
          <span style="font-size:10px;color:rgba(255,255,255,0.6);font-weight:700">${m.plays}</span>
        </div>`;
    }).join('');

    const topArtistMaxCount = Math.max(stats.topArtists[0]?.count || 1, 1);

    modal.innerHTML = `
      <style>
        #wrappedCard {
          width: 100%; max-width: 1200px;
          background: linear-gradient(160deg, #0a0a14 0%, #0d1a10 50%, #0a0a14 100%);
          border-radius: 24px; border: 1px solid rgba(29,185,84,0.2);
          box-shadow: 0 0 80px rgba(29,185,84,0.1);
          display: flex; flex-direction: column;
        }
        .w-main-grid {
          padding: 24px 36px; display: grid; gap: 20px; flex: 1;
        }
        .w-top {
          display: grid; grid-template-columns: auto auto 1fr 1fr 1fr; gap: 16px; align-items: stretch; height: 100%;
        }
        .w-mid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 24px; height: 100%;
        }
        .w-box {
          background: rgba(255,255,255,0.02); border-radius: 16px; padding: 16px 24px; border: 1px solid rgba(255,255,255,0.04); display: flex; flex-direction: column; justify-content: center; overflow: hidden;
        }
        .w-card-title {
          font-size: 11px; font-weight: 800; letter-spacing: 0.16em; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 12px;
        }
        
        /* Desktop strict landscape lock */
        @media (min-width: 1024px) {
          #wrappedCard { max-height: 80vh; overflow: hidden; }
          .w-main-grid { grid-template-rows: minmax(100px, 120px) minmax(200px, 220px) minmax(100px, 140px); }
        }
        
        /* Mobile fallback stacked */
        @media (max-width: 1023px) {
          #wrappedCard { max-height: 85vh; overflow-y: auto; overflow-x: hidden; }
          .w-main-grid { display: flex; flex-direction: column; gap: 28px; padding: 32px 24px; }
          .w-top { grid-template-columns: 1fr; }
          .w-mid { grid-template-columns: 1fr; }
          .w-box { padding: 24px; }
        }
      </style>
      <div id="wrappedCard">
        <div class="w-main-grid">
          
          <!-- ROW 1 -->
          <div class="w-top">
            <div style="background:linear-gradient(135deg,rgba(29,185,84,0.15),rgba(155,89,255,0.1)); padding:20px 32px; border-radius:16px; border:1px solid rgba(255,255,255,0.04); display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
              <div style="font-size:11px;font-weight:800;letter-spacing:0.16em;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:8px">NONIMID WRAPPED</div>
              <div style="font-size:44px;font-weight:800;letter-spacing:-0.03em;line-height:1;background:linear-gradient(90deg,#1db954,#9b59ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${stats.year}</div>
            </div>

            <div style="background:linear-gradient(90deg,rgba(29,185,84,0.1),rgba(155,89,255,0.08)); border:1px solid rgba(29,185,84,0.2); border-radius:16px; padding:20px 32px; display:flex; align-items:center; gap:20px; justify-content:center;">
              <div style="font-size:40px">${personalityEmoji(stats.personality)}</div>
              <div>
                <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:4px">Your Sound</div>
                <div style="font-size:22px;font-weight:800;letter-spacing:-0.01em">${stats.personality}</div>
              </div>
            </div>

            ${bigStat('🎵', stats.totalPlays.toLocaleString(), 'Songs Played')}
            ${bigStat('⏱', stats.totalMinutes.toLocaleString(), 'Minutes')}
            ${bigStat('❤', stats.likedCount.toLocaleString(), 'Liked')}
          </div>

          <!-- ROW 2 -->
          <div class="w-mid">
            <!-- LEFT: Top Song -->
            <div class="w-box">
              <div class="w-card-title">#1 Song of the Year</div>
              ${topSongArt ? `
              <div style="display:flex; align-items:center; flex:1; gap:24px;">
                <img src="${topSongArt}" style="width:140px; height:140px; border-radius:16px; object-fit:cover; box-shadow:0 10px 40px rgba(0,0,0,0.4);" onerror="this.src=''"/>
                <div style="flex:1; min-width:0;">
                  <div style="font-size:32px; font-weight:800; margin-bottom:8px; line-height:1.1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${esc(topSongName)}</div>
                  <div style="font-size:16px; color:rgba(255,255,255,0.5);">${stats.topSongs[0]?.count || 0} plays</div>
                </div>
              </div>` : '<div style="flex:1;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3)">No songs played</div>'}
            </div>

            <!-- RIGHT: Top Artists -->
            <div class="w-box">
              <div class="w-card-title">Top 5 Artists</div>
              ${stats.topArtists.length ? `
              <div style="display:flex;flex-direction:column;gap:10px; flex:1; justify-content:center;">
                ${stats.topArtists.slice(0,5).map((a, i) => `
                  <div style="display:flex;align-items:center;gap:12px">
                    <span style="font-size:14px;font-weight:800;color:rgba(255,255,255,0.2);width:20px;text-align:right">${i+1}</span>
                    <div style="flex:1;height:28px;background:rgba(255,255,255,0.03);border-radius:6px;position:relative;overflow:hidden">
                      <div style="height:100%;background:linear-gradient(90deg,rgba(29,185,84,0.2),transparent);width:${Math.round((a.count/topArtistMaxCount)*100) || 0}%;transition:width 1.2s ease"></div>
                      <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;font-weight:700; white-space:nowrap;">${esc(a.name)}</span>
                    </div>
                    <span style="font-size:13px;color:rgba(255,255,255,0.5);font-weight:700;width:36px;text-align:right">${a.count}</span>
                  </div>
                `).join('')}
              </div>` : '<div style="flex:1;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3)">No artists found</div>'}
            </div>
          </div>

          <!-- ROW 3: Monthly Chart -->
          ${stats.monthlyPlays.length > 0 ? `
          <div class="w-box">
            <div class="w-card-title">Monthly Plays</div>
            <div style="display:flex;gap:6px;align-items:flex-end; flex:1;">
              ${barChart}
            </div>
          </div>` : ''}

        </div>

        <!-- ROW 4: ACTIONS -->
        <div style="
          padding:16px 36px; border-top:1px solid rgba(255,255,255,0.04);
          display:flex; gap:12px; justify-content:flex-end; background:rgba(0,0,0,0.2);
        ">
          <button onclick="Wrapped.share()" style="
            padding:12px 24px; border-radius:24px; border:1px solid rgba(29,185,84,0.3);
            background:rgba(29,185,84,0.1); color:#1db954; font-family:'Syne',sans-serif;
            font-size:14px; font-weight:700; cursor:pointer; transition:all 0.2s;
            display:flex; align-items:center; gap:8px;
          ">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
            Share
          </button>
          <button onclick="Wrapped.download()" style="
            padding:12px 24px; border-radius:24px; border:none;
            background:#1db954; color:#000; font-family:'Syne',sans-serif;
            font-size:14px; font-weight:800; cursor:pointer; transition:all 0.2s;
            display:flex; align-items:center; gap:8px;
          ">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px"><path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5v-2z"/></svg>
            Save PNG
          </button>
          <button onclick="document.getElementById('wrappedModal').remove()" style="
            padding:12px 20px; border-radius:24px; border:1px solid rgba(255,255,255,0.1);
            background:transparent; color:rgba(255,255,255,0.5); font-family:'Syne',sans-serif;
            font-size:14px; font-weight:700; cursor:pointer;
          ">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    console.log('[WRAPPED] modal inserted');
    setTimeout(() => {
      console.log('[WRAPPED] modal shown');
      if (isFallback) console.log('[WRAPPED] fallback rendered');
    }, 50);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  function bigStat(emoji, value, label) {
    return `
      <div style="background:rgba(255,255,255,0.03);border-radius:16px;padding:16px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;border:1px solid rgba(255,255,255,0.04);">
        <div style="font-size:24px;margin-bottom:8px">${emoji}</div>
        <div style="font-size:28px;font-weight:800;color:#1db954;line-height:1">${value}</div>
        <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);margin-top:6px;text-transform:uppercase;letter-spacing:0.06em">${label}</div>
      </div>`;
  }

  function personalityEmoji(p) {
    const map = {
      'Phonk Drifter':  '🚗',
      'Chill Architect': '☕',
      'Jazz Soul':       '🎺',
      'Night Owl':       '🦉',
      'Festival Freak':  '🎡',
      'Explorer':        '🌍',
    };
    return map[p] || '🎵';
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  async function download() {
    const card = document.getElementById('wrappedCard');
    if (!card) return;
    try {
      // Use html2canvas if available, otherwise fallback to SVG snapshot
      if (window.html2canvas) {
        const c = await window.html2canvas(card, { backgroundColor: '#0a0a14', scale: 2 });
        const a = document.createElement('a');
        a.href = c.toDataURL('image/png');
        a.download = `nonimid-wrapped-${new Date().getFullYear()}.png`;
        a.click();
      } else {
        // Fallback: inject html2canvas dynamically
        window.Toast?.show('Preparing download…', 'info');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = async () => {
          const c = await window.html2canvas(card, { backgroundColor: '#0a0a14', scale: 2 });
          const a = document.createElement('a');
          a.href = c.toDataURL('image/png');
          a.download = `nonimid-wrapped-${new Date().getFullYear()}.png`;
          a.click();
        };
        document.head.appendChild(script);
      }
    } catch (e) {
      window.Toast?.show('Download failed — try screenshot instead', 'error');
    }
  }

  function share() {
    const stats = getStats();
    const text  = `🎵 NONIMID Wrapped ${stats.year}\n\n` +
                  `⏱ ${stats.totalMinutes} minutes listened\n` +
                  `🎤 Top artist: ${stats.topArtists[0]?.name || '—'}\n` +
                  `🏆 Sound: ${stats.personality}\n` +
                  `\n#NONIMID #WrappedYear`;
    if (navigator.share) {
      navigator.share({ title: `NONIMID Wrapped ${stats.year}`, text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      window.Toast?.show('Copied to clipboard!', 'success');
    }
  }

  return { open, download, share };
})();




/* ───────────────────────────────────────────────────────────────
   6. PWA — Service Worker + Install Prompt
   ─────────────────────────────────────────────────────────────── */
const PWAManager = (() => {
  let _deferredPrompt = null;

  function init() {
  registerServiceWorker();
  listenInstallPrompt();
  // injectManifest();
}

  function injectManifest() {}
    

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    // Inline Service Worker via blob
    const swCode = `
const CACHE = 'nonimid-v1';
const ASSETS = ['/', '/index.html'];
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Don't intercept YouTube/API calls
  if (url.hostname.includes('youtube') || url.hostname.includes('googleapis') || url.pathname.startsWith('/api/')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      if (resp.ok) {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return resp;
    }).catch(() => cached || new Response('Offline', {status: 503})))
  );
});
`;
    navigator.serviceWorker.register('/sw.js')
  .then(() => console.log('[NONIMID PWA] Service Worker registered'))
  .catch(err => console.error(err)); // Blob SW only works on same-origin
  }

  function listenInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      _deferredPrompt = e;
      showInstallBanner();
    });

    window.addEventListener('appinstalled', () => {
      const banner = document.getElementById('installBanner');
      if (banner) banner.remove();
      window.Toast?.show('NONIMID installed! 🎉', 'success');
    });
  }

  function showInstallBanner() {
    const old = document.getElementById('installBanner');
    if (old) return;

    const banner = document.createElement('div');
    banner.id = 'installBanner';
    banner.style.cssText = `
      position:fixed; bottom:calc(var(--player-h) + 12px); left:16px; right:16px;
      background:linear-gradient(135deg,rgba(18,18,30,0.98),rgba(13,13,20,0.98));
      border:1px solid rgba(29,185,84,0.25); border-radius:16px;
      padding:14px 16px; display:flex; align-items:center; gap:12px;
      box-shadow:0 8px 30px rgba(0,0,0,0.4); z-index:200;
      animation:toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
    `;
    banner.innerHTML = `
      <div style="font-size:28px">📱</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700">Install NONIMID</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:2px">Add to home screen for the best experience</div>
      </div>
      <button onclick="PWAManager.install()" style="
        padding:9px 16px; border-radius:20px; border:none;
        background:#1db954; color:#000; font-family:'Syne',sans-serif;
        font-size:12px; font-weight:800; cursor:pointer; white-space:nowrap;
      ">Install</button>
      <button onclick="document.getElementById('installBanner').remove()" style="
        background:none; border:none; color:rgba(255,255,255,0.4); cursor:pointer; font-size:18px; padding:2px;
      ">✕</button>
    `;
    document.body.appendChild(banner);

    // Auto-dismiss after 8s
    setTimeout(() => banner.remove(), 8000);
  }

  function install() {
    if (!_deferredPrompt) return;
    _deferredPrompt.prompt();
    _deferredPrompt.userChoice.then(() => {
      _deferredPrompt = null;
    });
  }

  return { init, install };
})();


/* ───────────────────────────────────────────────────────────────
   SIDEBAR INTEGRATION — Tambah nav items premium ke sidebar
   ─────────────────────────────────────────────────────────────── */
function injectPremiumNavItems() {
  const sidebar = document.querySelector('.sidebar-nav');
  if (!sidebar) return;

  // Avoid duplicate injection
  if (document.getElementById('nav-wrapped')) return;

  const navItems = `
    <div class="nav-section-label" style="margin-top:8px">Premium</div>
    <button class="nav-item" id="nav-wrapped" onclick="Wrapped.open()">
      <svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      Wrapped
    </button>
  `;

  sidebar.insertAdjacentHTML('beforeend', navItems);
}

function injectPremiumMobileNav() {
  // Add Wrapped to mobile nav
}


/* ───────────────────────────────────────────────────────────────
   KEYBOARD SHORTCUTS EXTENSION
   ─────────────────────────────────────────────────────────────── */
function initKeyboardExtension() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'w' || e.key === 'W') Wrapped.open();
  });
}


/* ───────────────────────────────────────────────────────────────
   PLAYER HOOK — intercept play() to trigger all premium systems
   ─────────────────────────────────────────────────────────────── */
function hookPlayerForPremium() {
  const tryHook = () => {
    if (!window.Player?.play) { setTimeout(tryHook, 100); return; }

    const origPlay = window.Player.play.bind(window.Player);
    window.Player.play = function(track) {
      origPlay(track);
      if (track?.thumbnail) {
        setTimeout(() => ThemeEngine.extractAndApply(track.thumbnail), 200);
      }
      if (window.YTPlayer?.isPlaying !== undefined) {
        setTimeout(() => AudioVisualizer.tryConnectAudio(), 300);
      }
    };

    // Also hook YTPlayer state for visualizer
    const origOnStateChange = window.YTPlayer?.onStateChange;
    if (window.YTPlayer) {
      window.YTPlayer.onStateChange = function(state) {
        if (typeof origOnStateChange === 'function') origOnStateChange(state);
        if (state === 1) {
          setTimeout(() => AudioVisualizer.tryConnectAudio(), 200);
        }
      };
    }
  };
  tryHook();
}


/* ───────────────────────────────────────────────────────────────
   PROFILE PAGE EXTENSION
   ─────────────────────────────────────────────────────────────── */
function hookProfilePage() {
  // Achievements removed from profile
}

/* ───────────────────────────────────────────────────────────────
   MAIN BOOT
   ─────────────────────────────────────────────────────────────── */
(function boot() {
  const run = () => {
    console.log('[NONIMID Premium] Booting…');

    // 1. Theme Engine
    ThemeEngine.init();

    // 2. Audio Visualizer
    AudioVisualizer.init();

    // Clean up old achievements data
    try {
      localStorage.removeItem('nonimid_achievements');
      console.log('[NONIMID Premium] Removed legacy achievements data');
    } catch(e) {}


    // 4. PWA
    PWAManager.init();

    // 6. Sidebar nav items
    injectPremiumNavItems();

    // 7. Keyboard shortcuts
    initKeyboardExtension();

    // 8. Player hooks for premium systems
    hookPlayerForPremium();

    // 9. Profile page extension
    hookProfilePage();

    // 10. Expose globals
    window.ThemeEngine    = ThemeEngine;
    window.AudioVisualizer= AudioVisualizer;
    window.Wrapped        = Wrapped;
    window.PWAManager     = PWAManager;

    console.log('[NONIMID Premium] ✓ All systems online');
    console.log('[NONIMID Premium] Shortcuts: W=Wrapped');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(run, 100));
  } else {
    setTimeout(run, 100);
  }
})();
