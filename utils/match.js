var userList = [
  [{
    nickName: '不知梦',
    avatarUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1538634608598&di=049bf5e6d85c0b1c4ef24f4aebee5c23&imgtype=jpg&src=http%3A%2F%2Fimg3.imgtn.bdimg.com%2Fit%2Fu%3D4001431513%2C4128677135%26fm%3D214%26gp%3D0.jpg',
    star: 1,
    level: '新手学渣'
  }, {
    nickName: '漏曦',
    avatarUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1538634637443&di=b0b3125ac1dbcddbda53c76896235a5d&imgtype=0&src=http%3A%2F%2Fimages.liqucn.com%2Fimg%2Fh1%2Fh969%2Fimg201709201545460_info300X300.jpg',
    star: 1,
    level: '新手学渣'
  }],
  [{
    nickName: '鬼蜮',
    avatarUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1538634668901&di=9d1df45af675f92cbcdbfc9399073155&imgtype=0&src=http%3A%2F%2Fimg.duoziwang.com%2F2017%2F08%2F23123283989243.jpg',
    star: 1,
    level: '不屈学弱'
  }, {
    nickName: '空心菜',
    avatarUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1538634699851&di=ead64b0137a373c187b9bba9daccdf61&imgtype=0&src=http%3A%2F%2Ftx.haiqq.com%2Fuploads%2Fallimg%2F160407%2F022Z04112-3.jpg',
    star: 2,
    level: '不屈学弱'
  }],
  [{
    nickName: '一纸荒凉',
    avatarUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1538634723707&di=67e5c9e44b124dda18da827211115197&imgtype=0&src=http%3A%2F%2Fimg.duoziwang.com%2F2016%2F11%2F24%2F16514924202.jpg',
    star: 2,
    level: '奋进学酥'
  }, {
    nickName: '凉凉😢',
    avatarUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1538634791954&di=4907afa29a303467b586531c43ab2c4c&imgtype=0&src=http%3A%2F%2F5b0988e595225.cdn.sohucs.com%2Fq_70%2Cc_zoom%2Cw_640%2Fimages%2F20180715%2F5ec90e59c20b45aeaed93722f8cfb460.jpeg',
    star: 3,
    level: '奋进学酥'
  }],
  [{
    nickName: '飞鱼',
    avatarUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1538634791953&di=af971d852d93e2894f494b4ec493190e&imgtype=0&src=http%3A%2F%2Fimg2.woyaogexing.com%2F2017%2F12%2F27%2Fe8924c875a94efa2%2521400x400_big.jpg',
    star: 2,
    level: '划水学民'
  }, {
    nickName: 'Sadness',
    avatarUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1538634791952&di=be1175fd197dd79fddd5f2f7f975db02&imgtype=0&src=http%3A%2F%2Fp0.qhimgs4.com%2Ft01f0a682159d4db41b.jpg',
    star: 3,
    level: '划水学民'
  }]
]

var showTimes = 0;
var lastNum = 0;

function RandomNumBoth(Min, Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  let temp = Math.round(Rand * Range);
  if (lastNum === temp) {
    showTimes++;
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
  let matchLevel = RandomNumBoth(level, level + 2);
  let flag = RandomNumBoth(0, 1);
  return userList[matchLevel][flag];
}

function RandomNum(Min, Max) {
  return parseInt(Math.random() * (Max - Min + 1) + Min, 10);
}

function randomPerson() {
  let random_one = RandomNum(0, 3);
  let random_two = RandomNum(0, 1);
  return userList[random_one][random_two]
}

module.exports = {
  RandomNumBoth,
  matchPerson,
  randomPerson,
  userList
}