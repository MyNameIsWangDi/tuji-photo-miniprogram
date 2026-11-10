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
    const project = wx.getStorageSync('last_project');
    if (!project || !project.image) {
      wx.showToast({ title: '请先选择照片', icon: 'none' });
      return;
    }
    wx.setStorageSync('last_project', {
      ...project,
      adjustments: tpl.adjustments,
      borderStyle: tpl.borderStyle,
      wmPos: tpl.watermarkPosition,
      elements: project.elements || [],
    });
    wx.showToast({ title: '已套用模板', icon: 'success' });
    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/editor/editor?image=${encodeURIComponent(project.image)}`,
      });
    }, 600);
  },

  close() { wx.navigateBack(); },
});
