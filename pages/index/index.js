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

  async addTodo() {
    const { newTodo, todos } = this.data
    if (!newTodo.trim()) {
      wx.showToast({
        title: '请输入待办事项',
        icon: 'none'
      })
      return
    }

    try {
      console.log('开始调用云函数进行内容检测...')
      const { result, success, error } = await wx.cloud.callFunction({
        name: 'msgSecCheck',
        data: {
          content: newTodo.trim()
        }
      }).catch(error => {
        console.error('云函数调用失败:', error)
        throw error
      })

      console.log('云函数调用结果:', { result, success, error })

      if (!result.success) {
        console.log('云函数调用失败，启用本地敏感词检测')
        const localCheck = this.checkSensitiveWords(newTodo.trim())
        if (localCheck.isRisky) {
          console.log('本地检测发现敏感词:', localCheck.words)
          wx.showModal({
            title: '内容提醒',
            content: `输入内容包含敏感词"${localCheck.words.join('、')}"，请修改后重试`,
            showCancel: false
          })
          return
        }
      }

      if (result && result.suggest === 'risky') {
        console.log('云端检测发现敏感内容')
        wx.showModal({
          title: '内容提醒',
          content: '输入内容可能包含敏感信息，请修改后重试',
          showCancel: false
        })
        return
      }
      
      console.log('内容检测通过，准备添加待办事项')
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

      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('添加待办事项失败，使用本地敏感词检测:', error)
      const localCheck = this.checkSensitiveWords(newTodo.trim())
      if (localCheck.isRisky) {
        console.log('本地检测发现敏感词:', localCheck.words)
        wx.showModal({
          title: '内容提醒',
          content: `输入内容包含敏感词"${localCheck.words.join('、')}"，请修改后重试`,
          showCancel: false
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

      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
    }
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