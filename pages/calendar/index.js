Page({
  data: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    days: [],
    todos: [],
    selectedDate: '',
    selectedDateTodos: []
  },

  onLoad() {
    this.initCalendar();
    this.loadTodos();
  },

  onShow() {
    // 每次页面显示时重新加载待办事项
    this.loadTodos();
  },

  // 初始化日历
  initCalendar() {
    const { year, month } = this.data;
    const days = this.generateDays(year, month);
    
    // 获取当前日期的格式化字符串
    const today = new Date();
    const formattedToday = this.formatDate(today);
    
    this.setData({
      days,
      selectedDate: formattedToday
    });
  },

  // 生成日历天数
  generateDays(year, month) {
    const days = [];
    
    // 获取当月第一天是星期几
    const firstDay = new Date(year, month - 1, 1).getDay();
    
    // 获取当月天数
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 获取上个月的天数
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
    
    // 获取今天的日期信息
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    // 添加上个月的日期
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = month - 1 === 0 ? 12 : month - 1;
      const prevYear = month - 1 === 0 ? year - 1 : year;
      days.push({
        day,
        month: prevMonth,
        year: prevYear,
        currentMonth: false,
        isToday: false,
        fullDate: this.formatDate(new Date(prevYear, prevMonth - 1, day)),
        hasTodo: false
      });
    }
    
    // 添加当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        currentMonth: true,
        isToday: i === currentDay && month === currentMonth && year === currentYear,
        fullDate: this.formatDate(new Date(year, month - 1, i)),
        hasTodo: false
      });
    }
    
    // 添加下个月的日期，补齐6行7列
    const totalDays = 42; // 6行7列
    const remainingDays = totalDays - days.length;
    const nextMonth = month + 1 > 12 ? 1 : month + 1;
    const nextYear = month + 1 > 12 ? year + 1 : year;
    
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        currentMonth: false,
        isToday: false,
        fullDate: this.formatDate(new Date(nextYear, nextMonth - 1, i)),
        hasTodo: false
      });
    }
    
    return days;
  },

  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 加载待办事项
  loadTodos() {
    const todos = wx.getStorageSync('todos') || [];
    
    // 更新日历上的待办标记
    const days = this.data.days.map(day => {
      const hasTodo = todos.some(todo => todo.date && todo.date.startsWith(day.fullDate));
      return { ...day, hasTodo };
    });
    
    // 更新选中日期的待办事项
    const selectedDateTodos = todos.filter(todo => 
      todo.date && todo.date.startsWith(this.data.selectedDate)
    );
    
    this.setData({
      todos,
      days,
      selectedDateTodos
    });
  },

  // 选择日期
  selectDate(e) {
    const fullDate = e.currentTarget.dataset.date;
    
    // 添加点击动画效果
    const animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease',
    });
    
    animation.scale(0.9).step();
    animation.scale(1.0).step();
    
    // 设置动画到当前点击的元素
    const index = this.data.days.findIndex(day => day.fullDate === fullDate);
    const animationData = {};
    animationData[`days[${index}].animation`] = animation.export();
    
    this.setData(animationData);
    
    // 更新选中日期的待办事项
    const selectedDateTodos = this.data.todos.filter(todo => 
      todo.date && todo.date.startsWith(fullDate)
    );
    
    this.setData({
      selectedDate: fullDate,
      selectedDateTodos
    });
  },

  // 上个月
  prevMonth() {
    let { year, month } = this.data;
    
    if (month === 1) {
      year--;
      month = 12;
    } else {
      month--;
    }
    
    const days = this.generateDays(year, month);
    
    this.setData({
      year,
      month,
      days
    }, () => {
      this.loadTodos();
    });
  },

  // 下个月
  nextMonth() {
    let { year, month } = this.data;
    
    if (month === 12) {
      year++;
      month = 1;
    } else {
      month++;
    }
    
    const days = this.generateDays(year, month);
    
    this.setData({
      year,
      month,
      days
    }, () => {
      this.loadTodos();
    });
  },

  // 切换待办事项状态
  toggleTodo(e) {
    const id = e.currentTarget.dataset.id;
    const todos = this.data.todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    
    wx.setStorageSync('todos', todos);
    
    // 更新选中日期的待办事项
    const selectedDateTodos = todos.filter(todo => 
      todo.date && todo.date.startsWith(this.data.selectedDate)
    );
    
    this.setData({
      todos,
      selectedDateTodos
    });
  },

  // 跳转到详情页
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/index?id=${id}`
    });
  },

  // 跳转到今天
  goToToday() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const formattedToday = this.formatDate(today);
    
    // 如果当前月份不是今天所在的月份，则切换到今天所在的月份
    if (this.data.year !== currentYear || this.data.month !== currentMonth) {
      const days = this.generateDays(currentYear, currentMonth);
      
      this.setData({
        year: currentYear,
        month: currentMonth,
        days
      }, () => {
        this.loadTodos();
      });
    }
    
    // 选中今天的日期
    const selectedDateTodos = this.data.todos.filter(todo => 
      todo.date && todo.date.startsWith(formattedToday)
    );
    
    this.setData({
      selectedDate: formattedToday,
      selectedDateTodos
    });
    
    // 添加一个轻微的震动反馈
    wx.vibrateShort({
      type: 'light'
    });
  }
}) 