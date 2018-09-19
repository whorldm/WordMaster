// components/ExamUnpass/ExamUnpass.js
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
    greedTitle: {
      type: String,
      default: '小学二年级'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    goNextGame: function () {
      console.log('继续深造')
      this.triggerEvent('myNextGame')
    }
  }
})
