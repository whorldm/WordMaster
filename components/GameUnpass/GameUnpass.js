// components/GameUnpass/GameUnpass.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    mySelf: {
      type: Object
    },
    levelId: {
      type: Number
    },
    greedTitle: {
      type: String,
      default: '小学二年级  第二课时'
    },
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
      this.triggerEvent('myNextGame');
    }
  }
})
