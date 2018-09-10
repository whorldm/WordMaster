var app = getApp();
var request = require("../../../utils/request.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    myLevel: {},  // 我目前的段位信息
    segmentList: []  // 所有的段位list
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    request.getData("SEGMENT_LIST",{userId: app.globalData.userId})
    .then(res => {
      this.setData({
        myLevel: res.list[res.list.length - 1],
        segmentList: res.list
      })
    }).catch(error => {
      console.error("获取用户信息失败");
    })
  },

  // 跳转到等待匹配页面
  waitMatch: function () {
    wx.navigateTo({
      url: '/pages/rankgame/waiting/waiting?level='+this.data.myLevel.name+'&star='+this.data.myLevel.star,
    })
  },
  
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  }
})