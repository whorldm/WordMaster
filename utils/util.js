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
  if (reg.test(str1)) {
    temp.push(str2);
    temp.push(str1);
  } else {
    temp.push(str1);
    temp.push(str2); 
  }
  return temp;  
}

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
function rebuildArr(str1,str2) {
  let reg = /^[a-zA-Z]/;
  let obj = {};
  if (reg.test(str1)) {
    obj.wordE = str1;
    obj.wordC = str2;
  } else {
    obj.wordE = str2;
    obj.wordC = str1;
  }
  return obj;  
}

module.exports = {
  judeGreed,
  deepCopy,
  formatTime,
  dateFormat,
  checkParams,
  fill_zero_prefix,
  dealWordCouple,
  rebuildArr
}
