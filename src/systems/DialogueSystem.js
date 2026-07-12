class DialogueSystem {
  constructor() {
    this.currentChapter = 0;
    this.chapters = [
      {
        id: 'awakening',
        title: '第一章：苏醒',
        lines: [
          { speaker: 'system', text: '【系统启动中...】' },
          { speaker: 'system', text: '船员生命体征：正常' },
          { speaker: 'system', text: '任务日志：第 473 天' },
          { speaker: 'grace', text: '我...在哪？我是谁？' },
          { speaker: 'system', text: '欢迎回来，Grace 博士。' },
          { speaker: 'system', text: '你的任务是拯救地球。' },
          { speaker: 'grace', text: '我必须找到挽救的办法...' }
        ]
      },
      {
        id: 'first_contact',
        title: '第二章：第一类接触',
        lines: [
          { speaker: 'system', text: '检测到未知飞船信号。' },
          { speaker: 'system', text: '信号模式：音乐频率序列' },
          { speaker: 'grace', text: '音乐？这是...语言？' },
          { speaker: 'rocky', text: '♪♫♪♫♪', isMusic: true },
          { speaker: 'grace', text: '它在和我们说话！' }
        ]
      },
      {
        id: 'friendship',
        title: '第三章：星际友谊',
        lines: [
          { speaker: 'rocky', text: '♫♪♫♪♫', isMusic: true },
          { speaker: 'grace', text: '我们开始能互相理解了。' },
          { speaker: 'grace', text: '它叫Rocky，来自波江座。' },
          { speaker: 'rocky', text: '♪♫♪ (朋友)', isMusic: true },
          { speaker: 'grace', text: '是的，朋友。' }
        ]
      },
      {
        id: 'solution',
        title: '第四章：希望之光',
        lines: [
          { speaker: 'grace', text: '能量藻可以作为地球的能源！' },
          { speaker: 'rocky', text: '♫♫♪♫♫♪', isMusic: true },
          { speaker: 'grace', text: '我们成功了！' },
          { speaker: 'system', text: '轨迹计算完成。燃料充足。' },
          { speaker: 'grace', text: '回家了，带你去看看地球。' }
        ]
      }
    ];
  }

  getChapter(id) {
    return this.chapters.find(c => c.id === id) || this.chapters[0];
  }

  getNextLine(chapterId, currentLineIndex) {
    const chapter = this.getChapter(chapterId);
    if (currentLineIndex < chapter.lines.length) {
      return chapter.lines[currentLineIndex];
    }
    return null;
  }

  getAllLines(chapterId) {
    const chapter = this.getChapter(chapterId);
    return chapter.lines;
  }
}

export const dialogueSystem = new DialogueSystem();
