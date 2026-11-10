const store = require('../../utils/store');

const TEMPLATES = [
  { name: '暮色电影感', tag: '滤镜 · 暖阳', swatch: '#C8A879' },
  { name: '城市夜行', tag: '滤镜 · 清冷', swatch: '#6B7A8F' },
  { name: '海边日落', tag: '滤镜 · 蜜桃', swatch: '#E89C7C' },
  { name: '晨间手记', tag: '水印 · 右下', swatch: '#B8B09A' },
  { name: '青绿假日', tag: '滤镜 · 青柠', swatch: '#8FAF8E' },
  { name: '夜色霓虹', tag: '滤镜 · 浓郁', swatch: '#9C6B8F' },
];

const CATS = ['精选', '调色', '拼图', '水印'];

Page({
  data: {
    theme: 'darkroom',
    themes: store.THEMES,
    cats: CATS,
    category: 0,
    templates: TEMPLATES,
  },

  onShow() {
    this.setData({ theme: store.getTheme() });
  },

  pickCategory(e) {
    this.setData({ category: Number(e.currentTarget.dataset.i) });
  },

  pickTheme(e) {
    const key = e.currentTarget.dataset.key;
    store.setTheme(key);
    this.setData({ theme: key });
    wx.showToast({ title: '已应用主题', icon: 'none' });
  },

  useTemplate(e) {
    wx.showToast({ title: `已使用「${e.currentTarget.dataset.name}」`, icon: 'none' });
  },
});
