Component({
  /**
   * 组件的属性列表
   */
  properties: {
    combox: {
      type: Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    rollList: [],
    comboxList: ['combox X1', 'combox X2', 'combox X3', 'combox X4', 'combox X5','combox X6']
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onRoll: function () {
      let tempList = this.data.rollList;
      tempList.push('combox X'+this.data.combox);   
      this.setData({
        rollList: tempList
      })
    },
    onInit: function () {
      this.setData({
        rollList: []
      })
    }
  }
})
