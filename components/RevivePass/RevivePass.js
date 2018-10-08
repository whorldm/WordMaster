// components/Revive/Revive.js
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
    starNum: {
      type: Number
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
    commonTitleList: [
      ['成', '绩', '及', '格'],
      ['成', '绩', '良', '好'],
      ['成', '绩', '优', '秀']
    ],
    examTitleList: [
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
      this.triggerEvent('goNextGame');
    }
  }
})
