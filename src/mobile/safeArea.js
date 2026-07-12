/**
 * 移动端安全区域工具
 * 检测刘海屏/灵动岛/Home Indicator 的安全边距
 * Web 端返回 0
 */

let _insets = null;

export function getSafeAreaInsets() {
  if (_insets !== null) return _insets;

  _insets = { top: 0, bottom: 0, left: 0, right: 0 };

  const style = getComputedStyle(document.documentElement);
  const parsePx = (prop) => {
    const val = style.getPropertyValue(prop);
    if (!val) return 0;
    return parseInt(val, 10) || 0;
  };

  _insets.top = parsePx('--safe-area-top');
  _insets.bottom = parsePx('--safe-area-bottom');
  _insets.left = parsePx('--safe-area-left');
  _insets.right = parsePx('--safe-area-right');

  if (_insets.top === 0 && _insets.bottom === 0) {
    const testEl = document.createElement('div');
    testEl.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);';
    document.body.appendChild(testEl);
    const cs = getComputedStyle(testEl);
    _insets.top = parseInt(cs.paddingTop, 10) || 0;
    _insets.bottom = parseInt(cs.paddingBottom, 10) || 0;
    _insets.left = parseInt(cs.paddingLeft, 10) || 0;
    _insets.right = parseInt(cs.paddingRight, 10) || 0;
    document.body.removeChild(testEl);
  }

  return _insets;
}

export function safeTop() {
  return Math.max(getSafeAreaInsets().top, 20);
}

export function safeBottom() {
  return Math.max(getSafeAreaInsets().bottom, 0);
}
