// ===== RETRO PATH - 8-Bit Sound System =====
// Semua suara di-generate via Web Audio API — tanpa file eksternal

const Sound = (() => {
  let ctx = null;
  let _muted = false;
  let _volume = 0.3;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  // ─── Helper: main oscillator ─────────────────────
  function playTone(freq, duration, type = 'square', volume = _volume) {
    if (_muted) return;
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  }

  // ─── Helper: noise burst ─────────────────────────
  function playNoise(duration, volume = _volume * 0.5) {
    if (_muted) return;
    const c = getCtx();
    const bufferSize = Math.floor(c.sampleRate * duration);
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = c.createBufferSource();
    source.buffer = buffer;
    const gain = c.createGain();
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    const filter = c.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, c.currentTime);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    source.start(c.currentTime);
  }

  // ─── Helper: multi-tone sequence ─────────────────
  function playSequence(notes, type = 'square') {
    if (_muted) return;
    const c = getCtx();
    let t = c.currentTime;
    for (const [freq, dur, vol] of notes) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(vol ?? _volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur * 0.7; // overlap a bit
    }
  }

  // ===== PUBLIC SOUNDS =====

  /** Blok ditempatkan di grid */
  function placeBlock() {
    playTone(880, 0.08, 'square', _volume * 0.7);
    setTimeout(() => playTone(1100, 0.06, 'square', _volume * 0.5), 40);
  }

  /** Blok dihapus (right-click) */
  function removeBlock() {
    playTone(600, 0.06, 'square', _volume * 0.6);
    setTimeout(() => playTone(440, 0.08, 'square', _volume * 0.5), 50);
  }

  /** Klik tombol UI */
  function uiClick() {
    playTone(500, 0.04, 'square', _volume * 0.4);
  }

  /** Langkah karakter (tiap cell) */
  function step() {
    playTone(300 + Math.random() * 100, 0.04, 'square', _volume * 0.3);
  }

  /** Mulai jalan — whoosh */
  function startPath() {
    playNoise(0.15, _volume * 0.3);
    playSequence([
      [400, 0.08, _volume * 0.5],
      [600, 0.08, _volume * 0.5],
      [800, 0.12, _volume * 0.5],
    ], 'square');
  }

  /** Level selesai — victory jingle */
  function levelComplete() {
    playSequence([
      [523, 0.15, _volume],
      [659, 0.15, _volume],
      [784, 0.15, _volume],
      [1047, 0.3, _volume],
    ], 'square');
    // Sparkle on top
    setTimeout(() => {
      playSequence([
        [1200, 0.1, _volume * 0.4],
        [1500, 0.15, _volume * 0.3],
      ], 'square');
    }, 200);
  }

  /** Error / notifikasi gagal */
  function error() {
    playTone(200, 0.15, 'sawtooth', _volume * 0.5);
    setTimeout(() => playTone(160, 0.2, 'sawtooth', _volume * 0.4), 120);
  }

  /** Petunjuk dipakai */
  function hint() {
    playSequence([
      [660, 0.08, _volume * 0.5],
      [880, 0.08, _volume * 0.5],
      [1100, 0.12, _volume * 0.5],
    ], 'triangle');
  }

  /** Beli item di toko */
  function purchase() {
    playSequence([
      [440, 0.08, _volume * 0.6],
      [554, 0.08, _volume * 0.6],
      [659, 0.08, _volume * 0.6],
      [880, 0.15, _volume * 0.7],
    ], 'square');
  }

  /** Transisi screen */
  function screenTransition() {
    playTone(600, 0.06, 'square', _volume * 0.3);
    setTimeout(() => playTone(800, 0.06, 'square', _volume * 0.3), 60);
  }

  // ─── Mute toggle ─────────────────────────────────
  function toggleMute() {
    _muted = !_muted;
    return _muted;
  }

  function isMuted() {
    return _muted;
  }

  function setVolume(v) {
    _volume = Math.max(0, Math.min(1, v));
  }

  function getVolume() {
    return _volume;
  }

  // Init: resume audio context on first user interaction
  function init() {
    const resume = () => {
      getCtx();
      document.removeEventListener('click', resume);
      document.removeEventListener('keydown', resume);
      document.removeEventListener('touchstart', resume);
    };
    document.addEventListener('click', resume);
    document.addEventListener('keydown', resume);
    document.addEventListener('touchstart', resume);
  }

  return {
    init,
    placeBlock,
    removeBlock,
    uiClick,
    step,
    startPath,
    levelComplete,
    error,
    hint,
    purchase,
    screenTransition,
    toggleMute,
    isMuted,
    setVolume,
    getVolume,
  };
})();
