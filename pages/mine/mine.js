// pages/mine/mine.js
const api = require('../../utils/api')

Page({
  data: {
    userInfo: null,
    checkinDays: 0,
    favoritesCount: 0,
    currentMonth: '',
    calendarData: [],
    favorites: [],
    emotionColors: {
      '温柔': '#E8B4B8',
      '活力': '#F18F43',
      '沉静': '#94B276',
      '忧郁': '#9B8EA8'
    }
  },

  onLoad() {
    this.initUserInfo()
    this.initCalendar()
    this.loadFavorites()
  },

  onShow() {
    this.initUserInfo()
  },

  initUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo,
        checkinDays: userInfo.checkinDays || 23,
        favoritesCount: userInfo.favoritesCount || 12
      })
    } else {
      wx.redirectTo({ url: '/pages/login/login' })
    }
  },

  initCalendar() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const today = now.getDate()

    // 模拟打卡数据
    const checkinData = {
      1: '#E8B4B8', 2: '#F18F43', 4: '#94B276', 5: '#9B8EA8', 7: '#E8B4B8',
      8: '#94B276', 10: '#F18F43', 11: '#E8B4B8', 13: '#9B8EA8', 14: '#94B276',
      15: '#E8B4B8', 17: '#F18F43', 18: '#94B276', 20: '#9B8EA8', 21: '#E8B4B8',
      22: '#F18F43', 24: '#94B276', 25: '#9B8EA8'
    }

    const calendar = []
    for (let i = 0; i < firstDay; i++) {
      calendar.push({ empty: true })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      calendar.push({
        day: d,
        color: checkinData[d] || '#E8E0D8',
        checked: !!checkinData[d],
        today: d === today
      })
    }

    this.setData({
      currentMonth: `${year}年 ${month}月`,
      calendarData: calendar
    })
  },

  loadFavorites() {
    // 模拟收藏数据
    const favorites = [
      { id: 1, name: '初春晨雾', colors: ['#E8B4B8', '#C9B8E8', '#F9F0E0'] },
      { id: 2, name: '暮光晚橙', colors: ['#F18F43', '#D5DD5E', '#F0C860'] },
      { id: 3, name: '苔原初绿', colors: ['#94B276', '#A8C488', '#C8DCA8'] },
      { id: 4, name: '温暖米麻', colors: ['#F5C5A3', '#E8D5B7', '#D4BFA0'] }
    ]
    this.setData({ favorites })
  },

  onPrevMonth() {
    wx.showToast({ title: '上个月', icon: 'none' })
  },

  onNextMonth() {
    wx.showToast({ title: '下个月', icon: 'none' })
  },

  onCalendarDay(e) {
    const { day, checked } = e.currentTarget.dataset
    if (checked) {
      wx.showToast({ title: `${day}日已打卡`, icon: 'none' })
    }
  },

  onFavoriteDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  onViewAllFavorites() {
    wx.switchTab({ url: '/pages/gallery/gallery' })
  },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userToken')
          wx.removeStorageSync('userInfo')
          wx.redirectTo({ url: '/pages/login/login' })
        }
      }
    })
  }
})