// pages/result/result.js
const api = require('../../utils/api')

Page({
  data: {
    emotionId: null,
    emotion: null,
    palettes: [],
    loading: true
  },

  onLoad(options) {
    const { emotionId, mode } = options
    if (emotionId) {
      this.setData({ emotionId: parseInt(emotionId) })
      this.loadEmotionInfo()
      this.loadPalettes()
    }
  },

  loadEmotionInfo() {
    const emotions = {
      1: { name: '温柔', icon: '🌸', color: '#E8B4B8' },
      2: { name: '活力', icon: '🌟', color: '#F18F43' },
      3: { name: '沉静', icon: '🍃', color: '#94B276' },
      4: { name: '忧郁', icon: '🌧', color: '#9B8EA8' }
    }
    this.setData({
      emotion: emotions[this.data.emotionId]
    })
  },

  loadPalettes() {
    api.getPaletteList({ emotionId: this.data.emotionId })
      .then(res => {
        if (res.code === 0) {
          this.setData({
            palettes: res.data,
            loading: false
          })
        } else {
          // 使用模拟数据
          this.setData({
            palettes: this.getMockPalettes(),
            loading: false
          })
        }
      })
      .catch(() => {
        this.setData({
          palettes: this.getMockPalettes(),
          loading: false
        })
      })
  },

  getMockPalettes() {
    const mockData = {
      1: [
        { id: 1, name: '初春晨雾', colors: ['#E8B4B8', '#F0CECE', '#C9B8E8', '#F9F0E0', '#D4C4A8'], likeCount: 128, emotionTag: '温柔' },
        { id: 2, name: '温暖米麻', colors: ['#F5C5A3', '#E8D5B7', '#D4BFA0', '#C9A880', '#B89060'], likeCount: 95, emotionTag: '温柔' },
        { id: 3, name: '莫奈花园', colors: ['#E8B4B8', '#C9B8E8', '#B8D4E8', '#D4E8C4', '#F0E0C0'], likeCount: 312, emotionTag: '温柔' }
      ],
      2: [
        { id: 4, name: '暮光晚橙', colors: ['#F18F43', '#F5A660', '#D5DD5E', '#E8D080', '#F0C860'], likeCount: 204, emotionTag: '活力' },
        { id: 5, name: '芥末春日', colors: ['#D5DD5E', '#C4CC50', '#E8F080', '#F0F4A0', '#A8B040'], likeCount: 89, emotionTag: '活力' }
      ],
      3: [
        { id: 6, name: '苔原初绿', colors: ['#94B276', '#A8C488', '#7A9660', '#B4D090', '#C8DCA8'], likeCount: 156, emotionTag: '沉静' },
        { id: 7, name: '薄荷轻语', colors: ['#B8D4C8', '#C8E0D4', '#D8ECD8', '#E8F4E8', '#F0F8F0'], likeCount: 67, emotionTag: '沉静' }
      ],
      4: [
        { id: 8, name: '烟雨江南', colors: ['#9B8EA8', '#7A6880', '#B8AABF', '#6A5870', '#C8C0D0'], likeCount: 118, emotionTag: '忧郁' },
        { id: 9, name: '紫罗兰絮', colors: ['#D4C0DC', '#C8B0D0', '#BCACC8', '#B0A0C0', '#A490B8'], likeCount: 82, emotionTag: '忧郁' }
      ]
    }
    return mockData[this.data.emotionId] || mockData[1]
  },

  onGoBack() {
    wx.navigateBack()
  },

  onPaletteDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}&emotionId=${this.data.emotionId}`
    })
  },

  onFavoriteAll() {
    wx.showToast({ title: '已全部收藏', icon: 'success' })
  }
})