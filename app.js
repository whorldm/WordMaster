var assistant = require("./utils/assistant");
var utils = require("./utils/util.js");
App({
  onLaunch: function() {
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
      updateManager.onCheckForUpdate(function(res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启？',
              success: res => {
                updateManager.applyUpdate();
              }
            })
          })
          updateManager.onUpdateFailed(function() {
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

    // 检查微信的登录是否过期
    wx.checkSession({
      success: () => {
        wx.getStorage({
          key: 'userId',
          success: res => {
            this.globalData.userId = res.data;
          }
        })
        wx.getStorage({
          key: 'userInfo',
          success: res => {
            this.globalData.userInfo = res.data;
          }
        })
      },
      fail: () => {
        // 当前用户已过期
      }
    })

    // 百度语音模块的初始化
    assistant.initBaiduVoiceModule();
  },
  globalData: {
    userId: '',
    userInfo: null,
    WSSAddress: "wss://wordmaster.tik.com/websocketRoom/",
    // WSSAddress: "ws://172.20.120.79:8088/websocketRoom/",
  },
})