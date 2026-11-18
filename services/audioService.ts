// Web Audio API helper for synthesizer-based ambient UI sounds without requiring external assets.
let audioCtx: AudioContext | null = null;
let isMuted = localStorage.getItem('portfolio-muted') === 'true';

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // Lazy initialize to bypass browser autoplay policies gracefully
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  // Resume context if suspended
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const audioService = {
  isMuted: (): boolean => isMuted,

  setMuted: (muted: boolean) => {
    isMuted = muted;
    localStorage.setItem('portfolio-muted', String(muted));
    if (!muted) {
      // Small audible confirmation chime when unmuted
      audioService.playChime();
    }
  },

  // Subtly high-pitched elegant click feedback for button hover/click
  playClick: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    // Very quick, clean cyber blip
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  },

  // Soft low-frequency accent chime
  playSecondary: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.12);

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  },

  // Interactive frequency sweep for nice theme transitioning
  playThemeTransition: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(180, ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.35);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(220, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(1100, ctx.currentTime + 0.35);

    gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.35);
    osc2.stop(ctx.currentTime + 0.35);
  },

  // Full ambient chime used for unmute & special interaction confirmation
  playChime: () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const time = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // Beautiful C Major Chord overtones (C5, E5, G5, C6)

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + index * 0.05);

      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.04, time + index * 0.05 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + index * 0.05 + 0.3);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(time + index * 0.05);
      osc.stop(time + index * 0.05 + 0.3);
    });
  }
};
