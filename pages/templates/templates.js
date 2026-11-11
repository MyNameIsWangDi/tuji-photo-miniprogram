const store = require('../../utils/store');
const templateData = require('../../utils/templates');

const CATS = ['精选', '调色', '拼图', '水印'];

Page({
  data: {
    theme: 'darkroom',
    themes: store.THEMES,
    cats: CATS,
    category: 0,
    templates: templateData.TEMPLATES,
    cover: '',
  },

  onShow() {
    const photos = wx.getStorageSync('gallery_cache') || [];
    this.setData({ theme: store.getTheme(), cover: photos[0] || '' });
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
    wx.navigateTo({
      url: `/pages/preview/preview?id=${e.currentTarget.dataset.id}`,
    });
  },

  goHome() { wx.reLaunch({ url: '/pages/home/home' }); },
  goRecent() { wx.navigateTo({ url: '/pages/recent/recent' }); },
  goMine() { wx.navigateTo({ url: '/pages/mine/mine' }); },
});
