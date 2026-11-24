# 挽救计划 · 星际救援 (Project Hail Mary Game)

受科幻小说《挽救计划》（*Project Hail Mary*）启发的竖屏星际生存与外星声学破译手游。玩家扮演从昏迷中苏醒的 Grace 博士，在飞船上管理噬星体燃料、氧气、食物与船体耐久，并通过五声音阶频率与波江座伙伴 Rocky 建立跨物种交流、携手拯救母星。

## 核心玩法与系统

- **飞船多舱室探索**：涵盖主菜单 (`MainMenuScene`)、舰桥 (`BridgeScene`)、飞船总览 (`ShipScene`)、实验室 (`LabScene`) 与 Rocky 接触舱 (`RockyScene`)，基于 Phaser 3 渲染竖屏 (`390×844`) 交互界面。
- **五声音阶声学交流**：内置 `C4`–`C5` 六组频率色块与 Rocky 音乐短语词典（问候、好奇、开心、担忧、兴奋、感激），逐步提升翻译进度与信任等级（从「陌生人」至「家人」）。
- **生存资源管理 (`ResourceManager`)**：实时追踪噬星体燃料 (`astrophageFuel`)、氧气 (`oxygen`)、食物 (`food`) 与船体完整度 (`hullIntegrity`)，低于 `15` 触发危急警报，归零判定任务失败。
- **四章叙事推进 (`DialogueSystem`)**：包含「苏醒」「第一类接触」「星际友谊」「希望之光」四幕主线剧情。
- **跨端移动封装**：通过 Vite 打包前端产物并由 Capacitor 封装 Android / iOS 原生工程。

## 开发与构建命令

```bash
# 安装依赖
npm install

# 运行核心系统与常量不变量单元测试
npm test

# 本地开发预览
npm run dev

# 构建前端产物并同步至 Android / iOS
npm run build
npx cap sync android
npx cap sync ios
```
