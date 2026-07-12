import { PENTATONIC_NOTES, ROCKY_PHRASES } from '../utils/constants.js';
import { hapticLight, hapticMedium, hapticHeavy, hapticRockySpeak } from '../mobile/bridge.js';

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.initialized = false;
    this.ambientNode = null;
    this.effectNodes = [];
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
      this._startAmbient();
    } catch (e) {
      console.warn('Web Audio API not available:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _startAmbient() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.value = 55;
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 1;
    gain.gain.value = 0.04;

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.3;
    lfoGain.gain.value = 10;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    this.ambientNode = { osc, gain, filter, lfo, lfoGain };
  }

  /** 播放 Rocky 音符 + 触觉反馈 */
  playRockyNote(noteIndex, duration = 300, time = 0) {
    if (!this.ctx) return;
    this.resume();
    const note = PENTATONIC_NOTES[noteIndex];
    if (!note) return;

    const now = this.ctx.currentTime + time;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.value = note.freq;

    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibrato.type = 'sine';
    vibrato.frequency.value = 5 + Math.random() * 3;
    vibratoGain.gain.value = 2;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    vibrato.start(now);
    vibrato.stop(now + duration / 1000);

    filter.type = 'bandpass';
    filter.frequency.value = note.freq * 1.5;
    filter.Q.value = 2;

    const durSec = duration / 1000;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.setValueAtTime(0.25, now + durSec * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + durSec + 0.05);

    // Rocky 说话触觉
    hapticRockySpeak(Math.min(duration, 50));

    this.effectNodes.push({ osc, gain, filter, vibrato, vibratoGain });
    if (this.effectNodes.length > 30) {
      this.effectNodes = this.effectNodes.slice(-20);
    }
  }

  /** 播放 Rocky 短语序列 */
  playRockyPhrase(phraseKey, delay = 0) {
    if (!this.ctx) return;
    const phrase = ROCKY_PHRASES[phraseKey];
    if (!phrase) return;
    let cumulativeTime = delay / 1000;
    for (let i = 0; i < phrase.notes.length; i++) {
      const noteIdx = phrase.notes[i];
      const dur = phrase.rhythm[i] || 200;
      this.playRockyNote(noteIdx, dur, cumulativeTime);
      cumulativeTime += dur / 1000;
    }
    return cumulativeTime * 1000;
  }

  /** 播放玩家点击的音符 + 中等触觉 */
  playPlayerNote(noteIndex) {
    if (!this.ctx) return;
    this.resume();
    const note = PENTATONIC_NOTES[noteIndex];
    if (!note) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const delay = this.ctx.createDelay(0.3);
    const feedback = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = note.freq;

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    delay.delayTime.value = 0.2;
    feedback.gain.value = 0.2;
    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    feedback.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.6);

    // 音符按下触觉
    hapticMedium();

    this.effectNodes.push({ osc, gain, delay, feedback });
  }

  /** 播放 UI 点击音效 + 轻触觉 */
  playClick() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);

    hapticLight();
  }

  /** 播放成功音效 + 重触觉 */
  playSuccess() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    [0.2, 0.4].forEach((delay, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = [523, 784][i];
      gain.gain.setValueAtTime(0.15, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + delay);
      osc.stop(now + delay + 0.35);
    });
    hapticHeavy();
  }

  destroy() {
    if (this.ambientNode) {
      Object.values(this.ambientNode).forEach(n => {
        try { n.stop(); } catch (e) { /* already stopped */ }
      });
    }
    this.effectNodes.forEach(g => {
      Object.values(g).forEach(n => {
        try { n.stop(); } catch (e) { /* already stopped */ }
      });
    });
    if (this.ctx) {
      this.ctx.close();
    }
  }
}

export const soundSystem = new SoundSystem();
