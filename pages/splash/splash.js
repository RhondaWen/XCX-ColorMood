Page({
  // 启动页停留在封面，用户点击后才跳转
  onLoad() {
    // 不自动跳转，让用户欣赏封面并主动点击进入
  },

  goToLogin() {
    wx.redirectTo({
      url: "/pages/login/login"
    })
  }
})