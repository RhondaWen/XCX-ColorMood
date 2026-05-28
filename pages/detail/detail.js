// pages/detail/detail.js - 云开发版本
const api = require('../../utils/api')
const palettesData = require('../../utils/palettes-data')

// 颜色名称映射（预设）
const colorNameMap = {
  '#E8B4B8': '深蜜桃',
  '#F0CECE': '羽粉晨光',
  '#C9B8E8': '薰衣雾',
  '#F9F0E0': '奶油象牙',
  '#D4C4A8': '苔原米',
  '#F5C5A3': '暖杏沙',
  '#E8D5B7': '米麻原',
  '#D4BFA0': '浅褐麻',
  '#C9A880': '古铜米',
  '#B89060': '深褐麻',
  '#F18F43': '暮光橙',
  '#F5A660': '暖金橙',
  '#D5DD5E': '芥末黄',
  '#E8D080': '柠檬奶',
  '#F0C860': '金蜜橙',
  '#94B276': '苔原绿',
  '#A8C488': '嫩芽绿',
  '#7A9660': '森林绿',
  '#B4D090': '薄荷绿',
  '#C8DCA8': '晨露绿',
  '#B8D4C8': '薄荷冰',
  '#C8E0D4': '薄雾绿',
  '#D8ECD8': '晨曦绿',
  '#E8F4E8': '新芽绿',
  '#F0F8F0': '露珠白',
  '#F9F5F0': '晨曦米',
  '#F0EBE3': '象牙白',
  '#E8E0D8': '暖灰米',
  '#D9D0C7': '雾灰米',
  '#C8C0B8': '暮灰米',
  '#228B22': '森林绿',
  '#32CD32': '亮叶绿',
  '#2E8B57': '深海绿',
  '#006400': '暗森林',
  '#3CB371': '中森林',
  '#9B8EA8': '烟雨紫',
  '#7A6880': '深烟紫',
  '#B8AABF': '薄雾紫',
  '#6A5870': '暗烟紫',
  '#C8C0D0': '晨雾紫',
  '#D4C0DC': '紫罗兰',
  '#C8B0D0': '薰衣草',
  '#BCACC8': '薄雾兰',
  '#B0A0C0': '晨曦紫',
  '#A490B8': '深薰衣',
  '#191970': '午夜蓝',
  '#000080': '海军蓝',
  '#4169E1': '皇室蓝',
  '#483D8B': '暗皇室',
  '#6A5ACD': '板岩蓝',
  '#FFE135': '柠檬黄',
  '#FFD700': '金盏花',
  '#FFEC8B': '浅柠檬',
  '#F0E68C': '卡其黄',
  '#FFF44F': '亮柠檬',
  '#D5DD5E': '芥末绿',
  '#C4CC50': '深芥末',
  '#E8F080': '柠檬草',
  '#F0F4A0': '浅芥末',
  '#A8B040': '橄榄芥'
}

Page({
  data: {
    paletteId: null,
    palette: null,
    colorDetails: [],  // 颜色详情（带名称）
    loading: true,
    canDelete: false,
    canEdit: false
  },

  onLoad(options) {
    this.setData({ paletteId: options.id })
    this.loadPaletteDetail()
  },

  async loadPaletteDetail() {
    console.log('加载色卡详情，ID:', this.data.paletteId)

    // 优先从云端获取（用 id 字段查询）
    try {
      const res = await api.getPaletteDetail(this.data.paletteId)
      console.log('云端返回:', res)
      if (res.code === 0 && res.data) {
        const palette = res.data
        console.log('云端获取成功，色卡名称:', palette.name)
        const userInfo = wx.getStorageSync('userInfo')
        const isOwner = userInfo && userInfo._id === palette.userId
        const canEdit = palette.emotionTag === '拍照取色' && isOwner

        this.setData({
          palette: palette,
          colorDetails: this.getColorDetails(palette.colors),
          loading: false,
          canDelete: canEdit,
          canEdit: canEdit
        })
        return
      }
    } catch (err) {
      console.log('云端获取失败:', err)
    }

    // 云端获取失败时，从共享数据获取预设色卡
    console.log('使用备用数据')
    const allPalettes = palettesData.getAllPalettes()
    const palette = allPalettes.find(p => p.id === this.data.paletteId)

    if (palette) {
      // 添加描述信息
      const descriptions = {
        'p1': '如初春清晨的第一缕光，轻轻铺落在睫毛上——粉、紫、米交织，像一场没有结局的温柔梦。',
        'p2': '柔软的米麻质感，像是午后阳光洒在棉布上的温度。适合需要被安慰的时候，也适合想把温柔给别人的时刻。',
        'p3': '暮光洒落，温暖而明亮。充满活力的橙色调，适合需要勇气和热情的时刻。',
        'p4': '芥末黄的春日气息，清新而有活力。适合迎接新的开始。',
        'p5': '苔原初绿，沉静而平和。让人心神安宁，适合需要专注和深思的时刻。',
        'p6': '薄荷的清新，轻声细语般的沉静。适合放松心情，找回内心的平静。',
        'p7': '烟雨江南，迷离而感伤。如水墨画般的忧郁，适合需要独处和思考的时刻。',
        'p8': '紫罗兰的絮语，淡淡的忧郁与感伤。适合安静地感受情绪。',
        'p9': '如莫奈笔下的花园，色彩柔和而梦幻。温柔中带着一丝神秘。',
        'p10': '晨曦的微光，宁静而平和。适合清晨醒来时感受内心的平静。',
        'p11': '夏日柠檬的清新酸甜，充满阳光的味道。适合迎接充满希望的一天。',
        'p12': '森林中的晨雾，深邃而宁静。适合需要与自然连接的时刻。',
        'p13': '深海夜蓝，深邃而神秘。适合夜晚独处时感受内心的深度。'
      }
      palette.description = descriptions[palette._id] || '独特的色彩组合，记录此刻的情绪。'

      this.setData({
        palette,
        colorDetails: this.getColorDetails(palette.colors),
        loading: false
      })
    } else {
      // 默认显示第一个色卡
      const defaultPalette = allPalettes[0]
      defaultPalette.description = '独特的色彩组合，记录此刻的情绪。'
      this.setData({
        palette: defaultPalette,
        colorDetails: this.getColorDetails(defaultPalette.colors),
        loading: false
      })
    }
  },

  // 获取颜色详情（带名称）
  getColorDetails(colors) {
    return colors.map(hex => ({
      hex,
      name: colorNameMap[hex] || this.guessColorName(hex)
    }))
  },

  // 根据颜色值猜测名称
  guessColorName(hex) {
    const hsl = this.hexToHsl(hex)
    const [h, s, l] = hsl

    if (l > 90) return '纯白'
    if (l < 10) return '纯黑'

    if (s < 10) {
      if (l > 70) return '浅灰'
      if (l > 40) return '中灰'
      return '深灰'
    }

    // 色相判断
    if (h < 15 || h > 345) return s > 50 ? '红' : '粉'
    if (h < 45) return s > 50 ? '橙' : '米'
    if (h < 75) return s > 50 ? '黄' : '奶'
    if (h < 150) return s > 50 ? '绿' : '薄荷'
    if (h < 210) return s > 50 ? '青' : '浅蓝'
    if (h < 270) return s > 50 ? '蓝' : '雾蓝'
    if (h < 315) return s > 50 ? '紫' : '薰衣'
    return '粉紫'
  },

  // HEX 转 HSL
  hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255
    let g = parseInt(hex.slice(3, 5), 16) / 255
    let b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }
    return [h * 360, s * 100, l * 100]
  },

  onGoBack() { wx.navigateBack() },

  onCopyColor(e) {
    const hex = e.currentTarget.dataset.hex || e.currentTarget.dataset.color
    wx.setClipboardData({
      data: hex,
      success: () => wx.showToast({ title: `已复制 ${hex}`, icon: 'success' })
    })
  },

  onEditName() {
    wx.showModal({
      title: '编辑色卡名称',
      content: '请输入新的名称',
      editable: true,
      placeholderText: this.data.palette.name,
      success: (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          this.doUpdateName(res.content.trim())
        }
      }
    })
  },

  async doUpdateName(newName) {
    wx.showLoading({ title: '保存中...', mask: true })

    const db = wx.cloud.database()
    try {
      await db.collection('palettes').doc(this.data.paletteId).update({
        data: { name: newName }
      })

      const palette = { ...this.data.palette, name: newName }
      this.setData({ palette })

      wx.hideLoading()
      wx.showToast({ title: '名称已更新', icon: 'success' })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '更新失败', icon: 'none' })
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
            // 使用 _id 删除，而不是自定义的 id
            const docId = this.data.palette._id
            await db.collection('palettes').doc(docId).remove()
            wx.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1500)
          } catch (err) {
            console.error('删除失败:', err)
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 保存色卡图片到相册
  async onSaveImage() {
    if (!this.data.palette || !this.data.palette.colors) {
      wx.showToast({ title: '数据加载中', icon: 'none' })
      return
    }

    wx.showLoading({ title: '生成图片中...', mask: true })

    try {
      // 获取 canvas 实例
      const query = wx.createSelectorQuery()
      query.select('#paletteCanvas')
        .fields({ node: true, size: true })
        .exec(async (res) => {
          if (!res[0] || !res[0].node) {
            wx.hideLoading()
            wx.showToast({ title: 'Canvas获取失败', icon: 'none' })
            return
          }

          const canvas = res[0].node
          const ctx = canvas.getContext('2d')

          // 设置 canvas 尺寸（像素值）
          const dpr = 2  // 高清
          canvas.width = 300 * dpr
          canvas.height = 400 * dpr
          ctx.scale(dpr, dpr)

          // 绘制背景
          ctx.fillStyle = '#F9F5F0'
          ctx.fillRect(0, 0, 300, 400)

          // 绘制标题
          ctx.fillStyle = '#2C2C2C'
          ctx.font = 'bold 18px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(this.data.palette.name || '色卡', 150, 30)

          // 绘制情绪标签
          if (this.data.palette.emotionTag) {
            ctx.fillStyle = '#6B6B6B'
            ctx.font = '12px sans-serif'
            ctx.fillText(this.data.palette.emotionTag, 150, 50)
          }

          // 绘制色条
          const colors = this.data.palette.colors
          const stripY = 70
          const stripHeight = 80
          const stripWidth = 280
          const colorWidth = stripWidth / colors.length

          colors.forEach((color, index) => {
            ctx.fillStyle = color
            ctx.fillRect(10 + index * colorWidth, stripY, colorWidth, stripHeight)
          })

          // 绘制颜色详情列表
          const startY = stripY + stripHeight + 20
          ctx.font = '12px sans-serif'
          ctx.textAlign = 'left'

          this.data.colorDetails.forEach((colorDetail, index) => {
            const y = startY + index * 40

            // 颜色方块（手动圆角）
            ctx.fillStyle = colorDetail.hex
            const size = 30, r = 4, x = 20
            ctx.beginPath()
            ctx.moveTo(x + r, y)
            ctx.lineTo(x + size - r, y)
            ctx.arcTo(x + size, y, x + size, y + r, r)
            ctx.lineTo(x + size, y + size - r)
            ctx.arcTo(x + size, y + size, x + size - r, y + size, r)
            ctx.lineTo(x + r, y + size)
            ctx.arcTo(x, y + size, x, y + size - r, r)
            ctx.lineTo(x, y + r)
            ctx.arcTo(x, y, x + r, y, r)
            ctx.closePath()
            ctx.fill()

            // 颜色名称
            ctx.fillStyle = '#2C2C2C'
            ctx.font = 'bold 13px sans-serif'
            ctx.fillText(colorDetail.name || '', 60, y + 12)

            // HEX值
            ctx.fillStyle = '#6B6B6B'
            ctx.font = '11px sans-serif'
            ctx.fillText(colorDetail.hex, 60, y + 26)
          })

          // 绘制底部装饰线
          ctx.strokeStyle = '#D9D0C7'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(20, 380)
          ctx.lineTo(280, 380)
          ctx.stroke()

          // 导出图片
          wx.canvasToTempFilePath({
            canvas: canvas,
            success: (res) => {
              // 保存到相册
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: () => {
                  wx.hideLoading()
                  wx.showToast({ title: '已保存到相册', icon: 'success' })
                },
                fail: (err) => {
                  wx.hideLoading()
                  if (err.errMsg.includes('auth deny')) {
                    wx.showModal({
                      title: '需要授权',
                      content: '请授权保存图片到相册',
                      success: (res) => {
                        if (res.confirm) {
                          wx.openSetting()
                        }
                      }
                    })
                  } else {
                    wx.showToast({ title: '保存失败', icon: 'none' })
                  }
                }
              })
            },
            fail: () => {
              wx.hideLoading()
              wx.showToast({ title: '生成图片失败', icon: 'none' })
            }
          })
        })
    } catch (err) {
      wx.hideLoading()
      console.error('保存图片失败:', err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  }
})