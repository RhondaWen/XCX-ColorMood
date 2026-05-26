// pages/gallery/gallery.js
const api = require('../../utils/api')

Page({
  data: {
    currentTab: '全部',
    tabs: ['全部', '温柔', '活力', '沉静', '忧郁'],
    palettes: [],
    loading: true,
    page: 1
  },

  onLoad() {
    this.loadPalettes()
  },

  onPullDownRefresh() {
    this.setData({ page: 1 })
    this.loadPalettes()
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    this.setData({ page: this.data.page + 1 })
    this.loadPalettes(true)
  },

  loadPalettes(append = false) {
    // 模拟数据
    const allPalettes = [
      { id: 1, name: '暮光晚橙', colors: ['#F18F43', '#F5A660', '#D5DD5E', '#E8D080', '#F0C860'], likeCount: 204, emotionTag: '活力', emotionColor: '#F18F43' },
      { id: 2, name: '苔原初绿', colors: ['#94B276', '#A8C488', '#7A9660', '#B4D090', '#C8DCA8'], likeCount: 156, emotionTag: '沉静', emotionColor: '#94B276' },
      { id: 3, name: '烟雨江南', colors: ['#9B8EA8', '#7A6880', '#B8AABF', '#6A5870', '#C8C0D0'], likeCount: 118, emotionTag: '忧郁', emotionColor: '#9B8EA8' },
      { id: 4, name: '莫奈花园', colors: ['#E8B4B8', '#C9B8E8', '#B8D4E8', '#D4E8C4', '#F0E0C0'], likeCount: 312, emotionTag: '温柔', emotionColor: '#E8B4B8' },
      { id: 5, name: '芥末春日', colors: ['#D5DD5E', '#C4CC50', '#E8F080', '#F0F4A0', '#A8B040'], likeCount: 89, emotionTag: '活力', emotionColor: '#D5DD5E' },
      { id: 6, name: '初春晨雾', colors: ['#E8B4B8', '#F0CECE', '#C9B8E8', '#F9F0E0', '#D4C4A8'], likeCount: 128, emotionTag: '温柔', emotionColor: '#E8B4B8' },
      { id: 7, name: '薄荷轻语', colors: ['#B8D4C8', '#C8E0D4', '#D8ECD8', '#E8F4E8', '#F0F8F0'], likeCount: 67, emotionTag: '沉静', emotionColor: '#B8D4C8' }
    ]

    let filtered = allPalettes
    if (this.data.currentTab !== '全部') {
      filtered = allPalettes.filter(p => p.emotionTag === this.data.currentTab)
    }

    if (append) {
      this.setData({
        palettes: [...this.data.palettes, ...filtered],
        loading: false
      })
    } else {
      this.setData({
        palettes: filtered,
        loading: false
      })
    }
  },

  onTabChange(e) {
    const { tab } = e.currentTarget.dataset
    this.setData({ currentTab: tab, page: 1 })
    this.loadPalettes()
  },

  onPaletteDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  onFavorite(e) {
    e.stopPropagation()
    wx.showToast({ title: '已收藏', icon: 'success' })
  }
})