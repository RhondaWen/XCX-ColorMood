// pages/tools/tools.js - 云开发版本
const api = require('../../utils/api')
const colorEngine = require('../../utils/color-engine')

Page({
  data: {
    baseColor: '#F18F43',
    mode: 'complementary',
    modes: [{ key: 'complementary', name: '互补色' }, { key: 'analogous', name: '类似色' }, { key: 'triadic', name: '三角配色' }, { key: 'morandi', name: '莫兰迪化' }],
    generatedColors: [],
    shakeListening: false,
    photoColorCard: []  // 拍照提取的色卡（不关联配色生成器）
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

  // 拍照取色 - 独立显示色卡，不关联配色生成器
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
    wx.showLoading({ title: '正在提取颜色...', mask: true })

    wx.getImageInfo({
      src: filePath,
      success: (imgInfo) => {
        const canvas = wx.createOffscreenCanvas({
          type: '2d',
          width: 200,
          height: 200
        })
        const ctx = canvas.getContext('2d')

        const img = canvas.createImage()
        img.onload = () => {
          const scale = Math.min(200 / imgInfo.width, 200 / imgInfo.height)
          const drawWidth = imgInfo.width * scale
          const drawHeight = imgInfo.height * scale

          ctx.drawImage(img, 0, 0, drawWidth, drawHeight)
          const imageData = ctx.getImageData(0, 0, drawWidth, drawHeight)

          // 提取色卡（5个颜色）
          const extractedColors = colorEngine.extractColors(imageData, 5)

          wx.hideLoading()

          if (extractedColors && extractedColors.length > 0) {
            const photoColorCard = extractedColors.map(c => ({
              hex: c.hex,
              name: c.name,
              ratio: c.ratio
            }))
            this.setData({ photoColorCard: photoColorCard })
            wx.showToast({ title: '色卡提取完成', icon: 'success' })
          } else {
            wx.showToast({ title: '未能提取颜色', icon: 'none' })
          }
        }

        img.onerror = () => {
          wx.hideLoading()
          wx.showToast({ title: '图片加载失败', icon: 'none' })
        }

        img.src = filePath
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '获取图片信息失败', icon: 'none' })
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

  // 摇一摇 - 关联配色生成器
  onShake() {
    this.setData({ shakeListening: false })
    wx.vibrateShort()
    wx.showToast({ title: '随机配色生成中...', icon: 'loading' })

    // 生成随机本色（莫兰迪色调）
    const r = Math.floor(Math.random() * 80 + 150)
    const g = Math.floor(Math.random() * 80 + 150)
    const b = Math.floor(Math.random() * 80 + 150)
    const baseColor = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()

    this.setData({
      baseColor: baseColor,
      mode: 'morandi',
      photoColorCard: []  // 清除拍照色卡
    })
    this.generateColors()

    setTimeout(() => this.setData({ shakeListening: true }), 500)
  },

  onManualShake() { this.onShake() },

  onGoCanvas() { wx.navigateTo({ url: '/pages/canvas/canvas' }) },

  onCopyColor(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.color,
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    })
  },

  // 清除拍照色卡
  onClearPhotoCard() {
    this.setData({ photoColorCard: [] })
  },

  // 保存色卡到云端并添加到收藏
  async onSavePhotoCard() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo._id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    if (this.data.photoColorCard.length === 0) {
      wx.showToast({ title: '没有色卡可保存', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中...', mask: true })

    const colors = this.data.photoColorCard.map(c => c.hex)
    const colorNames = this.data.photoColorCard.map(c => c.name).join('、')

    try {
      // 1. 保存色卡到 palettes 集合
      const res = await api.savePalette({
        name: '拍照取色 - ' + colorNames,
        colors: colors,
        emotionTag: '拍照取色'
      })

      if (res.code === 0) {
        // 2. 自动添加到用户收藏
        const db = wx.cloud.database()
        const userRes = await db.collection('users').doc(userInfo._id).get()
        const favorites = userRes.data.favorites || []
        favorites.push(res.data._id)
        await db.collection('users').doc(userInfo._id).update({
          data: { favorites }
        })

        wx.hideLoading()
        wx.showToast({ title: '已保存到收藏', icon: 'success' })
      } else {
        wx.hideLoading()
        wx.showToast({ title: res.message || '保存失败', icon: 'none' })
      }
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  }
})