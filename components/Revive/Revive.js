// components/Revive/Revive.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    remainNum: {
      type: Number
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
    noRevive: function (){
      console.log('重新再来')
      this.triggerEvent('noRevive');
    }
  }
})
