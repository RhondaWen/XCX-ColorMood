// pages/mine/mine.js - 云开发版本
const api = require('../../utils/api')

Page({
  data: {
    userInfo: null,
    isGuest: false,
    checkinDays: 0,
    favoritesCount: 0,
    currentMonth: '',
    calendarData: [],
    favorites: [],
    emotionColors: { '温柔': '#E8B4B8', '活力': '#F18F43', '沉静': '#94B276', '忧郁': '#9B8EA8' }
  },

  onLoad() { this.initUserInfo(); this.initCalendar(); this.loadFavorites() },
  onShow() { this.initUserInfo() },

  initUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo,
        isGuest: userInfo.isGuest || false,
        checkinDays: userInfo.checkinDays || 0,
        favoritesCount: (userInfo.favorites || []).length
      })
      this.loadCheckinHistory()
    }
  },

  async loadCheckinHistory() {
    if (this.data.isGuest) return
    const res = await api.getCheckinHistory()
    if (res.code === 0) {
      this.buildCalendar(res.data)
    }
  },

  initCalendar() {
    const now = new Date()
    this.setData({ currentMonth: `${now.getFullYear()}年 ${now.getMonth() + 1}月` })
    this.buildCalendar([])
  },

  buildCalendar(checkins) {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const today = now.getDate()

    const checkinMap = {}
    checkins.forEach(c => {
      const d = parseInt(c.date.slice(8))
      checkinMap[d] = this.data.emotionColors[c.emotionTag] || '#E8B4B8'
    })

    const calendar = []
    for (let i = 0; i < firstDay; i++) calendar.push({ empty: true })
    for (let d = 1; d <= daysInMonth; d++) {
      calendar.push({
        day: d,
        color: checkinMap[d] || '#E8E0D8',
        checked: !!checkinMap[d],
        today: d === today
      })
    }
    this.setData({ calendarData: calendar })
  },

  async loadFavorites() {
    if (this.data.isGuest) return
    const res = await api.getFavorites()
    if (res.code === 0) {
      const favorites = res.data.slice(0, 4).map(p => ({
        _id: p._id,
        name: p.name,
        colors: p.colors.slice(0, 3)
      }))
      this.setData({ favorites, favoritesCount: res.data.length })
    }
  },

  onPrevMonth() { wx.showToast({ title: '上月数据', icon: 'none' }) },
  onNextMonth() { wx.showToast({ title: '下月数据', icon: 'none' }) },

  onFavoriteDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  onViewAllFavorites() { wx.switchTab({ url: '/pages/gallery/gallery' }) },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo')
          wx.redirectTo({ url: '/pages/login/login' })
        }
      }
    })
  }
})