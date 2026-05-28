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
        iconClass: 'shape-pink-teardrop',
        color: '#E8B4B8',
        bgColor: 'rgba(232,180,184,.15)',
        desc: '宁静 · 温暖 · 柔软'
      },
      {
        id: 2,
        name: '活力',
        nameEn: 'VIVID',
        iconClass: 'shape-cyan-triangle',
        color: '#F18F43',
        bgColor: 'rgba(241,143,67,.15)',
        desc: '热情 · 欢乐 · 跳跃'
      },
      {
        id: 3,
        name: '沉静',
        nameEn: 'CALM',
        iconClass: 'shape-orange-square',
        color: '#94B276',
        bgColor: 'rgba(148,178,118,.15)',
        desc: '深思 · 平和 · 专注'
      },
      {
        id: 4,
        name: '忧郁',
        nameEn: 'MELANCHOLY',
        iconClass: 'shape-blue-penta',
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
    this.checkTodayCheckin() // 回到首页刷新打卡状态
  },

  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    } else {
      wx.redirectTo({ url: '/pages/login/login' })
    }
  },

  // 补全：今日打卡检测（兼容无接口情况）
  checkTodayCheckin() {
    const today = new Date().toISOString().slice(0, 10)
    
    // 优先从本地缓存拿（避免接口报错导致不显示）
    const localCheck = wx.getStorageSync('todayCheckin')
    if (localCheck === today) {
      this.setData({
        checkedIn: true,
        todayColor: wx.getStorageSync('todayColor') || '#F18F43'
      })
      return
    }

    // 原有接口逻辑（保留不动）
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
      .catch(() => {
        // 接口异常不影响使用
      })
  },

  // 点击情绪标签 → 跳转到推荐配色（已修复）
  onSelectEmotion(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/result/result?emotionId=${id}`
    })
  },

  // 点击打卡（逻辑完整）
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