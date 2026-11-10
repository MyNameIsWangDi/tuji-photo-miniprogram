const store = require('../../utils/store');

Page({
  data: {
    theme: 'darkroom',
    projects: [],
  },

  onShow() {
    const all = wx.getStorageSync('project_history') || [];
    this.setData({
      theme: store.getTheme(),
      projects: all,
    });
  },

  openProject(e) {
    const id = e.currentTarget.dataset.id;
    const project = this.data.projects.find((p) => p.id === id);
    if (!project) return;
    wx.setStorageSync('last_project', project);
    wx.navigateTo({
      url: `/pages/editor/editor?image=${encodeURIComponent(project.image)}`,
    });
  },

  goHome() { wx.reLaunch({ url: '/pages/home/home' }); },
  goTemplates() { wx.navigateTo({ url: '/pages/templates/templates' }); },
  goMine() { wx.navigateTo({ url: '/pages/mine/mine' }); },
});
