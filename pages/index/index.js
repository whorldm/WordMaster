const app = getApp()
var request = require("../../utils/request.js");
var utils = require("../../utils/util.js");

Page({
  data: {
    canClick: true, //是否可以点击
    userId: '',    
    userInfo: {},
    levelName: '', //用户的等级的名称
    levelId: '', //用户的等级的ID
    levelList: [] //用户的等级信息
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userId: app.globalData.userId,
        userInfo: app.globalData.userInfo,
      })
    }
    // utils.loadFont();
  },

  onShow: function(){
  
  },

  // 用户第一次点击的时候获取权限
  getUserInfo: function(e) {
    if(!this.data.canClick) {
      return;
    }
    // 禁止用户进行多次点击
    this.setData({
      canClick: false
    })
    if (this.data.userId || wx.getStorageSync('userId')) {
      this.getUserLevel();
      return ;
    }

    let userData = {};
    if (e.detail.userInfo) { // 用户点击了授权,并将用户的信息缓存
      wx.setStorage({
        key: "userInfo",
        data: e.detail.userInfo
      })
      app.globalData.userInfo = e.detail.userInfo;
      this.setData({
        userInfo: e.detail.userInfo,
      })
      userData = {
        nickname: encodeURIComponent(e.detail.userInfo.nickName),
        weiPic: encodeURIComponent(e.detail.userInfo.avatarUrl),
      };
      this.userLogin(userData);
    } else {  // 用户拒绝了授权
      this.setData({
        userInfo: {
          nickName: '匿名',
          avatarUrl: '../../img/1.jpeg',
        },
      })
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，可能没办法更好的体验单词大咖!',
        showCancel: false,
        success: res => {
          userData = {
            nickname: encodeURIComponent('匿名'),
            weiPic: encodeURIComponent('../../img/1.jpeg'),
          };
          this.userLogin(userData);
        }
      })
    }
  },

  // 新用户首次登陆授权
  userLogin: function (userData) {
    wx.login({
      success: res => {
        if (res.code) {
          let params = userData;
          params.code = res.code;
          request.getDataLoading("AUTHORIZATION",params,'正在授权...').then(res => {
            app.globalData.userId = res.userId;
            this.setData({
              userId: res.userId
            })
            wx.setStorage({
              key: 'userId',
              data: res.userId
            })

            this.getUserLevel();
    
          }).catch(error => {
            wx.showToast({
              title: '获取userId失败',
              icon: 'none'
            });
          })
        } else {
          wx.showToast({
            title: '微信登录失败',
            icon: 'none'
          });
        }
      }
    })
  },

  // 获取用户的等级
  getUserLevel: function () {
    this.setData({
      canClick: true
    })
    request.getData("LEVEL_LIST", { userId: app.globalData.userId })
      .then(res => {
        let temp = res.list[res.list.length - 1];
        if (temp.isTest === 1) {
          wx.navigateTo({
            url: "/pages/examgame/examgame?levelId=" + temp.id + '&levelName=' + temp.levelName,
          })
        } else {
          wx.navigateTo({
            url: "/pages/stairgame/stairgame?levelId=" + temp.id + '&levelName=' + temp.levelName,
          })
        }
      })
      .catch(err => {
        console.error("获取用户的等级信息失败！")
      })
  },

  // 查看排名
  navToRank: function() {
    wx.navigateTo({
      url: '/pages/ranking/ranking',
    })
  },

  // 未开启状态
  wait: function() {
    wx.showModal({
      showCancel: false,
      content: '尚未开启，敬请期待'
    })
  }
})
