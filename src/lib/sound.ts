/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Native Web Audio synth for bips and feedback without loading external files
class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Timer beep when resting or starting
  beep(freq = 880, duration = 0.15, type: OscillatorType = 'sine') {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio playback might be blocked by browser policy until user interacts
    }
  }

  // Triple beep for countdown finish (3, 2, 1, GO!)
  finishChime() {
    this.beep(523.25, 0.1); // C5
    setTimeout(() => this.beep(659.25, 0.1), 120); // E5
    setTimeout(() => this.beep(783.99, 0.25), 240); // G5
  }

  // Success ping for payment or goal completion
  success() {
    this.beep(587.33, 0.12);
    setTimeout(() => this.beep(880, 0.25), 100);
  }
}

export const soundFx = new SoundEffects();
