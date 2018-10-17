// components/BtnItem/BtnItem.js
var music = require('../../utils/music.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    gridItem: {  // 按钮的具体信息
      type: Object
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    animationData: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击选中状态
    onClicked: function() {
      this.setData({
        ['gridItem.isChoose']: !this.data.gridItem.isChoose
      })
      music.playClickMusic();
    },
    // 匹配正确的状态
    onMatched: function() {
      this.setData({
        ['gridItem.isClear']: true
      })
    },
    // 匹配失败的状态
    onFailed: function() {
      this.setData({
        ['gridItem.isError']: true
      })
      setTimeout(()=>{
        this.setData({
          ['gridItem.isChoose']: false,
          ['gridItem.isError']: false
        })
        this.triggerEvent('myevent', {
          firstStr: '',
          secondStr: '',
          isError: false
        })
      },1000)
    },
    // 提示的状态
    onNotice: function() {
      this.setData({
        ['gridItem.isNotice']: true
      })
      setTimeout(() => {
        this.setData({
          ['gridItem.isNotice']: false
        })
        this.triggerEvent('myevent', { isDelCoin: false })
      }, 1200)
    }
  }
})
