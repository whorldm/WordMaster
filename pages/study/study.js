// pages/study/study.js
var utils = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    worldCh: '下午',
    letterList: [
      { value: 'A', animation: null },
      { value: 'F', animation: null },
      { value: 'T', animation: null },
      { value: 'E', animation: null },
      { value: 'R', animation: null },
      { value: 'N', animation: null },
      { value: 'O', animation: null },
      { value: 'O', animation: null },
      { value: 'N', animation: null },
    ],
    showLetter: [], // 显示的单词
    positionList: [], // 随机的位置数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.animation = wx.createAnimation({
      duration: 800,   
      timingFunction: 'ease',
      delay: 0,
      transformOrigin: '100% 100%',
      success: function (res) {
      }
    });
    this.animationFly = wx.createAnimation({
      duration: 800,    
      timingFunction: 'ease',
      delay: 0,
      transformOrigin: '50% 50%',
      success: function (res) {
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.vanishLetter();
  },

  // 单词消失的动效
  vanishLetter: function () {
    let num = 0, str;
    let random = utils.RandomNum(0, 2);
    let vanishTimer = setInterval(() => {
      num++;
      if (num === this.data.letterList.length) {
        clearInterval(vanishTimer);
        getRandomPosition(this.data.letterList, this);
      }
      str = 'letterList[' + (num - 1) + '].animation';
      switch(random) {
        case 0:
          this.animation.rotate(-90).translateX(-20).step();
          break;
        case 1:
          this.animation.translateY(-50).opacity(0).step();
          break;
        case 2: 
          this.animation.translateX(-50).opacity(0).step();
          break;
      }
      this.setData({
        [str]: this.animation.export()
      })
    }, 800)
  },

  // 点击单词块后，动效变化
  ClickLettter: function (e) {
    console.log(e.target.dataset.angle)
    let str = "showLetter[" + e.target.dataset.posx + "][" + e.target.dataset.posy +"].animation";
    this.animationFly.rotate(0).step();
    this.animationFly.translateY(-500).opacity(0).step();
    this.setData({
      [str]: this.animationFly.export()
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})

// 字母块的随机显示
function getRandomPosition(arr, that) {
  let showArray = [],positionList = [];
  // 初始化矩阵
  for(let i=0; i<6; i++) {
    showArray[i] = new Array();
    for(let j=0; j<5; j++){
      showArray[i][j] = new Object();
    }
  }
  for(let i=0;i<arr.length;i++){
    let obj = {}
    obj.posX = utils.RandomNum(0, 5);
    obj.posY = utils.RandomNum(0, 4);
    positionList[i] = obj;
    isReapt(obj.posX, obj.posY, arr[i], showArray, that)
  }
  that.setData({
    showLetter: showArray,
    positionList: positionList
  })
}

function isReapt (posX, posY, obj, arr, that) {
  if(arr[posX][posY].value) {
    let tempX = posX + 1 < 6 ? posX + 1 : posX - 2;
    let tempY = posY + 1 < 5 ? posY + 1 : posY - 2;
    isReapt(tempX, tempY, obj, arr, that);
  } else {
    arr[posX][posY] = obj;
    let _deg = utils.RandomNum(-20, 20);
    that.animationFly.rotate(_deg).step();
    arr[posX][posY].angle = _deg;
    arr[posX][posY].animation = that.animationFly.export();
    return;
  }
}