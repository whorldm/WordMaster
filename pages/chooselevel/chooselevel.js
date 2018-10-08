const app = getApp();
var request = require("../../utils/request.js");
var utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShareDialog: false, //是否显示增加金币的弹框
    userInfo: {
      nickName: '匿名',
      avatarUrl: '../../img/1.jpeg'
    }, // 用户的基本信息
    battleInfo: {
      integral: 20,
      totalIntegral: 1920
    }, // 用户的竞争信息
    levelTitle: '无敌学神',
    levelStar: 3,
    coin: 3492,
    rank: 249,
    sportsLevel: 1, // 竞技场的等级 0-初级，1-中级，2-高级
    levelList: ['XX','初级', '中级', '高级'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getUserBattleInfo();
  },
  // 获取用户竞技场的信息
  getUserBattleInfo: function() {
    request.getDataLoading('BATTLE_HOME', {
      userId: app.globalData.userId
    },'获取数据...').then((res) => {
      this.setData({
        battleInfo: res.info
      })
    }).catch((err) => {
      wx.showToast({
        icon: 'none',
        title: '获取用户竞技信息失败',
      })
    })
  },

  // 选择竞技的等级（默认为初级）
  chooseLvel: function(e) {
    if (e.currentTarget.dataset.level) {
      this.setData({
        sportsLevel: Number(e.currentTarget.dataset.level)
      })
    }
  },

  // 单人竞技场
  oneCompare: function() {
    wx.navigateTo({
      url: '/pages/waiting/waiting?level=' + this.data.sportsLevel +'&coin='+this.data.battleInfo.coin + '&isNew=' + this.data.battleInfo.level,
    })
  },

  // 分享增加金币
  addScore: function () {
    this.setData({
      isShareDialog: true
    })
  },

  closeCoinDialog: function () {
    this.setData({
      isShareDialog: false
    })
  },

  wait: function () {
    wx.showModal({
      showCancel: false,
      content: '尚未开启，敬请期待'
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    if(this.data.isShareDialog) {
      this.setData({
        isShareDialog: false,
        ['battleInfo.coin']: this.data.battleInfo.coin + 500
      })
      this.changeCoinNum(500);
      return utils.shareMsg(false);
    } else {
      let obj = utils.shareMsg(true);
      return {
        title: obj.title,
        path: '/pages/homepage/homepage',
      }
    }
  },

  // 向后请求更新金币数量
  changeCoinNum: function (Num) {
    let params = {};
    params.userId = app.globalData.userId;
    params.coin = Num;
    request.getData("CHANGE_COIN", params)
      .then(res => {
        console.log('提示成功')
      })
      .catch(err => {
        console.error('后台错误')
      })
  },
})