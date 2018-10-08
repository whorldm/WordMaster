// components/ReviveUnpass/ReviveUnpass.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    lastWord: {
      type: Array
    },
    wrongArray: {
      type: Array
    },
    rightArray: {
      type: Array
    },
    todayRankList: {
      type: Object
    },
    isTest: {
      type: Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    titleList: [
      ['不', '合', '格'],
      ['不', '及', '格']
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goNextGame: function () {
      this.triggerEvent('goNextGame')
    }
  }
})
