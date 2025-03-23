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

  onTodoInput(e) {
    this.setData({
      'todo.text': e.detail.value
    })
  },

  onNoteInput(e) {
    this.setData({
      note: e.detail.value
    })
  },

  onDateChange(e) {
    this.setData({
      'todo.date': e.detail.value
    })
  },

  saveNote() {
    const todos = wx.getStorageSync('todos') || []
    const index = todos.findIndex(t => t.id === this.data.todo.id)
    
    if (index > -1) {
      todos[index] = {
        ...todos[index],
        text: this.data.todo.text,
        note: this.data.note,
        date: this.data.todo.date
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