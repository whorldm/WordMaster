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
  var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60)); // 分钟位
  var sec = fill_zero_prefix((second - hr * 3600 - min * 60)); // 秒位
  return min + ":" + sec + " ";
}
// 位数不足补零
function fill_zero_prefix(num) {
  return num < 10 ? "0" + num : num
}

// 计算倒计时的时间差
function completeTime (endTime) {
  if (endTime === '') {
    return -1;
  }
  let now = new Date().getTime();
  let end = new Date(endTime.replace(/\-/g, '/')).getTime();
  return parseInt((end - now)/1000);
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
    newObj = []; // 创建一个空的数组
    var i = Obj.length;
    while (i--) {
      newObj[i] = deepCopy(Obj[i]);
    }
    return newObj;
  } else if (Obj instanceof Object) {
    newObj = {}; // 创建一个空对象
    for (var k in Obj) { // 为这个对象添加新的属性
      newObj[k] = deepCopy(Obj[k]);
    }
    return newObj;
  } else {
    return Obj;
  }
}

// 重构回传给后台的数组结构
function rebuildArr(str1, str2, id, target) {
  let reg = /^[a-zA-Z]/;
  let obj = {};
  obj.userId = id;
  obj.isRepeat = false;
  if (reg.test(str1)) {
    obj.wordE = str1;
    obj.wordC = str2;
  } else {
    obj.wordE = str2;
    obj.wordC = str1;
  }
  for (let i = 0; i < target.length; i++) {
    if (obj.wordE === target[i].wordE) {
      obj.isRepeat = true;
      break;
    }
  }
  return obj;
}

// 动态加载字体
function loadFont() {
  wx.getSystemInfo({
    success: res => {
      if (res.model.indexOf('iPhone') > -1) {
        console.log('下载iphone')
        loadIphoneFont();
      } else {
        console.log('下载Andoid')
        loadAndoidFont()
      }
    }
  })
}

// 下载iphone字体包
function loadIphoneFont() {
  if (wx.canIUse('loadFontFace')) {
    wx.loadFontFace({
      family: 'Zaozi',
      source: 'url("https://tp5.rock520.com/static/css/XinQingNianTi.ttf")',
      success: function (res) {
        console.log(res)
        console.log("字体加载成功") //  loaded
      },
      fail: function (res) {
        console.log("字体加载失败") //  error
      }
    });
  } else {
    console.log('不支持下载字体')
  }
}
// 下载安卓字体包
function loadAndoidFont() {
  if (wx.canIUse('loadFontFace')) {
    wx.loadFontFace({
      family: 'Zaozi',
      source: 'url("http://pfc6zcsy2.bkt.clouddn.com/font/XinQingNianTi.ttf")',
      success: function (res) {
        console.log(res)
        console.log("字体加载成功") //  loaded
      },
      fail: function (res) {
        console.log("字体加载失败") //  error
      }
    });
  } else {
    console.log('不支持下载字体')
  }
}

// 分享文案
var shareMsgLst = [
  "最好玩的单词游戏，我菜鸟英语也能上瘾",
  "震惊！单词游戏毒到爆肝，居然停不下来",
  "我朋友做的游戏，请帮忙转发一下，提点意见，谢谢🙏"
]

var shareImgList = [
  'http://cdn.tik.com/wordmaster/image/share_share_logo_one.png',
  'http://cdn.tik.com/wordmaster/image/share_share_logo_two.png',
  'http://cdn.tik.com/wordmaster/image/share_share_logo_three.png'
]

function shareMsg(isGameOver) {
  let titelIndex;
  if (isGameOver) {
    titelIndex = RandomNum(0, 2);
  } else {
    titelIndex = RandomNum(0, 2);
  }
  let imgIndex = RandomNum(1, 2);

  return {
    title: shareMsgLst[titelIndex],
    path: '/pages/homepage/homepage',
    imageUrl: shareImgList[imgIndex]
  }
}

function RandomNum(Min, Max) {
  return parseInt(Math.random() * (Max - Min + 1) + Min, 10);
}

// 节流抖动函数
function throttle(fn, gapTime) {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 1500
  }
  let _lastTime = null // 返回新的函数    
  return function () {        
    let _nowTime = + new Date()        
    if (_nowTime - _lastTime > gapTime || !_lastTime) {            
      fn.apply(this, arguments)   //将this和参数传给原函数            
      _lastTime = _nowTime        
    }    
  }
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
    RandomNum,
    shareMsg,
    throttle,
    completeTime
  }