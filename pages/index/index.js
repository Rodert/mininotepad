// pages/index/index.js
Page({
  data: {
    newTodo: '',
    todos: [],
    filter: 'active',
    filteredTodos: [],
    completedCount: 0,
    activeCount: 0,
    currentDate: ''
  },

  onLoad() {
    const todos = wx.getStorageSync('todos') || []
    const now = new Date()
    const currentDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`

    this.setData({ 
      todos,
      currentDate
    }, () => {
      this.updateFilteredTodos()
      this.updateCounts()
    })
  },

  onInput(e) {
    this.setData({
      newTodo: e.detail.value
    })
  },

  addTodo() {
    const { newTodo, todos } = this.data
    if (!newTodo.trim()) {
      wx.showToast({
        title: '请输入待办事项',
        icon: 'none'
      })
      return
    }

    const todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createTime: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
    }

    const newTodos = [todo, ...todos]
    this.setData({
      todos: newTodos,
      newTodo: ''
    }, () => {
      this.saveTodos()
      this.updateFilteredTodos()
      this.updateCounts()
    })
  },

  deleteTodo(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          const { todos } = this.data
          const newTodos = todos.filter(todo => todo.id !== id)
          this.setData({ todos: newTodos }, () => {
            this.saveTodos()
            this.updateFilteredTodos()
            this.updateCounts()
          })
        }
      }
    })
  },

  toggleTodo(e) {
    const { id } = e.currentTarget.dataset
    const { todos } = this.data
    const newTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )

    this.setData({ todos: newTodos }, () => {
      this.saveTodos()
      this.updateFilteredTodos()
      this.updateCounts()
    })
  },

  setFilter(e) {
    const { type } = e.currentTarget.dataset
    this.setData({ filter: type }, () => {
      this.updateFilteredTodos()
    })
  },

  updateFilteredTodos() {
    const { todos, filter } = this.data
    let filteredTodos = []

    switch (filter) {
      case 'active':
        filteredTodos = todos.filter(todo => !todo.completed)
        break
      case 'completed':
        filteredTodos = todos.filter(todo => todo.completed)
        break
      default:
        filteredTodos = todos
    }

    this.setData({ filteredTodos })
  },

  updateCounts() {
    const { todos } = this.data
    const completedCount = todos.filter(todo => todo.completed).length
    const activeCount = todos.length - completedCount

    this.setData({
      completedCount,
      activeCount
    })
  },

  saveTodos() {
    const { todos } = this.data
    wx.setStorageSync('todos', todos)
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/detail/index?id=${id}`
    })
  }
})