const FILTERS = [
  { name: '原图', cat: '全部', sat: 1, temp: 0, contrast: 0 },
  { name: '暖阳', cat: '胶片', sat: 1.1, temp: 0.18, contrast: 1.05 },
  { name: '胶片', cat: '胶片', sat: 0.85, temp: 0.12, contrast: 0.92 },
  { name: '黑白', cat: '黑白', sat: 0, temp: 0, contrast: 1.12 },
  { name: '青橙', cat: '电影', sat: 1.25, temp: -0.2, contrast: 1.1 },
  { name: '复古', cat: '胶片', sat: 0.7, temp: 0.22, contrast: 0.95 },
  { name: '清冷', cat: '电影', sat: 0.9, temp: -0.26, contrast: 1.08 },
  { name: '浓郁', cat: '电影', sat: 1.45, temp: 0.06, contrast: 1.16 },
  { name: '青柠', cat: '风景', sat: 1.15, temp: -0.14, contrast: 1.04 },
  { name: '蜜桃', cat: '风景', sat: 1.2, temp: 0.24, contrast: 1.02 },
];

const TOOL_LABELS = ['调色', '滤镜', '水印', '边框', '裁剪', '文字'];

Page({
  data: {
    image: '',
    theme: 'darkroom',
    tools: TOOL_LABELS,
    activeTool: -1,

    // 调色
    adjustSection: 0,
    adjustSections: ['光效', '色彩', '细节', '曲线', 'HSL'],
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,

    // 滤镜
    filterCat: 0,
    filterCats: ['全部', '胶片', '黑白', '电影', '风景'],
    visibleFilters: [],
    filterIndex: -1,
    strength: 70,

    // 水印
    wmSection: 0,
    wmSections: ['预设', '自定义', '时间戳', '定位'],
    wmStyle: 0,
    wmPos: 8,
    wmOpacity: 60,

    // 边框
    borderSection: 0,
    borderSections: ['基础', '胶片', '拍立得', '装饰'],
    borderStyle: 1,
    borderWidth: 6,

    // 裁剪
    cropSection: 0,
    cropSections: ['比例', '旋转', '矫正', '透视'],
    cropRatio: 2,
    cropRatios: ['自由', '1:1', '3:4', '4:3', '16:9'],
    rotation: 0,

    // 文字
    textSection: 0,
    textSections: ['文本', '标签', '贴字', '艺术字'],
    textFont: 0,
    textContent: '山湖暮色 · 2026',
    textSize: 16,
  },

  onLoad(options) {
    const saved = wx.getStorageSync('last_project');
    this.setData({
      theme: require('../../utils/store').getTheme(),
      image: options.image ? decodeURIComponent(options.image) : (saved && saved.image) || '',
      ...(saved && saved.adjustments ? saved.adjustments : {}),
      filterIndex: saved && saved.filterIndex != null ? saved.filterIndex : -1,
    });
    this.refreshFilters();
  },

  refreshFilters() {
    const cat = this.data.filterCats[this.data.filterCat];
    const visibleFilters = FILTERS.map((f, i) => ({ ...f, i })).filter(
      (f) => this.data.filterCat === 0 || f.cat === cat || f.name === '原图'
    );
    this.setData({ visibleFilters });
  },

  /* ---------- 工具栏（常驻） ---------- */
  toggleTool(e) {
    const idx = Number(e.currentTarget.dataset.index);
    this.setData({ activeTool: this.data.activeTool === idx ? -1 : idx });
  },

  /* ---------- 调色 ---------- */
  pickAdjustSection(e) { this.setData({ adjustSection: Number(e.currentTarget.dataset.i) }); },
  onBrightness(e) { this.setData({ brightness: e.detail.value }); },
  onContrast(e) { this.setData({ contrast: e.detail.value }); },
  onSaturation(e) { this.setData({ saturation: e.detail.value }); },
  onTemperature(e) { this.setData({ temperature: e.detail.value }); },

  /* ---------- 滤镜 ---------- */
  pickFilterCat(e) {
    this.setData({ filterCat: Number(e.currentTarget.dataset.i) });
    this.refreshFilters();
  },
  pickFilter(e) { this.setData({ filterIndex: Number(e.currentTarget.dataset.i) }); },
  onStrength(e) { this.setData({ strength: e.detail.value }); },

  /* ---------- 水印 ---------- */
  pickWmSection(e) { this.setData({ wmSection: Number(e.currentTarget.dataset.i) }); },
  pickWmStyle(e) { this.setData({ wmStyle: Number(e.currentTarget.dataset.i) }); },
  pickWmPos(e) { this.setData({ wmPos: Number(e.currentTarget.dataset.i) }); },
  onWmOpacity(e) { this.setData({ wmOpacity: e.detail.value }); },

  /* ---------- 边框 ---------- */
  pickBorderSection(e) { this.setData({ borderSection: Number(e.currentTarget.dataset.i) }); },
  pickBorderStyle(e) { this.setData({ borderStyle: Number(e.currentTarget.dataset.i) }); },
  onBorderWidth(e) { this.setData({ borderWidth: e.detail.value }); },

  /* ---------- 裁剪 ---------- */
  pickCropSection(e) { this.setData({ cropSection: Number(e.currentTarget.dataset.i) }); },
  pickCropRatio(e) { this.setData({ cropRatio: Number(e.currentTarget.dataset.i) }); },
  rotate(e) {
    const dir = Number(e.currentTarget.dataset.dir);
    this.setData({ rotation: (this.data.rotation + dir + 4) % 4 });
  },

  /* ---------- 文字 ---------- */
  pickTextSection(e) { this.setData({ textSection: Number(e.currentTarget.dataset.i) }); },
  pickTextFont(e) { this.setData({ textFont: Number(e.currentTarget.dataset.i) }); },
  onTextSize(e) { this.setData({ textSize: e.detail.value }); },
  onTextInput(e) { this.setData({ textContent: e.detail.value }); },

  /* ---------- 导出 ---------- */
  export() {
    const project = {
      id: Date.now(),
      image: this.data.image,
      adjustments: {
        brightness: this.data.brightness,
        contrast: this.data.contrast,
        saturation: this.data.saturation,
        temperature: this.data.temperature,
      },
      filterIndex: this.data.filterIndex,
      editedAt: Date.now(),
    };
    wx.setStorageSync('last_project', project);
    wx.showToast({ title: '已保存到相册', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 800);
  },

  close() { wx.navigateBack(); },

  goBack() { wx.navigateBack(); },

  /* ---------- CSS filter 预览（真实生效） ---------- */
  filterStyle() {
    const f = this.data.filterIndex >= 0 ? FILTERS[this.data.filterIndex] : null;
    const k = f ? this.data.strength / 100 : 0;
    const b = 1 + this.data.brightness / 250;
    const c = 1 + this.data.contrast / 200 + (f ? f.contrast - 1 : 0) * k;
    const s = (1 + this.data.saturation / 100) * (f ? 1 + (f.sat - 1) * k : 1);
    const sep = f && f.temp > 0 ? f.temp * k * 40 : 0;
    const hue = f && f.temp < 0 ? f.temp * k * 20 : 0;
    return [
      `brightness(${b})`,
      `contrast(${c})`,
      `saturate(${Math.max(s, 0)})`,
      sep ? `sepia(${sep}%)` : '',
      hue ? `hue-rotate(${hue}deg)` : '',
    ].filter(Boolean).join(' ');
  },
});
