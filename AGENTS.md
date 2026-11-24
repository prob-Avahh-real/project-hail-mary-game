# 挽救计划 (project-hail-mary-game)

《Project Hail Mary》主题星际救援手机游戏。Capacitor 包装 Vite 前端。

## 用途与 Target 判定

| 平台 | 需要? | 方式 |
|------|-------|------|
| 移动端 | 需要 | Capacitor Android / iOS |
| 智能硬件 | 可选 | 未做；不纳入强制 Done |

## 命令

```bash
npm test
npm run build
npx cap sync android
```

无 `test` 脚本时先补 Sensor，禁止把构建成功当成测试绿。

## Harness / Loop（助手）

- Guide = 本文件；Sensor = `npm test` + `npm run build` + `npx cap sync android`
- 同类失误第二次 → 规则或测试（棘轮）

## 验证环 / Done

```bash
npm test
npm run build
npx cap sync android
```

**Done**：web 产物可同步进 Android/iOS 工程。可选穿戴未做可搁置。
