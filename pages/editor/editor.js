const FILTERS = [
  { name: '原图', cat: '全部', sat: 1, temp: 0, contrast: 1 },
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

const TOOLS = [
  { key: 'adjust', label: '调色' },
  { key: 'filter', label: '滤镜' },
  { key: 'watermark', label: '水印' },
  { key: 'border', label: '边框' },
  { key: 'crop', label: '裁剪' },
  { key: 'text', label: '文字' },
];

/** 九宫锚点（与安卓端 Anchors 一致）：四角 + 四边中点 + 中心。 */
const ANCHOR_NAMES = ['左上', '中上', '右上', '左中', '中心', '右中', '左下', '中下', '右下'];
const ANCHOR_POINTS = [
  [0, 0], [0.5, 0], [1, 0],
  [0, 0.5], [0.5, 0.5], [1, 0.5],
  [0, 1], [0.5, 1], [1, 1],
];

const STICKERS = ['★', '♥', '⌖', '日', '▣'];

Page({
  data: {
    image: '',
    theme: 'darkroom',
    tools: TOOLS,
    activeTool: -1,
    canvasW: 0,
    canvasH: 0,

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
    cropRect: { left: 0, top: 0, right: 1, bottom: 1 },

    // 文字
    textSection: 0,
    textSections: ['文本', '标签', '贴字', '艺术字'],
    textFont: 0,
    textContent: '山湖暮色 · 2026',
    textSize: 16,

    // 叠加元素（文字 / 贴纸）
    elements: [],
    selectedId: -1,
    freeMode: false,
    snapEnabled: true,
    snapRange: 24,
    stickers: STICKERS,
    anchorNames: ANCHOR_NAMES,
    anchorPoints: ANCHOR_POINTS,
    snappedName: '',
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
    this.measureCanvas();
  },

  onReady() {
    this.measureCanvas();
  },

  measureCanvas() {
    wx.createSelectorQuery()
      .in(this)
      .select('#photoCanvas')
      .boundingClientRect((rect) => {
        if (rect && rect.width) {
          this.setData({ canvasW: rect.width, canvasH: rect.height });
        }
      })
      .exec();
  },

  /* ---------- 工具栏（常驻） ---------- */
  toggleTool(e) {
    const idx = Number(e.currentTarget.dataset.index);
    const next = this.data.activeTool === idx ? -1 : idx;
    this.setData({ activeTool: next });
    if (next === 3 || next === 4) this.measureCanvas();
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
  refreshFilters() {
    const cat = this.data.filterCats[this.data.filterCat];
    const visibleFilters = FILTERS.map((f, i) => ({ ...f, i })).filter(
      (f) => this.data.filterCat === 0 || f.cat === cat || f.name === '原图'
    );
    this.setData({ visibleFilters });
  },

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
  moveCropHandle(e) {
    const handle = e.currentTarget.dataset.handle;
    const touch = e.touches[0];
    const rect = this.data.cropRect;
    const x = Math.max(0, Math.min(1, touch.x / this.data.canvasW));
    const y = Math.max(0, Math.min(1, touch.y / this.data.canvasH));
    const next = { ...rect };
    if (handle === 'lt') { next.left = x; next.top = y; }
    if (handle === 'rt') { next.right = x; next.top = y; }
    if (handle === 'lb') { next.left = x; next.bottom = y; }
    if (handle === 'rb') { next.right = x; next.bottom = y; }
    if (next.right - next.left < 0.08) next.right = next.left + 0.08;
    if (next.bottom - next.top < 0.08) next.bottom = next.top + 0.08;
    this.setData({ cropRect: next });
  },

  /* ---------- 文字 ---------- */
  pickTextSection(e) { this.setData({ textSection: Number(e.currentTarget.dataset.i) }); },
  pickTextFont(e) { this.setData({ textFont: Number(e.currentTarget.dataset.i) }); },
  onTextSize(e) { this.setData({ textSize: e.detail.value }); },
  onTextInput(e) { this.setData({ textContent: e.detail.value }); },

  /* ---------- 叠加元素：拖放 + 九宫吸附 ---------- */
  addTextElement() {
    const id = Date.now();
    const el = {
      id,
      kind: 'text',
      content: this.data.textContent || '输入文字',
      x: 0.5,
      y: 0.5,
      snapped: 4,
      size: this.data.textSize,
    };
    this.setData({
      elements: this.data.elements.concat(el),
      selectedId: id,
      freeMode: true,
      snappedName: '',
    });
  },

  addStickerElement(e) {
    const id = Date.now();
    const el = {
      id,
      kind: 'sticker',
      content: e.currentTarget.dataset.glyph,
      x: 0.5,
      y: 0.5,
      snapped: 4,
      size: 16,
    };
    this.setData({
      elements: this.data.elements.concat(el),
      selectedId: id,
      freeMode: true,
      snappedName: '',
    });
  },

  onElementMove(e) {
    const id = e.currentTarget.dataset.id;
    const dx = e.detail.x / this.data.canvasW;
    const dy = e.detail.y / this.data.canvasH;
    const elements = this.data.elements.map((el) =>
      el.id === id
        ? { ...el, x: Math.max(0, Math.min(1, dx)), y: Math.max(0, Math.min(1, dy)), snapped: -1 }
        : el
    );
    this.setData({ elements });
  },

  onElementTouchEnd(e) {
    const id = e.currentTarget.dataset.id;
    const el = this.data.elements.find((x) => x.id === id);
    if (!el) return;
    if (!this.data.snapEnabled) {
      this.setData({ selectedId: id, snappedName: '' });
      return;
    }
    const threshold = this.data.snapRange / Math.max(this.data.canvasW, this.data.canvasH);
    let best = -1;
    let bestDist = Infinity;
    ANCHOR_POINTS.forEach(([ax, ay], i) => {
      const d = Math.hypot(el.x - ax, el.y - ay);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    if (best >= 0 && bestDist <= threshold) {
      const [ax, ay] = ANCHOR_POINTS[best];
      const elements = this.data.elements.map((x) =>
        x.id === id ? { ...x, x: ax, y: ay, snapped: best } : x
      );
      this.setData({
        elements,
        selectedId: id,
        snappedName: `已吸附 · ${ANCHOR_NAMES[best]}`,
      });
    } else {
      this.setData({ selectedId: id, snappedName: '' });
    }
  },

  selectElement(e) {
    this.setData({ selectedId: Number(e.currentTarget.dataset.id) });
  },

  toggleSnap() { this.setData({ snapEnabled: !this.data.snapEnabled }); },
  onSnapRange(e) { this.setData({ snapRange: e.detail.value }); },

  /* ---------- 导出 ---------- */
  export() {
    const { image, elements, wmPos, wmOpacity, wmStyle, borderStyle, borderWidth } = this.data;
    wx.setStorageSync('last_project', {
      id: Date.now(),
      image,
      adjustments: {
        brightness: this.data.brightness,
        contrast: this.data.contrast,
        saturation: this.data.saturation,
        temperature: this.data.temperature,
      },
      filterIndex: this.data.filterIndex,
      elements,
      wmPos,
      wmOpacity,
      wmStyle,
      borderStyle,
      borderWidth,
      rotation: this.data.rotation,
      cropRect: this.data.cropRect,
      editedAt: Date.now(),
    });
    wx.navigateTo({ url: '/pages/export/export' });
  },

  close() { wx.navigateBack(); },

  /* ---------- CSS filter 预览 ---------- */
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

  elementStyle(el) {
    const w = this.data.canvasW;
    const h = this.data.canvasH;
    return `left:${el.x * w - 48}px; top:${el.y * h - 20}px;`;
  },
});
