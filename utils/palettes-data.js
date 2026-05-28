// utils/palettes-data.js - 预设色卡数据（统一维护）

// 完整的预设色卡列表
const allPalettes = [
  // 温柔
  { id: 'p1', name: '初春晨雾', colors: ['#E8B4B8', '#F0CECE', '#C9B8E8', '#F9F0E0', '#D4C4A8'], likeCount: 128, emotionTag: '温柔', emotionId: 1, emotionColor: '#E8B4B8' },
  { id: 'p2', name: '温暖米麻', colors: ['#F5C5A3', '#E8D5B7', '#D4BFA0', '#C9A880', '#B89060'], likeCount: 95, emotionTag: '温柔', emotionId: 1, emotionColor: '#E8B4B8' },
  { id: 'p9', name: '莫奈花园', colors: ['#E8B4B8', '#C9B8E8', '#B8D4E8', '#D4E8C4', '#F0E0C0'], likeCount: 312, emotionTag: '温柔', emotionId: 1, emotionColor: '#E8B4B8' },

  // 活力
  { id: 'p3', name: '暮光晚橙', colors: ['#F18F43', '#F5A660', '#D5DD5E', '#E8D080', '#F0C860'], likeCount: 204, emotionTag: '活力', emotionId: 2, emotionColor: '#F18F43' },
  { id: 'p4', name: '芥末春日', colors: ['#D5DD5E', '#C4CC50', '#E8F080', '#F0F4A0', '#A8B040'], likeCount: 89, emotionTag: '活力', emotionId: 2, emotionColor: '#F18F43' },
  { id: 'p11', name: '夏日柠檬', colors: ['#FFE135', '#FFD700', '#FFEC8B', '#F0E68C', '#FFF44F'], likeCount: 186, emotionTag: '活力', emotionId: 2, emotionColor: '#F18F43' },

  // 沉静
  { id: 'p5', name: '苔原初绿', colors: ['#94B276', '#A8C488', '#7A9660', '#B4D090', '#C8DCA8'], likeCount: 156, emotionTag: '沉静', emotionId: 3, emotionColor: '#94B276' },
  { id: 'p6', name: '薄荷轻语', colors: ['#B8D4C8', '#C8E0D4', '#D8ECD8', '#E8F4E8', '#F0F8F0'], likeCount: 67, emotionTag: '沉静', emotionId: 3, emotionColor: '#94B276' },
  { id: 'p10', name: '晨曦微光', colors: ['#F9F5F0', '#F0EBE3', '#E8E0D8', '#D9D0C7', '#C8C0B8'], likeCount: 45, emotionTag: '沉静', emotionId: 3, emotionColor: '#94B276' },
  { id: 'p12', name: '森林晨雾', colors: ['#228B22', '#32CD32', '#2E8B57', '#006400', '#3CB371'], likeCount: 142, emotionTag: '沉静', emotionId: 3, emotionColor: '#94B276' },

  // 忧郁
  { id: 'p7', name: '烟雨江南', colors: ['#9B8EA8', '#7A6880', '#B8AABF', '#6A5870', '#C8C0D0'], likeCount: 118, emotionTag: '忧郁', emotionId: 4, emotionColor: '#9B8EA8' },
  { id: 'p8', name: '紫罗兰絮', colors: ['#D4C0DC', '#C8B0D0', '#BCACC8', '#B0A0C0', '#A490B8'], likeCount: 82, emotionTag: '忧郁', emotionId: 4, emotionColor: '#9B8EA8' },
  { id: 'p13', name: '深海夜蓝', colors: ['#191970', '#000080', '#4169E1', '#483D8B', '#6A5ACD'], likeCount: 98, emotionTag: '忧郁', emotionId: 4, emotionColor: '#9B8EA8' }
]

// 按情绪ID获取色卡
const getPalettesByEmotionId = (emotionId) => {
  return allPalettes.filter(p => p.emotionId === emotionId)
}

// 按情绪标签获取色卡
const getPalettesByEmotionTag = (emotionTag) => {
  return allPalettes.filter(p => p.emotionTag === emotionTag)
}

// 获取所有色卡
const getAllPalettes = () => {
  return allPalettes
}

module.exports = {
  allPalettes,
  getPalettesByEmotionId,
  getPalettesByEmotionTag,
  getAllPalettes
}