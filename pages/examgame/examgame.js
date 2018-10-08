var assistant = require("../../utils/assistant.js");
var Utils = require("../../utils/util.js");
var request = require("../../utils/request.js");
var match = require("../../utils/match.js");
var music = require("../../utils/music.js");
var app = getApp();

var lastClickTime = 0; //上次点击的时间戳
var currentClickTime = 0; //本次点击的时间戳
var startTimer = null;  // 开赛前的倒计时
var gameTimer = null;  // 比赛倒计时的计时器

var innerAudioContextBg = null;  // 播放背景音乐的实例

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showModal: true,  // 倒计时遮罩
    row: 4,  //根据单词对总数以及策划规则算出的二维数组行数
    col: 3,  //根据单词对总数以及策划规则算出的二维数组列数
    isShowResult: false, //是否显示结果页面
    isGameOver: false, //表示比赛是否结束
    count_to_start: 3, //开赛倒计时
    total_second: 60, //比赛时间
    gameClock: '01:00', //游戏倒计时一分钟
    isClickFlag: false,  //表示用户是否点击选中单词
    firstClick: '',  //第一次点击单词的坐标
    matchWord: '',  //选中一个单词后，与之匹配单词的坐标
    sucessTimes: 0,  //消除成功的总次数，以判断是否消除完全
    showWordCouple: [], //显示单词对
    firstStr: '',   //存放第一次点击的字符串
    secondStr: '',  //存放第一次点击的字符串
    totalWord: [],  //存储考试的所有单词
    wordGrid: [],   //模拟随机生成后的数据
    sucessWord: [], //当前用户单局答对的单词
    errorWord: [], //当前用户答错的单词
    isError: false,  //是否消除错误
    error_Type: 0,  //正确情况的提示类型
    mySelf: {  // 保存当前用户的个人信息
      avatarUrl: '../../../img/1.jpeg',
      rightNum: 0,  //用户当前答错的单词数量
      errorNum: 0,  //用户当前答对的单词数量
      totalNum: 0,  //当前用户的词量
      combox: 0,   //用户的连消次数
      roundTime: 1, //表示用户目前处于第几盘
      score: 0,  //用户当前积分
      coin: 100  //用户的持有金币
    },
    totalRound: 1, //总共需要经历几轮
    passStandard: 100, //通过考试的标准
    levelId: '', //当前等级的ID
    levelName: '小学毕业考试', //当前等级的名称
    countURL: '../../img/countdown/new_count_two.png', // 开赛倒计时切换数字URL
    nextLevel: {}, //比赛结束后的下一关
    starNum: 0,  //星星的数量（判断是否通过考试）
    backClass: 'back', // 每回合切换提示的标志量
    delCoinNum: 50, //减少的金币数量
    todayRankList: {
      wordNum: 0
    }, //结束页面的排名和单词信息
    isJump: 0,
    formId: 0, //模版消息
    APIList: [{
      wordAPI: 'WORD_LIST',
      overAPI: 'GAME_OVER'
    },
    {
      wordAPI: 'WORD_JUMPTO',
      overAPI: 'JUMP_SETTLEMENT'
    }
    ]
  },

// ### 生命周期函数 code start ### 
  onLoad: function (options) {
    // 检查网络状态
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
    // 实例化播放器
    innerAudioContextBg = wx.createInnerAudioContext();
    if (options.levelId && options.levelName) {
      this.setData({
        ['mySelf.nickName']: app.globalData.userInfo.nickName ? app.globalData.userInfo.nickName : '匿名',
        ['mySelf.avatarUrl']: app.globalData.userInfo.avatarUrl ? app.globalData.userInfo.avatarUrl : '../../img/1.jpeg',
        levelId: options.levelId,
        levelName: options.levelName,
        formId: options.formId || 0, // 模版消息
        isJump: options.isJump || 0  // 表示是否是跳级，调用不同的API
      })
    }

    this.getTotalWord();  // 用户随机生成单词
    this.getUserAsset();  // 获取用户的资产
  },
  onShow: function () {
    // 初始化记录用户的操作时间变量
    lastClickTime = 0;
    currentClickTime = 0;

    // 为了防止用户在分享好友后，重新触发改方法
    if (!this.data.isGameOver) {
      // CountInThree(this);  //开赛倒计时
      // music.playCountMusic();
      setTimeout(() => {
        this.playBgMusic();
        CountOneMinte(this);
        this.setData({
          showModal: false
        })
      }, 1200)
    }

    // 初始化百度读音的模块（防止用户切换后回来无法播放读音）
    assistant.initBaiduVoiceModule();
    
    // 初始化组件
    this.ComboxShow = this.selectComponent("#ComboxShow");
    this.SuccessShow = this.selectComponent("#SuccessShow");
  },
  onUnload: function () {
    innerAudioContextBg.stop();
    if (innerAudioContextBg) {
      innerAudioContextBg.destroy();
    }
    if (gameTimer) {
      clearTimeout(gameTimer);
    }
    if (startTimer) {
      clearTimeout(startTimer);
    }
    if ((this.data.mySelf.roundTime < this.data.totalRound) && this.data.total_second > 0) {
      wx.showModal({
        content: '您已经放弃了考试!',
        showCancel: false,
      })
    }
  },
// ### 生命周期函数 code end ### 

  // 获取用户的当前金币
  getUserAsset: function () {
    request.getData("USER_ASSET", { userId: app.globalData.userId })
      .then(res => {
        if(res.code === 0) {
          this.setData({
            ['mySelf.coin']: res.myAsset.coin,
            ['mySelf.totalNum']: res.myAsset.right
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '获取金币失败',
          })
        }
      })
      .catch(err => {
        wx.showToast({
          icon: 'none',
          title: '获取金币失败～～',
        })
      })
  },

  // 获取考试的全部单词量
  getTotalWord: function () {
    let params = {};
    params.userId = app.globalData.userId;
    params.levelId = this.data.levelId;
    params.formId = this.data.formId;
    params.isTest = 1;
    
    request.getDataLoading(this.data.APIList[this.data.isJump].wordAPI, params, '正在获取数据...')
    .then(res => {
      if(res.code === 0 && res.list.length === 0) {
        wx.showModal({
          content: '网络开了小差，请稍后重试',
          showCancel: false,
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
      let tempWord = res.list.slice(0, 6);
      assistant.randomFill(arrayToFill, this.data.row, this.data.col, tempWord);
      this.setData({
        wordGrid: arrayToFill,
        totalWord: res.list,
        totalRound: res.list.length / 6,
        passStandard: (res.list.length / 6) * 100
      })
    })
    .catch(err => {
      wx.showModal({
        content: '网络开了小差，请稍后重试～～',
        showCancel: false,
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
    // 如果获取单词的组数大于所有考试的内容
    if(this.data.mySelf.roundTime > this.data.totalRound) {
      wx.showModal({
        showCancel: false,
        content: '抱歉～～，请检查网络是否良好',
        success: () => {
          wx.navigateBack();
        }
      })
      return;
    }

    let tempWord = this.data.totalWord.slice((this.data.mySelf.roundTime-1) * 6, this.data.mySelf.roundTime * 6);
    assistant.randomFill(arrayToFill, this.data.row, this.data.col, tempWord);
    this.setData({
      wordGrid: arrayToFill
    })
  },

  // 分享给好友
  onShareAppMessage: function () {
    let obj;
    if (this.data.starNum >= 2) {
      obj = Utils.shareMsg(true);
      return {
        title: obj.title,
        path: '/pages/homepage/homepage',
      }
    } else {
      return Utils.shareMsg(false);
    }
  },

  // 继续下一关卡
  goNextGame: function (obj) {
    // 通关模式
    if (this.data.nextLevel.isTest === 1) {
      wx.redirectTo({
        url: '/pages/examgame/examgame?levelId=' + this.data.nextLevel.levelId + '&levelName=' + this.data.nextLevel.levelName + '&isJump=' + this.data.isJump,
      })
    } else {
      wx.redirectTo({
        url: '/pages/stairgame/stairgame?levelId=' + this.data.nextLevel.levelId + '&levelName=' + this.data.nextLevel.levelName + '&isJump=' + this.data.isJump,
      })
    }
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
      let times = this.data.sucessTimes + 1;
      let _score = Number(this.data.mySelf.score) + 5 * ((this.data.mySelf.combox + 1) > 5 ? 5 : (this.data.mySelf.combox + 1));
      //保存已答对的单词
      let obj = Utils.rebuildArr(this.data.firstStr, word, app.globalData.userId, this.data.errorWord);
      let tmpWord = 'sucessWord[' + this.data.sucessWord.length + ']';

      this.setData(initLocalData({
        secondStr: word,
        showWordCouple: Utils.dealWordCouple(this.data.firstStr, word),
        ['mySelf.score']: _score,
        ['mySelf.totalNum']: this.data.mySelf.totalNum + 1,
        ['mySelf.combox']: this.data.mySelf.combox + 1,
        ['mySelf.rightNum']: this.data.mySelf.rightNum + 1,
        [first]: { isClear: true, isError: false },
        [second]: { isClear: true, isError: false },
        [tmpWord]: obj,
        sucessTimes: times
      }))
      // 播放字幕推动的动态效果
      this.SuccessShow.onRoll();
      // 播放字幕推动的动态效果
      this.ComboxShow.onRoll();

      //比赛时间未结束，更换一局
      if (times === 6 && this.data.total_second > 0) {  
        //考试的单词全部消除成功，比赛结束
        if (this.data.mySelf.roundTime === this.data.totalRound && !this.data.isGameOver) {
          this.GameOver(_score);
        } else {
          this.setData(initLocalData({
            sucessTimes: 0,
            ['mySelf.combox']: 0,
            ['mySelf.roundTime']: this.data.mySelf.roundTime + 1
          })); 

          let flag = 0;
          let showTimer = setInterval(() => {
            flag += 500;
            if(flag === 500) {
              this.setData({
                backClass: 'backed'
              })
            }
            if(flag > 1500) {
              clearInterval(showTimer);
              this.setData({
                backClass: 'back',
              }, this.wordRandom())
            }
          },500)         
        }
      }
    
    } else {
      // 错误后，将对应方块的isError变为true，以便使用错误提示的CSS
      let first = 'wordGrid[' + lastPosition[1] + '][' + lastPosition[0] + '].isError';
      let second = 'wordGrid[' + Y + '][' + X + '].isError';
      //将第一次点击方块的isChoose变为false
      let chooseFlag = 'wordGrid[' + lastPosition[1] + '][' + lastPosition[0] + '].isChoose';
      // 将答错的单词保存导错题本
      let matchPosition = this.data.matchWord.split(',');
      let obj = Utils.rebuildArr(this.data.firstStr, this.data.wordGrid[matchPosition[1]][matchPosition[0]].wordData.value, app.globalData.userId, this.data.errorWord);
      let tmpWord = 'errorWord[' + this.data.errorWord.length + ']';
      // 播放错误的读音
      let errorType = Utils.RandomNum(0, 1);
      // 提示相应的正确单词
      let other = "wordGrid[" + matchPosition[1] + "][" + matchPosition[0] + "].isNotice";

      // 播放字幕推动的动态效果
      this.ComboxShow.onInit();

      this.setData(initLocalData({
        [other]: true,
        secondStr: word,
        [tmpWord]: obj,
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
  GameOver: function (_score) {
    // 销毁背景音乐的实例
    innerAudioContextBg.stop();
    if (innerAudioContextBg) {
      innerAudioContextBg.destroy();
    }
    // 清除倒计时
    if (gameTimer) {
      clearTimeout(gameTimer);
    }
    if (startTimer) {
      clearTimeout(startTimer);
    }
    // 并统计最终的结果
    let starNum = judeTheStar(_score,this.data.passStandard);
    let params = {
      coin: this.data.mySelf.coin,
      star: starNum,
      level: this.data.levelId,
      userId: app.globalData.userId,
      wrongNum: this.data.errorWord.length,
      rightNum: this.data.sucessWord.length,
      wrongbookEntityList: this.data.errorWord,
      rightbookEntityList: this.data.sucessWord,
    }
    
    request.getData(this.data.APIList[this.data.isJump].overAPI, params, '正在结算...')
    .then(res => {
      if (res.code === 0) {
        if (starNum >= 2) {
          music.playPassMusic();
        } else {
          music.playUnpassMusic();
        }
        if (this.data.backClass === 'backed') {
          this.setData({
            backClass: 'back',
            nextLevel: res.nextLevel,
            starNum: starNum,
            isGameOver: true,
            todayRankList: {
              wordNum: res.rankList[0].todayWords,
              myRank: res.rankList[0].myRank,
              loserLogo: decodeURIComponent(res.rankList[1].weiPic),
              loserName: decodeURIComponent(res.rankList[1].nickname)
            }
          });
        } else {
          this.setData({
            nextLevel: res.nextLevel,
            starNum: starNum,
            isGameOver: true,
            todayRankList: {
              wordNum: res.rankList[0].todayWords,
              myRank: res.rankList[0].myRank,
              loserLogo: decodeURIComponent(res.rankList[1].weiPic),
              loserName: decodeURIComponent(res.rankList[1].nickname)
            }
          });
        }
      } else {
        wx.showModal({
          showCancel: false,
          content: '小咖不支持离线结算哦～～',
          success: res => {
            wx.navigateBack();
          }
        })
      }
    }).catch(error => {
      console.log(error);
      this.dealErrorState(starNum)
      // wx.showModal({
      //   showCancel: false,
      //   content: '小咖不支持离线结算哦！',
      //   success: res => {
      //     wx.navigateBack();
      //   }
      // })
    })
  },
  // 处理结算出错情况的显示
  dealErrorState: function (starNum) {
    if (starNum >= 2) {
      music.playPassMusic();
      this.setData({
        isGameOver: true,
        starNum: starNum,
        nextLevel: {
          levelId: this.data.levelId + 1,
          levelName: this.data.levelName
        },
        todayRankList: {
          wordNum: this.data.todayRankList.wordNum + this.data.mySelf.rightNum,
          loserLogo: match.randomPerson().avatarUrl,
          loserName: match.randomPerson().nickName
        }
      });
    } else {
      music.playUnpassMusic();
      this.setData({
        isGameOver: true,
        starNum: starNum,
        nextLevel: {
          levelId: this.data.levelId,
          levelName: this.data.levelName
        },
        todayRankList: {
          wordNum: this.data.todayRankList.wordNum + this.data.mySelf.rightNum,
          loserLogo: match.randomPerson().avatarUrl,
          loserName: match.randomPerson().nickName
        }
      });
    }
  },

// ### 用户点击操作 code end ###

// ### 获取提示 code start ###
  // 获取提示信息
  getHelp: Utils.throttle(function () {
    if (this.data.mySelf.coin < this.data.delCoinNum) {
      wx.showToast({
        icon: 'none',
        title: '金币数量不足'
      });
      return;
    }
    
    // 以选择一个单词，提示相应的
    let matchPosition = this.data.matchWord.split(',');
    if (this.data.isClickFlag) {
      let other = "wordGrid[" + matchPosition[1] + "][" + matchPosition[0] + "].isNotice";
      this.setData({
        isDelCoin: true,
        [other]: true,
        ['mySelf.coin']: this.data.mySelf.coin - this.data.delCoinNum,
      })
      setTimeout(() => {
        this.setData({
          isDelCoin: false,
          [other]: false
        })
      }, 1200)
      // this.delCoinNum();
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
            isDelCoin: true,
            [tempA]: true,
            [tempB]: true,
            ['mySelf.coin']: this.data.mySelf.coin - this.data.delCoinNum,
          })
          setTimeout(()=>{
            this.setData({
              isDelCoin: false,
              [tempA]: false,
              [tempB]: false,
            })
          }, 1200)
          // this.delCoinNum();
          return;
        }
      }
    }
  }, 1000),

  // 向后请求减少金币
  delCoinNum: function () {
    let params = {};
    params.userId = app.globalData.userId;
    params.levelId = this.data.levelId;
    request.getData("PROMPT", params)
      .then(res => {
        console.log('提示成功')
      })
      .catch(err => {
        console.error('后台错误')
      })
  },
// ### 获取提示 code end ###

// ### 音乐播放 code start ###
  // 播放背景音乐
  playBgMusic: function () {
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
function judeTheStar(score, standard) {
  if (score === standard) {
    return 3;
  }
  if (score >= standard * 0.8) {
    return 2;
  }
  return 0;
}

// 比赛倒计时（一分钟）
function CountOneMinte(that) {
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
    that.GameOver(that.data.mySelf.score);
    return;
  }
  gameTimer = setTimeout(function () {
    CountOneMinte(that);
  }, 1000)
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
    CountOneMinte(that);
    that.playBgMusic();  // 开始播放音乐
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