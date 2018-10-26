// components/BattlePass/BattlePass.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    RankList: {
      type: Array
    },
    mySelf: {
      type: Object
    },
    percent: {
      type: Number
    },
    reward: {
      type: Object
    },
    isFight: {
      type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    defaultValue: '0',
    titleList: ['冠军','亚军','季军']
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
