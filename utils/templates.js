// 模板数据（与安卓端 TemplateCatalog 保持一致）
const TEMPLATES = [
  {
    id: 'dusk_cinema',
    name: '暮色电影感',
    tag: '滤镜 · 暖阳',
    swatch: '#C8A879',
    components: ['滤镜 · 暖阳', '饱和度 +20', '水印 · 右下', '边框 · 白边'],
    adjustments: { brightness: 6, contrast: 8, saturation: 20, temperature: 12 },
    borderStyle: 1,
    watermarkPosition: 8,
  },
  {
    id: 'city_night',
    name: '城市夜行',
    tag: '滤镜 · 清冷',
    swatch: '#6B7A8F',
    components: ['滤镜 · 清冷', '对比度 +12', '亮度 -6', '边框 · 黑边'],
    adjustments: { brightness: -6, contrast: 12, saturation: -10, temperature: -18 },
    borderStyle: 2,
    watermarkPosition: 0,
  },
  {
    id: 'beach_sunset',
    name: '海边日落',
    tag: '滤镜 · 蜜桃',
    swatch: '#E89C7C',
    components: ['滤镜 · 蜜桃', '色温 +16', '饱和度 +12', '水印 · 左下'],
    adjustments: { brightness: 4, contrast: 4, saturation: 12, temperature: 16 },
    borderStyle: 0,
    watermarkPosition: 6,
  },
  {
    id: 'morning_note',
    name: '晨间手记',
    tag: '水印 · 右下',
    swatch: '#B8B09A',
    components: ['滤镜 · 原图', '亮度 +8', '水印 · 右下', '边框 · 圆角'],
    adjustments: { brightness: 8, contrast: 0, saturation: -6, temperature: 6 },
    borderStyle: 3,
    watermarkPosition: 8,
  },
  {
    id: 'green_holiday',
    name: '青绿假日',
    tag: '滤镜 · 青柠',
    swatch: '#8FAF8E',
    components: ['滤镜 · 青柠', '饱和度 +16', '色温 -8', '边框 · 白边'],
    adjustments: { brightness: 2, contrast: 6, saturation: 16, temperature: -8 },
    borderStyle: 1,
    watermarkPosition: 2,
  },
  {
    id: 'neon_night',
    name: '夜色霓虹',
    tag: '滤镜 · 浓郁',
    swatch: '#9C6B8F',
    components: ['滤镜 · 浓郁', '对比度 +16', '饱和度 +28', '水印 · 中下'],
    adjustments: { brightness: -4, contrast: 16, saturation: 28, temperature: 4 },
    borderStyle: 0,
    watermarkPosition: 7,
  },
];

function byId(id) {
  return TEMPLATES.find((t) => t.id === id) || null;
}

module.exports = { TEMPLATES, byId };
