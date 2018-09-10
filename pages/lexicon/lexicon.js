var app = getApp();

Page({
  data: {
    winHeight: "",//窗口高度
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    rightList: [
      { wordC: '苹果', wordE: 'apple', flag: true },
      { wordC: '香蕉', wordE: 'banana', flag: true },
      { wordC: '树', wordE: 'tree', flag: true },
      { wordC: '手机', wordE: 'phone', flag: true }
    ],
    errorList: [
      { wordC: '环境', wordE: 'envirnment', flag: false },
      { wordC: '铅笔', wordE: 'pencil', flag: false },
    ],
  },
  // 监听页面加载
  onLoad: function () {
    //  高度自适应
    let clientHeight = app.globalData.windowHeight,
      clientWidth = app.globalData.windowWidth,
      rpxR = 750 / clientWidth;
    let calc = clientHeight * rpxR - 200;
    this.setData({
      winHeight: calc
    });
  },

  // 滚动切换标签样式
  switchTab: function (e) {
    this.setData({
      currentTab: e.detail.current
    });
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) { return false; }
    else {
      this.setData({
        currentTab: cur
      })
    }
  }
})