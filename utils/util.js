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

// 位数不足补零
function fill_zero_prefix(num) {
  return num < 10 ? "0" + num : num
}

// 根据用户的操作时间判断得分等级
function judeGreed(second) {
  let temp = 1;
  if (second <= 3) {
    temp = 1.1;
  } else if (second <= 7) {
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
    temp.push(str1);
    temp.push(str2);
  } else {
    temp.push(str2);
    temp.push(str1);  
  }
  return temp;  
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
  judeGreed: judeGreed,
  formatTime: formatTime,
  checkParams: checkParams,
  fill_zero_prefix: fill_zero_prefix,
  dealWordCouple: dealWordCouple,
  rebuildArr: rebuildArr
}
