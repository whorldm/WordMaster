var Utils = require('../../utils/util.js');
const app = getApp();

Page({
  data: {
    windowWidth: 634,
    windowHeight: 1064,
    bgImgList: ['../../img/share_man.png', '../../img/share_woman.png']
  },

  onLoad: function (options) {
    this.setData ({
      todayWords: options.todayWords || 500,
      overPercent: options.overPercent || 89.7
    })
    // 获取设备的屏幕宽度
    wx.getSystemInfo({
      success: res => {
        this.setData({
          windowWidth: res.screenWidth,
          windowHeight: res.windowHeight
        })
      },
    });
  },

  onShow: function () {
    let random = Utils.RandomNum(0, 1);
    this.drawImage(random);
    this.drawBtn();
  },

  // 开赛前绘制分享图片
  drawImage: function (random) {
    let that = this;
    const ctx = wx.createCanvasContext('myCanvas');
    let bgImgPath = this.data.bgImgList[random];
    let titleImgPath = '../../img/title.png'

    // 绘制背景图
    ctx.drawImage(bgImgPath, 0, 0, convert(640, that), convert(1136, that));
    ctx.drawImage(titleImgPath, convert(280, that), convert(30, that), convert(305, that), convert(100, that));
    ctx.setFontSize(convert(32, that))
    ctx.setFillStyle('#F7FFDD')
    ctx.fillText("你已养成良好的学习习惯", convert(270, that), convert(230, that))
    ctx.fillText("今日消灭单词", convert(350, that), convert(295, that))

    ctx.setFontSize(convert(40, that))
    ctx.setFillStyle('#A6FF64')
    ctx.fillText(this.data.todayWords, convert(410, that), convert(340, that))

    ctx.setFontSize(convert(32, that))
    ctx.setFillStyle('#F7FFDD')
    // ctx.fillText("超过全国89.7%的玩家", convert(300, that), convert(370, that))
    ctx.draw()
  },

  // 绘制保存按钮
  drawBtn: function () {
    let that = this;
    const ctx = wx.createCanvasContext('btnCanvas');

    // 绘制背景图
    ctx.setFillStyle('#FFFA9F');
    ctx.fillRect(0, 0, that.data.windowWidth, convert(120, that))

    ctx.setFontSize(20)
    ctx.fillStyle = '#AC763C';
    ctx.setTextAlign('center');
    ctx.fillText("保存到相册", convert(376, that), convert(76, that), 300)

    ctx.draw();
  },

  // 当用户点击分享到朋友圈时，将图片保存到相册
  SaveImg: function () {
    wx.showLoading({
      title: '正在生成图片...',
    })
    wx.canvasToTempFilePath({
      canvasId: 'myCanvas',
      success: res => {
        this.setData({
          shareImgSrc: res.tempFilePath
        }, test)
      },
      fail: res => {
        console.error(res);
      }
    })

    let test = () => {
      wx.saveImageToPhotosAlbum({
        filePath: this.data.shareImgSrc,
        success(res) {
          wx.hideLoading();
          wx.showModal({
            title: '存图成功',
            content: '图片成功保存到相册了，去发圈噻~',
            showCancel: false,
            confirmText: '好哒'
          })
        }
      })
    }

  }
})

function convert(num, that) {
  return (that.data.windowWidth / 750) * num;
}