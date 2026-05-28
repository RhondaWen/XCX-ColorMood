// pages/tools/tools.js - 云开发版本
const api = require('../../utils/api')
const colorEngine = require('../../utils/color-engine')

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
    shakeListening: false,
    photoColorCard: [],  // 拍照提取的色卡
    showColorPicker: false,  // 颜色选择面板
    quickColors: ['#F18F43', '#94B276', '#D5DD5E', '#C9B8E8', '#E8B4B8', '#9B8EA8', '#F0CECE', '#B8D4C8', '#2C2C2C']
  },

  onLoad() {
    this.generateColors()
  },

  onShow() {
    // 进入工具页时启动摇一摇
    this.startAccelerometer()
  },

  onHide() {
    // 离开工具页时停止摇一摇
    this.stopAccelerometer()
  },

  onUnload() {
    this.stopAccelerometer()
  },

  // ==========================
  // 颜色选择面板
  // ==========================
  onShowColorPicker() {
    this.setData({ showColorPicker: true })
  },

  onColorPickerChange(e) {
    const color = e.detail.color
    this.setData({ baseColor: color })
    this.generateColors()
  },

  onColorPickerConfirm(e) {
    const color = e.detail.color
    // 添加到快捷颜色列表
    const quickColors = this.data.quickColors.slice()
    if (!quickColors.includes(color)) {
      if (quickColors.length >= 12) {
        quickColors.shift()
      }
      quickColors.push(color)
    }
    this.setData({
      baseColor: color,
      quickColors,
      showColorPicker: false
    })
    this.generateColors()
  },

  onColorPickerClose(e) {
    this.setData({ showColorPicker: false })
  },

  // ==========================
  // 配色生成器
  // ==========================
  onColorChange(e) {
    const color = e.detail.value
    this.setData({ baseColor: color })
    this.generateColors()
  },

  onHexInput(e) {
    const hex = e.detail.value.toUpperCase()
    this.setData({ baseColor: hex })
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
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

  // ==========================
  // 拍照取色（完整功能：提取色卡 + 保存）
  // ==========================
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

          // 使用 color-engine 提取色卡
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

  // 清除拍照色卡
  onClearPhotoCard() {
    this.setData({ photoColorCard: [] })
  },

  // 保存色卡到云端并添加到收藏
  onSavePhotoCard() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo._id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    if (this.data.photoColorCard.length === 0) {
      wx.showToast({ title: '没有色卡可保存', icon: 'none' })
      return
    }

    // 弹出编辑名称对话框
    const defaultName = '我的色卡 ' + new Date().toLocaleDateString()
    wx.showModal({
      title: '保存色卡',
      content: '请输入色卡名称',
      editable: true,
      placeholderText: defaultName,
      success: (res) => {
        if (res.confirm) {
          const cardName = res.content && res.content.trim() ? res.content.trim() : defaultName
          this.doSavePhotoCard(cardName)
        }
      }
    })
  },

  async doSavePhotoCard(cardName) {
    wx.showLoading({ title: '保存中...', mask: true })

    const userInfo = wx.getStorageSync('userInfo')
    const colors = this.data.photoColorCard.map(c => c.hex)

    try {
      const res = await api.savePalette({
        name: cardName,
        colors: colors,
        emotionTag: '拍照取色'
      })

      if (res.code === 0) {
        // 用 id 字段添加到用户收藏
        const db = wx.cloud.database()
        const userRes = await db.collection('users').doc(userInfo._id).get()
        const favorites = userRes.data.favorites || []
        favorites.push(res.data.id)  // 使用自定义的 id
        await db.collection('users').doc(userInfo._id).update({
          data: { favorites }
        })

        // 更新本地缓存
        userInfo.favorites = favorites
        wx.setStorageSync('userInfo', userInfo)

        wx.hideLoading()
        wx.showToast({ title: '已保存到收藏', icon: 'success' })
      } else {
        wx.hideLoading()
        wx.showToast({ title: res.message || '保存失败', icon: 'none' })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('保存色卡失败:', err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  // ==========================
  // 摇一摇（灵敏度已优化）
  // ==========================
  startAccelerometer() {
    wx.startAccelerometer({ interval: 'game' })
    wx.onAccelerometerChange((res) => {
      if (!this.data.shakeListening) return
      const { x, y, z } = res
      // 阈值调低，更容易摇出来
      if (Math.abs(x) > 1.1 || Math.abs(y) > 1.1) {
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

    // 莫兰迪柔和色系
    const morandi = [
      '#E8B4B8', '#F18F43', '#94B276', '#9B8EA8',
      '#C9B8E8', '#B8D4C8', '#D4C4A8', '#F5C5A3'
    ]

    const colors = []
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * morandi.length)
      colors.push(morandi[idx])
    }

    this.setData({
      baseColor: colors[0],
      generatedColors: colors,
      mode: 'morandi',
      photoColorCard: []
    })

    setTimeout(() => {
      this.setData({ shakeListening: true })
    }, 800)
  },

  onManualShake() {
    this.onShake()
  },

  // ==========================
  // 跳转 + 复制
  // ==========================
  onGoCanvas() {
    wx.navigateTo({ url: '/pages/canvas/canvas' })
  },

  onCopyColor(e) {
    const color = e.currentTarget.dataset.color || e.currentTarget.dataset.hex
    wx.setClipboardData({
      data: color,
      success: () => {
        wx.showToast({ title: `已复制 ${color}`, icon: 'success' })
      }
    })
  }
})