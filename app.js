// app.js - 情绪色谱
App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    token: ''
  },

  onLaunch() {
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    const token = wx.getStorageSync('userToken')

    if (userInfo && token) {
      this.globalData.userInfo = userInfo
      this.globalData.token = token
      this.globalData.isLoggedIn = true
    }
  },

  loginSuccess(userInfo, token) {
    this.globalData.userInfo = userInfo
    this.globalData.token = token
    this.globalData.isLoggedIn = true

    wx.setStorageSync('userInfo', userInfo)
    wx.setStorageSync('userToken', token)
  },

  logout() {
    this.globalData.userInfo = null
    this.globalData.token = ''
    this.globalData.isLoggedIn = false

    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('userToken')
  }
})