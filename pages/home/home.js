// pages/home/home.js
const api = require('../../utils/api')

Page({
  data: {
    userInfo: null,
    emotions: [
      {
        id: 1,
        name: '温柔',
        nameEn: 'GENTLE',
        icon: '🌸',
        color: '#E8B4B8',
        bgColor: 'rgba(232,180,184,.15)',
        desc: '宁静 · 温暖 · 柔软'
      },
      {
        id: 2,
        name: '活力',
        nameEn: 'VIVID',
        icon: '🌟',
        color: '#F18F43',
        bgColor: 'rgba(241,143,67,.15)',
        desc: '热情 · 欢乐 · 跳跃'
      },
      {
        id: 3,
        name: '沉静',
        nameEn: 'CALM',
        icon: '🍃',
        color: '#94B276',
        bgColor: 'rgba(148,178,118,.15)',
        desc: '深思 · 平和 · 专注'
      },
      {
        id: 4,
        name: '忧郁',
        nameEn: 'MELANCHOLY',
        icon: '🌧',
        color: '#9B8EA8',
        bgColor: 'rgba(155,142,168,.15)',
        desc: '迷离 · 感伤 · 孤独'
      }
    ],
    checkedIn: false,
    todayColor: null
  },

  onLoad() {
    this.checkLogin()
    this.checkTodayCheckin()
  },

  onShow() {
    this.checkLogin()
  },

  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    } else {
      // 未登录，跳转登录页
      wx.redirectTo({ url: '/pages/login/login' })
    }
  },

  checkTodayCheckin() {
    const today = new Date().toISOString().slice(0, 10)
    api.getCheckinHistory({ month: today.slice(0, 7) })
      .then(res => {
        if (res.code === 0) {
          const todayRecord = res.data.find(item => item.date === today)
          if (todayRecord) {
            this.setData({
              checkedIn: true,
              todayColor: todayRecord.colorHex
            })
          }
        }
      })
      .catch(() => {})
  },

  onSelectEmotion(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/result/result?emotionId=${id}`
    })
  },

  onCheckin() {
    if (this.data.checkedIn) {
      wx.showToast({
        title: '今日已打卡',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/result/result?mode=checkin'
    })
  }
})