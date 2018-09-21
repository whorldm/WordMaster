Component({
  /**
   * 组件的属性列表
   */
  properties: {
    rightNum: {
      type: Number
    },
    errorNum: {
      type: Number
    },
    starNum: {
      type: Number
    },
    levelId: {
      type: Number
    },
    greedTitle: {
      type: String,
      default: '小学二年级'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    titleList: [
      ['考', '试', '失', '败'],
      ['考', '试', '通', '过'],
      ['完', '美', '通', '过']
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goNextGame: function () {
      this.triggerEvent('myNextGame')
    }
  }
})
