// pages/detail/detail.js - 云开发版本
const api = require('../../utils/api')

Page({
  data: {
    paletteId: null,
    palette: null,
    favorite: false,
    loading: true,
    canDelete: false  // 是否可删除（拍照取色的色卡）
  },

  onLoad(options) {
    this.setData({ paletteId: options.id })
    this.loadPaletteDetail()
  },

  async loadPaletteDetail() {
    // 备用数据（用于本地测试）
    const backupData = {
      'p1': { _id: 'p1', name: '初春晨雾', colors: ['#E8B4B8', '#F0CECE', '#C9B8E8', '#F9F0E0', '#D4C4A8'], description: '如初春清晨的第一缕光，轻轻铺落在睫毛上——粉、紫、米交织，像一场没有结局的温柔梦。', likeCount: 128, emotionTag: '温柔', emotionColor: '#E8B4B8', userId: 'system' },
      'p2': { _id: 'p2', name: '温暖米麻', colors: ['#F5C5A3', '#E8D5B7', '#D4BFA0', '#C9A880', '#B89060'], description: '柔软的米麻质感，像是午后阳光洒在棉布上的温度。', likeCount: 95, emotionTag: '温柔', emotionColor: '#E8B4B8', userId: 'system' },
      'p3': { _id: 'p3', name: '暮光晚橙', colors: ['#F18F43', '#F5A660', '#D5DD5E', '#E8D080', '#F0C860'], description: '暮光洒落，温暖而明亮。', likeCount: 204, emotionTag: '活力', emotionColor: '#F18F43', userId: 'system' },
      'p4': { _id: 'p4', name: '苔原初绿', colors: ['#94B276', '#A8C488', '#7A9660', '#B4D090', '#C8DCA8'], description: '苔原初绿，沉静而平和。', likeCount: 156, emotionTag: '沉静', emotionColor: '#94B276', userId: 'system' },
      'p5': { _id: 'p5', name: '烟雨江南', colors: ['#9B8EA8', '#7A6880', '#B8AABF', '#6A5870', '#C8C0D0'], description: '烟雨江南，迷离而感伤。', likeCount: 118, emotionTag: '忧郁', emotionColor: '#9B8EA8', userId: 'system' },
      'p6': { _id: 'p6', name: '莫奈花园', colors: ['#E8B4B8', '#C9B8E8', '#B8D4E8', '#D4E8C4', '#F0E0C0'], description: '如莫奈笔下的花园，色彩柔和而梦幻。', likeCount: 312, emotionTag: '温柔', emotionColor: '#E8B4B8', userId: 'system' }
    }

    // 先尝试从云端获取
    if (this.data.paletteId && !this.data.paletteId.startsWith('p')) {
      const res = await api.getPaletteDetail(this.data.paletteId)
      if (res.code === 0 && res.data) {
        const palette = res.data
        const userInfo = wx.getStorageSync('userInfo')

        // 判断是否可删除：是拍照取色且是用户自己的
        const canDelete = palette.emotionTag === '拍照取色' &&
                          userInfo &&
                          userInfo._id === palette.userId

        this.setData({
          palette: palette,
          loading: false,
          canDelete: canDelete
        })
        return
      }
    }

    // 使用备用数据
    const palette = backupData[this.data.paletteId] || backupData['p1']
    this.setData({ palette, loading: false })

    // 检查是否已收藏
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.favorites) {
      this.setData({ favorite: userInfo.favorites.includes(this.data.paletteId) })
    }
  },

  onGoBack() { wx.navigateBack() },

  onCopyColor(e) {
    const hex = e.currentTarget.dataset.hex || e.currentTarget.dataset.color
    wx.setClipboardData({
      data: hex,
      success: () => wx.showToast({ title: `已复制 ${hex}`, icon: 'success' })
    })
  },

  async onFavorite() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo._id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    const res = await api.favoritePalette(this.data.paletteId)
    if (res.code === 0) {
      this.setData({ favorite: !this.data.favorite })
      wx.showToast({ title: this.data.favorite ? '已收藏' : '已取消', icon: 'success' })
    } else {
      wx.showToast({ title: res.message || '操作失败', icon: 'none' })
    }
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个色卡吗？删除后无法恢复。',
      success: async (res) => {
        if (res.confirm) {
          const db = wx.cloud.database()
          try {
            await db.collection('palettes').doc(this.data.paletteId).remove()
            wx.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1500)
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  onSaveImage() {
    wx.showToast({ title: '色板已保存', icon: 'success' })
  }
})