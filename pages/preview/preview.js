const store = require('../../utils/store');
const templates = require('../../utils/templates');

Page({
  data: {
    theme: 'darkroom',
    template: null,
  },

  onLoad(options) {
    this.setData({
      theme: store.getTheme(),
      template: templates.byId(options.id) || templates.TEMPLATES[0],
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
