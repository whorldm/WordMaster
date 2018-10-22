const app = getApp();
var request = require("../../utils/request.js");
var utils = require("../../utils/util.js");

var SocketTask = null;

Page({
  data: {
    socketOpen: false,  //socket连接是否打开
    isShareDialog: false, //是否显示增加金币的弹框
    level: 0, //选择的难度等级
    levelList: ['XX', '初级', '中级', '高级'],
    coin: 500, //金币数量
    joinNum: 39187, //参与总人数
    totalNum: 5, //房间总人数
    currentNum: 1, //当前的房间人数
    roomNum: '', //房间信息
    msgList: [], //滚动消息的数组 
    totalUserList: [], //用户头像的数组
    userList: [], //时刻的用户头像数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.level && options.coin) {
      this.setData({
        joinNum: utils.RandomNum(20000, 40000),
        level: Number(options.level),
        coin: Number(options.coin),
        isNew: Number(options.isNew)
      })
    }
  },

  // 监听页面显示
  onShow: function() {
    if (this.data.isNew === 1) {
      wx.showModal({
        showCancel: false,
        content: '点击可用工具可查看详细的使用方法哦～～',
      })
    }
    this.setData({
      socketOpen: false
    })
    // 获取房间号，并且于后台建立socket连接
    this.getRoomInfo();
  },

  // 分配房间号
  getRoomInfo: function () {
    request.getDataLoading('ROOM_NUMER', {
      userId: app.globalData.userId,
      level: this.data.level
    }, '正在分配房间...').then((res) => {
      // 建立房间信息
      this.connectWebSocket(res.roomNum);
      if(this.data.userList.length > 0) {
        this.setData({
          roomNum: res.roomNum
        })
        return;
      }
      // 更新房间的状态
      let tempUserList = [];
      let tempMsgList = [];
      tempUserList.unshift({
        nickname: app.globalData.userInfo.nickName ? app.globalData.userInfo.nickName : '匿名',
        weiPic: app.globalData.userInfo.avatarUrl ? app.globalData.userInfo.avatarUrl : '../../img/1.jpeg'
      })
      tempMsgList.unshift(app.globalData.userInfo.nickName + ' 进入准备状态')
      // 更新用户的数据
      this.setData({
        msgList: tempMsgList,
        userList: tempUserList,
        roomNum: res.roomNum
      })
    }).catch((err) => {
      wx.showModal({
        showCancel: false,
        content: '网络崩溃了～～，请稍后重试！',
        success: () => {
          wx.navigateBack();
        }
      })
    })
  },

  // 与后台建立webSocket连接
  connectWebSocket: function(roomNum) {
    console.log('房间',roomNum);
    console.log('------', this.data.socketOpen)
    if (!this.data.socketOpen) {
      console.log('-----SocketTask', SocketTask)
      if(SocketTask === undefined || SocketTask == null || SocketTask.readyState !== 1) {
        this.webSocket(roomNum);
      }
    }
    SocketTask.onOpen(res => {
      this.setData({
        socketOpen: true
      })
      console.log('监听 WebSocket 连接打开事件。', res)
    })
    SocketTask.onClose(res => {
      console.log('////', this.data.socketOpen)
      if (res.code === 1000 && this.data.socketOpen) {
        console.log('////SocketTask', SocketTask)
        if(SocketTask && SocketTask.readyState !== 1) {
          console.log('监听 waiting 页面socket关闭，并尝试重连', res)
          SocketTask = null;
          this.webSocket(roomNum);
        }
      } else {
        SocketTask = null;
        this.setData({
          socketOpen: false
        })
        console.log('监听 waiting 页面socket关闭, 不重连', res)
      }
    })
    SocketTask.onError(error => {
      this.setData({
        socketOpen: false
      })
      console.log('监听 WebSocket 错误。错误信息', error)
    })

    SocketTask.onMessage(res => {
      console.log('监听WebSocket接受到服务器的消息事件。服务器返回的消息', JSON.parse(res.data))
      
      let data = JSON.parse(res.data);
      if (Number(data.code) === 0) {
        if(data.status) {
          wx.getStorageInfo({
            success: (res) => {
              if(res.keys.indexOf('endTime') > -1) {
                wx.getStorage({
                  key: 'endTime',
                  success: (time) => {
                    if (res.keys.indexOf('userRoomList') > -1 && wx.getStorageSync('userRoomList').length > 1 && utils.completeTime(time.data) > 0) {
                      console.log('短线重连，直接从缓存中读取数据')
                    } else {
                      console.log('新开的比赛，清除上次的数据并且缓存用户列表')
                      wx.removeStorage({
                        key: 'mySelf',
                        success: () => {
                          console.log('清除上次的数据成功****')
                        }
                      })
                      wx.setStorage({
                        key: 'userRoomList',
                        data: this.data.totalUserList,
                      })
                    }
                  }
                })  
              } else {
                wx.setStorage({
                  key: 'userRoomList',
                  data: this.data.totalUserList,
                })
              }
            },
          })
          wx.setStorage({
            key: 'endTime',
            data: data.endTime,
            success: () => {
              wx.redirectTo({
                url: '/pages/startgame/startgame?levelId=' + this.data.level + '&levelName=' + this.data.levelList[this.data.level] + '&roomNum=' + this.data.roomNum + '&coin=' + this.data.coin,
              })
            },
            fail: () => {
              wx.showModal({
                showCancel: false,
                content: '网速太慢，资源正在加载中 ...',
                success: () => {
                  wx.navigateBack();
                }
              })
            }
          })
        } else {
          if(data.userList) {
            this.updateRoomInfo(data.userList); // 更新房间信息
          }
        } 
      }
    })
  },
  // 创建Socket
  webSocket: function(roomNum) {
    console.log('开始连接')
    console.log(app.globalData.WSSAddress + app.globalData.userId + '_' + roomNum)
    SocketTask = wx.connectSocket({
      url: app.globalData.WSSAddress + app.globalData.userId+ '_' + roomNum,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        wx.setStorage({
          key: 'roomNum',
          data: roomNum,
        })
        console.log('WebSocket连接创建', res)
      },
      fail: (err) => {
        wx.showModal({
          showCancel: false,
          content: '网络异常，请检查网络状态是否良好？',
          success: () => {
            wx.navigateBack();
          }
        })
      },
    })
  },

  // 更新房间信息
  updateRoomInfo: function(data) {
    let tempUserList = [];
    let tempMsgList = [];
    for (let i = 0, len = data.length; i < len; i++) {
      data[i].nickname = decodeURIComponent(data[i].nickname);
      data[i].weiPic = decodeURIComponent(data[i].weiPic);
      data[i].score = 0;
      tempUserList.push({
        nickname: data[i].nickname ? data[i].nickname: '匿名',
        weiPic: data[i].weiPic ? data[i].weiPic : '../../img/1.jpeg',
      })
      tempMsgList.push(data[i].nickname + ' 进入准备状态')
    }
    this.setData({
      totalUserList: data,
      msgList: tempMsgList,
      userList: tempUserList,
      currentNum: data.length
    })
  },

  // 道具提示的弹框
  toolNotice: function() {
    wx.showModal({
      showCancel: false,
      content: '点击获取单词提示,扣除50金币',
    })
  },
  toolDouble: function() {
    wx.showModal({
      showCancel: false,
      content: '15s内得分双倍,每局限用一次',
    })
  },
  toolChange: function() {
    wx.showModal({
      showCancel: false,
      content: '点击置换当前的词板,扣除200金币,每局限用两次',
    })
  },

  // 分享增加金币
  addScore: function() {
    this.setData({
      isShareDialog: true
    })
  },
  // 关闭金币弹窗
  closeCoinDialog: function() {
    this.setData({
      isShareDialog: false
    })
  },

  // 用户点击右上角分享
  onShareAppMessage: function() {
    if (this.data.isShareDialog) {
      this.setData({
        isShareDialog: false,
        coin: Number(this.data.coin) + 500
      })
      this.changeCoinNum(500);
      // return utils.shareMsg(false);
      return {
        title: app.globalData.userInfo.nickName + '@你，单词大比拼，不服来战！让我们一决“词”雄',
        path: '/pages/homepage/homepage?shareUser='+app.globalData.userId+'&shareRoom='+this.data.roomNum+'&shareLevel='+this.data.level,
      }
    } else {
      // let obj = utils.shareMsg(true);
      return {
        title: app.globalData.userInfo.nickName + '@你，单词大比拼，不服来战！让我们一决“词”雄',
        path: '/pages/homepage/homepage?shareUser='+app.globalData.userId+'&shareRoom='+this.data.roomNum+'&shareLevel='+this.data.level,
      }
    }
  },

  // 监听页面隐藏
  onHide() {
    console.log('触发隐藏')
    console.log(SocketTask)
    if (SocketTask && SocketTask.readyState !== 3) {
      SocketTask.close({
        success: () => {
          this.setData({
            socketOpen: false
          })
          console.log('隐藏waiting页面，socket关闭成功')
        },
        fail: (err) => {
          this.setData({
            socketOpen: false
          })
          console.log('隐藏waiting页面，socket关闭失败', err)
        }
      })
    }
  },

  // 切换页面消除定时器
  onUnload() {
    console.log(SocketTask)
    if (SocketTask && SocketTask.readyState !== 3) {
      SocketTask.close({
        success: () => {
          this.setData({
            socketOpen: false
          })
          console.log('卸载waiting页面，socket关闭成功')
        },
        fail: (err) => {
          this.setData({
            socketOpen: false
          })
          console.log('卸载waiting页面，socket关闭失败', err)
        }
      })
    }
  },

  // 更新金币数量
  changeCoinNum: function(Num) {
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
  }
})