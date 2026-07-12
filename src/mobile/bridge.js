/**
 * Capacitor 原生桥接层
 * 在移动端提供触觉反馈、状态栏控制、启动画面管理
 * Web 端自动降级为 no-op
 */

let Haptics = null;
let StatusBar = null;
let SplashScreen = null;
let isNative = false;

async function initNative() {
  try {
    const cap = await import('@capacitor/core');
    if (!cap.Capacitor.isNativePlatform()) {
      console.log('[MobileBridge] Running in web mode');
      return;
    }
    isNative = true;
    console.log('[MobileBridge] Native platform detected:', cap.Capacitor.getPlatform());

    // 动态加载原生插件 (web 端无对应原生实现会自动降级)
    try { Haptics = (await import('@capacitor/haptics')).Haptics; } catch (e) { /* no-op */ }
    try { StatusBar = (await import('@capacitor/status-bar')).StatusBar; } catch (e) { /* no-op */ }
    try { SplashScreen = (await import('@capacitor/splash-screen')).SplashScreen; } catch (e) { /* no-op */ }

    // 设置状态栏
    if (StatusBar) {
      await StatusBar.setStyle({ style: 'DARK' });
      await StatusBar.setBackgroundColor({ color: '#0a0a1a' });
      await StatusBar.hide();
    }

    // 隐藏启动画面
    if (SplashScreen) {
      await SplashScreen.hide();
    }

  } catch (e) {
    console.log('[MobileBridge] Capacitor not available, running in browser');
  }
}

/** 轻触反馈 - 用于按钮点击 */
export async function hapticLight() {
  if (!isNative || !Haptics) return;
  try {
    await Haptics.impact({ style: 'LIGHT' });
  } catch (e) { /* silent */ }
}

/** 中等触觉 - 用于 Rocky 音符按下 */
export async function hapticMedium() {
  if (!isNative || !Haptics) return;
  try {
    await Haptics.impact({ style: 'MEDIUM' });
  } catch (e) { /* silent */ }
}

/** 重触觉 - 用于匹配成功/庆祝 */
export async function hapticHeavy() {
  if (!isNative || !Haptics) return;
  try {
    await Haptics.notification({ type: 'SUCCESS' });
  } catch (e) { /* silent */ }
}

/** Rocky 说话时的振动模式 */
export async function hapticRockySpeak(duration = 300) {
  if (!isNative || !Haptics) return;
  try {
    await Haptics.vibrate({ duration });
  } catch (e) { /* silent */ }
}

/** 获取是否是原生平台 */
export function getIsNative() {
  return isNative;
}

export { initNative, isNative };
