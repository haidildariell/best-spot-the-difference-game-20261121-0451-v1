// SoundEffects — every sound in the cabinet is synthesised with the Web Audio API at the moment
// it is needed: no audio files, nothing to load, nothing to fetch. A find rings a small harmonic
// chime whose pitch climbs as the round fills in; a miss answers with a soft muted thud; a hint
// sweeps a quiet radar ping; finishing a plate plays a short celebratory arpeggio.

export class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
  }

  /** Create the context lazily on the first user gesture (browsers refuse it any earlier). */
  ensureContext() {
    if (this.audioContext !== null) {
      if (this.audioContext.state === 'suspended') this.audioContext.resume();
      return true;
    }
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (AudioCtor === undefined) return false;
    this.audioContext = new AudioCtor();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.audioContext.destination);
    return true;
  }

  /** One soft sine partial with an exponential decay envelope. */
  playTone(frequency, startOffset, duration, peak, type = 'sine') {
    if (!this.ensureContext()) return;
    const context = this.audioContext;
    const start = context.currentTime + startOffset;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  /** The find chime: a bright two-note bell, rising a step for each difference already found. */
  playFoundChime(foundCount) {
    const base = 523.25 * Math.pow(2, Math.min(foundCount, 7) / 12);
    this.playTone(base, 0, 0.5, 0.22);
    this.playTone(base * 1.5, 0.02, 0.55, 0.14);
    this.playTone(base * 2, 0.04, 0.4, 0.07);
  }

  /** The misclick thud: a low, damped knock that says "not there" without scolding. */
  playMissThud() {
    this.playTone(118, 0, 0.16, 0.3, 'triangle');
    this.playTone(74, 0.01, 0.2, 0.2, 'sine');
  }

  /** The hint ping: a gentle sweep upward, like a sonar ring going out. */
  playHintPing() {
    if (!this.ensureContext()) return;
    const context = this.audioContext;
    const start = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(660, start);
    oscillator.frequency.exponentialRampToValueAtTime(1320, start + 0.35);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.12, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start(start);
    oscillator.stop(start + 0.45);
  }

  /** The plate-complete arpeggio: four notes up a major scale and a warm final chord. */
  playPlateComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((frequency, index) => this.playTone(frequency, index * 0.09, 0.6, 0.18));
    this.playTone(1318.5, 0.38, 0.9, 0.12);
    this.playTone(1567.98, 0.38, 0.9, 0.06);
  }

  /** A dry page-turn tick for moving the loupe between plates with the keyboard. */
  playLoupeTick() {
    this.playTone(1900, 0, 0.05, 0.03, 'square');
  }
}
