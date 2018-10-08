// components/ErrorWord/ErrorWord.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    random: {
      type: Number,
      default: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    errorList: ['Oh NO！', 'Come on！', 'Try again！']
  },

  /**
   * 组件的方法列表
   */
  methods: {
    playErrorMusic(num) {
      let innerAudioContextError = wx.createInnerAudioContext();
      if(num === 0){
        innerAudioContextError.src = 'http://cdn.tik.com/wordmaster/sounds/oh_on.mp3';
      }
      if(num === 1) {
        innerAudioContextError.src = 'http://cdn.tik.com/wordmaster/sounds/error.wav';
      }
      if(num === 2){
        innerAudioContextError.src = 'http://cdn.tik.com/wordmaster/sounds/try_again.mp3';
      }
      
      innerAudioContextError.play();
      innerAudioContextError.onEnded(()=> {
        innerAudioContextError.destroy();
      });
    }
  }
})
