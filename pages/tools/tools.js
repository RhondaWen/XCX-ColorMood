// pages/tools/tools.js
const api = require('../../utils/api')

Page({
  data: {
    baseColor: '#F18F43',
    mode: 'complementary',
    modes: [
      { key: 'complementary', name: '互补色' },
      { key: 'analogous', name: '类似色' },
      { key: 'triadic', name: '三角配色' },
      { key: 'morandi', name: '莫兰迪化' }
    ],
    generatedColors: [],
    shakeListening: false
  },

  onLoad() {
    this.generateColors()
    this.startAccelerometer()
  },

  onUnload() {
    this.stopAccelerometer()
  },

  // 配色生成器
  onColorChange(e) {
    const color = e.detail.value
    this.setData({ baseColor: color })
    this.generateColors()
  },

  onHexInput(e) {
    const hex = e.detail.value
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      this.setData({ baseColor: hex })
      this.generateColors()
    }
  },

  onModeChange(e) {
    const { mode } = e.currentTarget.dataset
    this.setData({ mode })
    this.generateColors()
  },

  generateColors() {
    const colors = api.generatePalette(this.data.baseColor, this.data.mode)
    this.setData({ generatedColors: colors })
  },

  // 拍照取色
  onTakePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.extractColorsFromImage(tempFilePath)
      }
    })
  },

  extractColorsFromImage(filePath) {
    wx.showToast({ title: '正在提取颜色...', icon: 'loading' })
    setTimeout(() => {
      const colors = ['#E8B4B8', '#C9B8E8', '#94B276', '#F18F43', '#D5DD5E']
      this.setData({
        baseColor: colors[0],
        generatedColors: colors
      })
      wx.showToast({ title: '颜色提取完成', icon: 'success' })
    }, 1000)
  },

  // 摇一摇
  startAccelerometer() {
    wx.onAccelerometerChange((res) => {
      if (!this.data.shakeListening) return
      const { x, y, z } = res
      const threshold = 15
      if (Math.abs(x) > threshold || Math.abs(y) > threshold || Math.abs(z) > threshold) {
        this.onShake()
      }
    })
    this.setData({ shakeListening: true })
  },

  stopAccelerometer() {
    wx.stopAccelerometer()
    this.setData({ shakeListening: false })
  },

  onShake() {
    this.setData({ shakeListening: false })
    wx.vibrateShort()
    wx.showToast({ title: '随机配色生成中...', icon: 'loading' })

    const randomHex = () => {
      const r = Math.floor(Math.random() * 80 + 150)
      const g = Math.floor(Math.random() * 80 + 150)
      const b = Math.floor(Math.random() * 80 + 150)
      return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
    }

    const colors = [randomHex(), randomHex(), randomHex(), randomHex()]
    this.setData({
      baseColor: colors[0],
      generatedColors: colors,
      mode: 'morandi'
    })

    setTimeout(() => {
      this.setData({ shakeListening: true })
    }, 500)
  },

  onManualShake() {
    this.onShake()
  },

  onGoCanvas() {
    wx.navigateTo({ url: '/pages/canvas/canvas' })
  },

  onCopyColor(e) {
    const { color } = e.currentTarget.dataset
    wx.setClipboardData({
      data: color,
      success: () => {
        wx.showToast({ title: `已复制 ${color}`, icon: 'success' })
      }
    })
  }
})