var version = 0; // 音效的版本
var musicList = [{
  // 通关背景音效
  "BG_GAME_MUSIC": "http://pepuwoffw.bkt.clouddn.com/bg_game_01.mp3",
  // 考试背景音效
  "BG_EXAM_MUSIC": "http://pepuwoffw.bkt.clouddn.com/bg_exam_01.mp3",
  // 倒计时音效
  "COUNT_THREE": "http://pepuwoffw.bkt.clouddn.com/count_three_01.mp3",
  // 点击的音效
  "CLICK_MUSIC": "http://pepuwoffw.bkt.clouddn.com/click.mp3",
  // 消除成功的音效
  "SUCCESS_MUSIC": "http://pepuwoffw.bkt.clouddn.com/success1.mp3",
  // 消除错误的音效
  "ERROR_MUSIC": "http://pepuwoffw.bkt.clouddn.com/error.wav",
  // 通过的音效
  "PASS_MUSIC": "http://pepuwoffw.bkt.clouddn.com/pass_01.mp3",
  // 未通过的音效
  "UNPASS_MUSIC": "http://pepuwoffw.bkt.clouddn.com/unpass_01.mp3",
}]


function getMusicSource (_version = 0, type) {
  return musicList[_version][type];
}

// 播放成功音效
function playSuccessMusic () {
  let innerAudioContextSuccess = wx.createInnerAudioContext();
  innerAudioContextSuccess.src = getMusicSource(version,'SUCCESS_MUSIC');
  innerAudioContextSuccess.play();
  setTimeout(() => {
    innerAudioContextSuccess.destroy();
  }, 1000)
}
// 播放失败音效
function playErrorMusic () {
  let innerAudioContextError = wx.createInnerAudioContext();
  innerAudioContextError.src = getMusicSource(version, 'ERROR_MUSIC');
  innerAudioContextError.play();
  setTimeout(() => {
    innerAudioContextError.destroy();
  }, 1000)
}
// 播放点击音效
function playClickMusic () {
  let innerAudioContextClick = wx.createInnerAudioContext();
  innerAudioContextClick.src = getMusicSource(version, 'CLICK_MUSIC');
  innerAudioContextClick.play();
  setTimeout(() => {
    innerAudioContextClick.destroy();
  }, 800)
}
// 播放倒计时音效
function playCountMusic() {
  let countDownMusic = wx.createInnerAudioContext();
  countDownMusic.src = getMusicSource(version, 'COUNT_THREE');
  countDownMusic.play();
  countDownMusic.onEnded(() => {
    countDownMusic.destroy();
  })
}
// 播放未通过音效
function playUnpassMusic() {
  let examUnpassMusic = wx.createInnerAudioContext();
  examUnpassMusic.src = getMusicSource(version, 'UNPASS_MUSIC');
  examUnpassMusic.play();
  examUnpassMusic.onEnded(() => {
    examUnpassMusic.destroy();
  })
}
// 播放通过音效
function playPassMusic() {
  let examPassMusic = wx.createInnerAudioContext();
  examPassMusic.src = getMusicSource(version, 'PASS_MUSIC');
  examPassMusic.play();
  examPassMusic.onEnded(() => {
    examPassMusic.destroy();
  })
}

module.exports = {
  getMusicSource,
  playSuccessMusic,
  playErrorMusic,
  playClickMusic,
  playCountMusic,
  playUnpassMusic,
  playPassMusic
}