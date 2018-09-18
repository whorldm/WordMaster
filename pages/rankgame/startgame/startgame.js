var assistant = require("../../../utils/assistant.js");
var pagesManager = require("../../../utils/pagesManager.js");
var robot = require("../../../utils/robot.js");
var Utils = require("../../../utils/util.js");
var request = require("../../../utils/request.js");
var app = getApp();

var operateTimer = null;  // 用户操作时间的计时器
var clickTimer = null;  // 用户操作时间的计时器
var gameTimer = null;  // 比赛倒计时的计时器

var innerAudioContextBg = null
var innerAudioContextError = null
var innerAudioContextSuccess = null

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pointClass1: '',
    pointClass2: '',
    addPoint1: 100,
    addPoint2: 100,
    canClick: true, //当前是否可以点击，防止用户误操作
    row: 4,  //根据单词对总数以及策划规则算出的二维数组行数
    col: 3,  //根据单词对总数以及策划规则算出的二维数组列数
    isFlip: false, // 是否实现翻牌效果
    fastFlag: false, // 两人对决，谁的答题速度快开始的标志
    total_second: 60, //比赛时间
    gameClock: '01:00', //游戏倒计时一分钟
    isClickFlag: false,  //表示用户是否点击选中单词
    firstClick: '',  //第一次点击单词的坐标
    matchWord: '',  //选中一个单词后，与之匹配单词的坐标
    sucessTimes: 0,  //消除成功的总次数，以判断是否消除完全
    showWordCouple: [], //显示单词对
    firstStr: '',   //存放第一次点击的字符串
    secondStr: '',  //存放第一次点击的字符串  
    operateSecond: 1, //用户操作成功一次的时间（即这次消除成功距离上一次成功的时间）,不同时间对应不同积分 
    wordGrid: [],   //模拟随机生成后的数据
    sucessWord: [], //当前用户答对的单词
    errorWord: [], //当前用户答错的单词
    mySelf: {  // 保存当前用户的个人信息
      avatarUrl: '../../../img/1.jpeg',
      rightNum: 0,
      errorNum: 0,
      combox: 0,
      roundTime: 0, //表示用户目前处于第几盘
      score: 0,  //用户当前积分
      coin: 100  //用户的持有金币
    },
    oppnent: {  //保存对手的信息
      avatarUrl: '../../../img/1.jpeg',
      rightNum: 0,
      errorNum: 0,
      combox: 0,
      roundTime: 0,
      score: 0
    },
    frontClass: 'front',
    backClass: 'back'
  },

// ### 生命周期函数 code start ### 
  onLoad: function (options) {
    pagesManager.startgame = this;
    // 实例化播放器
    innerAudioContextBg = wx.createInnerAudioContext();
    innerAudioContextError = wx.createInnerAudioContext();
    innerAudioContextSuccess = wx.createInnerAudioContext();
    if(options.matchPerson) {
      this.setData({
        ['mySelf.avatarUrl']: app.globalData.userInfo.avatarUrl,
        ['oppnent.avatarUrl']: options.matchPerson,
      })
    }
    // 下载字体
    // wx.loadFontFace({
    //   family: 'Bitstream',
    //   source: 'url("https://sungd.github.io/Pacifico.ttf")',
    //   success: res => {
    //     console.log(res) //  loaded
    //   },
    //   fail: res => {
    //     console.log(res) //  error
    //   },
    //   complete: res => {
    //     console.log(res);
    //   }
    // });
  },
  onShow: function () {
    this.RobotRandom(); // 机器人随机生成单词
    this.wordRandom();  // 用户随机生成单词
    this.getUserAsset();  // 获取用户的材料
    this.playBgMusic();  // 开始播放音乐
    CountOneMinte(this);  // 比赛倒计时开始
    setTimer(this);  // 设置记录操作时间的计时器
  },
  onUnload: function () {
    robot.stopToPlayGame();
    innerAudioContextBg.stop();
    innerAudioContextBg.destroy();
    innerAudioContextSuccess.destroy();
    innerAudioContextError.destroy();

    if (gameTimer) {
      clearTimeout(gameTimer);
    }
    if (this.data.total_second > 0) {
      wx.showModal({
        content: '您已经放弃了战斗!',
        showCancel: false,
      })
    }
  },
// ### 生命周期函数 code end ### 

  // 获取用户的当前金币
  getUserAsset: function () {
    request.getData("USER_ASSET",{userId: app.globalData.userId})
    .then(res => {
      this.setData({
        ['mySelf.coin']: res.myAsset.coin
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
    request.getData("WORD_LIST")
    .then(res => {
      assistant.randomFill(arrayToFill, this.data.row, this.data.col, res.list);
      this.setData({
        wordGrid: arrayToFill
      })
    })
    .catch(err => {
      console.error("获取单词失败！")
    })
  },

// ### 用户点击操作 code start ###
  // 判断用户的点击操作
  ClickGrid: function (e) {
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
    if (!this.data.canClick) {  //页面可否点击
      console.log('延时保护')
      return ;
    }
    // 点击了已消除的区域
    if (matchWord === undefined || matchWord === '' || matchWord === null) {
      return;
    }
    
    this.onChooseWord(X, Y, matchWord, word);
  },

  // 选择单词
  onChooseWord: function (X, Y, matchWord, word) {
    // 第一次点击选中单词
    if(!this.data.isClickFlag) {
      // 播放读音
      assistant.playVoiceByInputText(word);
      // 设置选择的标志量
      let chooseFlag = "wordGrid["+Y+"]["+X+"].isChoose";
      let noticeFlag = "wordGrid["+Y+"]["+X+"].isNotice";
      this.setData({
        [noticeFlag]: false,
        [chooseFlag]: true,
        isClickFlag: true,
        firstClick: X+','+Y,
        matchWord: matchWord.column+','+matchWord.row,
        firstStr: word
      })
      return ;
    }

    // 重复点击一个单词，即取消刚才选中的单词
    if (this.data.firstClick === X+','+Y) {
      let chooseFlag = "wordGrid[" + Y + "][" + X + "].isChoose";
      this.setData(initLocalData({
        [chooseFlag]: false,
        firstStr: ''
      }))
      return ;
    }

    // 第二次选择单词，判断是否正确
    let lastPosition = this.data.firstClick.split(','); // 上次点击方块的位置
    if (this.data.matchWord === X+','+Y) {
      //播放音乐与单词读音
      this.playSuccess();
      assistant.playVoiceByInputText(word);
      // 清除记录操作时间的定时器
      clearTimer(operateTimer);
      // 答对后将对应的单词块的数据清空以及重置状态位
      let first = 'wordGrid['+lastPosition[1]+']['+lastPosition[0]+']';
      let second = 'wordGrid['+Y+']['+X+']';
       //计算个人的得分以及当前棋盘所消除单词对总数
      let times = this.data.sucessTimes + 1;
      let addScore = Math.round(100 * (this.data.mySelf.combox * 0.1 + 1) * Utils.judeGreed(this.data.operateSecond));
      let _score = Number(this.data.mySelf.score) + Math.round(100 * (this.data.mySelf.combox * 0.1 + 1) * Utils.judeGreed(this.data.operateSecond));
      //保存已答对的单词
      let obj = Utils.rebuildArr(this.data.firstStr, word);
      let tmpWord = 'sucessWord['+this.data.sucessWord.length+']';

      this.setData(initLocalData({
          canClick: false,
          pointClass1: 'addPoint',
          addPoint1: addScore,
          secondStr: word,
          showWordCouple: Utils.dealWordCouple(this.data.firstStr, word),
          ['mySelf.combox']: this.data.mySelf.combox + 1,
          // ['mySelf.score']: _score,
          ['mySelf.rightNum']: this.data.mySelf.rightNum + 1,
          [first]: { isClear: true, isError: false},
          [second]: { isClear: true, isError: false },
          [tmpWord]: obj,
          sucessTimes: times,
          operateSecond: 0 
        })
      )

      // 重新设置操作时间的定时器
      setTimer(this);

      // 1s后隐藏单词以及combox动效
      setTimeout(()=> {
        this.setData({
          canClick: true,
          firstStr: '',
          secondStr: '',
          ['mySelf.score']: _score,
          pointClass1: '',
          showWordCouple: []
        })
      },1000)

      //比赛未结束且当前棋盘全部消除成功后更换一局
      if (times === this.data.row * this.data.col / 2 && this.data.total_second > 3) {
        // 判断当前用户还是机器人的答题速度快
        let _fastFlag = (this.data.mySelf.roundTime + 1) > this.data.oppnent.roundTime;
        let _score;
        if (_fastFlag) {
          _score = this.data.mySelf.score + 200;
        } else {
          _score = this.data.mySelf.score + 100;
        }
        this.setData({
          canClick: false,
          frontClass: 'fronted',
          backClass: 'backed',
          sucessTimes: 0,
          fastFlag: _fastFlag,
          ['mySelf.score']: _score,
          ['mySelf.roundTime']: this.data.mySelf.roundTime + 1,
        },this.wordRandom())

        setTimeout(()=> {
          this.setData(initLocalData({
            canClick: true,
            frontClass: 'front',
            backClass: 'back'
          }));
        },1200)
      }

    } else {
      // 错误后，将对应方块的isError变为true，以便使用错误提示的CSS
      let first = 'wordGrid[' + lastPosition[1] + '][' + lastPosition[0] + '].isError';
      let second = 'wordGrid[' + Y + '][' + X + '].isError';
      //将第一次点击方块的isChoose变为false
      let chooseFlag = 'wordGrid[' + lastPosition[1] + '][' + lastPosition[0] + '].isChoose';
      this.palyError(); // 播放音乐
      // 将答错的单词保存导错题本
      let matchPosition = this.data.matchWord.split(',');
      let obj = Utils.rebuildArr(this.data.firstStr, this.data.wordGrid[matchPosition[1]][matchPosition[0]].wordData.value);
      let tmpWord = 'errorWord[' + this.data.errorWord.length + ']';

      this.setData(initLocalData({
        canClick: false,
        secondStr: word,
        combox: 1,
        [tmpWord]: obj,
        [first]: true ,
        [second]: true,
        ['mySelf.errorNum']: this.data.mySelf.errorNum + 1,
      }))

      // 700ms后将答错的单词方块状态初始化
      setTimeout(()=>{
        this.setData({
          canClick: true,
          firstStr: '',
          secondStr: '',
          [chooseFlag]: false,
          [first]: false,
          [second]: false,
        })
      },700);
    }

  },

  // 比赛结束
  GameOver: function () {
    robot.stopToPlayGame();
    innerAudioContextBg.stop();

    if (innerAudioContextBg) {
      innerAudioContextBg.destroy();
      innerAudioContextSuccess.destroy();
      innerAudioContextError.destroy();
    }

    // 并统计最终的结果
    let params = {
      userId: app.globalData.userId,
      rightNum: this.data.errorWord.length,
      worngNum: this.data.sucessWord.length,
      wrongbookEntityList: this.data.errorWord,
      rightbookEntitiyList: this.data.sucessWord,
    }

    // 保存比赛结果
    wx.setStorageSync('mySelf', this.data.mySelf);
    wx.setStorageSync('oppnent', this.data.oppnent);

    request.getData('GAME_OVER', params).then(res => {
      if (res.code === 0) {
        wx.redirectTo({
          url: '/pages/rankgame/gameover/gameover',
        })
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
    if(this.data.mySelf.coin < 20) {
      wx.showToast({
        icon:'none',
        title: '金币数量不足'
      });
      return ;
    }
    // 以选择一个单词，提示相应的
    let matchPosition = this.data.matchWord.split(',');
    if (this.data.isClickFlag) {
      let other = "wordGrid[" + matchPosition[1] + "][" + matchPosition[0]+"].isNotice";
      this.setData({
        ['mySelf.coin']: this.data.mySelf.coin - 20,
        [other]: true
      })
      // this.delCoinNum();
     return; 
    }
    // 未选中单词，提示一对
    for(let i=0,l1=this.data.wordGrid.length; i<l1; i++) {
      let temp = this.data.wordGrid[i]
      for(let j=0,l2=temp.length; j<l2; j++) {
        if(temp[j].wordData) {
          let tempA = "wordGrid[" + i + "][" + j + "].isNotice";
          let tempB = "wordGrid[" + temp[j].pairIndex.row + "][" + temp[j].pairIndex.column + "].isNotice";
          this.setData({
            ['mySelf.coin']: this.data.mySelf.coin - 20,
            [tempA]:true,
            [tempB]:true,
          })
          // this.delCoinNum();
          return;
        }
      }
    }
  },
  // 向后请求减少金币
  delCoinNum: function () {
    request.getData("PROMPT",{userId: app.globalData.userId})
    .then(res => {
      console.log('提示成功')
    })
    .catch(err => {
      console.error('后台错误')
    })
  },
// ### 获取提示 code end ###

// ### 机器人操作回调 code start ###
  //备份单词对，供机器人使用
  RobotRandom: function () {
    let robotArray = new Array(this.data.row);
    for (let i = 0, l1 = robotArray.length; i <= l1 - 1; ++i) {
      robotArray[i] = new Array(this.data.col);
      for (let j = 0, l2 = robotArray[i].length; j <= l2 - 1; ++j) {
        robotArray[i][j] = {};
      }
    }
    request.getData("WORD_LIST")
      .then(res => {
        assistant.randomFill(robotArray, this.data.row, this.data.col, res.list);
        robot.startToPlayGame(robotArray, this.data.row, this.data.col);
      })
      .catch(err => {
        console.error("获取单词失败！")
      })
  },
  // 模拟机器人操作成功后
  RobotSucess: function () {
    let _combox = this.data.oppnent.combox + 1;
    let _score = this.data.oppnent.score + Math.round(100 * (_combox * 0.1 + 1) * 1);
    this.setData({
      pointClass2: 'addPoint',
      addPoint2: Math.round(100 * (_combox * 0.1 + 1) * 1),
      ['oppnent.combox']: _combox,
      // ['oppnent.score']: _score,
      ['oppnent.rightNum']: this.data.oppnent.rightNum + 1,
    })

    setTimeout(() => {
      this.setData({
        pointClass2: '',
        ['oppnent.score']: _score,
      })
    },1000);
  },
  // 模拟机器人操作失败
  RobotError: function (){
    this.setData({
      ['oppnent.combox']: 0,
      ['oppnent.errorNum']: this.data.oppnent.errorNum + 1,
    })
  },
  // 模拟机器人全部操作成功
  RobotAllClear: function () {
    let _fastFlag = (this.data.mySelf.roundTime + 1) > this.data.oppnent.roundTime;
    let _score;
    if (_fastFlag) {
      _score = this.data.oppnent.score + 200;
    } else {
      _score = this.data.oppnent.score + 100;
    }
    this.setData({
      ['oppnent.score']: _score,
      ['oppnent.roundTime']: this.data.oppnent.roundTime + 1,
    }, this.RobotRandom());
  },
// ### 机器人操作回调 code end ###

// ### 音乐播放 code start ###
  // 播放背景音乐
  playBgMusic: function () {
    innerAudioContextBg.loop = true;
    innerAudioContextBg.volume = 0.2;
    innerAudioContextBg.src = 'http://pepuwoffw.bkt.clouddn.com/bg2.mp3';
    innerAudioContextBg.play();
  },
  // 播放成功音效
  playSuccess: function () {
    innerAudioContextSuccess.src = 'http://pepuwoffw.bkt.clouddn.com/success.mp3';
    innerAudioContextSuccess.play();
    setTimeout(()=> {
      innerAudioContextSuccess.stop();
    },1000)
  },
  // 播放失败音效
  palyError: function () {
    innerAudioContextError.src = 'http://pepuwoffw.bkt.clouddn.com/error.wav';
    innerAudioContextError.play();
    setTimeout(() => {
      innerAudioContextError.stop();
    },1000)
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

// 记录用户操作时间的计时器
function setTimer(that){
  operateTimer = setInterval(()=> {
    that.setData({
      operateSecond: that.data.operateSecond + 1
    })
  },1000)
}
function clearTimer() {
  clearInterval(operateTimer);
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
    that.GameOver();
    return;
  }
  gameTimer = setTimeout(function () {
    CountOneMinte(that);
  }, 1000)
}
