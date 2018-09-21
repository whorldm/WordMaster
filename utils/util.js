// 获取公有数据--key:表示要取字段的键值
function checkParams(that, app, key) {
  let temp = app.globalData[key];
  if (temp === '' || temp === undefined || temp === null) {
    if (that.data[key] !== '' && that.data[key] !== undefined && that.data[key] !== null) {
      temp = that.data[key];
    } else {
      wx.getStorage({
        key: key,
        success: res => {
          temp = res.data;
        },
      })
    }
  }
  return temp;
}

// 处理时间格式 yyyy/MM/DD hh:mm:ss
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 计算倒计时
function dateFormat(second) {
  var hr = fill_zero_prefix(Math.floor(second / 3600)); // 小时位
  var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));  // 分钟位
  var sec = fill_zero_prefix((second - hr * 3600 - min * 60));  // 秒位
  return  min + ":" + sec + " ";
}
// 位数不足补零
function fill_zero_prefix(num) {
  return num < 10 ? "0" + num : num
}

// 根据用户的操作时间判断得分等级
function judeGreed(second) {
  let temp = 1;
  if (Number(second) <= 3) {
    temp = 1.1;
  } else if (Number(second) <= 7) {
    temp = 1;
  } else {
    temp = 0.9;
  }
  return temp;
}

// 处理传入的单词对[英文,中文]
function dealWordCouple(str1, str2) {
  let reg = /^[a-zA-Z]/;
  let temp = [];
  if (reg.test(str2)) {
    temp.push(str1);
    temp.push(str2);
  } else {
    temp.push(str2);
    temp.push(str1);
  }
  return temp;  
}

// 深拷贝数组
function deepCopy(Obj) {
  var newObj;   
  if (Obj instanceof Array) {
      newObj = [];  // 创建一个空的数组
      var i = Obj.length;
      while (i--) {
          newObj[i] = deepCopy(Obj[i]);
      }
      return newObj;
  } else if (Obj instanceof Object){
      newObj = {};  // 创建一个空对象
      for (var k in Obj) {  // 为这个对象添加新的属性
          newObj[k] = deepCopy(Obj[k]);
      }
      return newObj;
  }else{
      return Obj;
  }
}

// 重构回传给后台的数组结构
function rebuildArr(str1,str2,id) {
  let reg = /^[a-zA-Z]/;
  let obj = {};
  obj.userId = id;
  if (reg.test(str1)) {
    obj.wordE = str1;
    obj.wordC = str2;
  } else {
    obj.wordE = str2;
    obj.wordC = str1;
  }
  return obj;  
}

// 动态加载字体
function loadFont() {
  if (wx.canIUse('loadFontFace')) {
    wx.loadFontFace({
      family: 'Zaozi',
      source: 'url("http://pfc6zcsy2.bkt.clouddn.com/font/title.otf")',
      success: function (res) {
        console.log("字体加载成功") //  loaded
      },
      fail: function (res) {
        console.log("字体加载失败") //  error
      }
    });
  }
}
// 动态幼圆字体
function loadYouyuanFont() {
  if (wx.canIUse('loadFontFace')) {
    wx.loadFontFace({
      family: 'YouYuan',
      source: 'url("http://pfc6zcsy2.bkt.clouddn.com/幼圆.TTF")',
      success: function (res) {
        console.log("字体加载成功") //  loaded
      },
      fail: function (res) {
        console.log("字体加载失败") //  error
      }
    });
  }
}
// 开赛倒计时
var startTimer = null;  // 开赛前的倒计时
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

// 比赛倒计时
var gameTimer = null;  // 比赛倒计时的计时器
function CountOneMinte(that) {
  clearTimeout(gameTimer);
  let temp = that.data.total_second - 1;
  that.setData({
    total_second: temp,
    gameClock: dateFormat(temp)
  })
  if (temp <= 0) {
    that.setData({
      gameClock: "00:00",
    });
    clearTimeout(gameTimer);
    if (!that.data.isGameOver) {
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

module.exports = {
  judeGreed,
  deepCopy,
  formatTime,
  dateFormat,
  checkParams,
  fill_zero_prefix,
  dealWordCouple,
  rebuildArr,
  loadFont,
  loadYouyuanFont,
  CountInThree,
  CountOneMinte
}
