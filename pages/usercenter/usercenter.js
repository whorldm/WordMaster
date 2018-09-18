Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    runAM: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  containerTap: function (res) {
    if(res.target.dataset.name !== 'random'){
      return;
    }
    var that = this
    var x = res.touches[0].pageX;
    var y = res.touches[0].pageY;
    this.setData({
      rippleStyle: ''
    });
    setTimeout(function () {
      that.setData({
        rippleStyle: 'top:' + y + 'px;left:' + x + 'px;animation:ripple 0.4s linear;'
      });
    }, 200)
  },

  chanMask: function () {
    var isShow = this.data.show ? false : true;
    var delay = isShow ? 30 : 1000;
    if (isShow) {
      this.setData({
        show: isShow
      });
    } else {
      this.setData({
        runAM: isShow
      });
    }

    setTimeout(function () {
      if (isShow) {
        this.setData({
          runAM: isShow
        });
      } else {
        this.setData({
          show: isShow
        });
      }
    }.bind(this), delay);

  }

})