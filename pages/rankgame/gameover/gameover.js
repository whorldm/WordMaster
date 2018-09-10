var Utils = require("../../../utils/util.js");
var request = require("../../../utils/request.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordList: [
      { wordC: '苹果', wordE: 'apple', flag: true },
      { wordC: '香蕉', wordE: 'banana', flag: true },
      { wordC: '环境', wordE: 'envirnment', flag: false },
      { wordC: '树', wordE: 'tree', flag: true },
      { wordC: '铅笔', wordE: 'pencil', flag: false },
      { wordC: '手机', wordE: 'phone', flag: true }
    ],
    mySelf: {  // 保存个人信息
      logo: '../../../img/1.jpeg',
      score: 240,
      lastTimes: 3,
      total: 120
    },
    oppnent: {  //保存对手的信息
      logo: '../../../img/1.jpeg',
      score: 150
    },
    actionSheetHidden: true, //点击分享，弹出底部菜单
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.getTheResult();
  },
  // 从服务器获取上一次的所有结果
  getTheResult: function () {
    request.getDataLoading("WORD_LIST",{userId:app.globalData.userId})
    .then(res => {
      console.log(res)
    }).catch(err => {
      wx.showToast({
        title: '获取比赛结果失败',
      })
    })
  },

  // 再虐他一次
  playAgin: function(){
    console.log('触发函数')
  },

  // 换个对手
  changePerson: function(){
    console.log('触发函数')
  },

  // 分享弹出底部菜单
  actionSheetTap: function (e) {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },

  // 点击按钮后关闭菜单
  actionSheetChange: function (e) {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    });
  },

  // 点击生成图片的按钮
  SaveToPicture: function () {
    wx.navigateTo({
      url: '/pages/priview/priview',
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    this.actionSheetChange();
  },
})