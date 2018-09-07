var getInterface = require('./api.js');

/**
 * request请求封装
 * API {String}   接口名称
 * data {Object}  请求参数
 * message {String} 请求加载提示
 */

var RemoteAddress = "https://www.luoyunyu.com";
const getDataFromServerLoading = function (API, data = {},message) {
  wx.showNavigationBarLoading();
  if (message != '') {
    wx.showLoading({
      title: message,
    })
  }

  // 请求校验
  var checkData = {};
  // 合并对象，处理请求参数
  var params = mergeObj(checkData, data);
  // 获取接口类型
  var config = getInterface(API);

  var promise = new Promise(function (resolve, reject) {
    wx.request({
      url: RemoteAddress + config.interFace,
      data: params,
      method: config.method,
      header: config.header,
      success: function (res) {
        wx.hideNavigationBarLoading()
        if (message != '') {
          wx.hideLoading();
        }

        if (res.statusCode === 200) {
          resolve(res)
        } else {
          reject(res)
        }
      },
      fail: function (res) {
        if (message != "") {
          wx.hideLoading()
        }
        reject(res)
      }
    })
  });
  return promise;
}
// object 对象合并
function mergeObj(o1, o2) {
  for (var key in o2) {
    o1[key] = o2[key]
  }
  return o1;
}


// 带有动态加载
const getDataFromServer = (API, data = {}) => {
  this.getDataFromServer(API, data, "");
}


module.exports = {
  getData: getDataFromServer,
  getDataLoading: getDataFromServerLoading
}