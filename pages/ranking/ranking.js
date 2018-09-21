const app = getApp()
var request = require("../../utils/request.js");
var utils = require("../../utils/util.js");

Page({
  data: {
    userId: '',    
    userInfo: {},
    levelName: '', //用户的等级的名称
    levelId: '', //用户的等级的ID
    levelList: [], //排行list
    myRanks: '',// 我的排名情况
    levelType: 'score',//当前类型的排行
    listsHeight: '1000',//整个list的高度
    scrollHeight: '800',//滑动部分list排行榜的高度
  },

  onLoad: function () {
    //this.getWorldRank();
    //this.loadFontFace();
    if (app.globalData.userInfo) {
      this.setData({
        userId: app.globalData.userId,
        userInfo: app.globalData.userInfo,
      })
    }
    utils.loadFont();
    utils.loadYouyuanFont();
  },
  //获取连消排行
  getScoreRank: function() {
    //初始化levelList myRanks
    this.setData({
        levelList: {}, 
        myRanks: ''
      });
    // request.getData("RINKING_SCORE_LIST", { userId: app.globalData.userId })
    // .then(res => {
    //   let lists = res.list;
    
    //   this.setData({
    //     levelList: lists, 
    //     levelType: 'score',
    //     levelNum: this.levelNum + lists
    //   });
    // })
    // .catch(err => {
    //   console.error("获取数据失败！")
    //   console.log(err);
    // })
  },
  //获取好友排行
  getFriendsRank: function () {
    this.setData({
      levelList: {},
      myRanks: ''
    });
    // request.getDataLoading("FRIENDS_SCORE_LIST", { userId: app.globalData.userId })
    //   .then(res => {
    //     let lists = res.list;
      
    //     this.setData({
    //       levelList: lists,
    //       levelType: 'friends',
    //     });
    //   })
    //   .catch(err => {
    //     console.error("获取数据失败！");
    //     console.log(err);
    //   })
  },
  //获取世界排行
  getWorldRank: function () {
    //获取自己在世界的排行
    this.getMyRank();
    request.getData("RINKING_WORLD_LIST")
      .then(res => {
        let lists = res.worldRank;
        //中文解码，URL解码，nickname截取6个字符，
        lists.forEach(function(item,index){
          item.nickname = decodeURI(item.nickname);
          if((item.nickname).length>6){
            item.nickname = (item.nickname).slice(0,6)+'..';
          }
          item.weiPic = decodeURIComponent(item.weiPic);
          if (item.levelName){
            item.levelName = item.levelName.slice(0, 2);
          }else{
            item.levelName = '';
          }
        });
        this.setData({
          levelList: lists
        });
      })
      .catch(err => {
        console.error("获取数据失败!");
        console.log(err);
      })
  },
  //获取我的排名情况
  getMyRank: function () {
    request.getData("MY_RINKING", { userId: app.globalData.userId})
    .then(res => {
          let item = res.myRank;
          item.nickname = decodeURI(item.nickname);
          if ((item.nickname).length > 6) {
            item.nickname = (item.nickname).slice(0, 6) + '...';
          }
          item.weiPic = decodeURIComponent(item.weiPic);
          if (item.levelName) {
            item.levelName = item.levelName.slice(0, 2);
          } else {
            item.levelName = '';
          }
          
        this.setData({
          myRanks: JSON.parse(JSON.stringify(item))
        });
      })
      .catch(err => {
        console.error("获取数据失败!");
        console.log(err);
      })
  },

  //字体下载
  // loadFontFace: function () {
  //   const self = this
  //   wx.loadFontFace({
  //     family: this.data.fontFamily,
  //     source: 'url("http://pfc6zcsy2.bkt.clouddn.com/幼圆.TTF")',
  //     success(res) {
  //       console.log(res.status)
  //       self.setData({ loaded: true })
  //     },
  //     fail: function (res) {
  //       console.log(res.status)
  //     },
  //     complete: function (res) {
  //       console.log(res.status)
  //     }
  //   });
  // },
})
