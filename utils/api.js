// utils/api.js - API请求封装与配色算法

const BASE_URL = 'https://your-server.com/api' // 替换为实际服务器地址

/**
 * 封装请求方法
 */
const request = (url, method = 'GET', data = {}, needAuth = true) => {
  return new Promise((resolve, reject) => {
    const header = { 'content-type': 'application/json' }
    const token = wx.getStorageSync('userToken')

    if (needAuth && token) {
      header['Authorization'] = `Bearer ${token}`
    }

    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header,
      success: res => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('userToken')
          wx.removeStorageSync('userInfo')
          wx.redirectTo({ url: '/pages/login/login' })
          reject(new Error('登录已过期'))
        } else {
          reject(new Error('请求失败'))
        }
      },
      fail: () => reject(new Error('网络连接失败'))
    })
  })
}

// 用户相关API
const register = (data) => request('/user/register', 'POST', data, false)
const login = (data) => request('/user/login', 'POST', data, false)
const getUserInfo = () => request('/user/profile', 'GET')
const getFavorites = () => request('/user/favorites', 'GET')

// 配色相关API
const getPaletteList = (params) => request('/palette/list', 'GET', params)
const getPaletteGallery = (params) => request('/palette/gallery', 'GET', params)
const getPaletteDetail = (id) => request(`/palette/detail/${id}`, 'GET')
const favoritePalette = (data) => request('/palette/favorite', 'POST', data)
const savePalette = (data) => request('/palette/save', 'POST', data)

// 打卡相关API
const checkin = (data) => request('/mood/checkin', 'POST', data)
const getCheckinHistory = (params) => request('/mood/history', 'GET', params)

// 颜色命名API（The Color API）
const getColorName = (hex) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://www.thecolorapi.com/id?hex=${hex.replace('#', '')}`,
      method: 'GET',
      success: res => {
        if (res.data && res.data.name) {
          resolve({ name: res.data.name.value })
        } else {
          resolve({ name: '未知颜色' })
        }
      },
      fail: () => resolve({ name: '未知颜色' })
    })
  })
}

// 配色生成算法
const hexToHsl = (hex) => {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [h * 360, s * 100, l * 100]
}

const hslToHex = (h, s, l) => {
  h /= 360; s /= 100; l /= 100
  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')
}

const generatePalette = (baseHex, mode) => {
  const [h, s, l] = hexToHsl(baseHex)
  let colors = []

  switch (mode) {
    case 'complementary':
      colors = [
        baseHex,
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 180) % 360, s * 0.7, l * 1.1),
        hslToHex(h, s * 0.5, l * 1.2)
      ]
      break
    case 'analogous':
      colors = [
        baseHex,
        hslToHex((h + 30) % 360, s, l),
        hslToHex((h - 30 + 360) % 360, s, l),
        hslToHex((h + 15) % 360, s * 0.8, l * 1.1)
      ]
      break
    case 'triadic':
      colors = [
        baseHex,
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
        hslToHex(h, s * 0.6, l * 1.2)
      ]
      break
    case 'morandi':
      colors = [
        hslToHex(h, Math.max(s * 0.6, 5), Math.min(l * 1.15, 90)),
        hslToHex((h + 20) % 360, Math.max(s * 0.55, 5), Math.min(l * 1.1, 90)),
        hslToHex((h - 20 + 360) % 360, Math.max(s * 0.5, 5), Math.min(l * 1.2, 92)),
        hslToHex(h, Math.max(s * 0.4, 5), Math.min(l * 1.3, 94))
      ]
      break
    default:
      colors = [baseHex, baseHex, baseHex, baseHex]
  }

  return colors
}

module.exports = {
  register,
  login,
  getUserInfo,
  getFavorites,
  getPaletteList,
  getPaletteGallery,
  getPaletteDetail,
  favoritePalette,
  savePalette,
  checkin,
  getCheckinHistory,
  getColorName,
  generatePalette,
  hexToHsl,
  hslToHex
}