//# region 随机填充算法
  var handleArray = null;

  function randomFill(arrayToFill, arrayRow, arrayColumn, allWords) {
    var allWordsCount = arrayRow * arrayColumn;
    handleArray = new Array(allWordsCount);
    for (var i = 0, l = handleArray.length; i <= l - 1; ++i) {
      handleArray[i] = {
        row: -1,
        column: -1
      };
    }

    var counterForInitHandleArray = 0;
    for (var i = 0, l1 = arrayRow; i <= l1 - 1; ++i) {
      for (var j = 0, l2 = arrayColumn; j <= l2 - 1; ++j) {
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
      if (counterForAllWords % 2 === 0) { //left
        elementToFill.wordData = allWords[Math.floor(counterForAllWords / 2)].left;
        leftWordPosition = whichPosition;
      } else {
        elementToFill.wordData = allWords[Math.floor(counterForAllWords / 2)].right;
        var leftElement = arrayToFill[leftWordPosition.row][leftWordPosition.column];
        var rightElement = elementToFill;
        leftElement.pairIndex = {
          row: whichPosition.row,
          column: whichPosition.column
        };
        leftElement.isChoose = false;
        leftElement.isClear = false;
        leftElement.isError = false;
        rightElement.pairIndex = {
          row: leftWordPosition.row,
          column: leftWordPosition.column
        };
        rightElement.isChoose = false;
        rightElement.isClear = false;
        rightElement.isError = false;
      }
      handleArray[randomIndex] = handleArray[maxRandomChooseIndex];
      maxRandomChooseIndex--;
      counterForAllWords++;
    }
  }
//# end region 随机填充算法


//# region 随机填充算法 (鹏飞版本)
  var handleArrayForLeft = null;
  var handleArrayForRight = null;

  function newRandomFillTwo(arrayToFill, arrayRow, arrayColumn, allWords) {
    var allWordsCount = arrayRow * arrayColumn;
    handleArrayForLeft = new Array(allWordsCount / 2);
    handleArrayForRight = new Array(allWordsCount / 2);
    for (var i = 0, l = allWordsCount / 2; i <= l - 1; ++i) {
      handleArrayForLeft[i] = {
        row: -1,
        column: -1
      };
      handleArrayForRight[i] = {
        row: -1,
        column: -1
      };
    }

    var counterForInitHandleArray = 0;
    var maxLeftCount = allWordsCount / 2;
    for (var i = 0, l1 = arrayRow; i <= l1 - 1; ++i) {
      for (var j = 0, l2 = arrayColumn; j <= l2 - 1; ++j) {
        if (counterForInitHandleArray < maxLeftCount) {
          handleArrayForLeft[counterForInitHandleArray].row = i;
          handleArrayForLeft[counterForInitHandleArray].column = j;
        } else {
          handleArrayForRight[counterForInitHandleArray - maxLeftCount].row = i;
          handleArrayForRight[counterForInitHandleArray - maxLeftCount].column = j;
        }
        counterForInitHandleArray++;
      }
    }

    var maxRandomChooseIndexLeft = allWordsCount / 2 - 1;
    var maxRandomChooseIndexRight = allWordsCount / 2 - 1;
    var counterForAllWords = 0;
    var leftWordPosition;
    for (var i = 0, l = allWordsCount; i <= l - 1; ++i) {
      if (counterForAllWords % 2 === 0) { //left
        var randomIndex = Math.round(maxRandomChooseIndexLeft * Math.random());
        var whichPosition = handleArrayForLeft[randomIndex];
        var elementToFill = arrayToFill[whichPosition.row][whichPosition.column];
        elementToFill.wordData = allWords[Math.floor(counterForAllWords / 2)].left;
        leftWordPosition = whichPosition;
        handleArrayForLeft[randomIndex] = handleArrayForLeft[maxRandomChooseIndexLeft];
        maxRandomChooseIndexLeft--;
      } else {
        var randomIndex = Math.round(maxRandomChooseIndexRight * Math.random());
        var whichPosition = handleArrayForRight[randomIndex];
        var elementToFill = arrayToFill[whichPosition.row][whichPosition.column];
        elementToFill.wordData = allWords[Math.floor(counterForAllWords / 2)].right;
        var leftElement = arrayToFill[leftWordPosition.row][leftWordPosition.column];
        var rightElement = elementToFill;
        leftElement.pairIndex = {
          row: whichPosition.row,
          column: whichPosition.column
        };
        leftElement.isChoose = false;
        leftElement.isClear = false;
        leftElement.isError = false;
        rightElement.pairIndex = {
          row: leftWordPosition.row,
          column: leftWordPosition.column
        };
        rightElement.isChoose = false;
        rightElement.isClear = false;
        rightElement.isError = false;
        handleArrayForRight[randomIndex] = handleArrayForRight[maxRandomChooseIndexRight];
        maxRandomChooseIndexRight--;
      }

      counterForAllWords++;
    }
  }
//# end region 随机填充算法

//# region 随机填充算法 (上下对称排列)
  var tempArray = null;

  function newRandomFill(arrayToFill, arrayRow, arrayColumn, allWords) {
    var allWordsCount = arrayRow * arrayColumn;
    tempArray = new Array(allWordsCount);
    for (let i = 0, l = tempArray.length; i <= l - 1; ++i) {
      tempArray[i] = {
        row: -1,
        column: -1
      };
    }

    var counterForInitHandleArray = 0;
    for (let i = 0, l1 = arrayRow; i <= l1 - 1; ++i) {
      for (let j = 0, l2 = arrayColumn; j <= l2 - 1; ++j) {
        tempArray[counterForInitHandleArray].row = i;
        tempArray[counterForInitHandleArray].column = j;
        counterForInitHandleArray++;
      }
    }

    let en_RandomList = randNum2(-1, 5, 6); // 0~5的随机序号数组
    let en_RandomIndex;
    let en_Position;
    let en_Element;

    let ch_RandomList = randNum2(-1, 5, 6); // 0~5的随机序号数组
    let ch_RandomIndex;
    let ch_Position;
    let ch_Element;

    for (let i = 0; i <= 5; ++i) {
      en_RandomIndex = en_RandomList[i];
      ch_RandomIndex = ch_RandomList[i];

      en_Position = tempArray[en_RandomIndex];
      ch_Position = tempArray[ch_RandomIndex + 6];

      ch_Element = arrayToFill[ch_Position.row][ch_Position.column];
      ch_Element.wordData = allWords[ch_RandomIndex].right;
      ch_Element.pairIndex = en_Position;
      ch_Element.isChoose = false;
      ch_Element.isClear = false;
      ch_Element.isError = false;

      en_Element = arrayToFill[en_Position.row][en_Position.column];
      en_Element.wordData = allWords[ch_RandomIndex].left;
      en_Element.pairIndex = ch_Position;
      en_Element.isChoose = false;
      en_Element.isClear = false;
      en_Element.isError = false;
    }
  }

  function randNum2(min, max, num) {
    if (num > max - min) {
      console.error('范围太小');
      return false;
    }

    var range = max - min,
      minV = min + 1, //实际上可以取的最小值
      arr = [],
      tmp = "";

    function GenerateANum(i) {
      for (i; i < num; i++) {
        var rand = Math.random(); //  rand >=0  && rand < 1
        tmp = Math.floor(rand * range + minV);
        if (arr.indexOf(tmp) == -1) {
          arr.push(tmp)
        } else {
          GenerateANum(i);
          break;
        }
      }
    }
    GenerateANum(0); //默认从0开始
    return arr;
  }
//# end region 随机填充算法


//# region 单词中英交叉排布（英文和中文没行交叉排列，行内为随机排列）
  function newRandomThree(arrayToFill, arrayRow, arrayColumn, allWords) {
    // 初始化数组
    let allWordsCount = arrayRow * arrayColumn;
    let ArrayContainer = new Array(allWordsCount);
    for (let i = 0, l = ArrayContainer.length; i <= l - 1; ++i) {
      ArrayContainer[i] = {
        row: -1,
        column: -1
      };
    }

    var counterForInitHandleArray = 0;
    for (let i = 0, l1 = arrayRow; i <= l1 - 1; ++i) {
      for (let j = 0, l2 = arrayColumn; j <= l2 - 1; ++j) {
        ArrayContainer[counterForInitHandleArray].row = i;
        ArrayContainer[counterForInitHandleArray].column = j;
        counterForInitHandleArray++;
      }
    }

    let topArray = allWords.slice(0, 3); // 上方的单词数组
    let bottomArray = allWords.slice(3); // 下方的单词数组

    setPosition(arrayToFill, ArrayContainer, topArray, 0);
    setPosition(arrayToFill, ArrayContainer, bottomArray, 6);
  }

  function setPosition(arrayToFill, array, allWords ,lineIndex) {
    let en_RandomList = randNum2(-1, 2, 3); // 0~2的随机序号数组
    let en_RandomIndex;
    let en_Position;
    let en_Element;

    let ch_RandomList = randNum2(-1, 2, 3); // 0~2的随机序号数组
    let ch_RandomIndex;
    let ch_Position;
    let ch_Element;

    for (let i = 0; i <= 2; ++i) {
      en_RandomIndex = en_RandomList[i];
      ch_RandomIndex = ch_RandomList[i];

      en_Position = array[en_RandomIndex + lineIndex];
      ch_Position = array[ch_RandomIndex + 3 + lineIndex];

      ch_Element = arrayToFill[ch_Position.row][ch_Position.column];
      ch_Element.wordData = allWords[ch_RandomIndex].right;
      ch_Element.pairIndex = en_Position;
      ch_Element.isChoose = false;
      ch_Element.isClear = false;
      ch_Element.isError = false;

      en_Element = arrayToFill[en_Position.row][en_Position.column];
      en_Element.wordData = allWords[ch_RandomIndex].left;
      en_Element.pairIndex = ch_Position;
      en_Element.isChoose = false;
      en_Element.isClear = false;
      en_Element.isError = false;
    }
  }
//# end region 单词中英交叉排布


//#region 百度语音合成
  var IMEI, tokenFromBaidu;
  var filePath;
  var vedioIndex = 0;
  var vedioList = [];
  var canPlayNext = true;

  //初始化百度语音合成模块
  function initBaiduVoiceModule() {
    wx.getSystemInfo({
      success: onGetSystemInfoSuccess
    })
  }

  function onGetSystemInfoSuccess(res) {
    IMEI = res.SDKVersion;
    getBaiduVoiceToken();
  }

  function getBaiduVoiceToken() {
    let grant_type = "client_credentials";
    let appKey = "yGyEqOOj3RIHPWQ9fc6akgju"; //百度应用Key
    let appSecret = "07cXQ5BHEMIyOrOib1v7EsGPqeDrQr2o"; //百度应用密钥
    let url = "https://openapi.baidu.com/oauth/2.0/token"; //获取token的地址

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
  function playVoiceByInputText(text, spd = 5) {
    var tex = encodeURI(encodeURI(text)); //转换编码url_encode UTF8编码,百度要求最好转换两次
    var tok = tokenFromBaidu;
    var cuid = IMEI;
    var ctp = 1;
    var pit = 8;
    var lan = "zh";   // zh表示中文
    var url = "https://tsn.baidu.com/text2audio?tex=" + tex + "&lan=" + lan + "&cuid=" + cuid + "&ctp=" + ctp + "&tok=" + tok + "&per=" + 0 + "&spd=" + spd + "&pit=" + pit + "&vol=" + 15;

    wx.downloadFile({
      url: url,
      success: onDownloadSuccess,
      fail: res => {
        console.error(res)
      }
    })
  }

  // v1.2
  function onDownloadSuccess(res) {
    vedioList.unshift(res.tempFilePath);
    if (vedioList.length > 0) {
      MusicPlay();
    }
  }

  function MusicPlay() {
    // console.log('-----开始执行播放函数-----')
    // console.log(canPlayNext)
    if (canPlayNext && vedioList.length > 0) {
      canPlayNext = false;
      let innerAudioContextRead = wx.createInnerAudioContext();
      innerAudioContextRead.volume = 1;
      innerAudioContextRead.src = vedioList.pop();
      innerAudioContextRead.play();

      //监听开始播放，并且在500ms后自动播放下一个（为了处理某些机型无法监听到onEnded事件）
      innerAudioContextRead.onPlay(function () {
        // console.log('开始播放')
        setTimeout(() => {
          canPlayNext = true;
          innerAudioContextRead.destroy();
          MusicPlay();
        }, 700)
      })

      //当前读音已播放完毕，接着播放下一个
      // innerAudioContextRead.onEnded(function(){
      //   console.log('播放结束')
      //   canPlayNext = true;
      //   innerAudioContextRead.destroy();
      //   MusicPlay();
      // })

      //播放错误，销毁该实例
      innerAudioContextRead.onError(function(res){
        console.log(res.errMsg)
        console.log(res.errCode)
        innerAudioContextRead.destroy();
      })
    }
  }
//#end region 百度语音合成


// ### 有道读音（只读英文） ###
  function playVoiceByYouDao(text) {
    let Text_Str = text.split(' ');
    var url = "https://dict.youdao.com/dictvoice?audio=" + Text_Str[1];

    wx.downloadFile({
      url: url,
      success: (res) => {
        // console.log('进入到成功的回调函数',res)
        if(res.statusCode === 200) {
          // console.log('下载成功')
          vedioList.unshift(res.tempFilePath);
          // console.log(vedioList);
          if (vedioList.length > 0) {
            MusicPlay();
          }
        }
      },
      fail: (err) => {
        console.log('进入到失败的回调函数', err)
      }
    })
  }
// ### 有道读音 ###


//### 讯飞语音合成 ###
  import md5 from './md5.js'
  function playVoiceByXunFei (TextString) {
    let params = {
      "auf": "audio/L16;rate=16000",
      "aue": "raw",
      "voice_name": "xiaoyan",
      "speed": "50",
      "volume": "50",
      "pitch": "50",
      "engine_type": "intp65",
      "text_type": "text"
    }; 
    let APPID = "5bcfd3e8";
    let curTime = Math.floor((new Date()).getTime() / 1000);
    let paramBase64 = "eyJhdWYiOiAiYXVkaW8vTDE2O3JhdGU9MTYwMDAiLCJhdWUiOiAicmF3Iiwidm9pY2VfbmFtZSI6ICJ4aWFveWFuIiwic3BlZWQiOiAiNTAiLCJ2b2x1bWUiOiAiNTAiLCJwaXRjaCI6ICI1MCIsImVuZ2luZV90eXBlIjogImludHA2NSIsInRleHRfdHlwZSI6ICJ0ZXh0In0=";
    let checkSum = md5(APPID + curTime + paramBase64);
    
    wx.request({
      url: 'https://api.xfyun.cn/v1/service/v1/tts',
      method: 'POST',
      data: {
        text: TextString
      },
      header: {
        'X-CurTime': curTime,
        'X-Param': paramBase64,
        'X-Appid': APPID,
        'X-CheckSum': checkSum,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: (res) => {
        console.log(res)
        if (res.header['Content-type'] === "audio/mpeg") {
          console.log(res);
        } else {
          console.log('合成失败')
        }
      },
      fail: (err) => {
        console.error(err)
      }
      
    })
  }
//### 讯飞语音合成 ###



function testAPI() {
  //测试百度语音合成
  initBaiduVoiceModule(); //初始化百度语音模块，此方法是异步方法，应该在游戏开始时调用而不是第一次播放声音之前
  setTimeout(playVoiceByInputText, 1000, ["出租车 taxi"]); //根据文本播放合成后的声音 

  //测试随机填充算法
  var row = 4; //根据单词对总数以及策划规则算出的二维数组行数
  var column = 3; //根据单词对总数以及策划规则算出的二维数组列数

  var arrayToFill = new Array(row); //存放单词数据的二维数组
  for (var i = 0, l1 = arrayToFill.length; i <= l1 - 1; ++i) {
    arrayToFill[i] = new Array(column);
    for (var j = 0, l2 = arrayToFill[i].length; j <= l2 - 1; ++j) {
      arrayToFill[i][j] = {};
    }
  }

  var allWords = new Array(); //存放单词对的容器
  allWords[0] = {
    left: {
      value: "apple"
    },
    right: {
      value: "苹果"
    }
  };
  allWords[1] = {
    left: {
      value: "banana"
    },
    right: {
      value: "香蕉"
    }
  };
  allWords[2] = {
    left: {
      value: "peach"
    },
    right: {
      value: "桃子"
    }
  };
  allWords[3] = {
    left: {
      value: 'phone'
    },
    right: {
      value: "手机"
    }
  };
  allWords[4] = {
    left: {
      value: 'star'
    },
    right: {
      value: "星星"
    }
  };
  allWords[5] = {
    left: {
      value: 'sun'
    },
    right: {
      value: "太阳"
    }
  };

  newRandomThree(arrayToFill, row, column, allWords); //随机将单词填入二维数组，并记录每个单词对应翻译的数组索引
  console.log(arrayToFill);

  for (var i = 0, l1 = row; i <= l1 - 1; ++i) { //打印测试
    for (var j = 0, l2 = column; j <= l2 - 1; ++j) {
      console.log("wordData:" + arrayToFill[i][j].wordData.value + "pairIndex:" + arrayToFill[i][j].pairIndex);
    }
  }
}

module.exports = {
  randomFill: newRandomFill,
  // randomFill: newRandomThree,
  initBaiduVoiceModule,
  // playVoiceByInputText,
  playVoiceByInputText: playVoiceByYouDao,
  playVoiceByXunFei,
  // playVoiceByYouDao,
  testAPI
}