// pages/profile/profile.js - 个人信息编辑（云开发版本）
const api = require('../../utils/api')

Page({
  data: {
    userInfo: {},
    loading: false
  },

  onLoad() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    this.setData({
      userInfo: {
        avatar: userInfo.avatar || '🌸',
        username: userInfo.username || '',
        signature: userInfo.signature || '',
        email: userInfo.email || ''
      }
    })
  },

  // 选择头像
  onChooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.setData({
          'userInfo.avatar': tempFilePath
        })
      }
    })
  },

  // 输入昵称
  onInputName(e) {
    this.setData({
      'userInfo.username': e.detail.value
    })
  },

  // 输入签名
  onInputSignature(e) {
    this.setData({
      'userInfo.signature': e.detail.value
    })
  },

  // 输入邮箱
  onInputEmail(e) {
    this.setData({
      'userInfo.email': e.detail.value
    })
  },

  // 保存到云端
  async onSave() {
    const { userInfo } = this.data

    if (!userInfo.username || !userInfo.username.trim()) {
      wx.showToast({ title: '昵称不能为空', icon: 'none' })
      return
    }

    const storedUser = wx.getStorageSync('userInfo')
    if (!storedUser || !storedUser._id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    this.setData({ loading: true })
    wx.showLoading({ title: '保存中...', mask: true })

    try {
      // 如果头像改变了且是本地文件，上传到云端
      let avatarUrl = userInfo.avatar
      if (userInfo.avatar && userInfo.avatar.startsWith('wxfile://')) {
        avatarUrl = await this.uploadAvatar(userInfo.avatar)
      }

      // 更新云端用户数据
      const db = wx.cloud.database()
      await db.collection('users').doc(storedUser._id).update({
        data: {
          avatar: avatarUrl,
          signature: userInfo.signature || ''
        }
      })

      // 更新本地缓存
      const newUserInfo = {
        ...storedUser,
        avatar: avatarUrl,
        signature: userInfo.signature || ''
      }
      wx.setStorageSync('userInfo', newUserInfo)

      wx.hideLoading()
      this.setData({ loading: false })
      wx.showToast({ title: '保存成功', icon: 'success' })

      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err) {
      wx.hideLoading()
      this.setData({ loading: false })
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  // 上传头像到云端
  async uploadAvatar(filePath) {
    const cloudPath = `avatars/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
    try {
      const res = await wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: filePath
      })
      return res.fileID
    } catch (err) {
      console.error('上传头像失败', err)
      return filePath
    }
  }
})