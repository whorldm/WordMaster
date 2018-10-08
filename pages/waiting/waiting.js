// pages/sportsgame/waiting/waiting.js
const app = getApp();
var request = require("../../utils/request.js");
var utils = require("../../utils/util.js");
var startTimer = null;
var waitTimer = null;

Page({
  data: {
    showModal: false, //是否显示倒计时
    isShareDialog: false, //是否显示增加金币的弹框
    countURL: '',
    count_to_start: 3,
    level: 0, //选择的难度等级
    levelList: ['XX','初级', '中级', '高级'],
    coin: 500, //金币数量
    joinNum: 39187, //参与总人数
    totalNum: 30,  //房间总人数
    currentNum: 1, //当前的房间人数
    roomNum: '', //房间信息
    msgList: [], //滚动消息的数组 
    totalUserList: [], //用户头像的数组
    userList: [],  //时刻的用户头像数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.level && options.coin) {
      this.setData({
        currentNum: utils.RandomNum(5,20),
        joinNum: utils.RandomNum(20000, 40000),
        level: Number(options.level),
        coin: Number(options.coin),
        isNew: Number(options.isNew)
      })
    }
    this.getRoomInfo();
  },

  // 获取房间的信息
  getRoomInfo: function () {
    request.getDataLoading('BATTLE_JOIN', {
      userId: app.globalData.userId
    }, '正在获取房间信息...').then((res) => {
      // 从服务器获取用户的头像和昵称信息
      let tempUserList = [];
      let tempMsgList = [];
      for (let i = 0, len = res.userList.length; i < len - 1; i++) {
        tempMsgList.push(decodeURIComponent(res.userList[i].nickname)+' 进入准备状态')
        let obj = {};
        obj.nickname = decodeURIComponent(res.userList[i].nickname);
        obj.weiPic = decodeURIComponent(res.userList[i].weiPic);
        tempUserList.push(obj)
      }
      // 将当前用户的头像加入横向滑动的数组
      let showUserList = tempUserList.slice(0, this.data.currentNum);
      showUserList.unshift({
        nickname: app.globalData.userInfo.nickName ? app.globalData.userInfo.nickName : '匿名',
        weiPic: app.globalData.userInfo.avatarUrl ? app.globalData.userInfo.avatarUrl : '../../img/1.jpeg'
      })
      // 将当前用户的消息加入公告栏的数组
      let showMsgList = tempMsgList.slice(0, this.data.currentNum);
      showMsgList.unshift(app.globalData.userInfo.nickName+' 进入准备状态')
      // 更新用户的数据
      this.setData({
        msgList: showMsgList,
        userList: showUserList,
        totalMsgList: tempMsgList,
        totalUserList: tempUserList,
        roomNum: res.userList[res.userList.length - 1].roomNum,
        totalNum: res.userList.length
      }, this.addLastPerson())
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

  // 监听页面显示
  onShow: function () {
    if (this.data.isNew === 1) {
      wx.showModal({
        showCancel: false,
        content: '点击可用工具可查看详细的使用方法哦～～',
      })
    }
  },

  // 随机动态的添加房间人数
  addLastPerson: function () {
    let temp, tempUserList, tempMsgList;
    waitTimer = setInterval(() => {
        temp = this.data.currentNum + utils.RandomNum(1, 3);
      if (temp >= 30) {
        this.setData({
          currentNum: 30,
          showModal: true
        }, CountInThree(this))
        clearInterval(waitTimer);
      } else {
        tempUserList = this.data.userList;
        tempMsgList = this.data.msgList;
        for (let i = this.data.currentNum; i < temp; i++) {
          tempUserList.unshift(this.data.totalUserList[i]);
          tempMsgList.unshift(this.data.totalMsgList[i]);
        }
        this.setData({
          msgList: tempMsgList,
          userList: tempUserList,
          currentNum: temp
        });
      } 
    }, 2000)
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
      return utils.shareMsg(false);
    } else {
      let obj = utils.shareMsg(true);
      return {
        title: obj.title,
        path: '/pages/homepage/homepage',
      }
    }
  },

  // 切换页面消除定时器
  onUnload: function () {
    if (startTimer) {
      clearTimeout(startTimer);
    }
    if (waitTimer) {
      clearInterval(waitTimer);
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

var urlList = [
  '../../img/countdown/number1.png',
  '../../img/countdown/number2.png',
  '../../img/countdown/number3.png'
];

function CountInThree(that) {
  clearTimeout(startTimer);
  let temp = that.data.count_to_start - 1;
  if (temp < 0) {
    that.setData({
      showModal: false
    })
    wx.redirectTo({
      url: '/pages/startgame/startgame?levelId=' + that.data.level + '&levelName=' + that.data.levelList[that.data.level] + '&roomNum=' + that.data.roomNum + '&coin='+ that.data.coin,
    })
    return;
  }
  that.setData({
    count_to_start: temp,
    countURL: urlList[temp]
  })

  startTimer = setTimeout(function () {
    CountInThree(that);
  }, 1000)
}
