// utils/api.js - 云数据库API与配色算法

const app = getApp()
const getDb = () => wx.cloud.database()

// ========== 用户相关 ==========

// 注册用户
const register = async (data) => {
  const db = getDb()
  try {
    // 检查用户名是否已存在
    const existUser = await db.collection('users').where({ username: data.username }).get()
    if (existUser.data.length > 0) {
      return { code: -1, message: '用户名已存在' }
    }

    // 创建新用户
    const res = await db.collection('users').add({
      data: {
        username: data.username,
        password: data.password,
        email: data.email || '',
        avatar: '🌸',
        createTime: db.serverDate(),
        favorites: [],
        checkinDays: 0
      }
    })
    return { code: 0, data: { _id: res._id, username: data.username } }
  } catch (err) {
    return { code: -1, message: '注册失败' }
  }
}

// 登录
const login = async (data) => {
  const db = getDb()
  try {
    const res = await db.collection('users')
      .where({
        username: data.username,
        password: data.password
      })
      .get()

    if (res.data.length === 0) {
      return { code: -1, message: '用户名或密码错误' }
    }

    const user = res.data[0]
    return { code: 0, data: user }
  } catch (err) {
    return { code: -1, message: '登录失败' }
  }
}

// 获取用户信息
const getUserInfo = async () => {
  const userInfo = wx.getStorageSync('userInfo')
  if (!userInfo || !userInfo._id) return { code: -1, message: '未登录' }

  const db = getDb()
  try {
    const res = await db.collection('users').doc(userInfo._id).get()
    return { code: 0, data: res.data }
  } catch (err) {
    return { code: -1, message: '获取失败' }
  }
}

// ========== 配色相关 ==========

// 获取色板列表（按情绪筛选）
const getPaletteList = async (params) => {
  const db = getDb()
  try {
    let query = db.collection('palettes')
    if (params && params.emotionId) {
      const emotionMap = { 1: '温柔', 2: '活力', 3: '沉静', 4: '忧郁' }
      query = query.where({ emotionTag: emotionMap[params.emotionId] })
    }

    const res = await query.limit(20).get()
    return { code: 0, data: res.data }
  } catch (err) {
    return { code: -1, message: '获取失败' }
  }
}

// 获取广场色板（系统预设）
const getPaletteGallery = async (params) => {
  const db = getDb()
  try {
    let query = db.collection('palettes')

    // 只获取系统预设色卡（userId 为 system 或不存在，且不是拍照取色）
    query = query.where({
      userId: db.command.in(['system', null, undefined]).or(db.command.exists(false)),
      emotionTag: db.command.neq('拍照取色')
    })

    // 如果有情绪标签筛选
    if (params && params.tag && params.tag !== '全部') {
      query = query.where({ emotionTag: params.tag })
    }

    const res = await query.orderBy('likeCount', 'desc').limit(20).get()
    return { code: 0, data: res.data }
  } catch (err) {
    return { code: -1, message: '获取失败' }
  }
}

// 获取色板详情
const getPaletteDetail = async (id) => {
  const db = getDb()
  try {
    const res = await db.collection('palettes').doc(id).get()
    return { code: 0, data: res.data }
  } catch (err) {
    return { code: -1, message: '获取失败' }
  }
}

// 收藏色板
const favoritePalette = async (paletteId) => {
  const userInfo = wx.getStorageSync('userInfo')
  if (!userInfo || !userInfo._id) return { code: -1, message: '未登录' }

  const db = getDb()
  try {
    // 获取用户当前收藏
    const userRes = await db.collection('users').doc(userInfo._id).get()
    const favorites = userRes.data.favorites || []

    // 判断是否已收藏
    const idx = favorites.indexOf(paletteId)
    if (idx > -1) {
      favorites.splice(idx, 1) // 取消收藏
    } else {
      favorites.push(paletteId) // 添加收藏
    }

    // 更新用户收藏
    await db.collection('users').doc(userInfo._id).update({
      data: { favorites }
    })

    // 更新色板点赞数
    const paletteRes = await db.collection('palettes').doc(paletteId).get()
    const likeCount = paletteRes.data.likeCount || 0
    await db.collection('palettes').doc(paletteId).update({
      data: { likeCount: idx > -1 ? likeCount - 1 : likeCount + 1 }
    })

    return { code: 0, data: { favorites } }
  } catch (err) {
    return { code: -1, message: '操作失败' }
  }
}

// 保存自定义色板
const savePalette = async (data) => {
  const userInfo = wx.getStorageSync('userInfo')
  if (!userInfo || !userInfo._id) return { code: -1, message: '未登录' }

  const db = getDb()
  try {
    const res = await db.collection('palettes').add({
      data: {
        name: data.name,
        colors: data.colors,
        emotionTag: data.emotionTag || '自定义',
        likeCount: 0,
        userId: userInfo._id,
        createTime: db.serverDate()
      }
    })
    return { code: 0, data: { _id: res._id } }
  } catch (err) {
    return { code: -1, message: '保存失败' }
  }
}

// ========== 打卡相关 ==========

// 情绪打卡
const checkin = async (data) => {
  const userInfo = wx.getStorageSync('userInfo')
  if (!userInfo || !userInfo._id) return { code: -1, message: '未登录' }

  const db = getDb()
  const today = new Date().toISOString().slice(0, 10)

  try {
    // 检查今日是否已打卡
    const existRes = await db.collection('checkins')
      .where({
        userId: userInfo._id,
        date: today
      })
      .get()

    if (existRes.data.length > 0) {
      return { code: -1, message: '今日已打卡' }
    }

    // 添加打卡记录
    await db.collection('checkins').add({
      data: {
        userId: userInfo._id,
        date: today,
        emotionTag: data.emotionTag,
        emotionId: data.emotionId,
        emotionColor: data.emotionColor || null,
        emotionIcon: data.emotionIcon || null,
        colorHex: data.colorHex,
        colors: data.colors || [data.colorHex],
        paletteId: data.paletteId || null,
        createTime: db.serverDate()
      }
    })

    // 更新用户打卡天数
    const userRes = await db.collection('users').doc(userInfo._id).get()
    await db.collection('users').doc(userInfo._id).update({
      data: { checkinDays: (userRes.data.checkinDays || 0) + 1 }
    })

    return { code: 0, message: '打卡成功' }
  } catch (err) {
    return { code: -1, message: '打卡失败' }
  }
}

// 获取打卡历史
const getCheckinHistory = async (params) => {
  const userInfo = wx.getStorageSync('userInfo')
  if (!userInfo || !userInfo._id) return { code: -1, message: '未登录' }

  const db = getDb()
  try {
    const res = await db.collection('checkins')
      .where({
        userId: userInfo._id
      })
      .orderBy('date', 'desc')
      .limit(50)
      .get()

    return { code: 0, data: res.data }
  } catch (err) {
    return { code: -1, message: '获取失败' }
  }
}

// 获取用户收藏列表
const getFavorites = async () => {
  const userInfo = wx.getStorageSync('userInfo')
  if (!userInfo || !userInfo._id) return { code: -1, message: '未登录' }

  const db = getDb()
  try {
    const userRes = await db.collection('users').doc(userInfo._id).get()
    const favorites = userRes.data.favorites || []

    if (favorites.length === 0) {
      return { code: 0, data: [] }
    }

    // 批量获取收藏的色板
    const paletteRes = await db.collection('palettes')
      .where({ _id: db.command.in(favorites) })
      .get()

    return { code: 0, data: paletteRes.data }
  } catch (err) {
    return { code: -1, message: '获取失败' }
  }
}

// ========== 颜色命名API ==========

const getColorName = (hex) => {
  return new Promise((resolve) => {
    wx.request({
      url: `https://www.thecolorapi.com/id?hex=${hex.replace('#', '')}`,
      method: 'GET',
      success: (res) => {
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

// ========== 配色算法 ==========

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