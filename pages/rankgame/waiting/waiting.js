Page({

  data: {
    second: 3,
    text: '等待匹配中.....'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.waitGame();
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  waitGame: function () {
    setTimeout(() => {
      if(this.data.second > 1) {
        this.setData({
          second: this.data.second - 1,
        })
        this.waitGame();
      } else {
        clearTimeout();
        this.startGame();
      }
    },1000)
  },

  startGame: function () {
    wx.navigateTo({
      url: '/pages/rankgame/startgame/startgame',
    })
  }

})