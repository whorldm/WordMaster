const app = getApp();
var request = require("../../../utils/request.js");
var countTimer = null; // 设置 定时器 初始为null

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: '../../../img/1.jpeg',
      nickName: '侧耳倾听',
      level: '无敌学神',
      star: 3
    },  
    isLoading: true,
    progress_txt: '正在匹配...',
    count: 5, // 设置 计数器 初始为0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app);
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
      })
    } else {
      this.setData({
        userInfo: getCurrentPages()[0].data.userInfo
      })
    }
    // request.getData("USER",{userId: app.globalData.userId})
    // .then(res => {
    //   console.log(res);
    //   this.setData({
    //     userInfo:{
    //     }
    //   })
    // }).catch(error => {
    //   console.error("获取用户信息失败");
    // })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.countInterval();
  },

  // 倒计时进行匹配对手
  countInterval: function () {
    let temp = 1;
    // 设置倒计时定时器
    countTimer = setInterval(() => {
      if (temp < this.data.count) {
        temp++;
      } else {
        this.setData({
          progress_txt: '',
          isLoading: false
        })
        clearInterval(countTimer);
        this.delayJump();
      }
    }, 1000)
  },

  // 延迟跳转
  delayJump: function () {
    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/rankgame/startgame/startgame',
      })
    },800)
  },

  // 返回上一页的排行
  goBack: function () {
    wx.navigateBack();
  },

  // 监听页面隐藏 清除定时器
  onHide: function () {
    console.log(111)
    if(countTimer) {
      clearInterval(countTimer);
    }
  },

  onUnload: function () {
    console.log(222)
    if(countTimer) {
      clearInterval(countTimer);
    }
  }
})