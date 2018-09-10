var assistant = require("../../../utils/assistant.js");
var pagesManager = require("../../../utils/pagesManager.js");
var robot = require("../../../utils/robot.js");
var Utils = require("../../../utils/util.js");
var request = require("../../../utils/request.js");
var app = getApp();

var allWords = new Array(3);  //存放单词对的容器
allWords[0] = { left: { value: "apple" }, right: { value: "苹果" } };
allWords[1] = { left: { value: "banana" }, right: { value: "香蕉" } };
allWords[2] = { left: { value: "peach" }, right: { value: "桃子" } };
allWords[3] = { left: { value: "sun" }, right: { value: "太阳" } };
allWords[4] = { left: { value: "moon" }, right: { value: "月亮" } };
allWords[5] = { left: { value: "star" }, right: { value: "星星" } };

var oprateTimer = null;  // 用户操作的计时器
var startTime = 0;  // 用户操作的时间

var gameTimer = null;
var total_second = 1 * 60; 

const innerAudioContextBg = wx.createInnerAudioContext(),
      innerAudioContextError = wx.createInnerAudioContext(),
      innerAudioContextSuccess = wx.createInnerAudioContext();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    row: 4,  //根据单词对总数以及策划规则算出的二维数组行数
    col: 3,  //根据单词对总数以及策划规则算出的二维数组列数
    gameFlag: true, // 游戏是否开始的标志
    gameClock: '01:00', //游戏倒计时一分钟
    isClickFlag: false,  //表示是否点击
    firstClick: '',  //第一次点击单词的坐标
    matchWord: '',  //选中一个后，与之匹配单词的坐标
    sucessTimes: 0,  //消除成功的总次数，以判断是否消除完全
    showWordCouple: [], // 显示单词对
    strQuene: '',   //存放单词队的字符串，用于读音 
    combox: 1, //连续消除成功的次数，用以计算combox系数
    oprateTime: 0, //用户一次操作成功的时间
    oprateSecond: 0,  //操作的时间，不同时间对应不同积分 
    point: 0, //当前用户获得的积分
    wordGrid: [],   //模拟随机生成后的数据
    sucessWord: [], //当前用户答对的单词
    errorWord: [], //当前用户答错的单词
    mySelf: {  // 保存个人信息
      logo: '../../../img/1.jpeg'
    },
    oppnent: {  //保存对手的信息
      logo: '../../../img/1.jpeg',
      score: 0
    },
    allWords:[] // 获取所有的单词
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    pagesManager.startgame = this;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    total_second = total_second - 1;
    this.wordRandom();  // 随机生成单词
    this.playBgMusic(); //  开始播放音乐
    CountOneMinte(this);
    robot.startToPlayGame(this.data.wordGrid, this.data.row, this.data.col);
  },

  /**
   * 将单词对随机生成二维数组
   */
  wordRandom: function () { 
    let arrayToFill = new Array(this.data.row); //存放单词数据的二维数组
    for (let i = 0, l1 = arrayToFill.length; i <= l1 - 1; ++i) {
      arrayToFill[i] = new Array(this.data.col);
      for (let j = 0, l2 = arrayToFill[i].length; j <= l2 - 1; ++j) {
        arrayToFill[i][j] = {};
      }
    }
    request.getData("WORD_LIST",{userId: app.globalData.userId})
    .then(res => {
      assistant.randomFill(arrayToFill, this.data.row, this.data.col, res.list);
      this.setData({
        wordGrid: arrayToFill
      })
    })
    .catch(err => {
      console.error("获取单词失败！")
    })
    // assistant.randomFill(arrayToFill, this.data.row, this.data.col, this.data.allWords);
    // this.setData({
    //   wordGrid: arrayToFill
    // })
  },

  // 从服务器获取单词（应该大于一次显示的数据）
  getWordList: function () {
    request.getData("WORD_LIST",{userId: app.globalData.userId})
    .then(res => {
      this.setData({
        allWords: res.list
      })
    })
    .catch(err => {
      console.error("获取单词失败！")
    })
  },

  /**
   * 判断用户的点击操作
   */
  ClickGrid: function (e) {
    if(!this.data.gameFlag) {
      wx.showToast({
        title: '比赛结束',
      })
      return;
    }
    // 直接通过传入二维数组的序号来获取单词的位置
    let X = e.target.dataset.posx;
    let Y = e.target.dataset.posy;
    let matchWord = e.target.dataset.key;
    let word = e.target.dataset.value;

    this.onChooseWord(X, Y, matchWord, word);
  },
  // 选择单词
  onChooseWord: function (X, Y, matchWord, word) {
    // 点击了已消除的区域
    if(matchWord === undefined || matchWord === '' || matchWord === null) {
      return;
    }
    
    // 第一次点击选中单词
    if(!this.data.isClickFlag) {
      let chooseFlag = "wordGrid["+Y+"]["+X+"].isChoose";
      let noticeFlag = "wordGrid["+Y+"]["+X+"].isNotice";
      this.setData({
        [noticeFlag]: false,
        [chooseFlag]: true,
        isClickFlag: true,
        firstClick: X+','+Y,
        matchWord: matchWord.column+','+matchWord.row,
        strQuene: word
      })
      return ;
    }

    // 重复点击一个单词，即取消刚才选中的单词
    if (this.data.firstClick === X+','+Y) {
      let chooseFlag = "wordGrid[" + Y + "][" + X + "].isChoose";
      this.setData(initLocalData({
        [chooseFlag]: false
      }))
      return ;
    }

    // 第二次选择单词，判断是否正确
    let lastPosition = this.data.firstClick.split(','); // 上次点击方块的位置
    if (this.data.matchWord === X+','+Y) {
      //播放音乐与单词读音
      this.playSuccess();
      assistant.playVoiceByInputText(Utils.dealWordCouple(this.data.strQuene, word).join(' '));
      // 答对后将对应的单词块的数据清空以及重置状态位
      let first = 'wordGrid['+lastPosition[1]+']['+lastPosition[0]+']';
      let second = 'wordGrid['+Y+']['+X+']';
       //计算个人的得分以及当前棋盘所消除单词对总数
      let times = this.data.sucessTimes + 1;
      let _point = Number(this.data.point) + Math.round(100 * (this.data.combox *0.1 + 1) * Utils.judeGreed(this.data.oprateTime));
      let test = 'oppnent.score';  //模拟测试对手修改数据//////////////
      //保存已答对的单词
      let obj = Utils.rebuildArr(this.data.strQuene, word);
      let tmpWord = 'sucessWord['+this.data.sucessWord.length+']';

      
      this.setData(initLocalData({
          showWordCouple: Utils.dealWordCouple(this.data.strQuene, word),
          combox: this.data.combox + 1,
          point: _point,
          [test]: this.data.oppnent.score + 100,
          [first]: { isClear: true, isError: false},
          [second]: { isClear: true, isError: false },
          [tmpWord]: obj,
          sucessTimes: times
        })
      )
      // 1s后隐藏单词以及combox动效
      setTimeout(()=> {
        this.setData({
          showWordCouple: []
        })
      },1000)
      //比赛未结束且当前棋盘全部消除成功后更换一局
      if (times === this.data.row * this.data.col / 2) {
        robot.stopToPlayGame();
        this.setData(initLocalData({
          sucessTimes: 0,
        }), this.wordRandom());
        robot.startToPlayGame(this.data.wordGrid, this.data.row, this.data.col);
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
      let obj = Utils.rebuildArr(this.data.strQuene, this.data.wordGrid[matchPosition[1]][matchPosition[0]].wordData.value);
      let tmpWord = 'errorWord[' + this.data.errorWord.length + ']';

      this.setData(initLocalData({
        combox: 1,
        [tmpWord]: obj,
        [first]: true ,
        [second]: true,
      }))
      // 700ms后将答错的单词方块状态初始化
      setTimeout(()=>{
        this.setData({
          [chooseFlag]: false,
          [first]: false,
          [second]: false,
        })
      },700);
    }
  },

  // 获取提示信息
  getHelp: function () {
    // 以选择一个单词，提示相应的
    let matchPosition = this.data.matchWord.split(',');
    if (this.data.isClickFlag) {
      let other = "wordGrid[" + matchPosition[1] + "][" + matchPosition[0]+"].isNotice";
      this.setData({
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
    request.getData("DEL_COIN",{userId:app.globalData.userId})
    .then(res => {
      console.log('提示成功')
    })
    .catch(err => {
      console.error('后台错误')
    })
  },

  // 比赛结束
  GameOver: function () {
    console.log('比赛结束')
    // 并统计最终的结果
    let params = {
      wrongbookEntityList: this.data.errorWord,
      rightbookEntitiyList: this.data.sucessWord,
    }
    // request.getData('GAME_OVER', params).then(result => {
    //   console.log(result);
    // }).catch(error => {
    //   console.error('错误')
    // })
    wx.redirectTo({
      url: '/pages/rankgame/gameover/gameover',
    })
  },

  // 播放背景音乐
  playBgMusic: function () {
    innerAudioContextBg.src = 'http://pepuwoffw.bkt.clouddn.com/bg.mp3';
    innerAudioContextBg.volume = 0.1;
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
  },
  
  // 监听用户的返回事件
  onUnload: function () {
    innerAudioContextBg.stop();
    if(gameTimer) {
      clearTimeout(gameTimer);
    }
    wx.showModal({
      content: '您已经放弃了战斗!',
      showCancel: false,
    })
  }
})


// 本地数据的常用初始化
function initLocalData(obj = {}) {
  let temp = {
    isClickFlag: false,
    firstClick: '',
    matchWord: '',
    strQuene: ''
  }
  for (var key in temp) {
    obj[key] = temp[key]
  }
  return obj;
}

// 比赛倒计时（一分钟）
function CountOneMinte(that) {
  clearTimeout(gameTimer);
  that.setData({
    gameClock: '00:' + Utils.fill_zero_prefix(total_second)
  })
  if (total_second <= 0) {
    innerAudioContextBg.stop();
    that.setData({
      gameClock: "00:00",
      gameFlag: false
    });
    clearTimeout(gameTimer);
    that.GameOver();
    return;
  }
  gameTimer = setTimeout(function () {
    total_second -= 1;
    CountOneMinte(that);
  }, 1000)
}
