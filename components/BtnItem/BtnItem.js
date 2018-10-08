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
    positionX: {  // x坐标
      type: Number
    },
    positionY: {  // y坐标
      type: Number
    }
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
    },
    // 提示的状态
    onNotice: function() {
      this.setData({
        ['gridItem.isNotice']: true
      })
    }
  }
})
