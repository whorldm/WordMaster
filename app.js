var assistant = require("./utils/assistant");

App({
  onLaunch: function () {
    // 获取设备的屏幕宽高
    wx.getSystemInfo({
      success: res => {
        this.globalData.windowWidth = res.windowWidth;
        this.globalData.windowHeight = res.windowHeight;
        this.globalData.screenWidth = res.screenWidth;
        this.globalData.screenHeight = res.screenHeight;
      }
    })

    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      let updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启？',
              success: res => {
                updateManager.applyUpdate();
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用小程序的更新功能，请升级到最新微信版本后重试。'
      })
    }

    wx.checkSession({
      success: () => {
        // 当前的session_key未过期
        wx.getStorage({
          key: 'user_id',
          success: res => {
            this.globalData.user_id = res.data;
          }
        })
      },
      fail: () => {
        // 当前用户已过期
      }
    })

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    // 百度语音模块的初始化
    assistant.initBaiduVoiceModule();
  },
  globalData: {
    userInfo: null,
    RemoteAddress: "https://www.luoyunyu.com",
  },
})