// app.js - 情绪色谱（云开发版本）
App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    cloudEnv: 'cloud1-d1gyppvig53f8f1f4'
  },

  onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: this.globalData.cloudEnv,
      traceUser: true
    })

    // 清理错误的 userInfo 缓存（如果存储的是字符串而非对象）
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && (typeof userInfo !== 'object' || !userInfo.avatar)) {
      console.log('清理无效的 userInfo 缓存')
      wx.removeStorageSync('userInfo')
    }

    this.checkLoginStatus()
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
    }
  },

  loginSuccess(userInfo) {
    this.globalData.userInfo = userInfo
    this.globalData.isLoggedIn = true
    wx.setStorageSync('userInfo', userInfo)
  },

  logout() {
    this.globalData.userInfo = null
    this.globalData.isLoggedIn = false
    wx.removeStorageSync('userInfo')
  },

  // 获取云数据库实例
  getDb() {
    return wx.cloud.database()
  }
})