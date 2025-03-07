// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-2gjpg4z65bac3f44'
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('开始进行内容安全检测，输入内容:', event.content)
  
  try {
    // 调用微信内容安全接口
    console.log('准备调用 msgSecCheck API...')
    const result = await cloud.openapi.security.msgSecCheck({
      content: event.content,
      openid: cloud.getWXContext().OPENID,
      scene: 2,
      version: 2
    })
    console.log('msgSecCheck API 调用成功，返回结果:', result)

    return {
      result: result,
      success: true,
      log: '内容检测完成'
    }
  } catch (err) {
    // 如果内容检测失败，返回错误信息
    console.error('msgSecCheck API 调用失败:', err)
    
    // 根据错误码返回不同的处理结果
    if (err.errCode === 87014) {
      // 内容含有违法违规内容
      return {
        success: false,
        result: {
          suggest: 'risky'
        },
        log: '发现违规内容'
      }
    }
    
    return {
      error: err,
      success: false,
      result: {
        suggest: 'pass' // 默认通过
      },
      log: '内容检测失败，使用默认处理'
    }
  }
} 