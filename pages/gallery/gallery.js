// pages/gallery/gallery.js - 云开发版本
const api = require('../../utils/api')

Page({
  data: {
    currentTab: '全部',
    tabs: ['全部', '温柔', '活力', '沉静', '忧郁'],
    palettes: [],
    loading: true
  },

  onLoad() { this.loadPalettes() },

  async loadPalettes() {
    const res = await api.getPaletteGallery({ tag: this.data.currentTab })
    if (res.code === 0 && res.data.length > 0) {
      this.setData({ palettes: res.data, loading: false })
    } else {
      this.setData({
        palettes: this.getBackupPalettes(),
        loading: false
      })
    }
  },

  getBackupPalettes() {
    return [
      { _id: 'p1', name: '初春晨雾', colors: ['#E8B4B8', '#F0CECE', '#C9B8E8', '#F9F0E0', '#D4C4A8'], likeCount: 128, emotionTag: '温柔', emotionColor: '#E8B4B8' },
      { _id: 'p3', name: '暮光晚橙', colors: ['#F18F43', '#F5A660', '#D5DD5E', '#E8D080', '#F0C860'], likeCount: 204, emotionTag: '活力', emotionColor: '#F18F43' },
      { _id: 'p4', name: '苔原初绿', colors: ['#94B276', '#A8C488', '#7A9660', '#B4D090', '#C8DCA8'], likeCount: 156, emotionTag: '沉静', emotionColor: '#94B276' },
      { _id: 'p5', name: '烟雨江南', colors: ['#9B8EA8', '#7A6880', '#B8AABF', '#6A5870', '#C8C0D0'], likeCount: 118, emotionTag: '忧郁', emotionColor: '#9B8EA8' },
      { _id: 'p6', name: '莫奈花园', colors: ['#E8B4B8', '#C9B8E8', '#B8D4E8', '#D4E8C4', '#F0E0C0'], likeCount: 312, emotionTag: '温柔', emotionColor: '#E8B4B8' }
    ]
  },

  onTabChange(e) {
    const { tab } = e.currentTarget.dataset
    this.setData({ currentTab: tab })
    this.loadPalettes()
  },

  onPaletteDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  async onFavorite(e) {
    e.stopPropagation()
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || userInfo.isGuest) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.showToast({ title: '已收藏', icon: 'success' })
  }
})