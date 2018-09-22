//#region 随机填充算法
var handleArray = null;

function randomFill(arrayToFill, arrayRow, arrayColumn, allWords){
    var allWordsCount = arrayRow * arrayColumn;
    handleArray = new Array(allWordsCount);
    for(var i = 0, l = handleArray.length; i <= l - 1; ++i){
      handleArray[i] = {row : -1, column : -1};
    }

    var counterForInitHandleArray = 0;
    for(var i = 0, l1 = arrayRow; i <= l1 - 1; ++i){
      for(var j = 0, l2 = arrayColumn; j <= l2 - 1; ++j){
        handleArray[counterForInitHandleArray].row = i;
        handleArray[counterForInitHandleArray].column = j;
        counterForInitHandleArray++;
      } 
    }

    var maxRandomChooseIndex = allWordsCount - 1;
    var counterForAllWords = 0;
    var leftWordPosition;
    for (var i = 0, l = allWordsCount; i <= l - 1; ++i) {
      var randomIndex = Math.round(maxRandomChooseIndex * Math.random()); 
      var whichPosition = handleArray[randomIndex];
      var elementToFill = arrayToFill[whichPosition.row][whichPosition.column];
      if (counterForAllWords % 2 === 0){ //left
        elementToFill.wordData = allWords[Math.floor(counterForAllWords / 2)].left;
        leftWordPosition = whichPosition;
      } else {
        elementToFill.wordData = allWords[Math.floor(counterForAllWords / 2)].right;
        var leftElement = arrayToFill[leftWordPosition.row][leftWordPosition.column];
        var rightElement = elementToFill;
        leftElement.pairIndex = { row: whichPosition.row, column: whichPosition.column };
        leftElement.isChoose = false;
        leftElement.isClear = false;
        leftElement.isError = false;
        rightElement.pairIndex = { row: leftWordPosition.row, column: leftWordPosition.column };
        rightElement.isChoose = false;
        rightElement.isClear = false;
        rightElement.isError = false;
      }
      handleArray[randomIndex] = handleArray[maxRandomChooseIndex];
      maxRandomChooseIndex--;
      counterForAllWords++;
    }
  }
//#endregion 随机填充算法


//#code start 新版随机填充算法（将中英文上下分开显示）
var tempArray = null;

function newRandomFill(arrayToFill, arrayRow, arrayColumn, allWords) {
  let allWordsCount = arrayRow * arrayColumn;
  tempArray = new Array(allWordsCount);
  for (let i = 0, l = tempArray.length; i <= l - 1; ++i) {
    tempArray[i] = { row: -1, column: -1 };
  }

  let counterForInitTempArray = 0;
  for (let i = 0, l1 = arrayRow; i <= l1 - 1; ++i) {
    for (let j = 0, l2 = arrayColumn; j <= l2 - 1; ++j) {
      tempArray[counterForInitTempArray].row = i;
      tempArray[counterForInitTempArray].column = j;
      counterForInitTempArray++;
    }
  }

  let maxRandomChooseIndex = allWordsCount - 1;
  let counterForAllWords = 0;
  let leftWordPosition;
  for (let i = 0, l = allWordsCount; i <= l - 1; ++i) {
    let randomIndex = Math.round(maxRandomChooseIndex * Math.random());
    let whichPosition = tempArray[randomIndex];
    let elementToFill = arrayToFill[whichPosition.row][whichPosition.column];
    if (counterForAllWords % 2 === 0) { //left
      elementToFill.wordData = allWords[Math.floor(counterForAllWords / 2)].left;
      leftWordPosition = whichPosition;
    } else {
      elementToFill.wordData = allWords[Math.floor(counterForAllWords / 2)].right;
      var leftElement = arrayToFill[leftWordPosition.row][leftWordPosition.column];
      var rightElement = elementToFill;
      leftElement.pairIndex = { row: whichPosition.row, column: whichPosition.column };
      leftElement.isChoose = false;
      leftElement.isClear = false;
      leftElement.isError = false;
      rightElement.pairIndex = { row: leftWordPosition.row, column: leftWordPosition.column };
      rightElement.isChoose = false;
      rightElement.isClear = false;
      rightElement.isError = false;
    }
    tempArray[randomIndex] = tempArray[maxRandomChooseIndex];
    maxRandomChooseIndex--;
    counterForAllWords++;
  }
}
//#code end 新版随机填充算法（将中英文上下分开显示）


//#region 百度语音合成
  var IMEI, tokenFromBaidu;
  var filePath;
  var vedioIndex = 0;
  var vedioList = [];
  var canPlayNext = true;

  //初始化百度语音合成模块
  function initBaiduVoiceModule(){
    wx.getSystemInfo({
        success : onGetSystemInfoSuccess
      })
  }

  function onGetSystemInfoSuccess(res){
    IMEI = res.SDKVersion;
    getBaiduVoiceToken();
  }

  function getBaiduVoiceToken() {
    let grant_type = "client_credentials";
    let appKey = "yGyEqOOj3RIHPWQ9fc6akgju";  //百度应用Key
    let appSecret = "07cXQ5BHEMIyOrOib1v7EsGPqeDrQr2o"; //百度应用密钥
    let url = "https://openapi.baidu.com/oauth/2.0/token";  //获取token的地址

    wx.request({
      url: url,
      data: {
        grant_type: grant_type,
        client_id: appKey,
        client_secret: appSecret
      },
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: onGetTokenSuccess
    })
  }

  function onGetTokenSuccess(res) {
    tokenFromBaidu = res.data.access_token;
  }

  //根据输入的文本播放合成的声音
  function playVoiceByInputText(text,spd = 5){
    var tex = encodeURI(encodeURI(text));//转换编码url_encode UTF8编码,百度要求最好转换两次
    var tok = tokenFromBaidu;
    var cuid = IMEI;
    var ctp = 1;
    var pit = 8;
    var lan = "zh";    // zh表示中文
    var url = "https://tsn.baidu.com/text2audio?tex=" + tex + "&lan=" + lan + "&cuid=" + cuid + "&ctp=" + ctp + "&tok=" + tok + "&per=" + 2 + "&spd=" + spd + "&pit=" + pit + "&vol=" + 15;

    wx.downloadFile({
      url: url,
      success: onDownloadSuccess,
      fail: res => {
        console.error(res)
      },
      complete: res => {
        // console.log('开始下载第' + (vedioList.length) +'个读音');
      }
    })
  }


function onDownloadSuccess(res) {
 // console.log('下载结束')
  vedioList.push(res.tempFilePath);
  if(vedioIndex <= vedioList.length){
    play();
  }
}
function play() {
  if (canPlayNext && vedioList.length > 0) {
    canPlayNext = false;
    if (vedioIndex < vedioList.length) {
     // console.log('开始播放第'+vedioIndex+'个读音');
      const innerAudioContext = wx.createInnerAudioContext()
      innerAudioContext.src = vedioList[vedioIndex]
      innerAudioContext.play()
      innerAudioContext.onEnded(() => {
        // console.log('播放结束')
        canPlayNext = true;
        vedioIndex++
        play()
      innerAudioContext.destroy()
      })
      innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
        //播放错误，销毁该实例
        innerAudioContext.destroy();
      })
    } else {
      canPlayNext = true;
      vedioIndex = 0;
      vedioList = [];
    }
  }
}

  // function onDownloadSuccess(res){
  //   filePath = res.tempFilePath;
  //   play();
  // }

  // function play() {
  //   const innerAudioContext = wx.createInnerAudioContext()
  //   innerAudioContext.autoplay = true
  //   innerAudioContext.src = filePath
  //   innerAudioContext.onPlay(() => {
  //     // console.log('开始播放')
  //   })
  //   innerAudioContext.onError((res) => {
  //     console.error(res.errMsg)
  //     console.error(res.errCode)
  //   })
  // }
  //#endregion 百度语音合成


//#有道读音
var ydVedioList = [], ydVedioIndex = 0, ydPlayNext = true;
function playVoiceByYouDao(str){
  var url = "http://dict.youdao.com/dictvoice?audio=" + str;
  wx.downloadFile({
    url: url,
    success: youDaoDownload,
    fail: res => {
      console.error(res)
    },
    complete: res => {
      // console.log('开始下载第' + (vedioList.length) +'个读音');
    }
  })
}
function youDaoDownload(res) {
  // console.log('下载结束')
  ydVedioList.push(res.tempFilePath);
  if (ydVedioIndex <= ydVedioList.length) {
    ydplay(ydVedioList, ydVedioIndex);
  }
}

function ydplay(list ,index) {
  if (ydPlayNext && list.length > 0) {
    ydPlayNext = false;
    if (index < list.length) {
      // console.log('开始播放第'+index+'个读音');
      const innerAudioContext = wx.createInnerAudioContext()
      innerAudioContext.src = list[index]
      innerAudioContext.play()
      innerAudioContext.onEnded(() => {
        // console.log('播放结束')
        ydPlayNext = true;
        index++
        play()
        innerAudioContext.destroy()
      })
      innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
        //播放错误，销毁该实例
        innerAudioContext.destroy();
      })
    } else {
      ydPlayNext = true;
      vedioInindexdex = 0;
      list = [];
    }
  }
}
  function testAPI(){
    //测试百度语音合成
    initBaiduVoiceModule(); //初始化百度语音模块，此方法是异步方法，应该在游戏开始时调用而不是第一次播放声音之前
    setTimeout(playVoiceByInputText, 1000, ["小鸡 chicken run"]); //根据文本播放合成后的声音 

    //测试随机填充算法
    var arrayToFill = new Array(10); //存放单词数据的二维数组
    for(var i = 0, l1 = arrayToFill.length; i <= l1 - 1; ++i){
      arrayToFill[i] = new Array(10);
      for(var j = 0, l2 = arrayToFill[i].length; j <= l2 - 1; ++j){
        arrayToFill[i][j] = {};
      }
    }

    var allWords = new Array(3);  //存放单词对的容器
    allWords[0] = {left : {value : "apple"}, right : {value : "苹果"}};
    allWords[1] = {left : {value : "banana"}, right : {value : "香蕉"}};
    allWords[2] = {left : {value : "peach"}, right : {value : "桃子"}};

    var row = 3;  //根据单词对总数以及策划规则算出的二维数组行数
    var column = 2; //根据单词对总数以及策划规则算出的二维数组列数


    randomFill(arrayToFill, row, column, allWords); //随机将单词填入二维数组，并记录每个单词对应翻译的数组索引
    console.log(arrayToFill);
    
    for(var i = 0, l1 = row; i <= l1 - 1; ++i){ //打印测试
      for(var j = 0, l2 = column; j <= l2 - 1; ++j){
        console.log("wordData:" + arrayToFill[i][j].wordData.value + "indexX:" + arrayToFill[i][j].wordData.pairIndex.row + "indexY:" + arrayToFill[i][j].wordData.pairIndex.column) ;
      }
    }
  }
  
  module.exports = {
    newRandomFill,
    randomFill, 
    initBaiduVoiceModule, 
    playVoiceByInputText, 
    playVoiceByYouDao,
    testAPI  
  }