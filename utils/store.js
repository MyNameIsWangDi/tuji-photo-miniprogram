// 主题存储：5 套主题与「暗房修图台」设计规范一一对应
const STORAGE_KEY = 'tuji_theme';

const THEMES = [
  { key: 'darkroom', label: '暗房黑', desc: '默认 · 深色中性', swatch: '#070708' },
  { key: 'morning', label: '晨光白', desc: '明亮 · 适合白天户外', swatch: '#FAFAF7' },
  { key: 'film', label: '胶片暖', desc: '暖调 · 低对比度', swatch: '#16120E' },
  { key: 'green', label: '青野', desc: '冷绿 · 户外出行主题', swatch: '#0C1310' },
  { key: 'jade', label: '墨玉灰', desc: '中性灰 · 柔和过渡', swatch: '#17181B' },
];

function getTheme() {
  return wx.getStorageSync(STORAGE_KEY) || 'darkroom';
}

function setTheme(key) {
  wx.setStorageSync(STORAGE_KEY, key);
}

module.exports = { THEMES, getTheme, setTheme };
