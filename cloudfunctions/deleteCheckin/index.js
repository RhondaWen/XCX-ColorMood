// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const { checkinId } = event
  const db = cloud.database()

  try {
    // 删除打卡记录（管理员权限，绕过安全规则）
    await db.collection('checkins').doc(checkinId).remove()

    return {
      success: true,
      message: '删除成功'
    }
  } catch (err) {
    console.error('删除失败:', err)
    return {
      success: false,
      message: err.message || '删除失败'
    }
  }
}