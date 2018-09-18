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
  
  var showTimes = 0; 
  var lastNum = 0;

  function RandomNumBoth(Min,Max){
    var Range = Max - Min;
    var Rand = Math.random();
    let temp = Math.round(Rand * Range);
    if(lastNum === temp){
      showTimes ++;
    }
    if (showTimes > 2) {
      showTimes = 0;
      temp = Max;
    }
    lastNum = temp;
    var num = Min + temp;
    return num;
  }
  
  function matchPerson(level) {
    let matchLevel = RandomNumBoth(level, level+2);
    let flag = RandomNumBoth(0, 1);
    return userList[matchLevel][flag];
  }

  module.exports = {
    RandomNumBoth,
    matchPerson,
    userList
  }