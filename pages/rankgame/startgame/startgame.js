const app = getApp();

// var mockWordList = [{ 'bed': '床' }, { 'room': '房间' }, { 'moon': '月亮' }, { 'sun': '太阳' }, { 'star': '星星' }, { 'phone': '手机' }];
var mockWordGrid = [
  [{ key: 'A', value: '床' }, { key: 'B', value: 'moon' }, { key: 'C', value: 'sun' }],
  [{ key: 'D', value: '星星' }, { key: 'E', value: 'room' }, { key: 'F', value: 'phone' }],
  [{ key: 'A', value: 'bed' }, { key: 'C', value: '太阳' }, { key: 'B', value: '月亮' }],
  [{ key: 'E', value: '房间' }, { key: 'D', value: 'star' }, { key: 'F', value: '手机' }]
] ;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isClickFlag: false, // 表示是否点击
    firstClick: '', // 第一次点击单词的坐标
    wordKey: '', // 选中单词的key值
    sucessTime: 0, // 消除成功的次数
    wordList: [],  // 获取的单词对
    wordGrid: []  // 模拟随机生成后的数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.wordRandom();
  },

  /**
   * 将单词对随机生成二维数组
   */
  wordRandom: function () {
    this.setData({
      wordGrid: mockWordGrid
    })
  },

  /**
   * 判断用户的点击操作
   */
  ClickGrid: function (e) {
    console.log(e);
    // 直接通过传入二维数组的序号来获取单词的位置
    let X = e.target.dataset.posx;
    let Y = e.target.dataset.posy;
    let Key = e.target.dataset.key;
    console.log('你所点击的模块坐标：' + X + ',' + Y);
    
    // 点击了已消除的区域
    if(Key === undefined || Key === '' || Key === null) {
      wx.showToast({
        icon: 'none',
        title: '请点击有效区域',
      })
      return;
    }
    
    // 第一次点击选中单词
    if(!this.data.isClickFlag) {
      this.setData({
        isClickFlag: true,
        firstClick: X+','+Y,
        wordKey: Key
      })
      return ;
    }

    // 重复点击一个单词，即取消刚才选中的单词
    if (this.data.firstClick === X+','+Y) {
      this.setData({
        isClickFlag: false,
        firstClick: '',
        wordKey: ''
      })
      return ;
    }

    // 第二次选择单词，判断是否正确
    if(this.data.wordKey === Key) {
      let time = this.data.sucessTime + 1;
      if (time < mockWordList.length) {
        wx.showToast({
          title: '消除成功',
        })
      } else {
        wx.showToast({
          icon: 'none',
          title: '全部消除成功，稍后重开一局',
        })
        this.wordRandom();
        this.setData({
          isClickFlag: false,
          firstClick: '',
          wordKey: ''
        })
        return;
      }
      
      let lastPosition = this.data.firstClick.split(',');
      let first = 'wordGrid['+lastPosition[1]+']['+lastPosition[0]+']';
      let second = 'wordGrid['+Y+']['+X+']';
      this.setData({
        [first]: [],
        [second]: [],
        sucessTime: time
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '消除单词失败',
      })
    }
    this.setData({
      isClickFlag: false,
      firstClick: '',
      wordKey: ''
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})