var app = getApp();
var request = require("../../../utils/request.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    segmentList: []
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
        segmentList: res.list
      })
    }).catch(error => {
      console.error("获取用户信息失败");
    })
  },

  // 跳转到等待匹配页面
  waitMatch: function () {
    wx.navigateTo({
      url: '/pages/rankgame/waiting/waiting',
    })
  },
  
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  }
})