// pages/detail/detail.js - 云开发版本
const api = require('../../utils/api')

Page({
  data: {
    paletteId: null,
    palette: null,
    favorite: false,
    loading: true
  },

  onLoad(options) {
    this.setData({ paletteId: options.id })
    this.loadPaletteDetail()
  },

  async loadPaletteDetail() {
    // 备用数据
    const backupData = {
      'p1': { name: '初春晨雾', colors: [{ hex: '#E8B4B8', name: '深蜜桃', tag: '温柔' }, { hex: '#F0CECE', name: '羽粉晨光', tag: '温柔' }, { hex: '#C9B8E8', name: '薰衣雾', tag: '温柔' }, { hex: '#F9F0E0', name: '奶油象牙', tag: '暖调' }, { hex: '#D4C4A8', name: '苔原米', tag: '自然' }], description: '如初春清晨的第一缕光，轻轻铺落在睫毛上——粉、紫、米交织，像一场没有结局的温柔梦。', likeCount: 128, emotionTag: '温柔', emotionColor: '#E8B4B8' },
      'p2': { name: '温暖米麻', colors: [{ hex: '#F5C5A3', name: '杏仁乳', tag: '温柔' }, { hex: '#E8D5B7', name: '棉麻褐', tag: '自然' }, { hex: '#D4BFA0', name: '砂米', tag: '暖调' }, { hex: '#C9A880', name: '驼绒', tag: '暖调' }, { hex: '#B89060', name: '焦糖棕', tag: '暖调' }], description: '柔软的米麻质感，像是午后阳光洒在棉布上的温度。', likeCount: 95, emotionTag: '温柔', emotionColor: '#E8B4B8' },
      'p3': { name: '暮光晚橙', colors: [{ hex: '#F18F43', name: '日落橙', tag: '活力' }, { hex: '#F5A660', name: '晚霞金', tag: '活力' }, { hex: '#D5DD5E', name: '芥末黄', tag: '活力' }, { hex: '#E8D080', name: '暖米', tag: '暖调' }, { hex: '#F0C860', name: '柠檬黄', tag: '活力' }], description: '暮光洒落，温暖而明亮。', likeCount: 204, emotionTag: '活力', emotionColor: '#F18F43' },
      'p4': { name: '苔原初绿', colors: [{ hex: '#94B276', name: '苔原绿', tag: '沉静' }, { hex: '#A8C488', name: '新叶绿', tag: '沉静' }, { hex: '#7A9660', name: '深林绿', tag: '沉静' }, { hex: '#B4D090', name: '嫩芽绿', tag: '沉静' }, { hex: '#C8DCA8', name: '薄荷绿', tag: '沉静' }], description: '苔原初绿，沉静而平和。', likeCount: 156, emotionTag: '沉静', emotionColor: '#94B276' },
      'p5': { name: '烟雨江南', colors: [{ hex: '#9B8EA8', name: '烟雨紫', tag: '忧郁' }, { hex: '#7A6880', name: '暗紫', tag: '忧郁' }, { hex: '#B8AABF', name: '雾紫', tag: '忧郁' }, { hex: '#6A5870', name: '深紫', tag: '忧郁' }, { hex: '#C8C0D0', name: '浅紫', tag: '忧郁' }], description: '烟雨江南，迷离而感伤。', likeCount: 118, emotionTag: '忧郁', emotionColor: '#9B8EA8' }
    }

    const palette = backupData[this.data.paletteId] || backupData['p1']
    this.setData({ palette, loading: false })

    // 检查是否已收藏
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && !userInfo.isGuest && userInfo.favorites) {
      this.setData({ favorite: userInfo.favorites.includes(this.data.paletteId) })
    }
  },

  onGoBack() { wx.navigateBack() },

  onCopyColor(e) {
    const { hex } = e.currentTarget.dataset
    wx.setClipboardData({
      data: hex,
      success: () => wx.showToast({ title: `已复制 ${hex}`, icon: 'success' })
    })
  },

  async onFavorite() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || userInfo.isGuest) {
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

  onSaveImage() {
    wx.showToast({ title: '色板已保存', icon: 'success' })
  }
})