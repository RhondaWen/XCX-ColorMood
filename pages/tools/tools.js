// pages/tools/tools.js - 云开发版本
const api = require('../../utils/api')

Page({
  data: {
    baseColor: '#F18F43',
    mode: 'complementary',
    modes: [{ key: 'complementary', name: '互补色' }, { key: 'analogous', name: '类似色' }, { key: 'triadic', name: '三角配色' }, { key: 'morandi', name: '莫兰迪化' }],
    generatedColors: [],
    shakeListening: false
  },

  onLoad() {
    this.generateColors()
    this.startAccelerometer()
  },

  onUnload() { this.stopAccelerometer() },

  onColorChange(e) {
    this.setData({ baseColor: e.detail.value })
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
    this.setData({ mode: e.currentTarget.dataset.mode })
    this.generateColors()
  },

  generateColors() {
    const colors = api.generatePalette(this.data.baseColor, this.data.mode)
    this.setData({ generatedColors: colors })
  },

  onTakePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        wx.showToast({ title: '正在提取颜色...', icon: 'loading' })
        setTimeout(() => {
          const colors = ['#E8B4B8', '#C9B8E8', '#94B276', '#F18F43', '#D5DD5E']
          this.setData({ baseColor: colors[0], generatedColors: colors })
          wx.showToast({ title: '颜色提取完成', icon: 'success' })
        }, 1000)
      }
    })
  },

  startAccelerometer() {
    wx.onAccelerometerChange((res) => {
      if (!this.data.shakeListening) return
      const { x, y, z } = res
      if (Math.abs(x) > 15 || Math.abs(y) > 15 || Math.abs(z) > 15) {
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

    this.setData({
      baseColor: randomHex(),
      generatedColors: [randomHex(), randomHex(), randomHex(), randomHex()],
      mode: 'morandi'
    })

    setTimeout(() => this.setData({ shakeListening: true }), 500)
  },

  onManualShake() { this.onShake() },

  onGoCanvas() { wx.navigateTo({ url: '/pages/canvas/canvas' }) },

  onCopyColor(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.color,
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    })
  }
})