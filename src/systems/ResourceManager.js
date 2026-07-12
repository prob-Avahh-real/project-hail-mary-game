import { INITIAL_RESOURCES, TRUST_LEVELS } from '../utils/constants.js';

class ResourceManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.resources = { ...INITIAL_RESOURCES };
  }

  get(key) {
    return this.resources[key] ?? 0;
  }

  set(key, value) {
    this.resources[key] = Math.max(0, Math.min(100, value));
  }

  add(key, amount) {
    this.set(key, this.get(key) + amount);
  }

  sub(key, amount) {
    this.set(key, this.get(key) - amount);
  }

  getTrustLevel() {
    const trust = this.get('rockyTrust');
    for (let i = TRUST_LEVELS.length - 1; i >= 0; i--) {
      if (trust >= TRUST_LEVELS[i].min) {
        return TRUST_LEVELS[i];
      }
    }
    return TRUST_LEVELS[0];
  }

  getTranslationPercent() {
    return this.get('translationProgress');
  }

  isCritical() {
    return (
      this.get('astrophageFuel') < 15 ||
      this.get('oxygen') < 15 ||
      this.get('hullIntegrity') < 15
    );
  }

  isGameOver() {
    return (
      this.get('astrophageFuel') <= 0 ||
      this.get('oxygen') <= 0 ||
      this.get('hullIntegrity') <= 0
    );
  }

  getStatus() {
    return { ...this.resources };
  }
}

export const resourceManager = new ResourceManager();
