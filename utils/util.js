// utils/util.js - 工具函数

/**
 * 格式化时间
 */
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * RGB转HEX
 */
const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('').toUpperCase()
}

/**
 * HEX转RGB
 */
const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * 计算颜色亮度
 */
const getLuminance = (r, g, b) => {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

/**
 * 判断是否为深色
 */
const isDarkColor = (r, g, b) => {
  return getLuminance(r, g, b) < 0.5
}

/**
 * HSL转RGB
 */
const hslToRgb = (h, s, l) => {
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

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

/**
 * RGB转HSL
 */
const rgbToHsl = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s
  const l = (max + min) / 2

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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * 混合两个颜色
 */
const blendColors = (color1, color2, ratio = 0.5) => {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)

  if (!c1 || !c2) return color1

  const r = Math.round(c1.r * (1 - ratio) + c2.r * ratio)
  const g = Math.round(c1.g * (1 - ratio) + c2.g * ratio)
  const b = Math.round(c1.b * (1 - ratio) + c2.b * ratio)

  return rgbToHex(r, g, b)
}

/**
 * 颜色命名
 */
const colorNames = {
  red: { range: [[0, 20], [340, 360]], sMin: 30, lRange: [20, 80] },
  orange: { range: [[20, 45]], sMin: 30, lRange: [30, 80] },
  yellow: { range: [[45, 70]], sMin: 30, lRange: [40, 90] },
  green: { range: [[70, 165]], sMin: 20, lRange: [20, 80] },
  cyan: { range: [[165, 195]], sMin: 30, lRange: [30, 80] },
  blue: { range: [[195, 255]], sMin: 30, lRange: [20, 80] },
  purple: { range: [[255, 290]], sMin: 30, lRange: [20, 80] },
  magenta: { range: [[290, 340]], sMin: 30, lRange: [20, 80] }
}

const getColorName = (r, g, b) => {
  const hsl = rgbToHsl(r, g, b)
  const { h, s, l } = hsl

  // 低饱和度为灰色系
  if (s < 15) {
    if (l < 20) return '黑色'
    if (l < 40) return '深灰'
    if (l < 60) return '灰色'
    if (l < 80) return '浅灰'
    return '白色'
  }

  // 高亮度为浅色系
  const lightness = l > 70 ? '浅' : (l < 30 ? '深' : '')

  for (const [name, config] of Object.entries(colorNames)) {
    for (const [min, max] of config.range) {
      if (h >= min && h < max && s >= config.sMin &&
          l >= config.lRange[0] && l <= config.lRange[1]) {
        const nameMap = {
          red: '红', orange: '橙', yellow: '黄', green: '绿',
          cyan: '青', blue: '蓝', purple: '紫', magenta: '品红'
        }
        return lightness + nameMap[name]
      }
    }
  }

  return '未知色'
}

/**
 * 生成随机颜色
 */
const randomColor = () => {
  return rgbToHex(
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256)
  )
}

/**
 * 防抖函数
 */
const debounce = (fn, delay = 300) => {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 */
const throttle = (fn, delay = 300) => {
  let last = 0
  return function(...args) {
    const now = Date.now()
    if (now - last > delay) {
      last = now
      fn.apply(this, args)
    }
  }
}

/**
 * 显示提示
 */
const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({ title, icon, duration })
}

/**
 * 显示加载
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({ title, mask: true })
}

/**
 * 隐藏加载
 */
const hideLoading = () => {
  wx.hideLoading()
}

/**
 * 检查网络状态
 */
const checkNetwork = () => {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      success: res => {
        resolve(res.networkType !== 'none')
      },
      fail: () => {
        reject(new Error('网络检查失败'))
      }
    })
  })
}

/**
 * 生成唯一ID
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

module.exports = {
  formatTime,
  rgbToHex,
  hexToRgb,
  getLuminance,
  isDarkColor,
  hslToRgb,
  rgbToHsl,
  blendColors,
  getColorName,
  randomColor,
  debounce,
  throttle,
  showToast,
  showLoading,
  hideLoading,
  checkNetwork,
  generateId
}