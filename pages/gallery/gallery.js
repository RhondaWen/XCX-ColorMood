// pages/gallery/gallery.js - 云开发版本
const api = require('../../utils/api')
const palettesData = require('../../utils/palettes-data')

Page({
  data: {
    currentMainTab: 'gallery',      // 主标签：gallery / favorites
    currentEmotionTab: '全部',       // 广场情绪标签
    currentSourceTab: '全部',        // 我的色库来源标签
    emotionTabs: ['全部', '温柔', '活力', '沉静', '忧郁'],
    sourceTabs: ['全部', '拍照取色'],  // 删除了"收藏"
    palettes: [],
    loading: true
  },

  onLoad() {
    this.loadPalettes()
  },

  onShow() {
    // 检查是否需要切换到"我的色库"标签
    const galleryTab = wx.getStorageSync('galleryTab')
    if (galleryTab === 'favorites' && this.data.currentMainTab !== 'favorites') {
      wx.removeStorageSync('galleryTab')
      this.setData({
        currentMainTab: 'favorites',
        loading: true,
        palettes: []
      })
      this.loadPalettes()
    }
  },

  onMainTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentMainTab: tab,
      loading: true,
      palettes: []
    })
    this.loadPalettes()
  },

  onEmotionTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentEmotionTab: tab,
      loading: true,
      palettes: []
    })
    this.loadPalettes()
  },

  onSourceTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentSourceTab: tab,
      loading: true,
      palettes: []
    })
    this.loadPalettes()
  },

  async loadPalettes() {
    this.setData({ loading: true })

    if (this.data.currentMainTab === 'gallery') {
      // 广场：优先从云端获取系统预设色卡
      try {
        const res = await api.getPaletteGallery({ tag: this.data.currentEmotionTab })
        console.log('广场云端返回数据:', res)
        if (res.code === 0 && res.data && res.data.length > 0) {
          console.log('色卡数据示例:', res.data[0])
          this.setData({ palettes: res.data, loading: false })
        } else {
          // 云端无数据时使用备用数据
          console.log('云端无数据，使用备用数据')
          this.setData({ palettes: this.getBackupPalettes(), loading: false })
        }
      } catch (err) {
        // 出错时使用备用数据
        console.log('云端获取出错:', err)
        this.setData({ palettes: this.getBackupPalettes(), loading: false })
      }
    } else {
      // 我的色库：显示用户创建的色卡（拍照取色）
      const userInfo = wx.getStorageSync('userInfo')
      console.log('获取色库，userInfo:', userInfo)
      if (!userInfo || !userInfo._id) {
        this.setData({
          palettes: [],
          loading: false
        })
        return
      }

      const res = await api.getFavorites()
      console.log('getFavorites 结果:', res)
      if (res.code === 0) {
        let palettes = res.data || []
        console.log('获取到的色卡:', palettes)

        // 按来源筛选（只筛选拍照取色）
        if (this.data.currentSourceTab === '拍照取色') {
          palettes = palettes.filter(p => p.emotionTag === '拍照取色')
        }

        this.setData({ palettes: palettes, loading: false })
      } else {
        this.setData({ palettes: [], loading: false })
      }
    }
  },

  getBackupPalettes() {
    if (this.data.currentEmotionTab === '全部') {
      return palettesData.getAllPalettes()
    } else {
      return palettesData.getPalettesByEmotionTag(this.data.currentEmotionTab)
    }
  },

  onReachBottom() {
    // 可扩展分页加载
  },

  onPaletteDetail(e) {
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index
    console.log('点击色卡，获取的 ID:', id)

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