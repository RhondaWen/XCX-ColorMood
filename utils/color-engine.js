// utils/color-engine.js - 颜色处理引擎

const { rgbToHex, hexToRgb, rgbToHsl, getColorName, blendColors } = require('./util')

/**
 * 从图片数据中提取主色
 * 使用中位切分算法的简化版本
 */
const extractColors = (imageData, colorCount = 5) => {
  const pixels = []
  const data = imageData.data

  // 采样像素点（每隔几个点取一个，提高性能）
  const step = Math.max(1, Math.floor(data.length / 10000))

  for (let i = 0; i < data.length; i += step * 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    // 忽略透明像素和接近白色/黑色的像素
    if (a > 128) {
      const brightness = (r + g + b) / 3
      if (brightness > 20 && brightness < 235) {
        pixels.push([r, g, b])
      }
    }
  }

  if (pixels.length === 0) {
    return [{ hex: '#808080', name: '灰色', ratio: 100 }]
  }

  // 使用K-means聚类
  const clusters = kMeansClustering(pixels, colorCount)

  // 按比例排序
  clusters.sort((a, b) => b.count - a.count)

  const totalPixels = clusters.reduce((sum, c) => sum + c.count, 0)

  return clusters.map(cluster => {
    const hex = rgbToHex(
      Math.round(cluster.center[0]),
      Math.round(cluster.center[1]),
      Math.round(cluster.center[2])
    )
    return {
      hex,
      name: getColorName(
        Math.round(cluster.center[0]),
        Math.round(cluster.center[1]),
        Math.round(cluster.center[2])
      ),
      ratio: Math.round((cluster.count / totalPixels) * 100)
    }
  })
}

/**
 * K-means聚类算法
 */
const kMeansClustering = (pixels, k, maxIterations = 20) => {
  if (pixels.length === 0) return []
  if (pixels.length <= k) {
    return pixels.map(p => ({ center: p, count: 1 }))
  }

  // 随机选择初始中心点
  const centers = []
  const usedIndices = new Set()

  while (centers.length < k) {
    const index = Math.floor(Math.random() * pixels.length)
    if (!usedIndices.has(index)) {
      centers.push([...pixels[index]])
      usedIndices.add(index)
    }
  }

  let clusters = []

  for (let iter = 0; iter < maxIterations; iter++) {
    // 分配点到最近的聚类中心
    clusters = centers.map(() => ({ points: [], center: [0, 0, 0] }))

    for (const pixel of pixels) {
      let minDist = Infinity
      let minIndex = 0

      for (let i = 0; i < centers.length; i++) {
        const dist = colorDistance(pixel, centers[i])
        if (dist < minDist) {
          minDist = dist
          minIndex = i
        }
      }

      clusters[minIndex].points.push(pixel)
    }

    // 更新聚类中心
    let converged = true

    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i]
      if (cluster.points.length > 0) {
        const newCenter = [0, 0, 0]
        for (const p of cluster.points) {
          newCenter[0] += p[0]
          newCenter[1] += p[1]
          newCenter[2] += p[2]
        }
        newCenter[0] /= cluster.points.length
        newCenter[1] /= cluster.points.length
        newCenter[2] /= cluster.points.length

        if (colorDistance(centers[i], newCenter) > 1) {
          converged = false
        }

        centers[i] = newCenter
        cluster.center = newCenter
      }
    }

    if (converged) break
  }

  // 过滤空聚类并返回
  return clusters
    .filter(c => c.points.length > 0)
    .map(c => ({
      center: c.center,
      count: c.points.length
    }))
}

/**
 * 计算颜色距离
 */
const colorDistance = (c1, c2) => {
  return Math.sqrt(
    Math.pow(c1[0] - c2[0], 2) +
    Math.pow(c1[1] - c2[1], 2) +
    Math.pow(c1[2] - c2[2], 2)
  )
}

/**
 * 文字转配色
 * 基于关键词和情绪映射到颜色
 */
const textToColors = (text) => {
  // 关键词-颜色映射库
  const keywordColorMap = {
    // 自然
    '春天': ['#90EE90', '#98FB98', '#00FA9A', '#7CFC00'],
    '夏天': ['#FFD700', '#FFA500', '#FF6347', '#FF4500'],
    '秋天': ['#D2691E', '#CD853F', '#DEB887', '#F4A460'],
    '冬天': ['#B0C4DE', '#ADD8E6', '#87CEEB', '#E0FFFF'],
    '海洋': ['#006994', '#40E0D0', '#48D1CC', '#00CED1'],
    '森林': ['#228B22', '#006400', '#32CD32', '#2E8B57'],
    '天空': ['#87CEEB', '#B0E0E6', '#ADD8E6', '#87CEFA'],
    '日落': ['#FF6B6B', '#FF8E53', '#FFA07A', '#FFD93D'],
    '夜晚': ['#191970', '#000080', '#4169E1', '#483D8B'],
    '星空': ['#0C164F', '#1A237E', '#283593', '#303F9F'],

    // 情绪
    '快乐': ['#FFD93D', '#FFEC8B', '#FFE135', '#F0E68C'],
    '悲伤': ['#708090', '#778899', '#696969', '#A9A9A9'],
    '爱情': ['#FF69B4', '#FF1493', '#DC143C', '#FF6B6B'],
    '平静': ['#98D8C8', '#7FDBDA', '#B0E0E6', '#ADD8E6'],
    '激动': ['#FF4500', '#FF6347', '#FF7F50', '#FFA07A'],
    '忧郁': ['#4682B4', '#5F9EA0', '#6495ED', '#4169E1'],
    '温暖': ['#FFA07A', '#FF8C00', '#FF7F50', '#FFDAB9'],
    '神秘': ['#9370DB', '#8A2BE2', '#9932CC', '#BA55D3'],

    // 物品
    '咖啡': ['#6F4E37', '#8B4513', '#A0522D', '#D2691E'],
    '奶茶': ['#D2B48C', '#DEB887', '#F5DEB3', '#FAEBD7'],
    '薄荷': ['#98FF98', '#00FA9A', '#3EB489', '#2E8B57'],
    '柠檬': ['#FFF44F', '#FFFF00', '#FFD700', '#FFEC8B'],

    // 风格
    '复古': ['#8B4513', '#A0522D', '#CD853F', '#DEB887'],
    '清新': ['#98D8C8', '#B0E0E6', '#ADD8E6', '#E0FFFF'],
    '高级': ['#2F4F4F', '#696969', '#808080', '#A9A9A9'],
    '少女': ['#FFB6C1', '#FFC0CB', '#FF69B4', '#DB7093'],
    '科技': ['#00CED1', '#20B2AA', '#48D1CC', '#40E0D0']
  }

  // 情绪分析映射
  const emotionMap = {
    '开心': '快乐', '高兴': '快乐', '幸福': '快乐', '愉快': '快乐',
    '难过': '悲伤', '伤心': '悲伤', '失落': '悲伤', '沮丧': '悲伤',
    '爱': '爱情', '喜欢': '爱情', '心动': '爱情', '浪漫': '爱情',
    '放松': '平静', '安静': '平静', '宁静': '平静', '安逸': '平静',
    '兴奋': '激动', '热情': '激动', '激情': '激动', '澎湃': '激动',
    '忧愁': '忧郁', '伤感': '忧郁', '惆怅': '忧郁', '低落': '忧郁'
  }

  // 颜色倾向调整
  const toneAdjust = {
    '暖': (colors) => colors.map(c => warmAdjust(c)),
    '冷': (colors) => colors.map(c => coolAdjust(c)),
    '亮': (colors) => colors.map(c => brightAdjust(c)),
    '暗': (colors) => colors.map(c => darkAdjust(c)),
    '柔和': (colors) => colors.map(c => softAdjust(c)),
    '鲜艳': (colors) => colors.map(c => vividAdjust(c))
  }

  let matchedColors = []
  let matchedKeywords = []

  // 匹配关键词
  for (const [keyword, colors] of Object.entries(keywordColorMap)) {
    if (text.includes(keyword)) {
      matchedColors = matchedColors.concat(colors)
      matchedKeywords.push(keyword)
    }
  }

  // 匹配情绪同义词
  for (const [word, emotion] of Object.entries(emotionMap)) {
    if (text.includes(word) && !matchedKeywords.includes(emotion)) {
      const colors = keywordColorMap[emotion]
      if (colors) {
        matchedColors = matchedColors.concat(colors)
        matchedKeywords.push(word)
      }
    }
  }

  // 如果没有匹配到，根据文字长度和字符生成默认配色
  if (matchedColors.length === 0) {
    const baseHue = (text.length * 37) % 360
    matchedColors = generateAnalogousColors(baseHue)
  }

  // 应用色调调整
  for (const [tone, adjust] of Object.entries(toneAdjust)) {
    if (text.includes(tone)) {
      matchedColors = adjust(matchedColors)
    }
  }

  // 去重并取前5个
  const uniqueColors = [...new Set(matchedColors)].slice(0, 5)

  return {
    colors: uniqueColors.map(hex => {
      const rgb = hexToRgb(hex)
      return {
        hex,
        name: getColorName(rgb.r, rgb.g, rgb.b),
        ratio: Math.round(100 / uniqueColors.length)
      }
    }),
    keywords: matchedKeywords,
    description: generateDescription(matchedKeywords)
  }
}

// 色调调整辅助函数
const warmAdjust = (hex) => {
  const rgb = hexToRgb(hex)
  return rgbToHex(
    Math.min(255, rgb.r + 20),
    Math.min(255, rgb.g + 10),
    Math.max(0, rgb.b - 10)
  )
}

const coolAdjust = (hex) => {
  const rgb = hexToRgb(hex)
  return rgbToHex(
    Math.max(0, rgb.r - 10),
    Math.min(255, rgb.g + 5),
    Math.min(255, rgb.b + 20)
  )
}

const brightAdjust = (hex) => {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const newRgb = hslToRgb ? null : rgb
  return rgbToHex(
    Math.min(255, rgb.r + 30),
    Math.min(255, rgb.g + 30),
    Math.min(255, rgb.b + 30)
  )
}

const darkAdjust = (hex) => {
  const rgb = hexToRgb(hex)
  return rgbToHex(
    Math.max(0, rgb.r - 30),
    Math.max(0, rgb.g - 30),
    Math.max(0, rgb.b - 30)
  )
}

const softAdjust = (hex) => {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  hsl.s = Math.max(0, hsl.s - 20)
  // 简化处理，降低饱和度
  const gray = (rgb.r + rgb.g + rgb.b) / 3
  return rgbToHex(
    Math.round(rgb.r * 0.7 + gray * 0.3),
    Math.round(rgb.g * 0.7 + gray * 0.3),
    Math.round(rgb.b * 0.7 + gray * 0.3)
  )
}

const vividAdjust = (hex) => {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  // 增加饱和度
  const gray = (rgb.r + rgb.g + rgb.b) / 3
  return rgbToHex(
    Math.min(255, Math.round(rgb.r + (rgb.r - gray) * 0.3)),
    Math.min(255, Math.round(rgb.g + (rgb.g - gray) * 0.3)),
    Math.min(255, Math.round(rgb.b + (rgb.b - gray) * 0.3))
  )
}

/**
 * 生成类似色
 */
const generateAnalogousColors = (baseHue) => {
  const colors = []
  for (let i = -2; i <= 2; i++) {
    const hue = (baseHue + i * 30 + 360) % 360
    const rgb = hslToRgb(hue / 360, 0.7, 0.5)
    colors.push(rgbToHex(rgb.r, rgb.g, rgb.b))
  }
  return colors
}

// HSL转RGB（确保函数可用）
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
 * 生成描述文字
 */
const generateDescription = (keywords) => {
  if (keywords.length === 0) {
    return '根据您的内容生成的专属配色方案'
  }
  return `融合了${keywords.join('、')}元素的配色灵感`
}

/**
 * 双图融合配色
 */
const fusionColors = (colors1, colors2, ratio = 0.5) => {
  const result = []
  const maxLen = Math.max(colors1.length, colors2.length)

  for (let i = 0; i < maxLen; i++) {
    const c1 = colors1[i % colors1.length]
    const c2 = colors2[i % colors2.length]

    const blended = blendColors(c1.hex || c1, c2.hex || c2, ratio)
    const rgb = hexToRgb(blended)

    result.push({
      hex: blended,
      name: getColorName(rgb.r, rgb.g, rgb.b),
      ratio: Math.round(100 / maxLen)
    })
  }

  return result
}

module.exports = {
  extractColors,
  kMeansClustering,
  colorDistance,
  textToColors,
  fusionColors,
  generateAnalogousColors
}