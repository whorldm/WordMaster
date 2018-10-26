const app = getApp();
var request = require("../../utils/request.js");
var utils = require("../../utils/util.js");

var lastClickTime = 0; //上次点击的时间戳
var currentClickTime = 0; //本次点击的事件

Page({
  data: {
    showContactDialog: false, //客服弹框
    userId: '',
    userInfo: {},
    formId: 0, // 用于发送模版消息
    coinNum: '', // 金币数量
    levelName: '', //用户的等级的名称
    levelId: '', //用户的等级的ID
    levelList: [], //用户的等级信息
    goLeft: true, // 左滑
    goRight: true, // 右滑
    pos: {}, // 悬浮按钮的样式
    imgUrls: [
      'http://cdn.tik.com/wordmaster/image/swiper_new_0.png',
      'http://cdn.tik.com/wordmaster/image/swiper_new_1.png',
      'http://cdn.tik.com/wordmaster/image/swiper_new_2.png',
      'http://cdn.tik.com/wordmaster/image/swiper_new_3.png',
      'http://cdn.tik.com/wordmaster/image/swiper_new_4.png',
      'http://cdn.tik.com/wordmaster/image/swiper_new_5.png'
    ],
    currentIndex: 0, //当前的最高等级
    stageLevelList: [], // 应用目前所划分的大等级
    bigLevel: {}, //用户目前的所在等级
    nextBigLevel: {}, //用户按照顺序将要进行的下一关
    maxLevelIdList: [{
        "game": 1,
        "name": '启蒙一',
        "exam": 4,
      },
      {
        "game": 5,
        "name": '小一 第1/4课时',
        "exam": 34,
      },
      {
        "game": 35,
        "name": '初一 第1/6课时',
        "exam": 55,
      },
      {
        "game": 56,
        "name": '高一 第1/8课时',
        "exam": 83,
      },
      {
        "game": 84,
        "name": '大一 第1/10课时',
        "exam": 127,
      },
      {
        "game": 128,
        "name": '大师',
        "exam": 9999999,
      }
    ]
  },

  onLoad: function(options) {
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType === 'none') {
          wx.showModal({
            showCancel: false,
            content: '请检查是否连接网络',
            success: () => {
              wx.navigateBack()
            }
          })
        }
      }
    })
    if (options.userId && app.globalData.userInfo) {
      this.setData({
        userId: app.globalData.userId,
        userInfo: app.globalData.userInfo,
      })
    }
    if(app.globalData.shareUser) {
      this.searchTheRoom();
    }
  },

  // 分享进入的用户查询是否会还有尚待参加的比赛
  searchTheRoom: function () {
    let params = {};
    params.userId = app.globalData.userId;
    params.roomNum = app.globalData.shareRoom;
    params.type = app.globalData.shareType;
    request.getData('CHECK_BATTLE_ROOM', params)
    .then((res) => {
      console.log('是否有房间：', res)
      if(res.code === 0) {
        // 已经开赛
        if(res.roomInfo !== null) {
          wx.showModal({
            showCancel: false,
            content: '您的好友邀请您参加“词鸡竞技场”，快来一决高下吧！',
            success: () => {
              if(Number(app.globalData.shareType) === 5) {
                wx.navigateTo({
                  url: '/pages/waiting/waiting?level=' + res.roomInfo.level +'&coin='+this.data.coinNum+'&roomNum='+app.globalData.shareRoom,
                })
              } 
              if(Number(app.globalData.shareType) === 1) {
                wx.navigateTo({
                  url: '/pages/fightwaiting/fightwaiting?level=' + res.roomInfo.level +'&coin='+this.data.coinNum+'&roomNum='+app.globalData.shareRoom,
                })
              } 
            }
          })
        } else {
          wx.showModal({
            content: '您的好友已开赛，您可以开启新的战场'
          })
        }
      }
    })
    .catch((error) => {
      console.error(error)
    })
  },

  onShow: function() {
    // 初始化记录用户的操作时间变量
    lastClickTime = 0;
    currentClickTime = 0;

    // 获取等级阶段以及用户的金币
    this.getUserAsset();
    this.getHomeLevel();

    this.setData({
      showContactDialog: false,
      pos: {
        top: 40,
        left: app.globalData.windowWidth - 80 || 315
      }
    })
  },

  // 获取首页的等级(展示)
  getHomeLevel: function() {
    request.getDataLoading("HOME_LEVEL_LIST", {
        userId: this.data.userId || app.globalData.userId
      }, '获取数据...')
      .then(res => {
        if (res.list.bigLevel !== null) {
          this.setData({
            currentIndex: res.list.stage,
            stageLevelList: res.list.bigLevelList,
            bigLevel: res.list.bigLevel,
            nextBigLevel: res.list.nextBigLevel
          })
        } else {
          this.setData({
            stageLevelList: res.list.bigLevelList,
          })
        }
      })
      .catch(err => {
        wx.showToast({
          'icon': 'none',
          title: '更新学位等级信息失败',
        })
      })
  },

  // 获取用户的等级(开启比赛)
  getUserLevel: function(e) {
    // 获取formId
    this.setData({
      formId: e.detail.formId
    })
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType === 'none') {
          wx.showModal({
            showCancel: false,
            content: '请检查是否连接网络'
          })
        } else {
          this.sendFormId(e.detail.formId);
          this.judgeLevel();
        }
      }
    })
  },
  // 想后台发送formId
  sendFormId: function(formId) {
    let params  = {};
    params.userId = app.globalData.userId;
    params.formId = formId;
    request.getData("INSERT_FORMID", params)
    .then(res => {
      
    }).catch(err => {
      console.error(err)
    })
  },

  // 判断关卡状态
  judgeLevel: function() {
    // 滑动所选等级的关卡ID范围
    let stageMin = this.data.maxLevelIdList[this.data.currentIndex].game;
    let stageMax = this.data.maxLevelIdList[this.data.currentIndex].exam;
    // 用户应该进行的下一关卡Id
    let currentLevelId = this.data.nextBigLevel.levelId;

    if (currentLevelId >= stageMin) {
      if (currentLevelId <= stageMax) {
        this.toStartGame(this.data.nextBigLevel); // 正常比赛
      } else {
        let obj = {
          isTest: 0,
          levelName: this.data.maxLevelIdList[this.data.currentIndex].name,
          levelId: stageMin
        }
        this.toStartGame(obj); // 巩固练习
      }
    } else {
      wx.showModal({
        showCancel: false,
        content: '学习是循序渐进的，想要解锁，需要一步步的升级打怪哦！'
      })
    }
  },

  // 开启比赛
  toStartGame: function(obj) {
    if (obj.isTest === 1) {
      wx.navigateTo({
        url: "/pages/examgame/examgame?levelId=" + obj.levelId + '&levelName=' + obj.levelName + '&isJump=0&formId=' + this.data.formId,
      })
    } else {
      wx.navigateTo({
        url: "/pages/stairgame/stairgame?levelId=" + obj.levelId + '&levelName=' + obj.levelName + '&isJump=0&formId=' + this.data.formId,
      })
    }
  },

  // 获取用户的当前金币
  getUserAsset: function() {
    request.getDataLoading("USER_ASSET", {
        userId: this.data.userId || app.globalData.userId
      }, '获取数据...')
      .then(res => {
        this.setData({
          coinNum: res.myAsset.coin,
          totalNum: res.myAsset.right
        })
      })
      .catch(err => {
        wx.showToast({
          icon: 'none',
          title: '更新持有金币数量失败',
        })
      })
  },

  // 用户点击箭头切换等级
  changSwiper: function(e) {
    currentClickTime = e.timeStamp;
    if (currentClickTime > lastClickTime + 350) {
      lastClickTime = currentClickTime;
    } else {
      return;
    }

    if (e.currentTarget.dataset.direct === 'right') {
      this.setData({
        currentIndex: this.data.currentIndex + 1
      })
    }
    if (e.currentTarget.dataset.direct === 'left') {
      this.setData({
        currentIndex: this.data.currentIndex - 1
      })
    }
  },

  // 当用户滑动切换
  swiperChange: function(event) {
    this.setData({
      currentIndex: event.detail.current
    })
  },

  // 查看排名
  navToRank: function() {
    wx.navigateTo({
      url: '/pages/ranking/ranking',
    })
  },

  // 切换到竞技场模式
  navToSports: function(e) {
    this.sendFormId(e.detail.formId);
    wx.navigateTo({
      url: '/pages/chooselevel/chooselevel',
    })
  },

  // 未开启状态
  wait: function() {
    wx.showModal({
      showCancel: false,
      content: '尚未开启，敬请期待'
    })
  },

  // 用户点击右上角分享
  onShareAppMessage: function() {
    return utils.shareMsg(false);
  },

  showDialog: function() {
    this.setData({
      showContactDialog: !this.data.showContactDialog
    })
  },

  // 悬浮按钮移动样式
  menuMainMove: function(e) {
    let windowWidth = app.globalData.windowWidth
    let windowHeight = app.globalData.windowHeight
    let touches = e.touches[0]
    let clientX = touches.clientX
    let clientY = touches.clientY
    // 边界判断
    if (clientX > windowWidth - 80) {
      clientX = windowWidth - 80
    }
    if (clientX <= 20) {
      clientX = 20
    }
    if (clientY > windowHeight - 60) {
      clientY = windowHeight - 60
    }
    if (clientY <= 40) {
      clientY = 40
    }
    let pos = {
      left: clientX,
      top: clientY,
    }
    this.setData({
      pos,
    })
  },

})