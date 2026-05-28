// pages/checkin-detail/checkin-detail.js
const api = require('../../utils/api')

Page({
  data: {
    checkin: null,
    isEditMode: false,
    emotions: [
      { id: 1, name: '温柔', icon: '🌸', color: '#E8B4B8' },
      { id: 2, name: '活力', icon: '🌟', color: '#F18F43' },
      { id: 3, name: '沉静', icon: '🍃', color: '#94B276' },
      { id: 4, name: '忧郁', icon: '🌧', color: '#9B8EA8' },
      { id: 5, name: '自定义', icon: '✨', color: '#D5DD5E', isCustom: true }
    ],
    selectedEmotion: null,
    customEmotionName: '',
    customEmotionColor: '#D5DD5E',
    paletteColors: [],
    quickColors: ['#F18F43', '#94B276', '#D5DD5E', '#C9B8E8', '#E8B4B8', '#9B8EA8', '#F0CECE', '#B8D4C8', '#2C2C2C'],
    currentCustomColor: '#F18F43',
    showColorPicker: false,
    colorPalette: {
      warm: ['#FF6B6B', '#FF8E72', '#FFA07A', '#FFB347', '#FFCC5C', '#F18F43', '#E8B4B8', '#F0CECE'],
      cool: ['#4ECDC4', '#45B7D1', '#96CEB4', '#94B276', '#88D8B0', '#7FDBDA', '#B8D4C8', '#A8D8EA'],
      soft: ['#C9B8E8', '#D5DD5E', '#E8D5B7', '#F5E6D3', '#F9F0E0', '#D4C4A8', '#9B8EA8', '#B8AABF'],
      neutral: ['#2C2C2C', '#4A4A4A', '#6B6B6B', '#8B8B8B', '#AAAAAA', '#CCCCCC', '#E8E0D8', '#F9F5F0'],
      vibrant: ['#FF4757', '#2F86A6', '#FFDD59', '#7BED9F', '#70A1FF', '#5352ED', '#D63384', '#E056FD']
    },
    loading: true
  },

  onLoad(options) {
    const { date, id } = options
    this.checkinDate = date
    this.checkinId = id

    if (id) {
      this.loadCheckinDetail(id)
    } else if (date) {
      this.loadCheckinByDate(date)
    }
  },

  async loadCheckinDetail(id) {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || userInfo.isGuest) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    const db = wx.cloud.database()
    try {
      const res = await db.collection('checkins').doc(id).get()
      if (res.data) {
        this.initCheckinData(res.data)
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'error' })
    }
  },

  async loadCheckinByDate(date) {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || userInfo.isGuest) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    const db = wx.cloud.database()
    try {
      const res = await db.collection('checkins')
        .where({
          userId: userInfo._id,
          date: date
        })
        .get()

      if (res.data.length > 0) {
        this.initCheckinData(res.data[0])
      } else {
        wx.showToast({ title: '未找到打卡记录', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'error' })
    }
  },

  initCheckinData(checkin) {
    const emotions = this.data.emotions
    let selectedEmotion = emotions.find(e => e.name === checkin.emotionTag)

    // 如果是自定义情绪，添加到列表
    if (!selectedEmotion && checkin.emotionTag) {
      selectedEmotion = {
        id: 5,
        name: checkin.emotionTag,
        icon: checkin.emotionIcon || '✨',
        color: checkin.emotionColor || checkin.colorHex || '#D5DD5E',
        isCustom: true
      }
      emotions[4] = selectedEmotion
    }

    this.setData({
      checkin,
      paletteColors: checkin.colors || [checkin.colorHex],
      selectedEmotion,
      customEmotionName: selectedEmotion?.isCustom ? selectedEmotion.name : '',
      customEmotionColor: selectedEmotion?.isCustom ? selectedEmotion.color : '#D5DD5E',
      currentCustomColor: checkin.colors?.[0] || checkin.colorHex || '#F18F43',
      loading: false,
      isEditMode: false,
      showColorPicker: false
    })
  },

  onEnterEdit() {
    this.setData({ isEditMode: true })
  },

  onCancelEdit() {
    this.setData({ isEditMode: false, showColorPicker: false })
    if (this.data.checkin) {
      this.initCheckinData(this.data.checkin)
    }
  },

  onEmotionSelect(e) {
    const { id } = e.currentTarget.dataset
    const emotion = this.data.emotions.find(e => e.id === id)
    this.setData({ selectedEmotion: emotion })
  },

  onCustomEmotionInput(e) {
    this.setData({ customEmotionName: e.detail.value })
  },

  onCustomColorChange(e) {
    this.setData({ customEmotionColor: e.detail.value })
  },

  onAddCustomColor() {
    const colors = this.data.paletteColors.slice()
    if (colors.length < 10) {
      colors.push(this.data.currentCustomColor)
      this.setData({ paletteColors: colors })
    }
  },

  onRemoveColor(e) {
    const { index } = e.currentTarget.dataset
    const colors = this.data.paletteColors.slice()
    colors.splice(index, 1)
    this.setData({ paletteColors: colors })
  },

  onQuickColorSelect(e) {
    const { color } = e.currentTarget.dataset
    this.setData({ currentCustomColor: color })
  },

  // 颜色选择面板
  onShowColorPicker() {
    this.setData({ showColorPicker: true })
  },

  onHideColorPicker() {
    // 关闭面板时，自动将当前颜色添加到配色列表
    const colors = this.data.paletteColors.slice()
    if (colors.length < 10 && !colors.includes(this.data.currentCustomColor)) {
      colors.push(this.data.currentCustomColor)
      this.setData({ paletteColors: colors })
    }
    this.setData({ showColorPicker: false })
  },

  onPaletteColorSelect(e) {
    const { color } = e.currentTarget.dataset
    this.setData({
      currentCustomColor: color
    })
  },

  async onSaveEdit() {
    const emotion = this.data.selectedEmotion
    if (!emotion) {
      wx.showToast({ title: '请选择情绪', icon: 'none' })
      return
    }

    if (emotion.isCustom && !this.data.customEmotionName) {
      wx.showToast({ title: '请输入自定义情绪名称', icon: 'none' })
      return
    }

    if (this.data.paletteColors.length === 0) {
      wx.showToast({ title: '请添加配色', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中...' })

    const db = wx.cloud.database()
    const updateData = {
      emotionTag: emotion.isCustom ? this.data.customEmotionName : emotion.name,
      colorHex: this.data.paletteColors[0],
      colors: this.data.paletteColors,
      emotionId: emotion.id,
      emotionIcon: emotion.icon,
      emotionColor: emotion.isCustom ? this.data.customEmotionColor : emotion.color,
      updateTime: db.serverDate()
    }

    try {
      await db.collection('checkins').doc(this.data.checkin._id).update({
        data: updateData
      })

      wx.hideLoading()
      wx.showToast({ title: '修改成功', icon: 'success' })

      // 更新本地数据
      const updatedCheckin = { ...this.data.checkin, ...updateData }
      this.setData({ checkin: updatedCheckin, isEditMode: false })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'error' })
    }
  },

  onDeleteCheckin() {
    const checkin = this.data.checkin
    const userInfo = wx.getStorageSync('userInfo')

    console.log('=== 删除打卡记录 ===')
    console.log('checkin:', checkin)
    console.log('userInfo:', userInfo)
    console.log('checkin.userId:', checkin?.userId)
    console.log('userInfo._id:', userInfo?._id)

    if (!checkin || !checkin._id) {
      wx.showToast({ title: '记录不存在', icon: 'none' })
      return
    }

    if (!userInfo || !userInfo._id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条打卡记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.doDeleteCheckin()
        }
      }
    })
  },

  async doDeleteCheckin() {
    wx.showLoading({ title: '删除中...', mask: true })

    const db = wx.cloud.database()
    const checkinId = this.data.checkin._id
    const userInfo = wx.getStorageSync('userInfo')

    try {
      // 直接用客户端 API 删除
      const result = await db.collection('checkins').doc(checkinId).remove()
      console.log('删除结果:', result)

      // 更新用户打卡天数
      if (userInfo && userInfo._id) {
        const userRes = await db.collection('users').doc(userInfo._id).get()
        const newDays = Math.max(0, (userRes.data.checkinDays || 1) - 1)
        await db.collection('users').doc(userInfo._id).update({
          data: { checkinDays: newDays }
        })
        userInfo.checkinDays = newDays
        wx.setStorageSync('userInfo', userInfo)
      }

      wx.hideLoading()
      wx.showToast({ title: '已删除', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)

    } catch (err) {
      wx.hideLoading()
      console.error('删除失败:', err)

      wx.showModal({
        title: '删除失败',
        content: '错误信息: ' + (err.errMsg || err.message || '未知错误') + '\n\n可能原因：\n1. userId 不匹配\n2. 数据库权限限制',
        showCancel: false
      })
    }
  },

  formatDate(dateStr) {
    const date = new Date(dateStr)
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekDays[date.getDay()]}`
  },

  onGoBack() {
    wx.navigateBack()
  }
})