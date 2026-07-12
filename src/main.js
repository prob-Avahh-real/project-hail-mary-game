import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './utils/constants.js';
import { BootScene } from './scenes/BootScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { ShipScene } from './scenes/ShipScene.js';
import { RockyScene } from './scenes/RockyScene.js';
import { LabScene } from './scenes/LabScene.js';
import { BridgeScene } from './scenes/BridgeScene.js';
import { UIScene } from './scenes/UIScene.js';
import { initNative } from './mobile/bridge.js';

// 初始化移动端原生功能 (状态栏/触觉/启动画面)
initNative();

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0a0a1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MainMenuScene, ShipScene, RockyScene, LabScene, BridgeScene, UIScene],
  audio: {
    disableWebAudio: false
  },
  input: {
    activePointers: 3,
    touch: {
      target: null,
      capture: true
    }
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true
  }
};

new Phaser.Game(config);
