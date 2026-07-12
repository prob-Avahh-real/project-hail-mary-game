import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants.js';
import { resourceManager } from '../systems/ResourceManager.js';
import { soundSystem } from '../systems/SoundSystem.js';
import { safeTop, safeBottom } from '../mobile/safeArea.js';

export class LabScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LabScene' });
    this.score = 0;
    this.level = 1;
    this.targetMixture = null;
    this.currentMixture = [];
    this.isAnimating = false;
  }

  create() {
    soundSystem.resume();
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.score = 0;
    this.level = 1;
    this.currentMixture = [];
    this.isAnimating = false;

    this._drawBackground();
    this._createMixTable();
    this._createElementButtons();
    this._createBackButton();
    this._generatePuzzle();

    this.scene.launch('UIScene');
  }

  _drawBackground() {
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0f1e);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // 实验室网格
    bg.lineStyle(1, 0x1a2040, 0.2);
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      bg.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }

    this.add.text(GAME_WIDTH / 2, safeTop() + 10, '🔬 实验室 · 能量藻合成', {
      fontSize: '16px', fontFamily: 'monospace', color: '#44ff88'
    }).setOrigin(0.5);
  }

  _createMixTable() {
    const cx = GAME_WIDTH / 2;
    const cy = 280;

    // 烧瓶
    this.flask = this.add.graphics().setDepth(3);
    this._drawFlask(cx, cy);

    // 目标提示
    this.targetText = this.add.text(cx, cy - 100, '', {
      fontSize: '14px', fontFamily: 'monospace', color: '#ffcc44',
      wordWrap: { width: GAME_WIDTH - 80 },
      align: 'center'
    }).setOrigin(0.5).setDepth(3);

    // 当前混合物显示
    this.mixText = this.add.text(cx, cy + 20, '', {
      fontSize: '11px', fontFamily: 'monospace', color: '#88aacc'
    }).setOrigin(0.5).setDepth(3);

    // 分数
    this.scoreText = this.add.text(GAME_WIDTH - 40, 60, '0', {
      fontSize: '18px', fontFamily: 'monospace', color: '#44ff88'
    }).setOrigin(1, 0).setDepth(3);
  }

  _drawFlask(cx, cy) {
    this.flask.clear();
    this.flask.fillStyle(0x112244, 0.3);
    this.flask.fillRoundedRect(cx - 30, cy - 40, 60, 80, { tl: 5, tr: 5, bl: 20, br: 20 });
    this.flask.lineStyle(2, COLORS.ACCENT, 0.3);
    this.flask.strokeRoundedRect(cx - 30, cy - 40, 60, 80, { tl: 5, tr: 5, bl: 20, br: 20 });
    // 瓶颈
    this.flask.fillStyle(0x112244, 0.2);
    this.flask.fillRect(cx - 8, cy - 55, 16, 20);
    this.flask.lineStyle(2, COLORS.ACCENT, 0.3);
    this.flask.strokeRect(cx - 8, cy - 55, 16, 20);

    // 液面
    if (this.currentMixture.length > 0) {
      const liquidH = Math.min(this.currentMixture.length * 12, 60);
      const avgColor = this._getMixColor();
      this.flask.fillStyle(avgColor, 0.6);
      this.flask.fillRoundedRect(cx - 26, cy + 40 - liquidH, 52, liquidH, { tl: 3, tr: 3, bl: 16, br: 16 });
    }
  }

  _getMixColor() {
    const colors = [0xff6666, 0xffaa44, 0x44ff44, 0x44aaff, 0xcc66ff];
    if (this.currentMixture.length === 0) return 0x113344;
    let r = 0, g = 0, b = 0;
    this.currentMixture.forEach(idx => {
      const c = colors[idx % colors.length];
      r += (c >> 16) & 0xff;
      g += (c >> 8) & 0xff;
      b += c & 0xff;
    });
    const n = this.currentMixture.length;
    return (Math.floor(r / n) << 16) | (Math.floor(g / n) << 8) | Math.floor(b / n);
  }

  _createElementButtons() {
    const elements = [
      { name: '氢', symbol: 'H', color: 0xff6666 },
      { name: '碳', symbol: 'C', color: 0xffaa44 },
      { name: '氮', symbol: 'N', color: 0x44ff44 },
      { name: '氧', symbol: 'O', color: 0x44aaff },
      { name: '磷', symbol: 'P', color: 0xcc66ff }
    ];

    const startY = GAME_HEIGHT - 200 - safeBottom();
    const btnW = 60, spacing = 12;
    const totalW = elements.length * btnW + (elements.length - 1) * spacing;
    const startX = (GAME_WIDTH - totalW) / 2;

    elements.forEach((el, i) => {
      const bx = startX + i * (btnW + spacing) + btnW / 2;
      const by = startY + 30;

      const btn = this.add.graphics().setDepth(3);
      btn.fillStyle(el.color, 0.3);
      btn.fillRoundedRect(bx - btnW / 2, by - 25, btnW, 50, 10);
      btn.lineStyle(2, el.color, 0.6);
      btn.strokeRoundedRect(bx - btnW / 2, by - 25, btnW, 50, 10);

      const symbolText = this.add.text(bx, by - 5, el.symbol, {
        fontSize: '18px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(4);

      const nameText = this.add.text(bx, by + 14, el.name, {
        fontSize: '10px', fontFamily: 'monospace', color: '#aabbcc'
      }).setOrigin(0.5).setDepth(4);

      btn.setInteractive(
        new Phaser.Geom.Rectangle(bx - btnW / 2, by - 25, btnW, 50),
        Phaser.Geom.Rectangle.Contains
      );

      btn.on('pointerdown', () => {
        if (this.isAnimating) return;
        soundSystem.playClick();
        this._addElement(i);
      });
    });

    // 清空按钮
    const clearX = GAME_WIDTH / 2, clearY = startY + 100;
    const clearBtn = this.add.graphics().setDepth(3);
    clearBtn.fillStyle(0xff4444, 0.2);
    clearBtn.fillRoundedRect(clearX - 50, clearY - 18, 100, 36, 18);
    clearBtn.lineStyle(1, 0xff4444, 0.4);
    clearBtn.strokeRoundedRect(clearX - 50, clearY - 18, 100, 36, 18);

    this.add.text(clearX, clearY, '🔄 清空', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ff8888'
    }).setOrigin(0.5).setDepth(4);

    clearBtn.setInteractive(
      new Phaser.Geom.Rectangle(clearX - 50, clearY - 18, 100, 36),
      Phaser.Geom.Rectangle.Contains
    );
    clearBtn.on('pointerdown', () => {
      if (this.isAnimating) return;
      this.currentMixture = [];
      this._updateFlask();
      soundSystem.playClick();
    });
  }

  _addElement(index) {
    this.currentMixture.push(index);
    if (this.currentMixture.length > 8) {
      this.currentMixture.shift();
    }
    this._updateFlask();

    // 自动检测匹配
    if (this.currentMixture.length >= 3) {
      this._checkPuzzle();
    }
  }

  _updateFlask() {
    this._drawFlask(GAME_WIDTH / 2, 280);
    const symbols = this.currentMixture.map(i => ['H', 'C', 'N', 'O', 'P'][i % 5]);
    this.mixText.setText(symbols.join(' + ') || '空');
  }

  _generatePuzzle() {
    const targets = [
      { elements: [0, 3, 0], name: '水分子 (H₂O)', hint: '合成水：H + O + H' },
      { elements: [1, 3, 3], name: '二氧化碳 (CO₂)', hint: '合成CO₂：C + O + O' },
      { elements: [0, 2, 2, 2], name: '氨 (NH₃)', hint: '合成氨：N + H + H + H' },
      { elements: [0, 3, 3, 0], name: '过氧化氢 (H₂O₂)', hint: '合成H₂O₂：H + O + O + H' },
      { elements: [1, 3, 1, 3], name: '碳循环催化', hint: '交替C和O：C + O + C + O' }
    ];

    this.targetMixture = targets[this.level - 1] || targets[0];
    this.targetText.setText(`🎯 目标：${this.targetMixture.name}\n${this.targetMixture.hint}`);

    // 提升难度提示
    if (this.level > 1) {
      this.targetText.setColor('#ff8844');
    }
  }

  _checkPuzzle() {
    if (this.isAnimating) return;
    const target = this.targetMixture.elements;
    const lastN = this.currentMixture.slice(-target.length);

    if (lastN.length === target.length && lastN.every((v, i) => v === target[i])) {
      this.isAnimating = true;
      this.score += 10 * this.level;
      this.scoreText.setText(String(this.score));

      // 资源奖励
      resourceManager.add('astrophageFuel', 5);
      resourceManager.add('oxygen', 3);

      // 成功特效
      this._showSuccessEffect();

      soundSystem.playPlayerNote(3);
      soundSystem.playPlayerNote(5);

      this.time.delayedCall(1500, () => {
        this.level++;
        if (this.level > 5) {
          this.level = 1;
          this.score += 30;
        }
        this.currentMixture = [];
        this._updateFlask();
        this.isAnimating = false;
        this._generatePuzzle();
      });
    }
  }

  _showSuccessEffect() {
    const cx = GAME_WIDTH / 2, cy = 280;
    for (let i = 0; i < 12; i++) {
      const particle = this.add.circle(
        cx + Phaser.Math.Between(-30, 30),
        cy + Phaser.Math.Between(-30, 30),
        Phaser.Math.Between(2, 6),
        0x44ff88,
        0.8
      ).setDepth(5);

      this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(40, 100),
        x: particle.x + Phaser.Math.Between(-30, 30),
        alpha: 0,
        duration: 800,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }

  _createBackButton() {
    const backBtn = this.add.text(30, safeTop() + 20, '← 返回主舱', {
      fontSize: '13px', fontFamily: 'monospace', color: '#667788'
    }).setInteractive({ useHandCursor: true }).setDepth(10);

    backBtn.on('pointerover', () => backBtn.setColor('#aabbcc'));
    backBtn.on('pointerout', () => backBtn.setColor('#667788'));
    backBtn.on('pointerdown', () => {
      soundSystem.playClick();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.stop('UIScene');
        this.scene.start('ShipScene');
      });
    });
  }

  shutdown() {
    this.scene.stop('UIScene');
  }
}
