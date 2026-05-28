// pages/mine/mine.js - 云开发版本
const api = require('../../utils/api')

Page({
  data: {
    userInfo: null,
    isGuest: false,
    checkinDays: 0,
    photoCount: 0,
    currentMonth: '',
    currentYear: 0,
    currentMonthNum: 0,
    calendarData: [],
    emotionColors: { '温柔': '#E8B4B8', '活力': '#F18F43', '沉静': '#94B276', '忧郁': '#9B8EA8' }
  },

  onLoad() {
    this.calendarYear = new Date().getFullYear()
    this.calendarMonth = new Date().getMonth() + 1
    this.initUserInfo()
    this.initCalendar()
  },
  onShow() { this.initUserInfo() },

  initUserInfo() {
    let userInfo = wx.getStorageSync('userInfo')
    // 确保 userInfo 是正确格式的对象
    if (userInfo && typeof userInfo === 'object' && userInfo.avatar) {
      this.setData({
        userInfo,
        isGuest: userInfo.isGuest || false
      })
      // 从云端获取最新的统计数据
      this.loadUserStats()
      this.loadCheckinHistory()
    } else {
      // 清除错误数据，设置为默认游客
      wx.removeStorageSync('userInfo')
      this.setData({
        userInfo: { username: '游客', avatar: '🎨' },
        isGuest: true,
        checkinDays: 0,
        photoCount: 0
      })
    }
  },

  // 从云端获取用户统计数据
  async loadUserStats() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo._id) return

    const db = wx.cloud.database()
    try {
      // 获取用户打卡天数
      const userRes = await db.collection('users').where({ _id: userInfo._id }).get()
      if (userRes.data.length > 0) {
        const userData = userRes.data[0]
        this.setData({
          checkinDays: userData.checkinDays || 0
        })
        userInfo.checkinDays = userData.checkinDays || 0
        wx.setStorageSync('userInfo', userInfo)
      }

      // 获取用户创建的拍照取色色卡数量
      const paletteRes = await db.collection('palettes')
        .where({ userId: userInfo._id, emotionTag: '拍照取色' })
        .count()
      this.setData({
        photoCount: paletteRes.total || 0
      })
    } catch (err) {
      console.log('获取用户统计失败:', err)
      this.setData({
        checkinDays: userInfo.checkinDays || 0,
        photoCount: 0
      })
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

  onGoProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' })
  },

  onAbout() {
    wx.showModal({
      title: '用颜色，说心情',
      content: '情绪色谱，陪你走过每一种感受。\n\n温柔的粉，藏着心底的软；\n活力的橙，装着对生活的热望；\n沉静的绿，给你喘息的空间；\n忧郁的紫，也允许你暂时低落。\n\n感谢遇见，愿你被世界温柔以待。',
      showCancel: false,
      confirmText: '知道啦',
      confirmColor: '#F18F43'
    })
  },

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