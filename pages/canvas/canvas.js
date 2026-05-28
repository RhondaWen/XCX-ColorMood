// pages/canvas/canvas.js
Page({
  data: {
    currentShape: 'rect',
    currentColor: '#F18F43',
    paletteColors: ['#F18F43', '#94B276', '#D5DD5E', '#C9B8E8', '#E8B4B8', '#9B8EA8', '#F0CECE', '#B8D4C8', '#2C2C2C', '#F9F5F0']
  },

  onLoad() {
    this.history = []
    this.drawing = false
  },

  onReady() {
    this.initCanvas()
  },

  initCanvas() {
    const query = wx.createSelectorQuery()
    query.select('#drawCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          console.error('Canvas not found')
          return
        }
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)

        this.canvas = canvas
        this.ctx = ctx
        this.canvasWidth = res[0].width
        this.canvasHeight = res[0].height

        // 初始化背景
        ctx.fillStyle = '#F9F5F0'
        ctx.fillRect(0, 0, res[0].width, res[0].height)
        ctx.fillStyle = 'rgba(107,107,107,.3)'
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('点击画布开始绘制', res[0].width / 2, res[0].height / 2)
      })
  },

  // 兼容性 roundRect 方法
  drawRoundRect(ctx, x, y, width, height, radius) {
    radius = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2)
    radius = Math.max(0, radius)

    const startX = width < 0 ? x + width : x
    const startY = height < 0 ? y + height : y
    const w = Math.abs(width)
    const h = Math.abs(height)

    ctx.beginPath()
    ctx.moveTo(startX + radius, startY)
    ctx.lineTo(startX + w - radius, startY)
    ctx.quadraticCurveTo(startX + w, startY, startX + w, startY + radius)
    ctx.lineTo(startX + w, startY + h - radius)
    ctx.quadraticCurveTo(startX + w, startY + h, startX + w - radius, startY + h)
    ctx.lineTo(startX + radius, startY + h)
    ctx.quadraticCurveTo(startX, startY + h, startX, startY + h - radius)
    ctx.lineTo(startX, startY + radius)
    ctx.quadraticCurveTo(startX, startY, startX + radius, startY)
    ctx.closePath()
  },

  onShapeChange(e) {
    const { shape } = e.currentTarget.dataset
    this.setData({ currentShape: shape })
  },

  onColorSelect(e) {
    const { color } = e.currentTarget.dataset
    this.setData({ currentColor: color })
  },

  onTouchStart(e) {
    const touch = e.touches[0]
    this.startX = touch.x
    this.startY = touch.y
    this.drawing = true
  },

  onTouchMove(e) {
    if (!this.drawing) return
    if (!this.history.length) {
      this.saveHistory()
    }
    const touch = e.touches[0]
    const width = touch.x - this.startX
    const height = touch.y - this.startY

    this.restoreLast()
    this.ctx.fillStyle = this.data.currentColor

    if (this.data.currentShape === 'rect') {
      this.drawRoundRect(this.ctx, this.startX, this.startY, width, height, 8)
      this.ctx.fill()
    } else {
      const rx = Math.abs(width) / 2
      const ry = Math.abs(height) / 2
      this.ctx.beginPath()
      this.ctx.ellipse(this.startX + width / 2, this.startY + height / 2, Math.max(rx, 2), Math.max(ry, 2), 0, 0, Math.PI * 2)
      this.ctx.fill()
    }
  },

  onTouchEnd() {
    if (this.drawing) {
      this.saveHistory()
    }
    this.drawing = false
  },

  saveHistory() {
    if (!this.canvas) return
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    this.history.push(imageData)
  },

  restoreLast() {
    if (this.history.length > 0) {
      this.ctx.putImageData(this.history[this.history.length - 1], 0, 0)
    }
  },

  onUndo() {
    if (this.history.length > 1) {
      this.history.pop()
      this.ctx.putImageData(this.history[this.history.length - 1], 0, 0)
    } else if (this.history.length === 1) {
      this.ctx.putImageData(this.history[0], 0, 0)
      this.history = []
    }
    wx.showToast({ title: '已撤销', icon: 'none' })
  },

  onClear() {
    if (!this.ctx || !this.canvasWidth) return
    this.ctx.fillStyle = '#F9F5F0'
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
    this.history = []
    wx.showToast({ title: '已清空', icon: 'none' })
  },

  onSave() {
    if (!this.canvas) {
      wx.showToast({ title: '画布未初始化', icon: 'error' })
      return
    }

    wx.showLoading({ title: '保存中...' })

    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.writePhotosAlbum']) {
          this.saveCanvasToAlbum()
        } else {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              this.saveCanvasToAlbum()
            },
            fail: () => {
              wx.hideLoading()
              wx.showModal({
                title: '提示',
                content: '需要授权保存图片到相册',
                confirmText: '去授权',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting()
                  }
                }
              })
            }
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        this.saveCanvasToAlbum()
      }
    })
  },

  saveCanvasToAlbum() {
    wx.canvasToTempFilePath({
      canvas: this.canvas,
      fileType: 'png',
      quality: 1,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.hideLoading()
            wx.showToast({ title: '已保存到相册', icon: 'success' })
          },
          fail: (err) => {
            wx.hideLoading()
            wx.showToast({ title: '保存失败', icon: 'error' })
          }
        })
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({ title: '导出图片失败', icon: 'error' })
      }
    })
  },

  onGoBack() {
    wx.navigateBack()
  }
})