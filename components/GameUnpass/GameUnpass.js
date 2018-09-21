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
      console.log('继续深造')
      this.triggerEvent('myNextGame')
    },
    shareToFriend: function () {
      console.log('分享 子组件传递给父组件触发')
      this.triggerEvent('myShare')
    },
    onShareAppMessage: function () {
      console.log('分享 子组件触发')
      return {
        title: '单词大咖',
        path: '/pages/index/index'
      }
    },
  }
})
