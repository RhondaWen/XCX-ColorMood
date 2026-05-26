Page({
  onLoad() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      wx.switchTab({ url: '/pages/home/home' })
    }
  },

  goToLogin() {
    wx.redirectTo({
      url: "/pages/login/login"
    })
  }
})