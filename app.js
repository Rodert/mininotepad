App({
  globalData: {
    todos: []
  },
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-2gjpg4z65bac3f44', // 云开发环境ID 
        traceUser: true
      })
    }

    // 初始化时从本地存储加载待办事项
    const todos = wx.getStorageSync('todos') || []
    this.globalData.todos = todos
  }
})
