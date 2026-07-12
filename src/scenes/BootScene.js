import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants.js';
import { soundSystem } from '../systems/SoundSystem.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 显示加载进度条
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const barW = 200, barH = 20;
    const barBg = this.add.graphics();
    barBg.fillStyle(0x1a1a3e, 1);
    barBg.fillRect(cx - barW / 2, cy - barH / 2, barW, barH);

    const barFg = this.add.graphics();
    const loadText = this.add.text(cx, cy - 40, '🚀 任务加载中...', {
      fontSize: '16px', color: '#8899aa', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.load.on('progress', (val) => {
      barFg.clear();
      barFg.fillStyle(COLORS.ACCENT, 1);
      barFg.fillRect(cx - barW / 2 + 2, cy - barH / 2 + 2, (barW - 4) * val, barH - 4);
    });
  }

  create() {
    // 初始化音效系统
    soundSystem.init();

    // 生成所有程序化纹理
    this._generatePlayerTexture();
    this._generateRockyTexture();
    this._generateStarTexture();
    this._generateDoorTexture();
    this._generateButtonTexture();
    this._generateNoteBtnTextures();
    this._generateParticleTexture();
    this._generateShipBgTexture();

    this.time.delayedCall(500, () => {
      this.scene.start('MainMenuScene');
    });
  }

  _generatePlayerTexture() {
    const g = this.make.graphics({ add: false });
    const s = 64;
    // 身体
    g.fillStyle(COLORS.GRACE_SUIT);
    g.fillRoundedRect(14, 24, 36, 30, 6);
    // 背包
    g.fillStyle(0xcccccc);
    g.fillRoundedRect(16, 22, 32, 12, 3);
    // 头盔
    g.fillStyle(COLORS.GRACE_HELMET);
    g.fillCircle(32, 16, 14);
    // 面罩
    g.fillStyle(COLORS.GRACE_VISOR);
    g.fillCircle(32, 16, 9);
    // 面罩反光
    g.fillStyle(0x88bbff, 0.6);
    g.fillCircle(29, 13, 3);
    // 腿
    g.fillStyle(COLORS.GRACE_BOOTS);
    g.fillRect(20, 54, 10, 10);
    g.fillRect(34, 54, 10, 10);
    // 手臂
    g.fillStyle(COLORS.GRACE_SUIT);
    g.fillRect(4, 28, 10, 16);
    g.fillRect(50, 28, 10, 16);
    g.generateTexture('player', s, s);
    g.destroy();
  }

  _generateRockyTexture() {
    const g = this.make.graphics({ add: false });
    const s = 80;
    const cx = 40, cy = 40;
    // 身体 - 五边形
    g.fillStyle(COLORS.ROCKY_BODY);
    g.beginPath();
    const pts = 5;
    for (let i = 0; i < pts; i++) {
      const angle = (i / pts) * Math.PI * 2 - Math.PI / 2;
      const rx = i % 2 === 0 ? 28 : 22;
      const ry = i % 2 === 0 ? 28 : 22;
      const px = cx + Math.cos(angle) * rx;
      const py = cy + Math.sin(angle) * ry;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.fillPath();

    // 岩石纹路
    g.lineStyle(1.5, COLORS.ROCKY_DARK, 0.6);
    g.lineBetween(cx - 15, cy - 18, cx + 8, cy - 8);
    g.lineBetween(cx + 12, cy - 10, cx + 20, cy + 5);
    g.lineBetween(cx - 10, cy + 8, cx + 5, cy + 18);
    g.lineBetween(cx - 20, cy - 5, cx - 8, cy + 12);

    // 圆顶
    g.fillStyle(COLORS.ROCKY_DOME);
    g.fillEllipse(cx, cy - 14, 26, 20);

    // 眼睛（发光蓝点）
    g.fillStyle(0x000000);
    g.fillCircle(cx - 7, cy - 10, 5);
    g.fillCircle(cx + 7, cy - 10, 5);
    g.fillStyle(COLORS.ROCKY_EYE);
    g.fillCircle(cx - 6, cy - 11, 3);
    g.fillCircle(cx + 8, cy - 11, 3);
    // 眼睛高光
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(cx - 5, cy - 12, 1);
    g.fillCircle(cx + 9, cy - 12, 1);

    // 腿（5条短腿）
    g.fillStyle(COLORS.ROCKY_DARK);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const lx = cx + Math.cos(angle) * 24;
      const ly = cy + Math.sin(angle) * 24;
      g.fillEllipse(lx, ly + 6, 8, 12);
    }

    g.generateTexture('rocky', s, s);
    g.destroy();
  }

  _generateStarTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xffffff);
    g.fillCircle(3, 3, 3);
    g.generateTexture('star', 6, 6);
    g.destroy();
  }

  _generateDoorTexture() {
    const g = this.make.graphics({ add: false });
    const w = 100, h = 160;
    // 门框
    g.fillStyle(0x2a3050);
    g.fillRoundedRect(0, 0, w, h, 8);
    // 门板
    g.fillStyle(0x1e2848);
    g.fillRoundedRect(6, 6, w - 12, h - 12, 5);
    // 面板
    g.fillStyle(COLORS.ACCENT, 0.3);
    g.fillRoundedRect(20, 40, 60, 50, 4);
    // 指示灯
    g.fillStyle(COLORS.ACCENT, 0.8);
    g.fillCircle(50, 55, 5);
    // 把手
    g.lineStyle(2, COLORS.WHITE, 0.5);
    g.lineBetween(70, 80, 85, 80);
    g.generateTexture('door', w, h);
    g.destroy();
  }

  _generateButtonTexture() {
    const g = this.make.graphics({ add: false });
    const w = 160, h = 50;
    g.fillStyle(COLORS.PANEL);
    g.fillRoundedRect(0, 0, w, h, 12);
    g.lineStyle(2, COLORS.ACCENT, 0.5);
    g.strokeRoundedRect(0, 0, w, h, 12);
    g.generateTexture('button', w, h);
    g.destroy();
  }

  _generateNoteBtnTextures() {
    const notes = ['C', 'D', 'E', 'G', 'A', 'C5'];
    const colors = [0xff6666, 0xffaa44, 0xffff44, 0x44ff44, 0x44aaff, 0xcc66ff];
    const size = 56;
    notes.forEach((name, i) => {
      const g = this.make.graphics({ add: false });
      g.fillStyle(colors[i], 0.3);
      g.fillCircle(size / 2, size / 2, size / 2 - 2);
      g.lineStyle(2, colors[i], 0.7);
      g.strokeCircle(size / 2, size / 2, size / 2 - 2);
      g.generateTexture('note-btn-' + i, size, size);
      g.destroy();
    });
  }

  _generateParticleTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xffffff);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();
  }

  _generateShipBgTexture() {
    const g = this.make.graphics({ add: false });
    const w = GAME_WIDTH, h = GAME_HEIGHT;
    // 深色飞船内部背景
    g.fillStyle(COLORS.BG_DARK);
    g.fillRect(0, 0, w, h);
    // 墙壁纹理
    for (let y = 0; y < h; y += 40) {
      g.fillStyle(0x111133, 0.3);
      g.fillRect(0, y, w, 2);
    }
    // 角落暗角
    g.fillStyle(0x000000, 0.4);
    g.fillRect(0, 0, w, 40);
    g.fillRect(0, h - 40, w, 40);
    g.generateTexture('ship-bg', w, h);
    g.destroy();
  }
}
