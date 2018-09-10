var assistant = require("../../../utils/assistant.js");
var pagesManager = require("../../../utils/pagesManager.js");
var robot = require("../../../utils/robot.js");

var allWords = new Array(3);  //存放单词对的容器
allWords[0] = { left: { value: "apple" }, right: { value: "苹果" } };
allWords[1] = { left: { value: "banana" }, right: { value: "香蕉" } };
allWords[2] = { left: { value: "peach" }, right: { value: "桃子" } };

var oprateTimer;
var startTime = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    row: 3,  //根据单词对总数以及策划规则算出的二维数组行数
    col: 2,  //根据单词对总数以及策划规则算出的二维数组列数
    isClickFlag: false,  //表示是否点击
    firstClick: '',  //第一次点击单词的坐标
    mathchWord: '',  //选中一个后，与之匹配单词的坐标
    sucessTimes: 0,  //消除成功的次数，以判断是否消除完全
    wordGrid: [],   //模拟随机生成后的数据
    strQuene: '',   //存放单词队的字符串，用于读音
    lastTimes: 0,  //联系消除成功的次数，用以计算combox系数
    oprateSecond: 0,  //操作的时间，不同时间对应不同积分 
    point: 0, //用户获得的积分
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
    this.wordRandom();
    setTimer();
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
    // console.log(allWords);
    assistant.randomFill(arrayToFill, this.data.row, this.data.col, allWords);
    // console.log(arrayToFill)
    this.setData({
      wordGrid: arrayToFill
    })
  },

  /**
   * 判断用户的点击操作
   */
  ClickGrid: function (e) {
    console.log(e);
    // 直接通过传入二维数组的序号来获取单词的位置
    let X = e.target.dataset.posx;
    let Y = e.target.dataset.posy;
    let matchWord = e.target.dataset.key;
    let word = e.target.dataset.value;
    
    this.onChooseWord(X, Y, matchWord, word);
  },

  onChooseWord : function(X, Y, matchWord, word){
    // 点击了已消除的区域
    if(matchWord === undefined || matchWord === '' || matchWord === null) {
      wx.showToast({
        icon: 'none',
        title: '请点击有效区域',
      })
      return;
    }
    
    // 第一次点击选中单词
    if(!this.data.isClickFlag) {
      this.setData({
        isClickFlag: true,
        firstClick: X+','+Y,
        mathchWord: matchWord.column+','+matchWord.row,
        strQuene: word
      })
      return ;
    }

    // 重复点击一个单词，即取消刚才选中的单词
    if (this.data.firstClick === X+','+Y) {
      this.setData(initLocalData())
      return ;
    }

    // 第二次选择单词，判断是否正确
    if (this.data.mathchWord === X+','+Y) {
      clearTimer();   //操作用时计时结束
      let time = this.data.sucessTimes + 1;
      assistant.playVoiceByInputText(this.data.strQuene + word);
      wx.showToast({
        title: '消除成功',
      })

      let lastPosition = this.data.firstClick.split(',');
      let first = 'wordGrid['+lastPosition[1]+']['+lastPosition[0]+']';
      let second = 'wordGrid['+Y+']['+X+']';
      let _point = Number(this.data.point) + Math.round(Number(100 * (this.data.lastTimes * 0.1 + 1) * judeGreed(startTime)));
      this.setData(
        initLocalData({
          lastTimes: this.data.lastTimes + 1,
          point: Number(_point),
          [first]: [],
          [second]: [],
          sucessTimes: time
        })
      )

      setTimer();  // 重新计时操作事件
      
      if (time === this.data.row * this.data.col / 2) {
        robot.stopToPlayGame();
        wx.showToast({
          icon: 'none',
          title: '全部消除成功，稍后重开一局',
        })
        this.setData(initLocalData({
          lastTimes: 0,
          point: 0,
        }), this.wordRandom());
        robot.startToPlayGame(this.data.wordGrid, this.data.row, this.data.col);
      }
    } else {
      wx.showToast({
        icon: 'none',
        title: '消除单词失败',
      })
      this.setData(initLocalData({
        lastTimes: 0
      }))
    }
  },

  /**
   * 监听页面隐藏
   */
  onHide:  function () {
    clearTimer();
  }

})

function setTimer () {
  oprateTimer = setInterval(()=>{
    startTime ++;
  },1000)
}

function clearTimer () {
  if(oprateTimer) {
    clearInterval(oprateTimer);
    startTime = 0;
  }
}

function judeGreed (second) {
  let temp = 1;
  if(second <= 3) {
    temp = 1.1;
  } else if(second <= 7) {
    temp = 1;
  } else {
    temp = 0.9;
  }
  return temp;
}

function initLocalData(obj = {}) {
  let temp = {
    isClickFlag: false,
    firstClick: '',
    mathchWord: '',
    strQuene: ''
  }
  for (var key in temp) {
    obj[key] = temp[key]
  }
  return obj;

}
