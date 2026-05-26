// pages/home/home.js - 云开发版本
const api = require('../../utils/api')

Page({
  data: {
    userInfo: null,
    isGuest: false,
    emotions: [
      { id: 1, name: '温柔', nameEn: 'GENTLE', icon: '🌸', color: '#E8B4B8', bgColor: 'rgba(232,180,184,.15)', desc: '宁静 · 温暖 · 柔软' },
      { id: 2, name: '活力', nameEn: 'VIVID', icon: '🌟', color: '#F18F43', bgColor: 'rgba(241,143,67,.15)', desc: '热情 · 欢乐 · 跳跃' },
      { id: 3, name: '沉静', nameEn: 'CALM', icon: '🍃', color: '#94B276', bgColor: 'rgba(148,178,118,.15)', desc: '深思 · 平和 · 专注' },
      { id: 4, name: '忧郁', nameEn: 'MELANCHOLY', icon: '🌧', color: '#9B8EA8', bgColor: 'rgba(155,142,168,.15)', desc: '迷离 · 感伤 · 孤独' }
    ],
    checkedIn: false
  },

  onLoad() { this.checkLogin() },

  onShow() { this.checkLogin(); this.checkTodayCheckin() },

  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo, isGuest: userInfo.isGuest || false })
    }
  },

  async checkTodayCheckin() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || userInfo.isGuest) return

    const res = await api.getCheckinHistory()
    if (res.code === 0) {
      const today = new Date().toISOString().slice(0, 10)
      const todayRecord = res.data.find(item => item.date === today)
      this.setData({ checkedIn: !!todayRecord })
    }
  },

  onSelectEmotion(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/result/result?emotionId=${id}` })
  },

  async onCheckin() {
    if (this.data.checkedIn) {
      wx.showToast({ title: '今日已打卡', icon: 'none' })
      return
    }

    if (this.data.isGuest) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => wx.navigateTo({ url: '/pages/login/login' }), 1500)
      return
    }

    wx.navigateTo({ url: '/pages/result/result?mode=checkin' })
  }
})