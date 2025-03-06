// pages/profile/index.js
Page({
  data: {
    userInfo: null,
    version: '1.0.0',
    isLogin: false,
    lastLoginAttempt: 0,  // 添加最后一次登录尝试时间
    showFeedback: false
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
  }
})