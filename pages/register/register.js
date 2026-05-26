// pages/register/register.js - 云开发版本
const api = require('../../utils/api')

Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    loading: false
  },

  onInputUsername(e) { this.setData({ username: e.detail.value }) },
  onInputPassword(e) { this.setData({ password: e.detail.value }) },
  onInputConfirmPassword(e) { this.setData({ confirmPassword: e.detail.value }) },
  onInputEmail(e) { this.setData({ email: e.detail.value }) },

  async onRegister() {
    const { username, password, confirmPassword, email } = this.data

    if (!username.trim()) { wx.showToast({ title: '请输入用户名', icon: 'none' }); return }
    if (username.length < 2 || username.length > 20) { wx.showToast({ title: '用户名需2-20字符', icon: 'none' }); return }
    if (!password) { wx.showToast({ title: '请输入密码', icon: 'none' }); return }
    if (password.length < 6) { wx.showToast({ title: '密码需6位以上', icon: 'none' }); return }
    if (password !== confirmPassword) { wx.showToast({ title: '两次密码不一致', icon: 'none' }); return }

    this.setData({ loading: true })
    const res = await api.register({ username, password, email })
    this.setData({ loading: false })

    if (res.code === 0) {
      wx.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } else {
      wx.showToast({ title: res.message || '注册失败', icon: 'none' })
    }
  },

  onGoLogin() { wx.navigateBack() }
})