import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, PENTATONIC_NOTES, ROCKY_PHRASES } from '../utils/constants.js';
import { resourceManager } from '../systems/ResourceManager.js';
import { soundSystem } from '../systems/SoundSystem.js';
import { safeTop, safeBottom } from '../mobile/safeArea.js';

export class RockyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RockyScene' });
    this.playerSequence = [];
    this.selectedPhrase = null;
    this.isRockySpeaking = false;
    this.score = 0;
    this.round = 0;
    this.targetPhrase = null;
  }

  create() {
    soundSystem.resume();
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.playerSequence = [];
    this.score = 0;
    this.round = 0;

    this._drawBackground();
    this._createRockyCharacter();
    this._createNoteKeyboard();
    this._createDialoguePanel();
    this._createTranslationBar();
    this._createBackButton();

    // 启动 UI
    this.scene.launch('UIScene');

    // Rocky 首次问候
    this.time.delayedCall(1000, () => {
      this._rockySpeak('greeting');
    });
  }

  _drawBackground() {
    const bg = this.add.graphics();
    // 接触舱背景 - 暖色调暗示外星环境
    bg.fillStyle(0x0a0d18);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // 隔断玻璃
    bg.fillStyle(COLORS.ACCENT, 0.06);
    bg.fillRect(0, 200, GAME_WIDTH, 2);
    bg.fillStyle(COLORS.ACCENT, 0.03);
    bg.fillRect(0, 202, GAME_WIDTH, 80);
    // 玻璃反光
    bg.lineStyle(1, COLORS.ACCENT, 0.1);
    for (let x = 0; x < GAME_WIDTH; x += 80) {
      bg.lineBetween(x, 210, x + 40, 260);
    }

    // 标签 (顶部安全区域偏移)
    this.add.text(GAME_WIDTH / 2, safeTop() + 10, '✨ 接触舱 · Rocky', {
      fontSize: '16px', fontFamily: 'monospace', color: '#ffaa44'
    }).setOrigin(0.5);
  }

  _createRockyCharacter() {
    this.rocky = this.add.image(GAME_WIDTH / 2, 140, 'rocky').setScale(2.2).setDepth(2);

    // Rocky 的持续浮动动画
    this.tweens.add({
      targets: this.rocky,
      y: 148,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 语调波纹（Rocky 说话时显示）
    this.rockyRipples = [];
  }

  _createNoteKeyboard() {
    // 在安全区域底边上方留空间
    const startY = GAME_HEIGHT - 290 - safeBottom();
    const noteSize = 54;
    const spacing = 10;
    const totalW = PENTATONIC_NOTES.length * noteSize + (PENTATONIC_NOTES.length - 1) * spacing;
    const startX = (GAME_WIDTH - totalW) / 2;

    // 键盘背景
    const kbBg = this.add.graphics().setDepth(3);
    kbBg.fillStyle(0x0d0d1f, 0.85);
    kbBg.fillRoundedRect(startX - 10, startY - 10, totalW + 20, noteSize + 20, 14);

    this.noteButtons = [];
    PENTATONIC_NOTES.forEach((note, i) => {
      const bx = startX + i * (noteSize + spacing) + noteSize / 2;
      const by = startY + noteSize / 2;

      const btn = this.add.image(bx, by, 'note-btn-' + i)
        .setInteractive({ useHandCursor: true })
        .setDepth(4)
        .setScale(0.95);

      // 音符标签
      const label = this.add.text(bx, by + 2, note.label, {
        fontSize: '13px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(5);

      // 按下弹跳 + 播放音符
      btn.on('pointerdown', () => {
        if (this.isRockySpeaking) return;
        this.tweens.add({
          targets: [btn, label],
          scaleX: 0.75, scaleY: 0.75,
          duration: 80,
          yoyo: true,
          onComplete: () => { btn.setScale(0.95); label.setScale(1); }
        });
        this._onNotePlayed(i, bx, by);
      });

      // 悬浮放大
      btn.on('pointerover', () => { btn.setScale(1.05); });
      btn.on('pointerout', () => { btn.setScale(0.95); });

      this.noteButtons.push(btn);
    });

    // 提示文本
    this.hintText = this.add.text(GAME_WIDTH / 2, startY - 18, '🎵 点击音符与 Rocky 对话', {
      fontSize: '11px', fontFamily: 'monospace', color: '#556677'
    }).setOrigin(0.5).setDepth(5);

    // 已演奏序列显示
    this.sequenceDisplay = this.add.text(GAME_WIDTH / 2, startY - 38, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffcc66'
    }).setOrigin(0.5).setDepth(5);
  }

  _onNotePlayed(noteIndex, x, y) {
    soundSystem.playPlayerNote(noteIndex);
    this.playerSequence.push(noteIndex);

    // 更新序列显示
    const noteNames = this.playerSequence.map(i => PENTATONIC_NOTES[i].label);
    this.sequenceDisplay.setText(noteNames.join(' '));

    // 视觉波纹
    this._showNoteRipple(x, y, PENTATONIC_NOTES[noteIndex].color);

    // 限制序列长度
    if (this.playerSequence.length > 8) {
      this.playerSequence.shift();
    }

    // 检查匹配
    this._checkMatch();
  }

  _showNoteRipple(x, y, color) {
    const ripple = this.add.circle(x, y, 10, color, 0.4).setDepth(3);
    this.tweens.add({
      targets: ripple,
      radius: 40, alpha: 0,
      duration: 500,
      onComplete: () => ripple.destroy()
    });
  }

  _rockySpeak(phraseKey) {
    this.isRockySpeaking = true;
    const phrase = ROCKY_PHRASES[phraseKey];
    if (!phrase) { this.isRockySpeaking = false; return; }
    this.targetPhrase = phraseKey;

    // 播放 Rocky 音效
    const totalDuration = soundSystem.playRockyPhrase(phraseKey, 0);
    const totalMs = totalDuration || 1500;

    // Rocky 震动动画
    this._animateRockySpeaking(totalMs);

    // 显示 Rocky 说的话
    this._showRockyDialogue(phrase.text);

    // Rocky 的视觉波纹
    phrase.notes.forEach((noteIdx, i) => {
      const delay = phrase.rhythm.slice(0, i).reduce((a, b) => a + b, 0);
      this.time.delayedCall(delay + 100, () => {
        const rx = this.rocky.x + Phaser.Math.Between(-15, 15);
        const ry = this.rocky.y + Phaser.Math.Between(-10, 10);
        this._showRockyRipple(rx, ry, PENTATONIC_NOTES[noteIdx].color);
      });
    });

    this.time.delayedCall(totalMs + 200, () => {
      this.isRockySpeaking = false;
    });
  }

  _animateRockySpeaking(duration) {
    this.tweens.add({
      targets: this.rocky,
      scaleX: 2.4, scaleY: 2.1,
      duration: 120,
      yoyo: true,
      repeat: Math.floor(duration / 240)
    });
    // 眼睛发光
    this.tweens.add({
      targets: this.rocky,
      tint: 0xffccaa,
      duration: 150,
      yoyo: true,
      repeat: Math.floor(duration / 300)
    });
  }

  _showRockyRipple(x, y, color) {
    const ripple = this.add.circle(x, y, 8, color, 0.5).setDepth(2);
    this.tweens.add({
      targets: ripple,
      scaleX: 3, scaleY: 3, alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => ripple.destroy()
    });
  }

  _showRockyDialogue(text) {
    if (this.rockyText) this.rockyText.destroy();
    this.rockyText = this.add.text(GAME_WIDTH / 2, 195, text, {
      fontSize: '15px', fontFamily: 'monospace', color: '#ffcc88',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(6).setAlpha(0);

    this.tweens.add({
      targets: this.rockyText,
      alpha: 1, y: 190,
      duration: 300
    });
  }

  _checkMatch() {
    if (this.playerSequence.length < 3) return;

    // 检查与 Rocky 上次短语的相似度
    if (!this.targetPhrase) return;
    const targetNotes = ROCKY_PHRASES[this.targetPhrase].notes;

    // 简单匹配：检查最后几个音符是否与目标序列的子序列匹配
    const lastN = this.playerSequence.slice(-targetNotes.length);
    let matches = 0;
    for (let j = 0; j < Math.min(lastN.length, targetNotes.length); j++) {
      if (lastN[j] === targetNotes[j]) matches++;
    }
    const matchRate = matches / Math.min(lastN.length, targetNotes.length);

    if (matchRate >= 0.6) {
      // 匹配成功
      this.score += Math.floor(matchRate * 20);
      this.round++;
      resourceManager.add('rockyTrust', matchRate >= 0.8 ? 5 : 3);
      resourceManager.add('translationProgress', matchRate >= 0.8 ? 8 : 4);

      this._showMatchEffect(matchRate >= 0.8 ? '完美共鸣！✨' : '部分理解 🤝');

      // Rocky 回应
      const responses = ['happy', 'excited', 'grateful', 'curious'];
      const response = responses[this.round % responses.length];
      this.time.delayedCall(600, () => {
        this._rockySpeak(response);
      });

      // 清除玩家序列
      this.playerSequence = [];
      this.sequenceDisplay.setText('');
    }
  }

  _showMatchEffect(text) {
    const flash = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, text, {
      fontSize: '22px', fontFamily: 'monospace', color: '#44ff88',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(10);

    this.tweens.add({
      targets: flash,
      y: GAME_HEIGHT / 2 - 140, alpha: 0,
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => flash.destroy()
    });

    // 信任度 + 翻译进度增加时播放庆祝音
    soundSystem.playClick();
  }

  _createDialoguePanel() {
    const panel = this.add.graphics().setDepth(5);
    panel.fillStyle(0x0a0a1a, 0.85);
    panel.fillRoundedRect(15, 280, GAME_WIDTH - 30, 70, 10);
    panel.lineStyle(1, COLORS.ACCENT, 0.2);
    panel.strokeRoundedRect(15, 280, GAME_WIDTH - 30, 70, 10);

    this.dialogueLabel = this.add.text(GAME_WIDTH / 2, 295, 'Rocky 正在倾听...', {
      fontSize: '12px', fontFamily: 'monospace', color: '#667788'
    }).setOrigin(0.5).setDepth(6);

    this.matchLabel = this.add.text(GAME_WIDTH / 2, 320, '尝试模仿 Rocky 的音符节奏 🎵', {
      fontSize: '11px', fontFamily: 'monospace', color: '#556677'
    }).setOrigin(0.5).setDepth(6);
  }

  _createTranslationBar() {
    const barX = 30, barY = 250, barW = GAME_WIDTH - 60, barH = 14;
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(0x111133);
    g.fillRoundedRect(barX, barY, barW, barH, 7);

    this.transBar = this.add.graphics().setDepth(6);
    const trust = resourceManager.getTrustLevel();
    this.add.text(barX + 5, barY - 18, `信任: ${trust.emoji} ${trust.name}`, {
      fontSize: '11px', fontFamily: 'monospace', color: '#8b7355'
    }).setDepth(6);

    this.transText = this.add.text(GAME_WIDTH - 35, barY - 18, `${resourceManager.getTranslationPercent()}%`, {
      fontSize: '11px', fontFamily: 'monospace', color: '#44ff88'
    }).setOrigin(1, 0).setDepth(6);

    this._updateTranslateBar();
  }

  _updateTranslateBar() {
    if (!this.transBar) return;
    this.transBar.clear();
    const barX = 30, barY = 250, barW = GAME_WIDTH - 60, barH = 14;
    const pct = resourceManager.getTranslationPercent() / 100;
    this.transBar.fillStyle(0x44ff88, 0.8);
    this.transBar.fillRoundedRect(barX, barY, barW * pct, barH, 7);
    if (this.transText) {
      this.transText.setText(`${resourceManager.getTranslationPercent()}%`);
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

  update(time, delta) {
    this._updateTranslateBar();
    // 更新对话提示
    if (this.dialogueLabel) {
      if (this.isRockySpeaking) {
        this.dialogueLabel.setText('Rocky 正在说话... 🪨');
      } else {
        this.dialogueLabel.setText('Rocky 正在倾听... 👂');
      }
    }
  }

  shutdown() {
    this.scene.stop('UIScene');
  }
}
