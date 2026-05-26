// pages/login/login.js
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

  onLogin() {
    const { username, password } = this.data

    // 模拟登录 - 直接跳转首页
    const mockUserInfo = {
      username: username || '用户',
      avatar: '🌸'
    }
    wx.setStorageSync('userInfo', mockUserInfo)
    wx.setStorageSync('userToken', 'mock_token')

    wx.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      wx.switchTab({ url: '/pages/home/home' })
    }, 1000)
  },

  onSkipLogin() {
    wx.setStorageSync('userInfo', { username: '游客', avatar: '🎨' })
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