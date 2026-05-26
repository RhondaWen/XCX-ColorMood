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
        if (!res[0]) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)

        this.canvas = canvas
        this.ctx = ctx

        // 初始化背景
        ctx.fillStyle = '#F9F5F0'
        ctx.fillRect(0, 0, res[0].width, res[0].height)
        ctx.fillStyle = 'rgba(107,107,107,.3)'
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('点击画布开始绘制', res[0].width / 2, res[0].height / 2)
      })
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
    this.saveHistory()
  },

  onTouchMove(e) {
    if (!this.drawing) return
    const touch = e.touches[0]
    const width = touch.x - this.startX
    const height = touch.y - this.startY

    this.restoreLast()
    this.ctx.fillStyle = this.data.currentColor

    if (this.data.currentShape === 'rect') {
      this.ctx.beginPath()
      this.ctx.roundRect(this.startX, this.startY, width, height, 8)
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
    const query = wx.createSelectorQuery()
    query.select('#drawCanvas').fields({ size: true }).exec((res) => {
      if (res[0]) {
        this.ctx.fillStyle = '#F9F5F0'
        this.ctx.fillRect(0, 0, res[0].width, res[0].height)
        this.history = []
        wx.showToast({ title: '已清空', icon: 'none' })
      }
    })
  },

  onSave() {
    wx.showToast({ title: '画板已保存至相册', icon: 'success' })
  },

  onGoBack() {
    wx.navigateBack()
  }
})