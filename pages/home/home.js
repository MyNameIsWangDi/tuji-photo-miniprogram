const store = require('../../utils/store');

Page({
  data: {
    theme: 'darkroom',
    photos: [],
    lastProject: null,
  },

  onShow() {
    const photos = wx.getStorageSync('gallery_cache') || [];
    this.setData({
      theme: store.getTheme(),
      photos,
      lastProject: wx.getStorageSync('last_project') || null,
    });
  },

  openEditor() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        const picked = res.tempFiles.map((f) => f.tempFilePath);
        if (!picked.length) return;
        const merged = picked.concat(this.data.photos).slice(0, 60);
        wx.setStorageSync('gallery_cache', merged);
        this.setData({ photos: merged });

        // 若从模板页过来，选图后自动套用模板参数
        const tpl = wx.getStorageSync('pending_template');
        if (tpl) wx.removeStorageSync('pending_template');

        const project = {
          id: Date.now(),
          image: picked[0],
          adjustments: tpl
            ? tpl.adjustments
            : { brightness: 0, contrast: 0, saturation: 0, temperature: 0 },
          filterIndex: -1,
          borderStyle: tpl ? tpl.borderStyle : 1,
          wmPos: tpl ? tpl.watermarkPosition : 8,
          wmOpacity: 60,
          wmStyle: 0,
          borderWidth: 6,
          elements: [],
          rotation: 0,
          cropRect: { left: 0, top: 0, right: 1, bottom: 1 },
          editedAt: Date.now(),
        };
        wx.setStorageSync('last_project', project);
        wx.navigateTo({
          url: `/pages/editor/editor?image=${encodeURIComponent(picked[0])}`,
        });
      },
    });
  },

  continueEdit() {
    const p = this.data.lastProject;
    if (!p) return;
    wx.navigateTo({
      url: `/pages/editor/editor?image=${encodeURIComponent(p.image)}`,
    });
  },

  openPhoto(e) {
    const image = e.currentTarget.dataset.src;
    const tpl = wx.getStorageSync('pending_template');
    if (tpl) wx.removeStorageSync('pending_template');
    const project = {
      id: Date.now(),
      image,
      adjustments: tpl
        ? tpl.adjustments
        : { brightness: 0, contrast: 0, saturation: 0, temperature: 0 },
      filterIndex: -1,
      borderStyle: tpl ? tpl.borderStyle : 1,
      wmPos: tpl ? tpl.watermarkPosition : 8,
      wmOpacity: 60,
      wmStyle: 0,
      borderWidth: 6,
      elements: [],
      rotation: 0,
      cropRect: { left: 0, top: 0, right: 1, bottom: 1 },
      editedAt: Date.now(),
    };
    wx.setStorageSync('last_project', project);
    wx.navigateTo({
      url: `/pages/editor/editor?image=${encodeURIComponent(image)}`,
    });
  },

  goTemplates() {
    wx.navigateTo({ url: '/pages/templates/templates' });
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' });
  },

  goMine() {
    wx.navigateTo({ url: '/pages/mine/mine' });
  },
});
