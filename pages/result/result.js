// pages/result/result.js - 云开发版本
const api = require('../../utils/api')

Page({
  data: {
    emotionId: null,
    emotion: null,
    palettes: [],
    loading: true,
    mode: 'normal',
    isCheckinMode: false,
    selectedPalette: null,
    useCustomColors: false,
    customColors: ['#F18F43'],
    currentCustomColor: '#F18F43',
    quickColors: ['#F18F43', '#94B276', '#D5DD5E', '#C9B8E8', '#E8B4B8', '#9B8EA8', '#F0CECE', '#B8D4C8', '#2C2C2C'],
    showColorPicker: false,
    colorPalette: {
      warm: ['#FF6B6B', '#FF8E72', '#FFA07A', '#FFB347', '#FFCC5C', '#F18F43', '#E8B4B8', '#F0CECE'],
      cool: ['#4ECDC4', '#45B7D1', '#96CEB4', '#94B276', '#88D8B0', '#7FDBDA', '#B8D4C8', '#A8D8EA'],
      soft: ['#C9B8E8', '#D5DD5E', '#E8D5B7', '#F5E6D3', '#F9F0E0', '#D4C4A8', '#9B8EA8', '#B8AABF'],
      neutral: ['#2C2C2C', '#4A4A4A', '#6B6B6B', '#8B8B8B', '#AAAAAA', '#CCCCCC', '#E8E0D8', '#F9F5F0'],
      vibrant: ['#FF4757', '#2F86A6', '#FFDD59', '#7BED9F', '#70A1FF', '#5352ED', '#D63384', '#E056FD']
    },
    emotions: [
      { id: 1, name: '温柔', icon: '🌸', color: '#E8B4B8' },
      { id: 2, name: '活力', icon: '🌟', color: '#F18F43' },
      { id: 3, name: '沉静', icon: '🍃', color: '#94B276' },
      { id: 4, name: '忧郁', icon: '🌧', color: '#9B8EA8' },
      { id: 5, name: '自定义', icon: '✨', color: '#D5DD5E', isCustom: true }
    ],
    selectedEmotionId: null,
    customEmotionName: '',
    customEmotionColor: '#D5DD5E'
  },

  onLoad(options) {
    const { emotionId, mode } = options
    const isCheckinMode = mode === 'checkin'

    this.setData({
      emotionId: emotionId ? parseInt(emotionId) : null,
      mode: mode || 'normal',
      isCheckinMode
    })

    if (isCheckinMode) {
      // 打卡模式：让用户先选择情绪
      this.setData({ loading: false })
      if (emotionId) {
        this.onEmotionSelect({ currentTarget: { dataset: { id: parseInt(emotionId) } } })
      }
    } else {
      this.loadEmotionInfo()
      this.loadPalettes()
    }
  },

  onEmotionSelect(e) {
    const { id } = e.currentTarget.dataset
    const emotion = this.data.emotions.find(em => em.id === id)

    this.setData({
      selectedEmotionId: id,
      emotionId: id,
      emotion: emotion,
      useCustomColors: false,
      customColors: emotion ? [emotion.color] : ['#D5DD5E'],
      showColorPicker: false
    })

    if (!emotion?.isCustom) {
      this.loadPalettes()
    } else {
      this.setData({ palettes: [], loading: false })
    }
  },

  onCustomEmotionInput(e) {
    this.setData({ customEmotionName: e.detail.value })
  },

  onCustomEmotionColorChange(e) {
    const color = e.detail.value
    this.setData({
      customEmotionColor: color,
      customColors: [color]
    })
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
    this.setData({ loading: true })
    const res = await api.getPaletteList({ emotionId: this.data.emotionId })
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

  onPaletteSelect(e) {
    const { index } = e.currentTarget.dataset
    const palette = this.data.palettes[index]
    this.setData({
      selectedPalette: palette,
      useCustomColors: false
    })
  },

  // 自定义配色相关
  onUseCustomColors() {
    this.setData({
      useCustomColors: true,
      selectedPalette: null
    })
  },

  onAddCustomColor() {
    const colors = this.data.customColors.slice()
    if (colors.length < 10) {
      colors.push(this.data.currentCustomColor)
      this.setData({ customColors: colors })
    } else {
      wx.showToast({ title: '最多添加10种颜色', icon: 'none' })
    }
  },

  onRemoveCustomColor(e) {
    const { index } = e.currentTarget.dataset
    const colors = this.data.customColors.slice()
    colors.splice(index, 1)
    this.setData({ customColors: colors })
  },

  onQuickColorSelect(e) {
    const { color } = e.currentTarget.dataset
    this.setData({ currentCustomColor: color })
  },

  // 显示颜色选择面板
  onShowColorPicker() {
    this.setData({ showColorPicker: true })
  },

  onHideColorPicker() {
    // 关闭面板时，将当前颜色添加到快捷选色区域
    const quickColors = this.data.quickColors.slice()
    if (!quickColors.includes(this.data.currentCustomColor)) {
      // 限制快捷选色最多12个
      if (quickColors.length >= 12) {
        quickColors.shift() // 移除最旧的
      }
      quickColors.push(this.data.currentCustomColor)
      this.setData({ quickColors })
    }
    this.setData({ showColorPicker: false })
  },

  onPaletteColorSelect(e) {
    const { color } = e.currentTarget.dataset
    this.setData({
      currentCustomColor: color
    })
  },

  onColorPickerChange(e) {
    this.setData({ currentCustomColor: e.detail.value })
  },

  async onConfirmCheckin() {
    const emotion = this.data.emotion
    let colors = []
    let emotionName = ''
    let emotionColor = ''

    // 验证情绪
    if (!emotion) {
      wx.showToast({ title: '请选择情绪', icon: 'none' })
      return
    }

    if (emotion.isCustom) {
      if (!this.data.customEmotionName.trim()) {
        wx.showToast({ title: '请输入情绪名称', icon: 'none' })
        return
      }
      emotionName = this.data.customEmotionName.trim()
      emotionColor = this.data.customEmotionColor
    } else {
      emotionName = emotion.name
      emotionColor = emotion.color
    }

    // 验证配色
    if (this.data.useCustomColors) {
      colors = this.data.customColors
    } else if (this.data.selectedPalette) {
      colors = this.data.selectedPalette.colors
    } else if (emotion.isCustom) {
      colors = this.data.customColors
    } else {
      wx.showToast({ title: '请选择配色方案', icon: 'none' })
      return
    }

    if (colors.length === 0) {
      wx.showToast({ title: '请添加配色', icon: 'none' })
      return
    }

    wx.showLoading({ title: '打卡中...' })

    const res = await api.checkin({
      emotionTag: emotionName,
      emotionId: this.data.selectedEmotionId,
      colorHex: colors[0],
      colors: colors,
      emotionColor: emotionColor,
      emotionIcon: emotion.icon,
      paletteId: this.data.selectedPalette?._id || null
    })

    wx.hideLoading()

    if (res.code === 0) {
      wx.showToast({ title: '打卡成功！', icon: 'success' })
      // 更新本地用户打卡天数
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        userInfo.checkinDays = (userInfo.checkinDays || 0) + 1
        wx.setStorageSync('userInfo', userInfo)
      }
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/home' })
      }, 1500)
    } else {
      wx.showToast({ title: res.message || '打卡失败', icon: 'error' })
    }
  },

  onGoBack() { wx.navigateBack() },

  onPaletteDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  async onFavoriteAll() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || userInfo.isGuest) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.showToast({ title: '已全部收藏', icon: 'success' })
  }
})