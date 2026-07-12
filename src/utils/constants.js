export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

export const COLORS = {
  BG_DARK: 0x0a0a1a,
  BG_SPACE: 0x0d0d2b,
  SHIP_WALL: 0x1a1a3e,
  SHIP_FLOOR: 0x2a2a4e,
  PANEL: 0x1e2d4a,
  ACCENT: 0x00d4ff,
  ACCENT2: 0xff6b35,
  WARNING: 0xff4444,
  SUCCESS: 0x44ff44,
  WHITE: 0xffffff,
  TEXT_DIM: 0x8899aa,
  GOLD: 0xffd700,
  ROCKY_BODY: 0x8b7355,
  ROCKY_DARK: 0x5c4a32,
  ROCKY_DOME: 0x6b5b45,
  ROCKY_EYE: 0x44ccff,
  ROCKY_CRYSTAL: 0xaaddff,
  GRACE_SUIT: 0xe8e8e8,
  GRACE_HELMET: 0xccddff,
  GRACE_VISOR: 0x4488cc,
  GRACE_BOOTS: 0x666677
};

export const PENTATONIC_NOTES = [
  { name: 'C4', freq: 261.63, color: 0xff6666, label: 'Do' },
  { name: 'D4', freq: 293.66, color: 0xffaa44, label: 'Re' },
  { name: 'E4', freq: 329.63, color: 0xffff44, label: 'Mi' },
  { name: 'G4', freq: 392.00, color: 0x44ff44, label: 'Sol' },
  { name: 'A4', freq: 440.00, color: 0x44aaff, label: 'La' },
  { name: 'C5', freq: 523.25, color: 0xcc66ff, label: 'Do\'' }
];

export const ROCKY_PHRASES = {
  greeting: {
    notes: [3, 2, 4, 1, 3],
    rhythm: [200, 150, 200, 150, 400],
    text: '♪♫♪♫♪ (你好，地球朋友！)'
  },
  curious: {
    notes: [0, 4, 2, 5],
    rhythm: [250, 200, 300, 500],
    text: '♪♫♪♫ (这是什么？)'
  },
  happy: {
    notes: [3, 3, 5, 3, 1],
    rhythm: [150, 150, 300, 150, 400],
    text: '♫♪♫♪♫ (太好了！)'
  },
  worried: {
    notes: [2, 1, 0],
    rhythm: [400, 400, 600],
    text: '♪♪♪ (危险...)'
  },
  excited: {
    notes: [5, 5, 3, 5, 5, 3],
    rhythm: [100, 100, 200, 100, 100, 300],
    text: '♫♫♪♫♫♪ (快来！快来！)'
  },
  grateful: {
    notes: [1, 3, 5, 3, 1],
    rhythm: [250, 200, 350, 200, 500],
    text: '♪♫♪♫♪ (谢谢你，朋友)'
  }
};

export const INITIAL_RESOURCES = {
  astrophageFuel: 70,
  oxygen: 85,
  food: 60,
  hullIntegrity: 90,
  rockyTrust: 10,
  translationProgress: 0
};

export const TRUST_LEVELS = [
  { min: 0, name: '陌生人', emoji: '🤔' },
  { min: 20, name: '好奇', emoji: '👀' },
  { min: 40, name: '朋友', emoji: '🤝' },
  { min: 60, name: '信任', emoji: '💪' },
  { min: 80, name: '挚友', emoji: '🌟' },
  { min: 100, name: '家人', emoji: '💎' }
];
