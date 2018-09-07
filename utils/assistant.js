//#region 随机填充算法
var maxLengthOfHandleArray = 100;
var handleArray = null;

function randomFill(arrayToFill, arrayRow, arrayColumn, allWords){
    var allWordsCount = arrayRow * arrayColumn;
    if(handleArray == null){
      handleArray = new Array(maxLengthOfHandleArray);
      for(var i = 0, l = handleArray.length; i <= l - 1; ++i){
        handleArray[i] = {row : -1, column : -1};
      }
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
    for(var i = 0, l = allWordsCount; i <= l - 1; ++i){
      var randomIndex = Math.round(maxRandomChooseIndex * Math.random());
      var whichPosition = handleArray[randomIndex];
      var elementToFill = arrayToFill[whichPosition.row][whichPosition.column];
      if(counterForAllWords % 2 === 0){ //left
        elementToFill.wordData = allWords[Math.floor(counterForAllWords / 2)].left;
        leftWordPosition = whichPosition;
      }
      else{
        elementToFill.wordData = allWords[Math.floor(counterForAllWords / 2)].right;
        var leftWord = arrayToFill[leftWordPosition.row][leftWordPosition.column].wordData;
        var rightWord = elementToFill.wordData;
        leftWord.pairIndex = {row : whichPosition.row, column : whichPosition.column};
        rightWord.pairIndex = {row : leftWordPosition.row, column : leftWordPosition.column};
      }
      handleArray[randomIndex] = handleArray[maxRandomChooseIndex];
      maxRandomChooseIndex--;
      counterForAllWords++;
    }
  }
  //#endregion 随机填充算法

  //#region 百度语音合成
  var IMEI, filePath, tokenFromBaidu;

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
  function playVoiceByInputText(text){
    var tex = encodeURI(encodeURI(text));//转换编码url_encode UTF8编码,百度要求最好转换两次
    var tok = tokenFromBaidu;
    var cuid = IMEI;
    var ctp = 1;
    var lan = "zh";    // zh表示中文
    var spd = 5;  // 表示朗读的语速，9代表最快，1是最慢（撩妹请用2，绕口令请用9）
    var url = "https://tsn.baidu.com/text2audio?tex=" + tex + "&lan=" + lan + "&cuid=" + cuid + "&ctp=" + ctp + "&tok=" + tok + "&spd=" + spd

    wx.downloadFile({
      url: url,
      success: onDownloadSuccess
    })
  }

  function onDownloadSuccess(res){
    filePath = res.tempFilePath;
    play();
  }

  function play() {
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = true
    innerAudioContext.src = filePath
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.error(res.errMsg)
      console.error(res.errCode)
    })
  }
  //#endregion 百度语音合成

  function testAPI(){
    //测试百度语音合成
    initBaiduVoiceModule(); //初始化百度语音模块，此方法是异步方法，应该在游戏开始时调用而不是第一次播放声音之前
    setTimeout(playVoiceByInputText, 1000, ["小鸡 chicken run"]); //根据文本播放合成后的声音 

    //测试随机填充算法
    var arrayToFill = new Array(100); //存放单词数据的二维数组
    for(var i = 0, l1 = arrayToFill.length; i <= l1 - 1; ++i){
      arrayToFill[i] = new Array(100);
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
    
    for(var i = 0, l1 = row; i <= l1 - 1; ++i){ //打印测试
      for(var j = 0, l2 = column; j <= l2 - 1; ++j){
        console.log("wordData:" + arrayToFill[i][j].wordData.value + "indexX:" + arrayToFill[i][j].wordData.pairIndex.row + "indexY:" + arrayToFill[i][j].wordData.pairIndex.column) ;
      }
    }
  }
  
  export {randomFill, initBaiduVoiceModule, playVoiceByInputText, testAPI}