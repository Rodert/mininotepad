// pages/profile/index.js
Page({
  data: {
    userInfo: null,
    version: '1.0.0',
    isLogin: false,
    lastLoginAttempt: 0,  // 添加最后一次登录尝试时间
    showFeedback: false
  },

  // 添加内容安全检测函数
  async checkContentSecurity(content) {
    try {
      const result = await wx.security.msgSecCheck({
        content: content,
        version: 2,
        scene: 2
      }).catch(async (error) => {
        console.error('内容安全检测失败:', error)
        // 如果是 API 调用失败，返回通过
        return { result: { suggest: 'pass' } }
      })

      // 检查结果
      if (result.result && result.result.suggest === 'risky') {
        wx.showModal({
          title: '内容提醒',
          content: '输入内容可能包含敏感信息，请修改后重试',
          showCancel: false
        })
        return false
      }
      return true
    } catch (error) {
      console.error('内容检测失败:', error)
      wx.showToast({
        title: '内容检测失败',
        icon: 'error'
      })
      // 如果检测失败，默认允许通过
      return true
    }
  },

  onLoad() {
    // 检查本地存储中的登录状态和用户信息
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    const loginTime = wx.getStorageSync('loginTime')
    
    // 检查用户信息是否存在且登录时间是否在有效期内（7天）
    if (userInfo && loginTime && Date.now() - loginTime < 7 * 24 * 60 * 60 * 1000) {
      this.setData({
        userInfo: userInfo,
        isLogin: true
      })
    } else {
      // 清除过期的登录信息
      wx.removeStorageSync('userInfo')
      wx.removeStorageSync('loginTime')
      this.setData({
        userInfo: null,
        isLogin: false
      })
    }
  },

  // 清空数据
  onTapClearData() {
    wx.showModal({
      title: '警告',
      content: '确定要清空所有待办事项数据吗？\n\n此操作将永久删除所有数据且不可恢复！',
      confirmText: '确定清空',
      confirmColor: '#ff4d4f',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '二次确认',
            content: '再次确认是否清空所有数据？',
            confirmText: '确定清空',
            confirmColor: '#ff4d4f',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                try {
                  wx.removeStorageSync('todos')
                  wx.showToast({
                    title: '数据已清空',
                    icon: 'success',
                    complete: () => {
                      // 延迟一下以确保Toast能够显示
                      setTimeout(() => {
                        // 重启小程序
                        wx.reLaunch({
                          url: '/pages/index/index'
                        })
                      }, 1500)
                    }
                  })
                } catch (e) {
                  wx.showToast({
                    title: '清空失败',
                    icon: 'error'
                  })
                }
              }
            }
          })
        }
      }
    })
  },

  // 用户登录
  onTapLogin() {
    // 如果已经登录，直接返回
    if (this.data.isLogin) {
      return
    }

    // 防抖处理：限制调用频率（3秒内只能调用一次）
    const now = Date.now()
    if (now - this.data.lastLoginAttempt < 3000) {
      wx.showToast({
        title: '请稍后再试',
        icon: 'none'
      })
      return
    }

    // 更新最后登录尝试时间
    this.setData({
      lastLoginAttempt: now
    })

    // 获取用户信息
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo
        // 保存用户信息和登录时间到本地存储
        wx.setStorageSync('userInfo', userInfo)
        wx.setStorageSync('loginTime', Date.now())
        
        this.setData({
          userInfo: userInfo,
          isLogin: true
        })

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
      },
      fail: () => {
        wx.showToast({
          title: '登录失败',
          icon: 'error'
        })
      }
    })
  },

  onTapAbout() {
    wx.showModal({
      title: '关于方便记事本',
      content: '方便记事本是一款简单易用的待办事项管理工具，帮助您随时记录和管理日常任务。\n\n特点：\n• 简洁的界面设计\n• 支持任务完成状态标记\n• 支持任务筛选查看\n• 数据本地存储安全可靠\n\n',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  // 退出登录
  onTapLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录信息
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('loginTime')
          
          this.setData({
            userInfo: null,
            isLogin: false
          })

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },

  onTapFeedback() {
    this.setData({
      showFeedback: true
    })
  },

  onCloseFeedback() {
    this.setData({
      showFeedback: false
    })
  },

  exportToTxt() {
    const todos = wx.getStorageSync('todos') || []
    if (todos.length === 0) {
      wx.showToast({
        title: '没有待办事项',
        icon: 'none'
      })
      return
    }

    // 生成文本内容
    let content = '方便记事本 - 待办事项列表\n\n'
    content += '导出时间：' + new Date().toLocaleString() + '\n\n'

    todos.forEach((todo, index) => {
      content += `${index + 1}. ${todo.text}\n`
      content += `   状态：${todo.completed ? '已完成' : '未完成'}\n`
      content += `   创建时间：${new Date(todo.createTime).toLocaleString()}\n`
      if (todo.note) {
        content += `   备注：${todo.note}\n`
      }
      content += '\n'
    })

    // 生成文件名
    const fileName = `待办事项_${new Date().getTime()}.txt`
    
    // 将内容写入文件系统
    const fs = wx.getFileSystemManager()
    const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`
    
    try {
      fs.writeFileSync(filePath, content, 'utf8')
      
      // 保存文件到手机
      wx.shareFileMessage({
        filePath: filePath,
        success: () => {
          wx.showToast({
            title: '导出成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('导出失败', err)
          wx.showToast({
            title: '导出失败',
            icon: 'none'
          })
        }
      })
    } catch (err) {
      console.error('写入文件失败', err)
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      })
    }
  }
})