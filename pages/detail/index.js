Page({
  data: {
    todo: null,
    note: ''
  },

  onLoad(options) {
    const todos = wx.getStorageSync('todos') || []
    const todo = todos.find(t => t.id === options.id)
    if (todo) {
      this.setData({
        todo,
        note: todo.note || ''
      })
    }
  },

  onNoteInput(e) {
    this.setData({
      note: e.detail.value
    })
  },

  saveNote() {
    const todos = wx.getStorageSync('todos') || []
    const index = todos.findIndex(t => t.id === this.data.todo.id)
    
    if (index > -1) {
      todos[index] = {
        ...todos[index],
        note: this.data.note
      }
      
      wx.setStorageSync('todos', todos)
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        success: () => {
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      })
    }
  },

  goBack() {
    wx.navigateBack()
  }
})