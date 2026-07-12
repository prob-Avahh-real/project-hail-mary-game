import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants.js';
import { resourceManager } from '../systems/ResourceManager.js';
import { safeBottom } from '../mobile/safeArea.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this._createResourceBars();
    this._createCriticalWarning();
  }

  _createResourceBars() {
    // 在安全区域底边上方留出空间 (Home Indicator)
    const bottomOffset = safeBottom() + 8;
    const startY = GAME_HEIGHT - 56 - bottomOffset;
    const barH = 10;
    const gap = 4;

    const resources = [
      { key: 'astrophageFuel', label: '⚡燃料', color: 0xff8844, colorStr: '#ff8844' },
      { key: 'oxygen', label: '🫁氧气', color: 0x44aaff, colorStr: '#44aaff' },
      { key: 'food', label: '🍖食物', color: 0x44ff44, colorStr: '#44ff44' },
      { key: 'hullIntegrity', label: '🛡️船体', color: 0xcc66ff, colorStr: '#cc66ff' }
    ];

    this.resourceBars = [];

    resources.forEach((res, i) => {
      const y = startY + i * (barH + gap + 12);
      const barW = 80;
      const x = 8;

      // 标签
      const label = this.add.text(x, y, res.label, {
        fontSize: '9px', fontFamily: 'monospace', color: res.colorStr
      }).setDepth(10);

      // 背景条
      const bgBar = this.add.graphics().setDepth(10);
      bgBar.fillStyle(0x111133, 0.8);
      bgBar.fillRoundedRect(x + 42, y + 2, barW, barH, 3);

      // 前景条
      const fgBar = this.add.graphics().setDepth(11);

      this.resourceBars.push({
        key: res.key,
        fgBar,
        bgBar,
        label,
        x: x + 42,
        y: y + 2,
        w: barW,
        h: barH,
        color: res.color
      });
    });

    this._updateBars();
  }

  _createCriticalWarning() {
    this.warningText = this.add.text(GAME_WIDTH / 2, 90, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ff4444',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(12).setAlpha(0);
  }

  _updateBars() {
    this.resourceBars.forEach(bar => {
      const val = resourceManager.get(bar.key) / 100;
      bar.fgBar.clear();

      let color = bar.color;
      if (val < 0.15) color = 0xff4444;
      else if (val < 0.3) color = 0xff8844;

      bar.fgBar.fillStyle(color, 0.9);
      bar.fgBar.fillRoundedRect(bar.x, bar.y, bar.w * val, bar.h, 3);
    });
  }

  update() {
    this._updateBars();

    // 检查危急状态
    if (resourceManager.isCritical() && !this._wasCritical) {
      this._wasCritical = true;
      this.warningText.setText('⚠️ 资源危急！');
      this.warningText.setAlpha(1);
      this.tweens.add({
        targets: this.warningText,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: 5,
        onComplete: () => {
          this.warningText.setAlpha(0);
          this._wasCritical = false;
        }
      });
    }

    // 游戏结束检查
    if (resourceManager.isGameOver()) {
      this.scene.pause();
      this._showGameOver();
    }
  }

  _showGameOver() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const overlay = this.add.graphics().setDepth(20);
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add.text(cx, cy - 40, '💀 任务失败', {
      fontSize: '32px', fontFamily: 'monospace', color: '#ff4444',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(21);

    this.add.text(cx, cy + 10, '资源耗尽，无法继续航行', {
      fontSize: '14px', fontFamily: 'monospace', color: '#8899aa'
    }).setOrigin(0.5).setDepth(21);

    const restartBtn = this.add.text(cx, cy + 60, '🔄 重新开始', {
      fontSize: '16px', fontFamily: 'monospace', color: '#44ff88',
      backgroundColor: '#112233', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });

    restartBtn.on('pointerdown', () => {
      resourceManager.reset();
      this.scene.stop();
      this.game.scene.stop('ShipScene');
      this.game.scene.stop('RockyScene');
      this.game.scene.stop('LabScene');
      this.game.scene.stop('BridgeScene');
      this.game.scene.start('MainMenuScene');
    });
  }
}
