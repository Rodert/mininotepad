// pages/profile/feedback/index.js
Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    feedbackTypes: [
      { id: 'contact', name: '联系客服', desc: '联系在线客服' },
      { id: 'help', name: '使用说明', desc: '查看使用帮助' },
      { id: 'feature', name: '新增功能留言', desc: '如果您有功能需求，点击这里' }
    ]
  },

  methods: {
    onClose() {
      this.triggerEvent('close');
    },

    onTapFeedbackType(e) {
      const { type } = e.currentTarget.dataset;
      switch (type) {
        case 'contact':
          this.handleCustomerService();
          break;
        case 'help':
          this.handleHelp();
          break;
        case 'feature':
          this.handleFeature();
          break;
      }
    },

    handleCustomerService() {
      this.onClose();
      wx.openCustomerServiceChat({
        success(res) {
          console.log('打开客服会话成功', res);
        },
        fail(err) {
          console.error('打开客服会话失败', err);
          wx.showToast({
            title: '客服暂时无法连接',
            icon: 'none'
          });
        }
      });
    },

    handleHelp() {
      wx.showModal({
        title: '使用说明',
        content: '感谢您使用方便记事本！\n\n1. 添加待办：点击首页"+"按钮\n2. 编辑待办：点击待办项进入详情页\n3. 完成待办：点击待办项前的圆圈\n4. 删除待办：左滑待办项\n5. 筛选待办：点击顶部的筛选按钮\n\n如需更多帮助，请联系客服。',
        showCancel: false,
        confirmText: '我知道了'
      });
    },

    handleFeature() {
      wx.showModal({
        title: '你来了，优秀的产品经理',
        content: '如果您有新增需求，可以联系TA。并且需求上线时会联系您验收。小红书@程序员大王。',
        showCancel: false,
        confirmText: '确定'
      });
    }
  }
});