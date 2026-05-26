// pages/login/login.js - 云开发版本
const api = require('../../utils/api')

Page({
  data: {
    username: '',
    password: '',
    loading: false
  },

  onInputUsername(e) {
    this.setData({ username: e.detail.value })
  },

  onInputPassword(e) {
    this.setData({ password: e.detail.value })
  },

  async onLogin() {
    const { username, password } = this.data

    if (!username.trim()) {
      wx.showToast({ title: '请输入用户名', icon: 'none' })
      return
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return
    }

    this.setData({ loading: true })

    const res = await api.login({ username, password })
    this.setData({ loading: false })

    if (res.code === 0) {
      wx.setStorageSync('userInfo', res.data)
      wx.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/home' })
      }, 1000)
    } else {
      wx.showToast({ title: res.message || '登录失败', icon: 'none' })
    }
  },

  onSkipLogin() {
    wx.setStorageSync('userInfo', { username: '游客', avatar: '🎨', isGuest: true })
    wx.switchTab({ url: '/pages/home/home' })
  },

  onGoRegister() {
    wx.navigateTo({ url: '/pages/register/register' })
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      wx.switchTab({ url: '/pages/home/home' })
    }
  }
})