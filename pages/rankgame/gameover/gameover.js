var Utils = require("../../../utils/util.js");
var request = require("../../../utils/request.js");
const app = getApp();
var innerAudioContextResult = null ;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mySelf: {  // 保存个人信息
      avatarUrl: '../../../img/1.jpeg',
      rightNum: 23,
      errorNum: 6,
      score: 240,
    },
    oppnent: {  //保存对手的信息
      avatarUrl: '../../../img/1.jpeg',
      rightNum: 6,
      errorNum: 10,
      score: 150
    },
    isWin: true, //是否赢
    actionSheetHidden: true, //点击分享，弹出底部菜单
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    innerAudioContextResult = wx.createInnerAudioContext();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 目前从本地获取数据
    let _mySelf = wx.getStorageSync('mySelf');
    let _oppnent = wx.getStorageSync('oppnent');
    this.playBgMusic(_mySelf.score > _oppnent.score)
    this.setData({
      isWin: _mySelf.score > _oppnent.score,
      mySelf: _mySelf,
      oppnent: _oppnent
    })
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
  // 播放背景音乐
  playBgMusic(flag){
    // if (flag) {
    //   innerAudioContextResult.src = 'http://pepuwoffw.bkt.clouddn.com/win.mp3';
    // } else {
    //   innerAudioContextResult.src = 'http://pepuwoffw.bkt.clouddn.com/lose.mp3';
    // }
    innerAudioContextResult.src = 'http://pepuwoffw.bkt.clouddn.com/success.mp3'
    innerAudioContextResult.play();
    innerAudioContextResult.onEnded(res => {
      innerAudioContextResult.destroy();
    })
  },
  // 回到首页
  goBack: function(){
    let len = getCurrentPages().length;
    wx.navigateBack({
      delta: len - 1
    })
  },

  // 换个对手
  changePerson: function(e){
    if(this.data.isWin) {  //表示用户赢了  挑战下一个
      wx.redirectTo({
        url: '/pages/rankgame/waiting/waiting'
      })
    } else {  // 用户输了，在战一次
      wx.redirectTo({
        url: '/pages/rankgame/startgame/startgame?matchPerson=' + this.data.oppnent.avatarUrl
      })
    }
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