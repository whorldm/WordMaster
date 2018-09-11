const app = getApp();
var request = require("../../../utils/request.js");
var utils = require("../../../utils/util.js");
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
    myLevel: {},
    matchPerson: {},
    isLoading: true,
    progress_txt: '正在匹配...',
    count: 5, // 设置 计数器 初始为0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // onLoad: function (options) {
  //   console.log(options);
  //   let waitTime = utils.RandomNumBoth(1,5);
  //   if (app.globalData.userInfo) {
  //     this.setData({
  //       userInfo: {
  //         avatarUrl: app.globalData.userInfo.avatarUrl,
  //         nickName: app.globalData.userInfo.nickName,
  //         level: options.level,
  //         star: options.star
  //       }
  //     })
  //   }
  // },

  // 直接从首页进入，不经过段位页
  onLoad: function () {
    let waitTime = utils.RandomNumBoth(1,5);
    if (app.globalData.userInfo) {
      this.setData({
        count: waitTime,
        userInfo: app.globalData.userInfo
      })
    } else {
      this.setData({
        count: waitTime,
        userInfo: getCurrentPages()[0].data.userInfo
      })
    }
    request.getData("SEGMENT_LIST",{userId: app.globalData.userId })
    .then(res => {
      this.setData({
        matchPerson: utils.matchPerson(res.list.length - 1),
        myLevel: res.list[res.list.length - 1],
      })
    })
    .catch(err => {
      console.error(err);
    })
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
    if(countTimer) {
      clearInterval(countTimer);
    }
  },

  onUnload: function () {
    if(countTimer) {
      clearInterval(countTimer);
    }
  }
})