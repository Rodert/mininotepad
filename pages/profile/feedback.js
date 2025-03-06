// pages/profile/feedback.js
Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onClose() {
      this.triggerEvent('close')
    },

    onTapCustomerService() {
      wx.openCustomerServiceChat({
        extInfo: { url: 'https://work.weixin.qq.com' },
        corpId: '', // 填写企业微信的企业ID
        success(res) {
          console.log('进入客服会话', res)
        },
        fail(err) {
          console.error('进入客服会话失败', err)
          wx.showToast({
            title: '暂时无法连接客服',
            icon: 'none'
          })
        }
      })
    },

    onTapFeedbackInfo() {
      wx.showModal({
        title: '使用说明',
        content: '感谢您使用方便记事本！\n\n1. 如果您在使用过程中遇到任何问题，可以通过"联系客服"与我们联系\n2. 支持添加、编辑、删除和标记完成待办事项\n3. 可以设置任务截止日期和优先级\n4. 数据会安全地保存在本地\n5. 定期更新以提供更好的使用体验\n\n如有建议，欢迎随时反馈！',
        showCancel: false,
        confirmText: '我知道了'
      })
    }