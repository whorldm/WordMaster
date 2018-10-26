var assistant = require("../../utils/assistant.js");
var Utils = require("../../utils/util.js");
var request = require("../../utils/request.js");
var match = require("../../utils/match.js");
var music = require("../../utils/music.js");
var app = getApp();

const webSocket = require('../../utils/socket.js'); 

var lastClickTime = 0; //上次点击的时间戳
var currentClickTime = 0; //本次点击的时间戳
var startTimer = null;
var gameTimer = null; // 比赛倒计时的计时器

var innerAudioContextBg = null; // 播放背景音乐的实例

Page({
  data: {
    showModal: true, //是否显示倒计时
    countURL: '',
    count_to_start: 3,
    isShareDialog: false, //是否显示增加金币的弹框
    row: 4, //根据单词对总数以及策划规则算出的二维数组行数
    col: 3, //根据单词对总数以及策划规则算出的二维数组列数
    isGameOver: false, //表示比赛是否结束
    total_second: 90, //比赛时间
    gameClock: '01:30', //游戏倒计时一分钟
    isClickFlag: false, //表示用户是否点击选中单词
    firstClick: '', //第一次点击单词的坐标
    matchWord: '', //选中一个单词后，与之匹配单词的坐标
    successTimes: 0, //消除成功的总次数，以判断是否消除完全
    showWordCouple: [], //显示单词对
    firstStr: '', //存放第一次点击的字符串
    secondStr: '', //存放第一次点击的字符串
    totalWord: [], //存储考试的所有单词
    wordGrid: [], //模拟随机生成后的数据
    isError: false, //是否消除错误
    error_Type: 0, //正确情况的提示类型
    mySelf: { // 保存当前用户的个人信息
      avatarUrl: '../../../img/1.jpeg',
      rightNum: 0, //用户当前答对的单词数量
      errorNum: 0, //用户当前答错的单词数量
      totalNum: 0, //当前用户的词量
      combox: 0, //用户的连消次数
      roundTime: 1, //表示用户目前处于第几盘
      score: 0, //用户当前积分
      coin: 100, //用户的持有金币
      rank: 1,
    },
    totalRound: 1, //总共需要经历几轮
    levelId: 0, //当前等级的ID
    levelName: '初级', //当前等级的名称
    starNum: 0, //星星的数量（判断是否通过考试）
    backClass: 'back', // 每回合切换提示的标志量
    delCoinNum: 50, //减少的金币数量
    RankList: [], //排名信息数组
    changeTimes: 2, //置换的使用次数
    doubleTimes: 1, //双倍积分的使用次数
    isDouble: false, // 是否为双倍积分
    percent: 0, // 用户的正确率
    changeWordIndex: 1, // 表示用户是否置换的标志
  },

  // ### 生命周期函数 code start ### 
  onLoad: function (options) {
    // 实例化播放器
    innerAudioContextBg = wx.createInnerAudioContext();
    if (options.levelId && options.levelName) {
      wx.getStorage({
        key: 'userRoomList',
        success: (res) => {
          this.setData({
            ['mySelf.nickName']: app.globalData.userInfo.nickName ? app.globalData.userInfo.nickName : '匿名',
            ['mySelf.avatarUrl']: app.globalData.userInfo.avatarUrl ? app.globalData.userInfo.avatarUrl : '../../img/1.jpeg',
            levelId: Number(options.levelId),
            levelName: options.levelName,
            roomNum: options.roomNum,
            ['mySelf.coin']: Number(options.coin),
            RankList: res.data
          })
        },
      })
    }
    this.getTotalWord(); // 用户随机生成单词
    // 复写监听函数
    webSocket.onSocketMessageCallback = this.onSocketMessageCallback;
  },

  onShow: function () {
    // 初始化记录用户的操作时间变量
    lastClickTime = 0;
    currentClickTime = 0;
    if (!this.data.isGameOver) {
      this.playBgMusic();
      CountInThree(this);
    }

    // 初始化组件
    this.ComboxShow = this.selectComponent("#ComboxShow");
    this.SuccessShow = this.selectComponent("#SuccessShow");
  },

  // socket收到的信息回调
  onSocketMessageCallback: function(data) {
    console.log('fightstart页面的监听')
      // 有人离开了房间
      if (data.message) {
        wx.showModal({
          showCancel: false,
          content: '对手已离开房间',
          success: (res) => {
            if (res.confirm) {
              this.GameOver();
            }
          }
        })
        return;
      }
      // 更新用户信息
      if (Number(data.code) === 0) {
        if (data.score && data.userId) {
          this.updateRank(data);
        }
      }
  },

  // 向服务器发送数据
  sendMessage: function (score) {
    let params = {};
    params.userId = app.globalData.userId;
    params.roomNum = this.data.roomNum;
    params.score = score;
    webSocket.sendSocketMessage({
      msg: JSON.stringify(params),
      success: function() {
        console.log('发送成功')
      },
      fail: function(){
        console.log('发送失败')
      }},
    )
  },
  // ### 生命周期函数 code end ### 

  // 获取考试的全部单词量
  getTotalWord: function () {
    let params = {};
    params.level = this.data.levelId;
    request.getDataLoading('BATTLE_WORD', params, '获取数据...')
      .then(res => {
        if (res.wordList.length === 0) {
          wx.showModal({
            showCancel: false,
            content: '网络崩溃了，请返回重试～～',
            success: () => {
              wx.navigateBack()
            }
          })
          return;
        }

        let arrayToFill = new Array(this.data.row); //存放单词数据的二维数组
        for (let i = 0, l1 = arrayToFill.length; i <= l1 - 1; ++i) {
          arrayToFill[i] = new Array(this.data.col);
          for (let j = 0, l2 = arrayToFill[i].length; j <= l2 - 1; ++j) {
            arrayToFill[i][j] = {};
          }
        }
        let tempWord = res.wordList.slice(0, 6);
        assistant.randomFill(arrayToFill, this.data.row, this.data.col, tempWord);
        this.setData({
          wordGrid: arrayToFill,
          totalWord: res.wordList,
          totalRound: parseInt(res.wordList.length / 6)
        })
      })
      .catch(err => {
        wx.showModal({
          showCancel: false,
          content: '网络崩溃了，请返回重试！',
          success: () => {
            wx.navigateBack()
          }
        })
      })
  },

  // 将单词对随机生成二维数组
  wordRandom: function () {
    let arrayToFill = new Array(this.data.row); //存放单词数据的二维数组
    for (let i = 0, l1 = arrayToFill.length; i <= l1 - 1; ++i) {
      arrayToFill[i] = new Array(this.data.col);
      for (let j = 0, l2 = arrayToFill[i].length; j <= l2 - 1; ++j) {
        arrayToFill[i][j] = {};
      }
    }
    let tempWord = this.data.totalWord.slice((this.data.changeWordIndex - 1) * 6, this.data.changeWordIndex * 6)
    assistant.randomFill(arrayToFill, this.data.row, this.data.col, tempWord);
    this.setData({
      wordGrid: arrayToFill
    })
  },

  // 分享给好友
  onShareAppMessage: function () {
    let obj;
    if (this.data.isGameOver) {
      obj = Utils.shareMsg(true);
      return {
        title: obj.title,
        path: '/pages/homepage/homepage',
      }
    } else {
      this.setData({
        isShareDialog: false,
        ['mySelf.coin']: this.data.mySelf.coin + 500
      })
      this.changeCoinNum(500);
      return Utils.shareMsg(false);
    }
  },


  // 监听页面卸载
  onUnload: function () {
    innerAudioContextBg.stop();
    if (innerAudioContextBg) {
      innerAudioContextBg.destroy();
    }
    if (startTimer) {
      clearTimeout(startTimer);
    }
    if (gameTimer) {
      clearTimeout(gameTimer);
    }
    webSocket.closeSocket();
    if (!this.data.isGameOver) {
      this.destoryRoom();
      wx.showModal({
        showCancel: false,
        content: '您已经放弃了战斗'
      })
    }
    wx.removeStorageSync('endTime')
    wx.removeStorageSync('roomNum')
    wx.removeStorageSync('userRoomList')
  },

  // 销毁房间
  destoryRoom: function () {
    request.getData('DESTORY_ROOM', {
      type: 1,
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
  },

  // 继续下一关卡
  goNextGame: function (obj) {
    wx.navigateBack();
  },

  // ### 用户点击操作 code start ###
  // 判断用户的点击操作
  ClickGrid: function (e) {
    // 防止误操作
    currentClickTime = e.timeStamp;
    if (!this.data.isClickFlag) {
      if (currentClickTime > lastClickTime + 100) {
        lastClickTime = currentClickTime;
      } else {
        return;
      }
    } else {
      if (currentClickTime > lastClickTime + 10) {
        lastClickTime = currentClickTime;
      } else {
        return;
      }
    }
    // 直接通过传入二维数组的序号来获取单词的位置
    let X = e.target.dataset.posx;
    let Y = e.target.dataset.posy;
    let matchWord = e.target.dataset.key;
    let word = e.target.dataset.value;

    if (this.data.total_second <= 0) { // 当前比赛是否结束
      wx.showToast({
        icon: 'none',
        title: '比赛结束',
      })
      return;
    }
    // 点击了已消除的区域
    if (matchWord === undefined || matchWord === '' || matchWord === null) {
      return;
    }
    // 播放点击音效
    music.playClickMusic();
    this.onChooseWord(X, Y, matchWord, word);
  },
  // 选择单词
  onChooseWord: function (X, Y, matchWord, word) {
    // 第一次点击选中单词
    if (!this.data.isClickFlag) {
      // 设置选择的标志量
      let chooseFlag = "wordGrid[" + Y + "][" + X + "].isChoose";
      let noticeFlag = "wordGrid[" + Y + "][" + X + "].isNotice";
      this.setData({
        [noticeFlag]: false,
        [chooseFlag]: true,
        isClickFlag: true,
        firstClick: X + ',' + Y,
        matchWord: matchWord.column + ',' + matchWord.row,
        firstStr: word
      })
      return;
    }

    // 重复点击一个单词，即取消刚才选中的单词
    if (this.data.firstClick === X + ',' + Y) {
      let chooseFlag = "wordGrid[" + Y + "][" + X + "].isChoose";
      this.setData(initLocalData({
        [chooseFlag]: false,
        firstStr: ''
      }))
      return;
    }

    // 第二次选择单词，判断是否正确
    let lastPosition = this.data.firstClick.split(','); // 上次点击方块的位置
    if (this.data.matchWord === X + ',' + Y) {
      // 答对后将对应的单词块的数据清空以及重置状态位
      let first = 'wordGrid[' + lastPosition[1] + '][' + lastPosition[0] + ']';
      let second = 'wordGrid[' + Y + '][' + X + ']';
      //计算个人的得分以及当前棋盘所消除单词对总数
      let times = this.data.successTimes + 1;
      let _score = 0;
      if (this.data.isDouble) {
        _score = Number(this.data.mySelf.score) + 2 * 10 * (this.data.mySelf.combox * 0.1 + 1);
      } else {
        _score = Number(this.data.mySelf.score) + 10 * (this.data.mySelf.combox * 0.1 + 1);
      }

      this.sendMessage(_score)

      this.setData(initLocalData({
        secondStr: word,
        showWordCouple: Utils.dealWordCouple(this.data.firstStr, word),
        ['mySelf.score']: _score,
        ['mySelf.totalNum']: this.data.mySelf.totalNum + 1,
        ['mySelf.combox']: this.data.mySelf.combox + 1,
        ['mySelf.rightNum']: this.data.mySelf.rightNum + 1,
        [first]: {
          isClear: true,
          isError: false
        },
        [second]: {
          isClear: true,
          isError: false
        },
        successTimes: times
      }))
      // 播放字幕推动的动态效果
      this.SuccessShow.onRoll();
      // 播放字幕推动的动态效果
      this.ComboxShow.onRoll();

      //比赛时间未结束，更换一局
      if (times === 6 && this.data.total_second > 0) {
        // 用户已经将所有的单词全部通过
        if (this.data.changeWordIndex === this.data.totalRound) {
          wx.showModal({
            showCancel: false,
            content: '恭喜你，你已经全部通过',
            success: () => {
              this.GameOver();
            }
          })
          return;
        }

        this.setData(initLocalData({
          successTimes: 0,
          changeWordIndex: this.data.changeWordIndex + 1,
          ['mySelf.roundTime']: this.data.mySelf.roundTime + 1
        }));

        let flag = 0;
        let showTimer = setInterval(() => {
          flag += 500;
          if (flag === 500) {
            this.setData({
              backClass: 'backed'
            })
          }
          if (flag > 1500) {
            clearInterval(showTimer);
            this.setData({
              backClass: 'back',
            }, this.wordRandom())
          }
        }, 500)
      }

    } else {
      // 错误后，将对应方块的isError变为true，以便使用错误提示的CSS
      let first = 'wordGrid[' + lastPosition[1] + '][' + lastPosition[0] + '].isError';
      let second = 'wordGrid[' + Y + '][' + X + '].isError';
      //将第一次点击方块的isChoose变为false
      let chooseFlag = 'wordGrid[' + lastPosition[1] + '][' + lastPosition[0] + '].isChoose';
      // 将答错的单词保存导错题本
      let matchPosition = this.data.matchWord.split(',');
      // 播放错误的读音
      let errorType = match.RandomNumBoth(0, 1);
      // 提示相应的正确单词
      let other = "wordGrid[" + matchPosition[1] + "][" + matchPosition[0] + "].isNotice";

      // 播放字幕推动的动态效果
      this.ComboxShow.onInit();

      this.setData(initLocalData({
        [other]: true,
        secondStr: word,
        [first]: true,
        [second]: true,
        ['mySelf.combox']: 0,
        ['mySelf.errorNum']: this.data.mySelf.errorNum + 1,
        isError: true,
        error_Type: errorType
      }));

      // 500ms后播放错误读音
      setTimeout(() => {
        if (this.data.isError) {
          this.ErrorWord = this.selectComponent('#errorShow');
          this.ErrorWord.playErrorMusic(errorType);
        }
      }, 500);

      // 800ms后将答错的单词方块状态初始化
      setTimeout(() => {
        this.setData({
          [other]: false,
          firstStr: '',
          secondStr: '',
          [chooseFlag]: false,
          [first]: false,
          [second]: false,
          isError: false
        })
      }, 800);
    }
  },
  // 比赛结束
  GameOver: function () {
    // 销毁背景音乐的实例
    innerAudioContextBg.stop();
    if (innerAudioContextBg) {
      innerAudioContextBg.destroy();
    }
    // 清除倒计时
    if (startTimer) {
      clearTimeout(startTimer);
    }
    if (gameTimer) {
      clearTimeout(gameTimer);
    }
    // 关闭socket连接
    webSocket.closeSocket();
    // 并统计最终的结果
    let params = {
      type: 5, // 房间的类型
      coin: this.data.mySelf.coin,
      level: this.data.levelId,
      userId: app.globalData.userId,
      words: this.data.mySelf.totalNum,
      roomNum: this.data.roomNum,
      rank: this.data.mySelf.rank,
      integral: this.data.mySelf.score
    }

    request.getDataLoading('ROOM_END', params, '正在结算...')
      .then(res => {
        if (res.code === 0) {
          console.log(this.data.RankList)
          let rightPercent = ((this.data.mySelf.totalNum - this.data.mySelf.errorNum) / this.data.mySelf.totalNum).toFixed(2);
          if (this.data.mySelf.rank === 1) {
            music.playPassMusic();
          } else {
            music.playUnpassMusic();
          }
          this.setData({
            isGameOver: true,
            reward: res.reward || [],
            percent: rightPercent * 100
          })
        }
      }).catch(error => {
        wx.showModal({
          showCancel: false,
          content: '小咖不支持离线结算哦～～',
          success: () => {
            wx.navigateBack();
          }
        })
      })
  },
  // 更新排名信息
  updateRank: function (obj) {
    let tempArr = this.data.RankList;
    let myRank = this.data.mySelf.rank;
    for (let i = 0, len = tempArr.length; i < len; i++) {
      if (Number(tempArr[i].userId) === Number(obj.userId)) {
        tempArr[i].score = obj.score;
        break;
      }
    }
    if (Number(tempArr[0].score) >= Number(tempArr[1].score)) {
      myRank = 1;
    } else {
      myRank = 2;
    }
    this.setData({
      RankList: tempArr,
      ['mySelf.rank']: myRank
    })
  },
  // ### 用户点击操作 code end ###

  // ### 使用工具 code start ###
  toolNotice: function () {
    if (this.data.mySelf.coin < this.data.delCoinNum) {
      wx.showToast({
        icon: 'none',
        title: '金币数量不足'
      });
      this.addScore();
      return;
    }
    // 以选择一个单词，提示相应的
    let matchPosition = this.data.matchWord.split(',');
    if (this.data.isClickFlag) {
      let other = "wordGrid[" + matchPosition[1] + "][" + matchPosition[0] + "].isNotice";
      this.setData({
        [other]: true,
        ['mySelf.coin']: this.data.mySelf.coin - this.data.delCoinNum,
      })
      setTimeout(() => {
        this.setData({
          [other]: false
        })
      }, 1000)
      this.changeCoinNum(0 - this.data.delCoinNum);
      return;
    }
    // 未选中单词，提示一对
    for (let i = 0, l1 = this.data.wordGrid.length; i < l1; i++) {
      let temp = this.data.wordGrid[i]
      for (let j = 0, l2 = temp.length; j < l2; j++) {
        if (temp[j].wordData) {
          let tempA = "wordGrid[" + i + "][" + j + "].isNotice";
          let tempB = "wordGrid[" + temp[j].pairIndex.row + "][" + temp[j].pairIndex.column + "].isNotice";
          this.setData({
            [tempA]: true,
            [tempB]: true,
            ['mySelf.coin']: this.data.mySelf.coin - this.data.delCoinNum,
          })
          setTimeout(() => {
            this.setData({
              [tempA]: false,
              [tempB]: false,
            })
          }, 1000)
          this.changeCoinNum(0 - this.data.delCoinNum);
          return;
        }
      }
    }
  },
  toolChange: function () {
    if (this.data.mySelf.coin < this.data.delCoinNum * 4) {
      wx.showToast({
        icon: 'none',
        title: '金币数量不足'
      });
      this.addScore();
      return;
    }
    if (this.data.changeTimes > 0) {
      this.setData({
        successTimes: 0,
        ['mySelf.coin']: this.data.mySelf.coin - 200,
        changeTimes: this.data.changeTimes - 1,
        changeWordIndex: this.data.changeWordIndex + 1,
      })
      this.changeCoinNum(-200);
      this.wordRandom();
    } else {
      wx.showModal({
        showCancel: false,
        content: '每场竞技赛只能使用两次置换哦！',
      })
    }
  },
  toolDouble: function () {
    if (this.data.isDouble) {
      wx.showModal({
        showCancel: false,
        content: '双倍积分进行中...',
      })
      return;
    }
    if (this.data.doubleTimes < 1) {
      wx.showModal({
        showCancel: false,
        content: '每场竞技赛中只能使用一次双倍积分哦！',
      })
      return;
    }
    this.setData({
      doubleTimes: this.data.doubleTimes - 1,
      isDouble: true
    })
    setTimeout(() => {
      this.setData({
        isDouble: false
      })
    }, 15000)
  },
  // ### 使用工具 code end ###

  // ### 分享增加金币 code start ###
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
  // ### 分享增加金币 code end ###

  // ### 音乐播放 code start ###
  playBgMusic: function () {
    innerAudioContextBg.volume = 0.5;
    innerAudioContextBg.loop = true;
    innerAudioContextBg.src = music.getMusicSource(0, 'BG_EXAM_MUSIC');
    innerAudioContextBg.play();
  }
  // ### 音乐播放 code end ###

})


// 本地数据的常用初始化
function initLocalData(obj = {}) {
  let temp = {
    isClickFlag: false,
    firstClick: '',
    matchWord: '',
  }
  for (var key in temp) {
    obj[key] = temp[key]
  }
  return obj;
}

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
    wx.getStorage({
      key: 'endTime',
      success: (res) => {
        that.setData({
          total_second: Utils.completeTime(res.data) + 3
        }, CountThreeMinte(that))
      },
    })
    clearTimeout(startTimer);
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

function CountThreeMinte(that) {
  clearTimeout(gameTimer);
  let temp = that.data.total_second - 1;
  that.setData({
    total_second: temp,
    gameClock: Utils.dateFormat(temp)
  })
  if (temp <= 0) {
    that.setData({
      gameClock: "00:00"
    })
    clearTimeout(gameTimer);
    // 如果已经结算，不再重复结算
    if (!that.data.isGameOver) {
      that.GameOver();
    }
    return;
  }
  gameTimer = setTimeout(() => {
    CountThreeMinte(that)
  }, 1000)
}

function compare(obj1, obj2) {
  var val1 = Number(obj1.score);
  var val2 = Number(obj2.score);
  if (val1 < val2) {
    return 1;
  } else if (val1 > val2) {
    return -1;
  } else {
    return 0;
  }
} 