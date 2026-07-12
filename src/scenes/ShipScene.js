import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants.js';
import { resourceManager } from '../systems/ResourceManager.js';
import { dialogueSystem } from '../systems/DialogueSystem.js';
import { soundSystem } from '../systems/SoundSystem.js';
import { safeTop } from '../mobile/safeArea.js';

export class ShipScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShipScene' });
    this.dialogueIndex = 0;
    this.chapterId = 'awakening';
  }

  create() {
    soundSystem.resume();
    const cx = GAME_WIDTH / 2;
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // 飞船内部背景
    this._drawShipInterior();

    // 玩家角色
    this.player = this.add.image(cx, GAME_HEIGHT - 260, 'player').setScale(1.8).setDepth(2);
    this.tweens.add({
      targets: this.player,
      y: GAME_HEIGHT - 265,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 地点标签 (顶部安全区域偏移)
    this.add.text(cx, safeTop() + 30, '🌌 Hail Mary · 主舱通道', {
      fontSize: '14px', fontFamily: 'monospace', color: '#556677'
    }).setOrigin(0.5);

    // 三个房间门
    this._createRoomDoor(cx - 110, 300, '🔬', '实验室', 'LabScene', '进入实验室');
    this._createRoomDoor(cx, 300, '🪨', '接触舱', 'RockyScene', '与 Rocky 对话');
    this._createRoomDoor(cx + 110, 300, '🧭', '驾驶舱', 'BridgeScene', '前往驾驶舱');

    // 对话框（开场剧情）
    this._createDialogueBox();

    // 启动 UI 层
    this.scene.launch('UIScene');

    // 显示开场对话
    this.time.delayedCall(800, () => {
      this._showNextDialogue();
    });
  }

  _drawShipInterior() {
    const bg = this.add.graphics();
    // 深色背景
    bg.fillStyle(COLORS.BG_DARK);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // 天花板
    bg.fillStyle(0x0f0f28);
    bg.fillRect(0, 0, GAME_WIDTH, 80);
    // 天花板灯条
    bg.fillStyle(COLORS.ACCENT, 0.08);
    bg.fillRect(50, 20, GAME_WIDTH - 100, 4);
    bg.fillStyle(COLORS.ACCENT, 0.04);
    bg.fillRect(50, 28, GAME_WIDTH - 100, 30);
    // 地板格线
    bg.fillStyle(COLORS.SHIP_FLOOR);
    bg.fillRect(0, GAME_HEIGHT - 180, GAME_WIDTH, 180);
    bg.lineStyle(1, 0x334466, 0.3);
    for (let x = 0; x < GAME_WIDTH; x += 60) {
      bg.lineBetween(x, GAME_HEIGHT - 180, x, GAME_HEIGHT);
    }
    // 走廊中线
    bg.lineStyle(2, COLORS.ACCENT, 0.15);
    bg.lineBetween(0, GAME_HEIGHT - 90, GAME_WIDTH, GAME_HEIGHT - 90);
    // 墙壁管线
    bg.lineStyle(1, 0x334466, 0.2);
    for (let y = 100; y < GAME_HEIGHT - 200; y += 50) {
      bg.lineBetween(10, y, 30, y);
      bg.lineBetween(GAME_WIDTH - 30, y, GAME_WIDTH - 10, y);
    }

    // 闪烁指示灯
    this.blinkLights = [];
    for (let i = 0; i < 5; i++) {
      const lx = 40 + Math.random() * (GAME_WIDTH - 80);
      const ly = 90 + Math.random() * 60;
      const light = this.add.circle(lx, ly, 2, COLORS.ACCENT, 0.6);
      this.tweens.add({
        targets: light,
        alpha: 0.1,
        duration: 800 + Math.random() * 1200,
        yoyo: true,
        repeat: -1
      });
      this.blinkLights.push(light);
    }
  }

  _createRoomDoor(x, y, emoji, label, targetScene, desc) {
    const cx = x;

    // 门
    const door = this.add.image(cx, y, 'door').setScale(0.8).setInteractive({ useHandCursor: true });
    door.setDepth(1);

    // 标签
    this.add.text(cx, y - 100, emoji, { fontSize: '28px' }).setOrigin(0.5).setDepth(2);
    this.add.text(cx, y + 90, label, {
      fontSize: '13px', fontFamily: 'monospace', color: '#aabbcc'
    }).setOrigin(0.5).setDepth(2);

    // 悬停效果
    door.on('pointerover', () => {
      door.setTint(0x334466);
      door.setScale(0.85);
    });
    door.on('pointerout', () => {
      door.clearTint();
      door.setScale(0.8);
    });
    door.on('pointerdown', () => {
      soundSystem.playClick();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.stop('UIScene');
        this.scene.start(targetScene);
      });
    });

    // 浮动提示
    const tip = this.add.text(cx, y + 105, desc, {
      fontSize: '10px', fontFamily: 'monospace', color: '#445566'
    }).setOrigin(0.5).setAlpha(0).setDepth(2);

    door.on('pointerover', () => tip.setAlpha(1));
    door.on('pointerout', () => tip.setAlpha(0));

    return door;
  }

  _createDialogueBox() {
    const dh = 140;
    this.dialogueBg = this.add.graphics().setDepth(10);
    this.dialogueBg.fillStyle(0x0a0a1a, 0.92);
    this.dialogueBg.fillRoundedRect(20, GAME_HEIGHT - dh - 20, GAME_WIDTH - 40, dh, 12);
    this.dialogueBg.lineStyle(1, COLORS.ACCENT, 0.3);
    this.dialogueBg.strokeRoundedRect(20, GAME_HEIGHT - dh - 20, GAME_WIDTH - 40, dh, 12);

    this.speakerText = this.add.text(40, GAME_HEIGHT - dh, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#00d4ff', fontStyle: 'bold'
    }).setDepth(11);

    this.dialogueText = this.add.text(40, GAME_HEIGHT - dh + 25, '', {
      fontSize: '15px', fontFamily: 'monospace', color: '#ddeeff', wordWrap: { width: GAME_WIDTH - 100 }
    }).setDepth(11);

    this.continueText = this.add.text(GAME_WIDTH - 60, GAME_HEIGHT - 45, '👇', {
      fontSize: '14px'
    }).setOrigin(0.5).setDepth(11).setAlpha(0);

    this.dialogueBg.setInteractive();
    this.dialogueBg.on('pointerdown', () => {
      this._showNextDialogue();
    });
  }

  _showNextDialogue() {
    const lines = dialogueSystem.getAllLines(this.chapterId);
    if (this.dialogueIndex >= lines.length) {
      this._hideDialogue();
      return;
    }
    const line = lines[this.dialogueIndex];
    let speakerName = '系统';
    if (line.speaker === 'grace') speakerName = 'Grace 博士';
    else if (line.speaker === 'rocky') speakerName = 'Rocky 🪨';
    else if (line.speaker === 'system') speakerName = 'Hail Mary OS';

    this.speakerText.setText(speakerName);
    this.dialogueText.setText(line.text);

    if (line.isMusic) {
      this.speakerText.setColor('#ffaa44');
      soundSystem.playRockyPhrase('greeting', 0);
    } else {
      this.speakerText.setColor('#00d4ff');
    }

    this.dialogueIndex++;
    if (this.dialogueIndex >= lines.length) {
      this.continueText.setText('✕');
    }
    this.continueText.setAlpha(1);
    this.tweens.add({
      targets: this.continueText,
      alpha: 0,
      duration: 300,
      delay: 3000
    });
  }

  _hideDialogue() {
    this.tweens.add({
      targets: [this.dialogueBg, this.speakerText, this.dialogueText, this.continueText],
      alpha: 0,
      duration: 400,
      onComplete: () => {
        this.dialogueBg.destroy();
        this.speakerText.destroy();
        this.dialogueText.destroy();
        this.continueText.destroy();
      }
    });
  }

  shutdown() {
    this.scene.stop('UIScene');
  }
}
