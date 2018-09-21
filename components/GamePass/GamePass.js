// components/GamePass/GamePass.js
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
    starNum: {
      type: Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    titleList:[
      ['成','绩','及','格'],
      ['成','绩','良','好'],
      ['成','绩','优','秀']
    ]
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
