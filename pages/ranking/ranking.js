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
    toView: 'to_',//跳到我的排名位置
    scrollTop: 0,//滚动距离顶部的距离
    levelType: 'world',//当前类型的排行
    listsHeight: '1000',//整个list的高度
    scrollHeight: '800',//滑动部分list排行榜的高度
    lists_topbar: ['学位','词量']//世界排行 是名次 学位 词量；今日排行  名次 已背单词， 错题
  },

  onLoad: function () {
    //世界排行列表展示
    this.getRankList();
    if (app.globalData.userInfo) {
      this.setData({
        userId: app.globalData.userId,
        userInfo: app.globalData.userInfo,
      })
    }
  },
  //获取排行列表
  getRankList: function (event) {
    let lists_topbar, API, levelType ;
    //判断是否是onload调用，onload调用默认为'world'
    if (event){
      levelType = event.currentTarget.dataset.type;
    }else{
      levelType = 'world';
    } 
    //设置topbar
    if(levelType == 'world'){
      lists_topbar = ['学位', '词量'];
      API = "RINKING_WORLD_LIST";
    } else if (levelType == 'today'){
      lists_topbar = ['已记单词'];
      API = "TODAY_RINKING_LIST";
    }else{
      lists_topbar = ['学位', '词量'];
      API = "";
      this.setData({
        levelList: [], //排行list
        myRanks: '',// 我的排名情况
      });
    }
    this.setData({
      lists_topbar,
      levelType,
      scrollTop: 0
    });
    let self = this;
    if(API){
      request.getDataLoading(API, { userId: app.globalData.userId }, '加载中...')
        .then(res => {
          let lists = res.rankList;
          //最后一条是自己的排名
          let myRanks;
          let len = 0;
          //中文解码，URL解码，nickname截取4个字符，
          lists.forEach(function (item, index) {
            item.nickname = decodeURI(item.nickname);
            len = self.CheckChinese(item.nickname);
            if ((item.nickname).length > len) {
              item.nickname = (item.nickname).slice(0, len) + '..';
            }
            item.weiPic = decodeURIComponent(item.weiPic);
            if (item.levelName) {
              item.levelName = item.levelName.slice(0, 2);
            } else {
              item.levelName = '无尽' + item.levelMaxId;
            }
          });
          myRanks = JSON.parse(JSON.stringify(lists[lists.length - 1]));
          //删除最后的数据（自身的排名情况）
          lists.pop();
          this.setData({
            levelList: lists,
            myRanks
          });
        })
        .catch(err => {
          console.error("获取数据失败!");
          console.log(err);
        })
    }
    
  }, 
  //判断是否为中文
  CheckChinese(str){
    let Creg = new RegExp("[\\u4E00-\\u9FFF]","g"); 
    let Ereg = new RegExp("[A-Za-z]","g");
    if (str.length < 5 ) {
      return str.length;
    }
    if (Creg.test(str)) {
      return 3;
    }else if (Ereg.test(str)){
      return 6;
    }else{
      return 5;
    }
  },
  //点击我自己，排行列表跳转到自己
  jumpTo: function(){
    this.setData({
      toView: 'to_' + this.data.myRanks.myRank
    });
  }
  
})
