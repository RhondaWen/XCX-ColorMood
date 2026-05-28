// pages/mine/mine.js - 云开发版本
const api = require('../../utils/api')

Page({
  data: {
    userInfo: null,
    isGuest: false,
    checkinDays: 0,
    favoritesCount: 0,
    currentMonth: '',
    currentYear: 0,
    currentMonthNum: 0,
    calendarData: [],
    favorites: [],
    emotionColors: { '温柔': '#E8B4B8', '活力': '#F18F43', '沉静': '#94B276', '忧郁': '#9B8EA8' }
  },

  onLoad() {
    this.calendarYear = new Date().getFullYear()
    this.calendarMonth = new Date().getMonth() + 1
    this.initUserInfo()
    this.initCalendar()
    this.loadFavorites()
  },
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
      this.allCheckins = res.data
      this.buildCalendar(res.data)
    }
  },

  initCalendar() {
    const now = new Date()
    this.calendarYear = now.getFullYear()
    this.calendarMonth = now.getMonth() + 1
    this.updateMonthDisplay()
    this.buildCalendar([])
  },

  updateMonthDisplay() {
    this.setData({
      currentMonth: `${this.calendarYear}年 ${this.calendarMonth}月`,
      currentYear: this.calendarYear,
      currentMonthNum: this.calendarMonth
    })
  },

  buildCalendar(checkins) {
    const year = this.calendarYear
    const month = this.calendarMonth
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const now = new Date()
    const isCurrentMonth = (year === now.getFullYear() && month === now.getMonth() + 1)
    const today = isCurrentMonth ? now.getDate() : -1

    // 存储每天打卡的ID
    this.checkinIdMap = {}

    const checkinMap = {}
    checkins.forEach(c => {
      const dateStr = c.date
      const cYear = parseInt(dateStr.slice(0, 4))
      const cMonth = parseInt(dateStr.slice(5, 7))
      const cDay = parseInt(dateStr.slice(8, 10))
      if (cYear === year && cMonth === month) {
        checkinMap[cDay] = c.colorHex || this.data.emotionColors[c.emotionTag] || '#E8B4B8'
        this.checkinIdMap[cDay] = c._id
      }
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

  onPrevMonth() {
    this.calendarMonth--
    if (this.calendarMonth < 1) {
      this.calendarMonth = 12
      this.calendarYear--
    }
    this.updateMonthDisplay()
    if (this.allCheckins) {
      this.buildCalendar(this.allCheckins)
    } else {
      this.loadCheckinHistory()
    }
  },

  onNextMonth() {
    this.calendarMonth++
    if (this.calendarMonth > 12) {
      this.calendarMonth = 1
      this.calendarYear++
    }
    this.updateMonthDisplay()
    if (this.allCheckins) {
      this.buildCalendar(this.allCheckins)
    } else {
      this.loadCheckinHistory()
    }
  },

  onCalendarDay(e) {
    const { day, checked } = e.currentTarget.dataset

    if (checked && this.checkinIdMap[day]) {
      // 已打卡，跳转到详情页
      wx.navigateTo({
        url: `/pages/checkin-detail/checkin-detail?id=${this.checkinIdMap[day]}`
      })
    } else if (!checked && day === new Date().getDate() &&
               this.calendarYear === new Date().getFullYear() &&
               this.calendarMonth === new Date().getMonth() + 1) {
      // 今天未打卡，提示去打卡
      wx.showModal({
        title: '今日未打卡',
        content: '是否现在去打卡？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/result/result?mode=checkin' })
          }
        }
      })
    }
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