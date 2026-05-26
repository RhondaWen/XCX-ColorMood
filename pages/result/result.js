// pages/result/result.js - 云开发版本
const api = require('../../utils/api')

Page({
  data: {
    emotionId: null,
    emotion: null,
    palettes: [],
    loading: true,
    mode: 'normal'
  },

  onLoad(options) {
    const { emotionId, mode } = options
    this.setData({
      emotionId: emotionId ? parseInt(emotionId) : 1,
      mode: mode || 'normal'
    })
    this.loadEmotionInfo()
    this.loadPalettes()
  },

  loadEmotionInfo() {
    const emotions = {
      1: { name: '温柔', icon: '🌸', color: '#E8B4B8' },
      2: { name: '活力', icon: '🌟', color: '#F18F43' },
      3: { name: '沉静', icon: '🍃', color: '#94B276' },
      4: { name: '忧郁', icon: '🌧', color: '#9B8EA8' }
    }
    this.setData({ emotion: emotions[this.data.emotionId] })
  },

  async loadPalettes() {
    const res = await api.getPaletteList({ emotionId: this.data.emotionId })
    if (res.code === 0 && res.data.length > 0) {
      this.setData({ palettes: res.data, loading: false })
    } else {
      // 使用备用数据
      this.setData({
        palettes: this.getBackupPalettes(),
        loading: false
      })
    }
  },

  getBackupPalettes() {
    const data = {
      1: [
        { _id: 'p1', name: '初春晨雾', colors: ['#E8B4B8', '#F0CECE', '#C9B8E8', '#F9F0E0', '#D4C4A8'], likeCount: 128, emotionTag: '温柔', emotionColor: '#E8B4B8' },
        { _id: 'p2', name: '温暖米麻', colors: ['#F5C5A3', '#E8D5B7', '#D4BFA0', '#C9A880', '#B89060'], likeCount: 95, emotionTag: '温柔', emotionColor: '#E8B4B8' }
      ],
      2: [
        { _id: 'p3', name: '暮光晚橙', colors: ['#F18F43', '#F5A660', '#D5DD5E', '#E8D080', '#F0C860'], likeCount: 204, emotionTag: '活力', emotionColor: '#F18F43' }
      ],
      3: [
        { _id: 'p4', name: '苔原初绿', colors: ['#94B276', '#A8C488', '#7A9660', '#B4D090', '#C8DCA8'], likeCount: 156, emotionTag: '沉静', emotionColor: '#94B276' }
      ],
      4: [
        { _id: 'p5', name: '烟雨江南', colors: ['#9B8EA8', '#7A6880', '#B8AABF', '#6A5870', '#C8C0D0'], likeCount: 118, emotionTag: '忧郁', emotionColor: '#9B8EA8' }
      ]
    }
    return data[this.data.emotionId] || data[1]
  },

  onGoBack() { wx.navigateBack() },

  onPaletteDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  async onFavoriteAll() {
    if (this.data.isGuest) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.showToast({ title: '已全部收藏', icon: 'success' })
  }
})