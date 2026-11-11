const store = require('../../utils/store');

Page({
  data: {
    theme: 'darkroom',
    project: null,
    canvasReady: false,
    saving: false,
    showOriginal: false,
    image: '',
  },

  onLoad() {
    const project = wx.getStorageSync('last_project');
    this.setData({
      theme: store.getTheme(),
      project: project || null,
      image: project ? project.image : '',
    });
    if (project) {
      this.setData({ canvasReady: true });
    }
  },

  onReady() {
    this.render();
  },

  /** 在 canvas 上完成合成：照片 → 调色滤镜 → 边框 → 叠加元素 → 水印。 */
  render() {
    const project = this.data.project;
    if (!project || !project.image) return;
    const query = wx.createSelectorQuery().in(this);
    query.select('#exportCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res && res[0] && res[0].node;
        if (!canvas) return;
        this.canvasNode = canvas;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const width = res[0].width;
        const height = res[0].height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        const img = canvas.createImage();
        img.onload = () => {
          const a = project.adjustments || {};
          const filter = [
            `brightness(${1 + (a.brightness || 0) / 250})`,
            `contrast(${1 + (a.contrast || 0) / 200})`,
            `saturate(${Math.max(1 + (a.saturation || 0) / 100, 0)})`,
            `sepia(${Math.max((a.temperature || 0) / 100 * 40, 0)}%)`,
          ].join(' ');
          if (ctx.filter !== undefined) ctx.filter = filter;

          const border = project.borderStyle === 1 || project.borderStyle === 4;
          if (border) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }
          const pad = border ? 12 : 0;
          const imgW = width - pad * 2;
          const imgH = height - pad * 2;
          ctx.drawImage(img, pad, pad, imgW, imgH);

          // 叠加元素
          (project.elements || []).forEach((el) => {
            const x = pad + el.x * imgW;
            const y = pad + el.y * imgH;
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            if (el.kind === 'sticker') {
              ctx.beginPath();
              ctx.arc(x, y, 16, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(0,0,0,0.35)';
              ctx.fill();
              ctx.fillStyle = '#FFFFFF';
              ctx.fillText(el.content, x, y + 5);
            } else {
              ctx.fillText(el.content, x, y);
            }
          });

          // 图片水印
          if (project.wmStyle === 1 && project.wmImage && project.wmOpacity > 0) {
            const anchors = [
              [0, 0], [0.5, 0], [1, 0], [0, 0.5], [0.5, 0.5], [1, 0.5], [0, 1], [0.5, 1], [1, 1],
            ];
            const [ax, ay] = anchors[project.wmPos || 8];
            const size = Math.min(imgW, imgH) * 0.22;
            const wmImg = canvas.createImage();
            wmImg.onload = () => {
              ctx.globalAlpha = (project.wmOpacity || 60) / 100;
              ctx.drawImage(
                wmImg,
                pad + ax * imgW - size / 2,
                pad + ay * imgH - size / 2,
                size, size
              );
              ctx.globalAlpha = 1;
            };
            wmImg.src = project.wmImage;
          }

          // 文字水印
          if (project.wmStyle === 0 && project.wmOpacity > 0) {
            const anchors = [
              [0, 0], [0.5, 0], [1, 0], [0, 0.5], [0.5, 0.5], [1, 0.5], [0, 1], [0.5, 1], [1, 1],
            ];
            const [ax, ay] = anchors[project.wmPos || 8];
            ctx.globalAlpha = (project.wmOpacity || 60) / 100;
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = ax === 0 ? 'left' : ax === 1 ? 'center' : 'right';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('© 途记 · 2026', pad + ax * imgW, pad + ay * imgH);
            ctx.globalAlpha = 1;
          }
          ctx.filter = 'none';

          this.setData({ canvasReady: true });
          wx.setStorageSync('export_temp', true);
        };
        img.src = project.image;
      });
  },

  saveToAlbum() {
    if (this.data.saving) return;
    this.setData({ saving: true });
    wx.canvasToTempFilePath({
      canvas: this.canvasNode,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
          fail: () => wx.showToast({ title: '保存失败', icon: 'none' }),
        });
      },
      fail: () => wx.showToast({ title: '导出失败', icon: 'none' }),
      complete: () => this.setData({ saving: false }),
    }, this);
  },

  share() {
    wx.showToast({ title: '点击右上角分享', icon: 'none' });
  },

  onShareAppMessage() {
    return { title: '用「途记」修的照片', path: '/pages/home/home' };
  },

  showOriginalTrue() { this.setData({ showOriginal: true }); },
  showOriginalFalse() { this.setData({ showOriginal: false }); },

  close() { wx.navigateBack(); },
});
