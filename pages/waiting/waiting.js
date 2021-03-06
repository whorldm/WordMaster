const app = getApp();
var request = require("../../utils/request.js");
var utils = require("../../utils/util.js");

// socket连接
const webSocket = require('../../utils/socket.js');

Page({
  data: {
    isTheOwner: true, // 是否为房主
    isGoBack: true, // 是否返回放弃
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
  onLoad: function (options) {
    if (options.level && options.coin) {
      this.setData({
        joinNum: utils.RandomNum(20000, 40000),
        level: Number(options.level),
        coin: Number(options.coin),
        isNew: Number(options.isNew)
      })
    }
    // 创建连接
    if (options.roomNum) {
      webSocket.connectSocket({ userId: app.globalData.userId,roomNum: options.roomNum});
      this.setData({
        roomNum: options.roomNum
      })
      wx.setStorage({
        key: 'roomNum',
        data: options.roomNum,
      })
    } else {
      this.getRoomInfo();
    }
    // 设置接收消息回调
    webSocket.onSocketMessageCallback = this.onSocketMessageCallback;
  },

  // socket收到的信息回调
  onSocketMessageCallback: function (data) {
    console.log('waiting 页面的监听', data)
    if (data.message) {
      // 有人离开房间不做提示
      return;
    }
    if (Number(data.code) === 0) {
      if (Number(data.status) === 1) {
        this.setData({
          isGoBack: false
        }, this.startGame(data))
      } else {
        if (data.userList) {
          this.setData({
            isTheOwner: data.userId === app.globalData.userId
          })
          this.updateRoomInfo(data.userList); // 更新房间信息
        }
      }
    }
  },

  // 监听页面显示
  onShow: function () {
    if (this.data.isNew === 1) {
      wx.showModal({
        showCancel: false,
        content: '点击可用工具可查看详细的使用方法哦～～',
      })
    }
  },

  // 分配房间号
  getRoomInfo: function () {
    request.getDataLoading('ROOM_NUMER', {
      userId: app.globalData.userId,
      level: this.data.level
    }, '正在分配房间...').then((res) => {
      // 建立房间信息
      webSocket.connectSocket({
        userId: app.globalData.userId,
        roomNum: res.roomNum,
        success: function () {
          console.log('连接成功！')
        },
        fail: function () {
          console.log('连接失败！')
        },
      });
      wx.setStorage({
        key: 'roomNum',
        data: res.roomNum,
      })

      if (this.data.userList.length > 1) {
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

  // 更新房间信息
  updateRoomInfo: function (data) {
    let tempUserList = [];
    let tempMsgList = [];
    for (let i = 0, len = data.length; i < len; i++) {
      data[i].nickname = decodeURIComponent(data[i].nickname);
      data[i].weiPic = decodeURIComponent(data[i].weiPic);
      data[i].score = 0;
      tempUserList.push({
        nickname: data[i].nickname ? data[i].nickname : '匿名',
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

  // 开始比赛
  startGame: function (data) {
    wx.setStorage({
      key: 'userRoomList',
      data: this.data.totalUserList,
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
  },

  // 开始匹配(后台匹配机器人)
  beginMatch: function () {
    request.getData('MATCH_BEGIN', {
        roomNum: this.data.roomNum
      })
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
      })
  },

  // 道具提示的弹框
  toolNotice: function () {
    wx.showModal({
      showCancel: false,
      content: '点击获取单词提示,扣除50金币',
    })
  },
  toolDouble: function () {
    wx.showModal({
      showCancel: false,
      content: '15s内得分双倍,每局限用一次',
    })
  },
  toolChange: function () {
    wx.showModal({
      showCancel: false,
      content: '点击置换当前的词板,扣除200金币,每局限用两次',
    })
  },

  // 分享增加金币
  addScore: function () {
    this.setData({
      isShareDialog: true
    })
  },
  // 关闭金币弹窗
  closeCoinDialog: function () {
    this.setData({
      isShareDialog: false
    })
  },

  // 用户点击右上角分享
  onShareAppMessage: function () {
    if (this.data.isShareDialog) {
      this.setData({
        isShareDialog: false,
        coin: Number(this.data.coin) + 500
      })
      this.changeCoinNum(500);
      return {
        title: app.globalData.userInfo.nickName + '@你，单词大比拼，不服来战！让我们一决“词”雄',
        path: '/pages/homepage/homepage?shareUser=' + app.globalData.userId + '&shareRoom=' + this.data.roomNum + '&shareLevel=' + this.data.level + '&shareType=5',
      }
    } else {
      return {
        title: app.globalData.userInfo.nickName + '@你，单词大比拼，不服来战！让我们一决“词”雄',
        path: '/pages/homepage/homepage?shareUser=' + app.globalData.userId + '&shareRoom=' + this.data.roomNum + '&shareLevel=' + this.data.level + '&shareType=5',
      }
    }
  },

  // 切换页面消除定时器
  onUnload() {
    console.log('waiting页面执行onUnload函数')
    if (this.data.isGoBack) {
      webSocket.closeSocket();
      this.destoryRoom();
      wx.removeStorageSync('roomNum');
    }
  },

  // 销毁房间
  destoryRoom: function () {
    request.getData('DESTORY_ROOM', {
        type: 5,
        userId: app.globalData.userId,
        roomNum: this.data.roomNum
      })
      .then((res) => {
        console.log('销毁房间成功')
        console.log(res)
      })
      .catch((err) => {
        console.log('销毁房间失败')
        console.log(err)
      })
  },

  // 更新金币数量
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
  }
})