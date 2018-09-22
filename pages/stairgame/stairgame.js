var assistant = require("../../utils/assistant.js");
var Utils = require("../../utils/util.js");
var request = require("../../utils/request.js");
var match = require("../../utils/match.js");
var music = require("../../utils/music.js");
var app = getApp();

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
    isGameOver: false, //表示比赛是否结束
    isClickFlag: false,  //表示用户是否点击选中单词
    firstClick: '',  //第一次点击单词的坐标
    matchWord: '',  //选中一个单词后，与之匹配单词的坐标
    sucessTimes: 0,  //消除成功的总次数，以判断是否消除完全
    showWordCouple: [], //显示单词对
    firstStr: '',   //存放第一次点击的字符串
    secondStr: '',  //存放第一次点击的字符串
    wordGrid: [],   //模拟随机生成后的数据
    sucessWord: [], //当前用户答对的单词
    errorWord: [], //当前用户答错的单词
    isRight: false,  //是否消除正确
    isError: false,  //是否消除错误
    right_Type: 0,  //错误情况的提示类型
    error_Type: 0,  //正确情况的提示类型
    mySelf: {  // 保存当前用户的个人信息
      nickName: '侧耳倾听',
      avatarUrl: '../../img/1.jpeg',
      rightNum: 0,
      errorNum: 0,
      totalNum: 100,
      combox: 0,
      roundTime: 0, //表示用户目前处于第几盘
      score: 0,  //用户当前积分
      coin: 0  //用户的持有金币
    },
    starNum: 2,  //星星的数量
    levelId: '',  //用户的当前等级Id
    levelName: '', //用户的当前等级名称
    countURL: '', //开赛倒计时切换数字URL
    nextLevel: {}, //比赛结束后的下一关
    count_to_start: 3,
    total_second: 120, //比赛时间
    gameClock: '02:00', //游戏倒计时一分钟
  },

// ### 生命周期函数 code start ### 
  onLoad: function (options) {
    console.log('普通关')
    // 实例化播放器
    innerAudioContextBg = wx.createInnerAudioContext();
    if(options.levelId && options.levelName) {
      this.setData({
        ['mySelf.nickName']: app.globalData.userInfo.nickName,
        ['mySelf.avatarUrl']: app.globalData.userInfo.avatarUrl,
        levelId: options.levelId,
        levelName: options.levelName
      })
    }
    // Utils.loadFont();
    this.wordRandom();  // 用户随机生成单词
    this.getUserAsset();  // 获取用户的资产
    music.playCountMusic();
    CountInThree(this);  //开赛倒计时
  },

  onShow: function () {
    
  },

  onUnload: function () {
    innerAudioContextBg.destroy();
    if (gameTimer) {
      clearTimeout(gameTimer);
    }
    if (startTimer) {
      clearTimeout(startTimer);
    }
    if (this.data.sucessTimes < (this.data.col * this.data.row / 2)) {
      wx.showModal({
        content: '您已经放弃了战斗!',
        showCancel: false,
      })
    }
    if (getCurrentPages().length === 1) {
      wx.navigateTo({
        url: '/pages/index/index',
      })
    }
  },
// ### 生命周期函数 code end ### 

  // 获取用户的当前金币
  getUserAsset: function () {
    request.getData("USER_ASSET", { userId: app.globalData.userId })
      .then(res => {
        this.setData({
          ['mySelf.coin']: res.myAsset.coin,
          ['mySelf.totalNum']: res.myAsset.right
        })
      })
      .catch(err => {
        console.error("获取用户的持有金币失败！")
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
    let params = {};
    params.userId = app.globalData.userId;
    params.levelId = this.data.levelId;
    params.isTest = 0;
    request.getData("WORD_LIST",params)
    .then(res => {
      if(res.list.length > 0) {
        assistant.randomFill(arrayToFill, this.data.row, this.data.col, res.list);
        this.setData({
          wordGrid: arrayToFill
        })
      } else {
        wx.showModal({
          title: '警告',
          content: '获取单词失败！',
          showCancel: false,
          success: ()=>{
            wx.navigateBack()
          }
        })
      }
    })
    .catch(err => {
      console.error("获取单词失败！")
    })
  },

  // 分享给好友
  onShareAppMessage: function () {
    return {
      title: '单词大咖',
      path: '/pages/index/index'
    }
  },

  // 继续下一关卡
  goNextGame: function (obj) {
    if (this.data.nextLevel.isTest === 1) {
      wx.redirectTo({
        url: '/pages/examgame/examgame?levelId=' + this.data.nextLevel.id + '&levelName=' + this.data.nextLevel.levelName,
      })
    } else {
      wx.redirectTo({
        url: '/pages/stairgame/stairgame?levelId=' + this.data.nextLevel.id + '&levelName=' + this.data.nextLevel.levelName,
      })
    }
  },

// ### 用户点击操作 code start ###
  // 判断用户的点击操作
  ClickGrid: function (e) {
    // 直接通过传入二维数组的序号来获取单词的位置
    let X = e.target.dataset.posx;
    let Y = e.target.dataset.posy;
    let matchWord = e.target.dataset.key;
    let word = e.target.dataset.value;

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
      // 播放读音
      // assistant.playVoiceByInputText(word);
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
      //播放音乐与单词读音
      music.playSuccessMusic();
      assistant.playVoiceByInputText(Utils.dealWordCouple(this.data.firstStr, word).join('。'));
      // 答对后将对应的单词块的数据清空以及重置状态位
      let first = 'wordGrid[' + lastPosition[1] + '][' + lastPosition[0] + ']';
      let second = 'wordGrid[' + Y + '][' + X + ']';
      //计算个人的得分以及当前棋盘所消除单词对总数
      let times = this.data.sucessTimes + 1;
      let _score = Number(this.data.mySelf.score) + 5 * ((this.data.mySelf.combox + 1) > 5 ? 5 : (this.data.mySelf.combox + 1));
      //保存已答对的单词
      let obj = Utils.rebuildArr(this.data.firstStr, word, app.globalData.userId);
      let tmpWord = 'sucessWord[' + this.data.sucessWord.length + ']';

      this.setData(initLocalData({
        secondStr: word,
        showWordCouple: Utils.dealWordCouple(this.data.firstStr, word),
        ['mySelf.combox']: this.data.mySelf.combox + 1,
        ['mySelf.rightNum']: this.data.mySelf.rightNum + 1,
        [first]: { isClear: true, isError: false },
        [second]: { isClear: true, isError: false },
        [tmpWord]: obj,
        sucessTimes: times,
        isRight: true,
        right_Type: match.RandomNumBoth(0, 1)
      }))

      // 1s后隐藏单词以及combox动效
      setTimeout(() => {
        this.setData({
          firstStr: '',
          secondStr: '',
          ['mySelf.score']: _score,
          ['mySelf.totalNum']: this.data.mySelf.totalNum + 1,
          showWordCouple: [],
          isRight: false,
        })
      }, 1000)

      //全部消除成功且时间没有结束，比赛结束
      if (times === 6 && !this.data.isGameOver) {
        setTimeout(() => {
          this.GameOver(_score);
        },500)
      }

    } else {
      // 错误后，将对应方块的isError变为true，以便使用错误提示的CSS
      let first = 'wordGrid[' + lastPosition[1] + '][' + lastPosition[0] + '].isError';
      let second = 'wordGrid[' + Y + '][' + X + '].isError';
      //将第一次点击方块的isChoose变为false
      let chooseFlag = 'wordGrid[' + lastPosition[1] + '][' + lastPosition[0] + '].isChoose';
      // 将答错的单词保存导错题本
      let matchPosition = this.data.matchWord.split(',');
      let obj = Utils.rebuildArr(this.data.firstStr, this.data.wordGrid[matchPosition[1]][matchPosition[0]].wordData.value, app.globalData.userId);
      let tmpWord = 'errorWord[' + this.data.errorWord.length + ']';
      // 播放错误的读音
      let errorType = match.RandomNumBoth(0, 1); 
      
      this.setData(initLocalData({
        secondStr: word,
        [tmpWord]: obj,
        [first]: true,
        [second]: true,
        ['mySelf.combox']: 0,
        ['mySelf.errorNum']: this.data.mySelf.errorNum + 1,
        isError: true,
        error_Type: errorType
      }));
      
      setTimeout(() => {
        if (this.data.isError) {
          this.ErrorWord = this.selectComponent('#errorShow');
          this.ErrorWord.playErrorMusic(errorType);
        }
      }, 500);
      
     
      // 700ms后将答错的单词方块状态初始化
      setTimeout(() => {
        this.setData({
          firstStr: '',
          secondStr: '',
          [chooseFlag]: false,
          [first]: false,
          [second]: false,
          isError: false
        })
      }, 1000);
    }
  },

  // 比赛结束
  GameOver: function (score) {
    // 暂停播放背景音乐以及销毁实例
    innerAudioContextBg.stop();
    if (innerAudioContextBg) {
      innerAudioContextBg.destroy();
    }
    // 并统计最终的结果
    let starNum = judeTheStar(score);
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

    request.getData('GAME_OVER', params).then(res => {
      if (res.code === 0) {
        if (starNum >= 1) {
          music.playPassMusic();
        } else {
          music.playUnpassMusic();
        }
        this.setData({
          nextLevel: res.nextLevel,
          isGameOver: true,
          starNum: starNum,
          isPass: score >= 60
        });
      }
    }).catch(error => {
      wx.showModal({
        content: '服务器内部错误，稍后回到首页',
        showCancel: false,
        success: res => {
          wx.navigateBack();
        }
      })
    })
  },
// ### 用户点击操作 code end ###

// ### 获取提示 code start ###
  // 获取提示信息
  getHelp: function () {
    if (this.data.mySelf.coin < 20) {
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
        [other]: true
      })
      setTimeout(()=>{
        this.setData({
          isDelCoin: false,
          ['mySelf.coin']: this.data.mySelf.coin - 20,
          [other]: false
        })
      },1000)
      
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
            [tempB]: true
          })
          setTimeout(() => {
            this.setData({
              isDelCoin: false,
              ['mySelf.coin']: this.data.mySelf.coin - 20,
              [tempA]: false,
              [tempB]: false,
            })
          }, 1000)
          // this.delCoinNum();
          return;
        }
      }
    }
  },
  // 向后请求减少金币
  delCoinNum: function () {
    let params = {};
    params.userId = app.globalData.userId,
    params.levelId = this.data.levelId
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
    innerAudioContextBg.volume = 0.8;
    innerAudioContextBg.src = music.getMusicSource(0,'BG_GAME_MUSIC');
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

function judeTheStar(score) {
  let star = 0; 
  if (score < 60) {
    star = 0;
  } else if (score < 80) {
    star = 1;
  } else if (score < 100) {
    star = 2;
  } else if (score === 100){
    star = 3;
  }
  return star;
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
      gameClock: "00:00",
    });
    clearTimeout(gameTimer);
    if(!that.data.isGameOver) {
      that.GameOver(that.data.mySelf.score);
    } else {
      console.log('结束  消除全部内容')
    }
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
