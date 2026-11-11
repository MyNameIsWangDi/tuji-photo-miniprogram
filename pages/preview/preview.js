const store = require('../../utils/store');
const templates = require('../../utils/templates');

Page({
  data: {
    theme: 'darkroom',
    template: null,
    cover: '',
    coverStyle: '',
  },

  onLoad(options) {
    const photos = wx.getStorageSync('gallery_cache') || [];
    const tpl = templates.byId(options.id) || templates.TEMPLATES[0];
    const a = tpl.adjustments;
    this.setData({
      theme: store.getTheme(),
      template: tpl,
      cover: photos[0] || '',
      coverStyle: [
        `brightness(${1 + (a.brightness || 0) / 250})`,
        `contrast(${1 + (a.contrast || 0) / 200})`,
        `saturate(${Math.max(1 + (a.saturation || 0) / 100, 0)})`,
        `sepia(${Math.max((a.temperature || 0) / 100 * 40, 0)}%)`,
      ].join(' '),
    });
  },

  useTemplate() {
    const tpl = this.data.template;
    // 暂存模板，回图库选图后自动套用
    wx.setStorageSync('pending_template', tpl);
    wx.showToast({ title: '已选择模板，请选照片', icon: 'none' });
    setTimeout(() => {
      wx.reLaunch({ url: '/pages/home/home' });
    }, 600);
  },

  close() { wx.navigateBack(); },
});
