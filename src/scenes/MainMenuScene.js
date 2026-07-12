import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants.js';
import { soundSystem } from '../systems/SoundSystem.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    soundSystem.resume();
    const cx = GAME_WIDTH / 2;

    // 星空背景
    this._createStarfield();

    // 暗色叠加
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000011, 0.5);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 飞船剪影
    const ship = this.add.graphics();
    ship.fillStyle(0x1a1a3e, 0.7);
    ship.fillTriangle(cx, 100, cx - 120, 350, cx + 120, 350);
    ship.fillStyle(0x0d0d2b, 0.9);
    ship.fillRect(cx - 30, 200, 60, 150);

    // 标题
    this.add.text(cx, 250, '挽 救 计 划', {
      fontSize: '38px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#00d4ff',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.add.text(cx, 305, '星 际 救 援', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#00d4ff',
      letterSpacing: 8
    }).setOrigin(0.5);

    this.add.text(cx, 340, 'PROJECT HAIL MARY', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#556677',
      letterSpacing: 3
    }).setOrigin(0.5);

    // 闪烁提示
    const startText = this.add.text(cx, GAME_HEIGHT - 140, '👆 点击开始任务', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#8899aa'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: startText,
      alpha: 0.4,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Rocky 预览
    const rockyPreview = this.add.image(cx, 460, 'rocky').setScale(1.5).setAlpha(0.8);
    this.tweens.add({
      targets: rockyPreview,
      y: 470,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(cx, 530, '石头星人 Rocky', {
      fontSize: '12px', fontFamily: 'monospace', color: '#8b7355'
    }).setOrigin(0.5);

    // 版本
    this.add.text(cx, GAME_HEIGHT - 40, 'v1.0 · Phaser 3', {
      fontSize: '10px', fontFamily: 'monospace', color: '#334455'
    }).setOrigin(0.5);

    // 点击开始
    this.input.once('pointerdown', () => {
      soundSystem.playClick();
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.time.delayedCall(600, () => {
        this.scene.start('ShipScene');
      });
    });

    this.cameras.main.fadeIn(800, 0, 0, 0);
  }

  _createStarfield() {
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const size = Math.random() * 2.5 + 0.5;
      const star = this.add.circle(x, y, size, 0xffffff, 0.3 + Math.random() * 0.4);
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: 2000 + Math.random() * 3000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000
      });
    }
  }
}
