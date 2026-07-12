/**
 * 移动端资源生成脚本
 * 将 SVG 图标/启动画面转换为 PNG 并生成所有平台尺寸
 * 用法: node scripts/generate-assets.mjs
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

async function main() {
  console.log('🎨 生成 App 图标 & 启动画面...\n');

  // 使用 sharp 转换 SVG → PNG
  try {
    const sharp = (await import('sharp')).default;

    // 图标: 1024x1024
    console.log('  → 生成 icon.png (1024x1024)...');
    await sharp(join(root, 'resources/icon.svg'))
      .resize(1024, 1024)
      .png()
      .toFile(join(root, 'resources/icon.png'));

    // 启动画面: 2732x2732
    console.log('  → 生成 splash.png (2732x2732)...');
    await sharp(join(root, 'resources/splash.svg'))
      .resize(2732, 2732)
      .png()
      .toFile(join(root, 'resources/splash.png'));

    console.log('  ✅ PNG 导出完成\n');
  } catch (e) {
    console.error('  ❌ sharp 转换失败:', e.message);
    console.log('  ⚠️  请手动将 resources/icon.svg 和 splash.svg 导出为 PNG');
    console.log('     或使用在线工具: https://cloudconvert.com/svg-to-png\n');
    return;
  }

  // 使用 @capacitor/assets 生成全部平台尺寸
  console.log('  → 生成 iOS/Android 全尺寸资源...');
  try {
    execSync('npx capacitor-assets generate --iconBackgroundColor "#0a0a1a" --splashBackgroundColor "#0a0a1a"', {
      cwd: root,
      stdio: 'inherit'
    });
    console.log('  ✅ 全部平台资源生成完成!\n');
  } catch (e) {
    console.log('  ⚠️  capacitor-assets 执行失败，请手动运行:');
    console.log('     npx capacitor-assets generate\n');
  }

  console.log('📱 资源生成流程结束。');
  console.log('   如需在 Xcode 中查看，运行: npm run open:ios');
  console.log('   如需在 Android Studio 中查看，运行: npm run open:android');
}

main().catch(console.error);
