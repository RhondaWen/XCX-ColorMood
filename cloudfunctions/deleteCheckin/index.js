// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const { checkinId } = event

  console.log('deleteCheckin 被调用')
  console.log('checkinId:', checkinId)

  if (!checkinId) {
    return {
      success: false,
      message: '缺少打卡记录ID'
    }
  }

  try {
    // 删除打卡记录
    const result = await db.collection('checkins').doc(checkinId).remove()
    console.log('删除结果:', result)

    return {
      success: true,
      message: '删除成功',
      stats: result.stats
    }
  } catch (err) {
    console.error('删除失败:', err)
    return {
      success: false,
      message: err.message || '删除失败',
      error: err.toString()
    }
  }
}