import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants.js';
import { resourceManager } from '../systems/ResourceManager.js';
import { soundSystem } from '../systems/SoundSystem.js';
import { safeTop } from '../mobile/safeArea.js';

export class BridgeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BridgeScene' });
    this.trajectoryAngle = 45;
    this.targetAngle = 0;
    this.powerLevel = 50;
    this.launched = false;
    this.attempts = 0;
  }

  create() {
    soundSystem.resume();
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.trajectoryAngle = 45;
    this.powerLevel = 50;
    this.launched = false;
    this.attempts = 0;

    this._drawBackground();
    this._createTrajectoryUI();
    this._createPowerSlider();
    this._createLaunchButton();
    this._createBackButton();
    this._generateTarget();

    this.scene.launch('UIScene');
  }

  _drawBackground() {
    const bg = this.add.graphics();
    bg.fillStyle(0x080d1a);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 星空
    for (let i = 0; i < 40; i++) {
      const sx = Phaser.Math.Between(0, GAME_WIDTH);
      const sy = Phaser.Math.Between(0, 300);
      this.add.circle(sx, sy, Math.random() * 1.5 + 0.5, 0xffffff, 0.3 + Math.random() * 0.3);
    }

    this.add.text(GAME_WIDTH / 2, safeTop() + 10, '🧭 驾驶舱 · 轨迹计算', {
      fontSize: '16px', fontFamily: 'monospace', color: '#44aaff'
    }).setOrigin(0.5);

    // 坐标网格
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a2a4a, 0.2);
    for (let x = 50; x < GAME_WIDTH - 30; x += 40) {
      grid.lineBetween(x, 60, x, 330);
    }
    for (let y = 60; y < 340; y += 40) {
      grid.lineBetween(50, y, GAME_WIDTH - 30, y);
    }

    // 起飞点
    this.launchPoint = { x: 60, y: 300 };
    this.add.circle(this.launchPoint.x, this.launchPoint.y, 6, COLORS.WHITE, 0.5);
    this.add.text(this.launchPoint.x, this.launchPoint.y + 15, 'Hail Mary', {
      fontSize: '9px', fontFamily: 'monospace', color: '#556677'
    }).setOrigin(0.5);
  }

  _createTrajectoryUI() {
    // 角度显示
    this.angleText = this.add.text(GAME_WIDTH / 2, 370, '', {
      fontSize: '24px', fontFamily: 'monospace', color: '#44aaff', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.powerText = this.add.text(GAME_WIDTH / 2, 400, '', {
      fontSize: '16px', fontFamily: 'monospace', color: '#ff8844'
    }).setOrigin(0.5);

    // 轨迹预览线
    this.trajectoryLine = this.add.graphics().setDepth(2);

    this._updateTrajectory();
  }

  _createPowerSlider() {
    const sx = 80, sy = 440, sw = GAME_WIDTH - 160, sh = 30;

    // 滑轨背景
    const track = this.add.graphics().setDepth(3);
    track.fillStyle(0x111133);
    track.fillRoundedRect(sx, sy, sw, sh, 15);
    track.lineStyle(1, COLORS.ACCENT, 0.2);
    track.strokeRoundedRect(sx, sy, sw, sh, 15);

    // 滑块
    this.sliderKnob = this.add.graphics().setDepth(4);
    this.sliderKnob.fillStyle(0xff8844, 0.8);
    this.sliderKnob.fillCircle(sx + sw / 2, sy + sh / 2, 14);

    this.add.text(sx - 5, sy + sh + 8, '低功率', {
      fontSize: '10px', fontFamily: 'monospace', color: '#556677'
    });
    this.add.text(GAME_WIDTH - 85, sy + sh + 8, '高功率', {
      fontSize: '10px', fontFamily: 'monospace', color: '#556677'
    });

    // 拖拽交互
    this.sliderKnob.setInteractive(
      new Phaser.Geom.Circle(sx + sw / 2, sy + sh / 2, 25),
      Phaser.Geom.Circle.Contains
    );
    this.input.setDraggable(this.sliderKnob);

    this.sliderKnob.on('drag', (pointer, dragX) => {
      const clampedX = Phaser.Math.Clamp(dragX, sx, sx + sw);
      this.sliderKnob.clear();
      this.sliderKnob.fillStyle(0xff8844, 0.8);
      this.sliderKnob.fillCircle(clampedX, sy + sh / 2, 14);
      this.powerLevel = Math.round(((clampedX - sx) / sw) * 100);
      // 只有未发射时才更新预览
      if (!this.launched) this._updateTrajectory();
    });

    this.add.text(GAME_WIDTH / 2, sy - 20, '⬆️ 拖动调整功率 ⬆️', {
      fontSize: '10px', fontFamily: 'monospace', color: '#445566'
    }).setOrigin(0.5);
  }

  _createLaunchButton() {
    const bx = GAME_WIDTH / 2, by = 520;
    const btn = this.add.graphics().setDepth(3);
    btn.fillStyle(0xff6b35, 0.3);
    btn.fillRoundedRect(bx - 60, by - 20, 120, 40, 20);
    btn.lineStyle(2, 0xff6b35, 0.5);
    btn.strokeRoundedRect(bx - 60, by - 20, 120, 40, 20);

    this.launchText = this.add.text(bx, by, '🚀 发射', {
      fontSize: '16px', fontFamily: 'monospace', color: '#ff8844', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(4);

    btn.setInteractive(
      new Phaser.Geom.Rectangle(bx - 60, by - 20, 120, 40),
      Phaser.Geom.Rectangle.Contains
    );
    btn.on('pointerdown', () => {
      if (this.launched) return;
      this._launch();
    });
  }

  _generateTarget() {
    this.targetAngle = Phaser.Math.Between(25, 65);
    const tx = this.launchPoint.x + Math.cos((this.targetAngle - 90) * Math.PI / 180) * 250;
    const ty = this.launchPoint.y + Math.sin((this.targetAngle - 90) * Math.PI / 180) * 200;

    // 目标圆环
    const target = this.add.graphics().setDepth(1);
    target.lineStyle(2, 0xff4444, 0.6);
    target.strokeCircle(tx, ty, 15);
    target.lineStyle(1, 0xff4444, 0.3);
    target.strokeCircle(tx, ty, 25);
    target.fillStyle(0xff4444, 0.1);
    target.fillCircle(tx, ty, 10);

    // 闪烁
    this.tweens.add({
      targets: target,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    this.targetPos = { x: tx, y: ty };

    this.add.text(GAME_WIDTH - 50, 50, '🎯 目标', {
      fontSize: '11px', fontFamily: 'monospace', color: '#ff6666'
    }).setOrigin(0.5);
  }

  _updateTrajectory() {
    this.trajectoryLine.clear();
    const startX = this.launchPoint.x;
    const startY = this.launchPoint.y;
    const rad = (this.trajectoryAngle - 90) * Math.PI / 180;
    const power = this.powerLevel / 100;

    // 预览线
    this.trajectoryLine.lineStyle(2, COLORS.ACCENT, 0.4);
    this.trajectoryLine.beginPath();
    this.trajectoryLine.moveTo(startX, startY);
    for (let t = 0; t < 20; t++) {
      const dist = t * 15 * power;
      const px = startX + Math.cos(rad) * dist;
      const py = startY + Math.sin(rad) * dist + (t * t * 0.8 * (1 - power));
      this.trajectoryLine.lineTo(px, py);
    }
    this.trajectoryLine.strokePath();

    this.angleText.setText(`角度: ${this.trajectoryAngle}°`);
    this.powerText.setText(`功率: ${this.powerLevel}%`);
  }

  _launch() {
    this.launched = true;
    this.attempts++;
    soundSystem.playClick();

    const startX = this.launchPoint.x;
    const startY = this.launchPoint.y;
    const rad = (this.trajectoryAngle - 90) * Math.PI / 180;
    const power = this.powerLevel / 100;

    // 飞行粒子
    const projectile = this.add.circle(startX, startY, 5, 0xffaa44, 1).setDepth(5);
    let t = 0;

    this.time.addEvent({
      delay: 30,
      repeat: 30,
      callback: () => {
        t++;
        const dist = t * 12 * power;
        const px = startX + Math.cos(rad) * dist;
        const py = startY + Math.sin(rad) * dist + (t * t * 0.8 * (1 - power));
        projectile.x = px;
        projectile.y = py;

        // 尾焰
        if (t % 3 === 0) {
          const trail = this.add.circle(px, py, Phaser.Math.Between(2, 4), 0xff8844, 0.5);
          this.tweens.add({
            targets: trail, alpha: 0, scale: 2, duration: 400,
            onComplete: () => trail.destroy()
          });
        }
      },
      callbackScope: this
    });

    // 检测命中
    this.time.delayedCall(1200, () => {
      const dx = projectile.x - this.targetPos.x;
      const dy = projectile.y - this.targetPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      projectile.destroy();

      if (distance < 25) {
        // 完美命中
        resourceManager.add('astrophageFuel', 10);
        resourceManager.add('oxygen', 5);
        this._showResult('恭喜！轨迹计算正确！🎯', '#44ff88');
        soundSystem.playPlayerNote(4);
        soundSystem.playPlayerNote(5);
      } else if (distance < 50) {
        // 接近
        resourceManager.add('astrophageFuel', 3);
        this._showResult('接近目标，继续调整...', '#ffaa44');
      } else {
        // 偏离
        resourceManager.sub('hullIntegrity', 5);
        this._showResult('偏离目标！请重新计算轨迹', '#ff4444');
      }

      // 重置允许再次尝试
      this.time.delayedCall(1500, () => {
        this.launched = false;
        this.trajectoryAngle = Phaser.Math.Between(30, 60);
        this.powerLevel = Phaser.Math.Between(40, 60);
        this._generateTarget();
        this._updateTrajectory();
      });
    });
  }

  _showResult(text, color) {
    const resultText = this.add.text(GAME_WIDTH / 2, 340, text, {
      fontSize: '16px', fontFamily: 'monospace', color: color,
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10).setAlpha(0);

    this.tweens.add({
      targets: resultText,
      alpha: 1, y: 330,
      duration: 300
    });
    this.tweens.add({
      targets: resultText,
      alpha: 0,
      delay: 1200,
      duration: 300,
      onComplete: () => resultText.destroy()
    });
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

  update() {
    // 触摸/点击屏幕调整角度（左半屏减小，右半屏增大）
    this.input.on('pointermove', (pointer) => {
      if (!pointer.isDown || this.launched) return;
      if (pointer.x < GAME_WIDTH / 2) {
        this.trajectoryAngle = Math.max(15, this.trajectoryAngle - 0.5);
      } else {
        this.trajectoryAngle = Math.min(75, this.trajectoryAngle + 0.5);
      }
      this._updateTrajectory();
    });
  }

  shutdown() {
    this.scene.stop('UIScene');
  }
}
