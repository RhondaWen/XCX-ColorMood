// pages/gallery/gallery.js - 云开发版本
const api = require('../../utils/api')

Page({
  data: {
    currentMainTab: 'gallery',      // 主标签：gallery / favorites
    currentEmotionTab: '全部',       // 广场情绪标签
    currentSourceTab: '全部',        // 收藏来源标签
    emotionTabs: ['全部', '温柔', '活力', '沉静', '忧郁'],
    sourceTabs: ['全部', '拍照取色', '收藏'],
    palettes: [],
    loading: true
  },

  onLoad() {
    this.loadPalettes()
  },

  onMainTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentMainTab: tab,
      loading: true,
      palettes: []
    })
    this.loadPalettes()
  },

  onEmotionTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentEmotionTab: tab,
      loading: true,
      palettes: []
    })
    this.loadPalettes()
  },

  onSourceTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentSourceTab: tab,
      loading: true,
      palettes: []
    })
    this.loadPalettes()
  },

  async loadPalettes() {
    if (this.data.currentMainTab === 'gallery') {
      // 广场：使用系统预设色卡（备用数据）
      this.setData({
        palettes: this.getBackupPalettes(),
        loading: false
      })
    } else {
      // 我的收藏：显示用户收藏的色卡（包括拍照取色）
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo || !userInfo._id) {
        this.setData({
          palettes: [],
          loading: false
        })
        return
      }

      const res = await api.getFavorites()
      if (res.code === 0) {
        let palettes = res.data || []

        // 按来源筛选
        if (this.data.currentSourceTab !== '全部') {
          if (this.data.currentSourceTab === '拍照取色') {
            palettes = palettes.filter(p => p.emotionTag === '拍照取色')
          } else if (this.data.currentSourceTab === '收藏') {
            palettes = palettes.filter(p => p.emotionTag !== '拍照取色')
          }
        }

        this.setData({ palettes: palettes, loading: false })
      } else {
        this.setData({ palettes: [], loading: false })
      }
    }
  },

  getBackupPalettes() {
    // 按情绪分类的备用数据
    const allPalettes = [
      { _id: 'p1', name: '初春晨雾', colors: ['#E8B4B8', '#F0CECE', '#C9B8E8', '#F9F0E0', '#D4C4A8'], likeCount: 128, emotionTag: '温柔', emotionColor: '#E8B4B8' },
      { _id: 'p2', name: '温暖米麻', colors: ['#F5C5A3', '#E8D5B7', '#D4BFA0', '#C9A880', '#B89060'], likeCount: 95, emotionTag: '温柔', emotionColor: '#E8B4B8' },
      { _id: 'p6', name: '莫奈花园', colors: ['#E8B4B8', '#C9B8E8', '#B8D4E8', '#D4E8C4', '#F0E0C0'], likeCount: 312, emotionTag: '温柔', emotionColor: '#E8B4B8' },
      { _id: 'p3', name: '暮光晚橙', colors: ['#F18F43', '#F5A660', '#D5DD5E', '#E8D080', '#F0C860'], likeCount: 204, emotionTag: '活力', emotionColor: '#F18F43' },
      { _id: 'p7', name: '夏日柠檬', colors: ['#FFE135', '#FFD700', '#FFEC8B', '#F0E68C', '#FFF44F'], likeCount: 186, emotionTag: '活力', emotionColor: '#F18F43' },
      { _id: 'p4', name: '苔原初绿', colors: ['#94B276', '#A8C488', '#7A9660', '#B4D090', '#C8DCA8'], likeCount: 156, emotionTag: '沉静', emotionColor: '#94B276' },
      { _id: 'p8', name: '森林晨雾', colors: ['#228B22', '#32CD32', '#2E8B57', '#006400', '#3CB371'], likeCount: 142, emotionTag: '沉静', emotionColor: '#94B276' },
      { _id: 'p5', name: '烟雨江南', colors: ['#9B8EA8', '#7A6880', '#B8AABF', '#6A5870', '#C8C0D0'], likeCount: 118, emotionTag: '忧郁', emotionColor: '#9B8EA8' },
      { _id: 'p9', name: '深海夜蓝', colors: ['#191970', '#000080', '#4169E1', '#483D8B', '#6A5ACD'], likeCount: 98, emotionTag: '忧郁', emotionColor: '#9B8EA8' }
    ]

    // 根据当前情绪标签筛选
    if (this.data.currentEmotionTab === '全部') {
      return allPalettes
    } else {
      return allPalettes.filter(p => p.emotionTag === this.data.currentEmotionTab)
    }
  },

  onReachBottom() {
    // 可扩展分页加载
  },

  onPaletteDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  async onFavorite(e) {
    e.stopPropagation()
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo._id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    const paletteId = e.currentTarget.dataset.id
    const res = await api.favoritePalette(paletteId)
    if (res.code === 0) {
      wx.showToast({ title: '已收藏', icon: 'success' })
    } else {
      wx.showToast({ title: res.message || '操作失败', icon: 'none' })
    }
  },

  onDeleteFavorite(e) {
    e.stopPropagation()
    const paletteId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要从收藏中删除这个色卡吗？',
      success: async (res) => {
        if (res.confirm) {
          const result = await api.favoritePalette(paletteId) // 取消收藏
          if (result.code === 0) {
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadPalettes() // 刷新列表
          }
        }
      }
    })
  }
})