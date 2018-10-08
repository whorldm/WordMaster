var music = require("../../utils/music.js");
var assistant = require("../../utils/assistant.js");
var Utils = require("../../utils/util.js");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    random: {
      type: Number,
      default: 1
    },
    showWord: {
      type: Array
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 在屏幕上滚动的所有内容
    rollList: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onRoll: function () {
      let tempList = this.data.rollList;
      tempList.push(new Doomm(this.data.showWord));
      music.playSuccessMusic();
      assistant.playVoiceByInputText(this.data.showWord.join(' '));
      this.setData({
        rollList: tempList
      })
    }
  }
})

class Doomm {
  constructor(wordArr) {
    this.str1 = wordArr[0];
    this.str2 = wordArr[1];
    this.random = Utils.RandomNum(0,1);
  }
}


