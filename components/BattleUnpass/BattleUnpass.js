Component({
  /**
   * 组件的属性列表
   */
  properties: {
    stageNum: {
      type: Number
    },
    rankNum: {
      type: Number
    },
    mySelf: {
      type: Object
    },
    percent: {
      default: 12,
      type: Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _stageNum: '一',
    _rankNum: 3
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
