// components/Board/Board.js
import Match from '../../utils/match.js'

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
    classStyle1: 'test',
    classStyle2: 'test',
    rightList: ['Good' ,'Great' ,'Wonderful', 'Awesome', 'Amazing', 'Perfect'],
    errorList: ['Oh NO！', 'Come on！', 'ARE YOU OK？', 'Try again！']
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init() {
      this.setData({
        classStyle1: 'fade_left',
        classStyle2: 'fade_right'
      })
    },
    remove: function () {
      this.setData({
        classStyle1: 'test',
        classStyle2: 'test'
      })
    },
    getSuccess: function(num) {
      if(num === null || num === undefined || num > rightList.length){
        num = 0;
      }
      return this.data.rightList[num];
    },
    getError: function() {
      console.log(111);
      let num = Match.RandomNumBoth(0,3);
      return this.data.errorList[num];
    }
  }
})
