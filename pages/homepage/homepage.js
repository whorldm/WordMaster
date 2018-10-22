// pages/homepage/homepage.js
var request = require("../../utils/request.js");
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    canClick: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('*****hompage*****',options)
    // 获取分享的用户ID和竞技场的房间号
    if(options.shareUser && options.shareRoom) {
      app.globalData.shareUser = options.shareUser;
      app.globalData.shareRoom = options.shareRoom;
      app.globalData.shareLevel = options.shareLevel;
    }
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType === 'none') {
          wx.showModal({
            showCancel: false,
            content: '请检查是否连接网络'
          })
        } else {
          this.loadStorage();
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      canClick: true
    })
  },

  // 加载历史缓存
  loadStorage: function () {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              app.globalData.userInfo = res.userInfo
              wx.getStorage({
                key: 'userId',
                success: res => {
                  app.globalData.userId = res.data;
                  wx.redirectTo({
                    url: '/pages/gamelevel/gamelevel?userId=' + res.data,
                  })
                }
              })
            }
          })
        }
      }
    })
  },

  // 用户第一次点击的时候获取权限
  getUserInfo: function(e) {
    if (!this.data.canClick) {
      wx.showToast({
        icon: 'none',
        title: '请勿重复点击',
      })
      return;
    }

    // 禁止用户进行多次点击
    this.setData({
      canClick: false
    })

    let userData = {};
    if (e.detail.userInfo) { // 用户点击了授权,并将用户的信息缓存
      wx.setStorage({
        key: "userInfo",
        data: e.detail.userInfo
      })
      app.globalData.userInfo = e.detail.userInfo;
      userData = {
        nickname: encodeURIComponent(e.detail.userInfo.nickName),
        weiPic: encodeURIComponent(e.detail.userInfo.avatarUrl),
      };
      this.userLogin(userData);
    } else { // 用户拒绝了授权
      let tempObj = {
        nickName: '匿名',
        avatarUrl: '../../img/1.jpeg',
      }
      wx.setStorage({
        key: "userInfo",
        data: tempObj
      })
      app.globalData.userInfo = tempObj;
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
  userLogin: function(userData) {
    wx.login({
      success: res => {
        if (res.code) {
          let params = userData;
          params.code = res.code;
          request.getDataLoading("AUTHORIZATION", params, '正在登录...')
          .then(res => {
            app.globalData.userId = res.userId;
            wx.setStorage({
              key: 'userId',
              data: res.userId
            })
            wx.redirectTo({
              url: '/pages/gamelevel/gamelevel?userId=' + res.userId,
            })
          }).catch(error => {
            wx.showToast({
              title: '用户授权失败',
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
  }
})