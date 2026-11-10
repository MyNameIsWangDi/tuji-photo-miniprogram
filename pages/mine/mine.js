const store = require('../../utils/store');

Page({
  data: {
    theme: 'darkroom',
    themes: store.THEMES,
    current: store.getTheme(),
    followSystem: false,
    autoSwitch: false,
    tab: 'mine',
  },

  onShow() {
    this.setData({ theme: store.getTheme(), current: store.getTheme() });
  },

  pickTheme(e) {
    const key = e.currentTarget.dataset.key;
    store.setTheme(key);
    this.setData({ current: key, theme: key });
    wx.showToast({ title: '已应用主题', icon: 'none' });
  },

  toggleFollow() { this.setData({ followSystem: !this.data.followSystem }); },
  toggleAuto() { this.setData({ autoSwitch: !this.data.autoSwitch }); },

  goTemplates() { wx.navigateTo({ url: '/pages/templates/templates' }); },
  goHome() { wx.reLaunch({ url: '/pages/home/home' }); },
  goSettings() { wx.navigateTo({ url: '/pages/settings/settings' }); },
});
