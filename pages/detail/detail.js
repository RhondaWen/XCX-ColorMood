// pages/detail/detail.js
const api = require('../../utils/api')

Page({
  data: {
    paletteId: null,
    palette: null,
    colorNames: [],
    loading: true,
    favorite: false
  },

  onLoad(options) {
    const { id, emotionId } = options
    this.setData({ paletteId: parseInt(id) })
    this.loadPaletteDetail()
  },

  loadPaletteDetail() {
    // 模拟数据
    const mockPalettes = {
      1: {
        id: 1,
        name: '初春晨雾',
        colors: [
          { hex: '#E8B4B8', name: '深蜜桃', tag: '温柔' },
          { hex: '#F0CECE', name: '羽粉晨光', tag: '温柔' },
          { hex: '#C9B8E8', name: '薰衣雾', tag: '温柔' },
          { hex: '#F9F0E0', name: '奶油象牙', tag: '暖调' },
          { hex: '#D4C4A8', name: '苔原米', tag: '自然' }
        ],
        description: '如初春清晨的第一缕光，轻轻铺落在睫毛上——粉、紫、米交织，像一场没有结局的温柔梦。适合需要被安慰的时候，也适合想把温柔给别人的时刻。',
        likeCount: 128,
        emotionTag: '温柔',
        emotionColor: '#E8B4B8'
      },
      2: {
        id: 2,
        name: '温暖米麻',
        colors: [
          { hex: '#F5C5A3', name: '杏仁乳', tag: '温柔' },
          { hex: '#E8D5B7', name: '棉麻褐', tag: '自然' },
          { hex: '#D4BFA0', name: '砂米', tag: '暖调' },
          { hex: '#C9A880', name: '驼绒', tag: '暖调' },
          { hex: '#B89060', name: '焦糖棕', tag: '暖调' }
        ],
        description: '柔软的米麻质感，像是午后阳光洒在棉布上的温度。',
        likeCount: 95,
        emotionTag: '温柔',
        emotionColor: '#E8B4B8'
      }
    }

    // 获取数据
    const palette = mockPalettes[this.data.paletteId] || mockPalettes[1]

    // 为每个颜色获取名称（调用颜色命名API）
    this.fetchColorNames(palette.colors)

    this.setData({
      palette,
      loading: false
    })
  },

  fetchColorNames(colors) {
    const colorNames = []
    colors.forEach(color => {
      api.getColorName(color.hex)
        .then(res => {
          colorNames.push({
            hex: color.hex,
            name: res.name || color.name,
            tag: color.tag
          })
          this.setData({ colorNames })
        })
        .catch(() => {
          colorNames.push(color)
          this.setData({ colorNames })
        })
    })
  },

  onGoBack() {
    wx.navigateBack()
  },

  onCopyColor(e) {
    const { hex } = e.currentTarget.dataset
    wx.setClipboardData({
      data: hex,
      success: () => {
        wx.showToast({ title: `已复制 ${hex}`, icon: 'success' })
      }
    })
  },

  onFavorite() {
    this.setData({ favorite: !this.data.favorite })
    wx.showToast({
      title: this.data.favorite ? '已收藏' : '已取消收藏',
      icon: 'success'
    })
  },

  onSaveImage() {
    wx.showToast({ title: '色板已保存至相册', icon: 'success' })
  }
})