const store = require('../../utils/store');

Page({
  data: {
    theme: 'darkroom',
    themes: store.THEMES,
    current: store.getTheme(),
    followSystem: false,
    autoSwitch: false,
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
  back() { wx.navigateBack(); },
});
