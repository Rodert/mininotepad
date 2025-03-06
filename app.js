App({
  globalData: {
    todos: []
  },
  onLaunch() {
    // 初始化时从本地存储加载待办事项
    const todos = wx.getStorageSync('todos') || []
    this.globalData.todos = todos
  }
})
