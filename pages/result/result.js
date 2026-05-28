// pages/result/result.js - 云开发版本
const api = require('../../utils/api')
const palettesData = require('../../utils/palettes-data')

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
    hexInputValue: '#F18F43',
    hexInputError: '',
    colorPalette: {
      warm: ['#FF6B6B', '#FF8E72', '#FFA07A', '#FFB347', '#FFCC5C', '#F18F43', '#E8B4B8', '#F0CECE'],
      cool: ['#4ECDC4', '#45B7D1', '#96CEB4', '#94B276', '#88D8B0', '#7FDBDA', '#B8D4C8', '#A8D8EA'],
      soft: ['#C9B8E8', '#D5DD5E', '#E8D5B7', '#F5E6D3', '#F9F0E0', '#D4C4A8', '#9B8EA8', '#B8AABF'],
      neutral: ['#2C2C2C', '#4A4A4A', '#6B6B6B', '#8B8B8B', '#AAAAAA', '#CCCCCC', '#E8E0D8', '#F9F5F0'],
      vibrant: ['#FF4757', '#2F86A6', '#FFDD59', '#7BED9F', '#70A1FF', '#5352ED', '#D63384', '#E056FD']
    },
    emotions: [
      { id: 1, name: '温柔', icon: '🌸', iconClass: 'shape-pink-teardrop', color: '#E8B4B8' },
      { id: 2, name: '活力', icon: '🌟', iconClass: 'shape-cyan-triangle', color: '#F18F43' },
      { id: 3, name: '沉静', icon: '🍃', iconClass: 'shape-orange-square', color: '#94B276' },
      { id: 4, name: '忧郁', icon: '🌧', iconClass: 'shape-blue-penta', color: '#9B8EA8' },
      { id: 5, name: '自定义', icon: '✨', iconClass: 'shape-custom', color: '#D5DD5E', isCustom: true }
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
      1: { name: '温柔', icon: '🌸', iconClass: 'shape-pink-teardrop', color: '#E8B4B8' },
      2: { name: '活力', icon: '🌟', iconClass: 'shape-cyan-triangle', color: '#F18F43' },
      3: { name: '沉静', icon: '🍃', iconClass: 'shape-orange-square', color: '#94B276' },
      4: { name: '忧郁', icon: '🌧', iconClass: 'shape-blue-penta', color: '#9B8EA8' }
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
    return palettesData.getPalettesByEmotionId(this.data.emotionId)
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
    this.setData({
      currentCustomColor: e.detail.value,
      hexInputValue: e.detail.value,
      hexInputError: ''
    })
  },

  // HEX 输入处理
  onHexInput(e) {
    const value = e.detail.value.toUpperCase()
    this.setData({ hexInputValue: value })

    // 验证 HEX 格式
    if (value.length === 7 && /^#[0-9A-F]{6}$/.test(value)) {
      this.setData({ hexInputError: '', currentCustomColor: value })
    } else if (value.length > 0 && !/^#[0-9A-F]*$/.test(value)) {
      this.setData({ hexInputError: '格式错误，请输入 #RRGGBB' })
    } else {
      this.setData({ hexInputError: '' })
    }
  },

  // 确认 HEX 输入
  onHexConfirm() {
    const value = this.data.hexInputValue
    if (/^#[0-9A-F]{6}$/.test(value)) {
      this.setData({ currentCustomColor: value, hexInputError: '' })
    } else {
      this.setData({ hexInputError: '请输入有效的颜色值 #RRGGBB' })
    }
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
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index
    console.log('点击色卡，ID:', id, 'index:', index)

    let paletteId = id
    if (!paletteId && index !== undefined && this.data.palettes[index]) {
      paletteId = this.data.palettes[index].id || this.data.palettes[index]._id
      console.log('从数据中获取 ID:', paletteId)
    }

    if (paletteId) {
      wx.navigateTo({ url: `/pages/detail/detail?id=${paletteId}` })
    } else {
      wx.showToast({ title: '无法获取色卡信息', icon: 'none' })
    }
  }
})