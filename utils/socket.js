const callback = () => { };
const WSS = "ws://172.20.120.79:8088/websocketRoom/";
const initSocket = (option = {}) => {
  const { websocket_url } = option;
  const socketTask = wx.connectSocket({
    url: WSS + websocket_url,
    success: function (res) {
      console.log(res);
    },
    fail: function (fail) {
      console.log(fail);
    }
  });
  // 发送token
  wx.onSocketOpen(function () {
    console.log('连接成功'); 
    // wx.sendSocketMessage({
    //   data: websocket_token,
    // })
  })
  wx.onSocketClose(function () {
    console.log('连接关闭');
    // wx.sendSocketMessage({
    //   data: websocket_token,
    // })
  })
  wx.onSocketError(function (res) {
    console.log('WebSocket连接打开失败，请检查！', res)
  })
  // 接收推送
  return socketTask;
}

function resiverMessage(context) {
  wx.onSocketMessage(function (data) {
    try {
      context.onMessage(JSON.parse(data.data)) //这里定义一个onMessage方法，用于每个页面的回调
    } catch (e) {
      console.log(e);
    }
  })
}
module.exports = {
  initSocket,
  resiverMessage
}