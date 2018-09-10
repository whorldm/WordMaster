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


var userList = [
  [{
      nickName: '不知梦',
      avatarUrl: '../../../img/1.jpeg',
      star: 1,
      level: '新手学渣'
    },{
      nickName: '漏曦',
      avatarUrl: '../../../img/2.jpeg',
      star: 1,
      level: '新手学渣'
  }],
  [{
      nickName: '鬼蜮',
      avatarUrl: '../../../img/3.jpeg',
      star: 1,
      level: '不屈学弱'
      },{
      nickName: '空心菜',
      avatarUrl: '../../../img/4.jpeg',
      star: 2,
      level: '不屈学弱'
  }],
  [{
      nickName: '一纸荒凉',
      avatarUrl: '../../../img/5.jpeg',
      star: 2,
      level: '奋进学酥'
    },{
      nickName: '凉凉😢',
      avatarUrl: '../../../img/6.jpeg',
      star: 3,
      level: '奋进学酥'
  }],
  [{
      nickName: '飞鱼',
      avatarUrl: '../../../img/7.jpeg',
      star: 2,
      level: '划水学民'
    },{
      nickName: 'Sadness',
      avatarUrl: '../../../img/5.jpeg',
      star: 3,
      level: '划水学民'
  }]
]

function RandomNumBoth(Min,Max){
  var Range = Max - Min;
  var Rand = Math.random();
  var num = Min + Math.round(Rand * Range);
  return num;
}

function matchPerson(level) {
  let matchLevel = RandomNumBoth(level, level+2);
  let flag = RandomNumBoth(0, 1);
  return userList[matchLevel][flag];
}

module.exports = {
  judeGreed,
  formatTime,
  checkParams,
  fill_zero_prefix,
  dealWordCouple,
  rebuildArr,
  matchPerson,
  RandomNumBoth
}
