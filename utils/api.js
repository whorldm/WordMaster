/**
 * API接口的集成封装
 */

const config = {
  'AUTHORIZATION':{   // 授权登录
    interFace: '/user/authorization',
    method: 'POST'
  },
  'USER': {
    interFace: '/user/rank',
    method: 'GET'
  },
  'PROMPT': {
    interFace: '/user/prompt',
    method: 'POST'
  },
  'CHANGE_COIN': {   // 分享后增加金币
    interFace: '/user/changeCoin',
    method: 'GET'
  },
  'USER_ASSET': {
    interFace: '/user/myAsset',
    method: 'GET'
  },
  'GAME': {
    interFace: '/game/join',
    method: 'POST'
  },
  'GAME_OVER': {
    interFace: '/game/settlement',
    method: 'POST'
  },
  'HOST_INFO' : {
    interFace: '/host/hostInfo',
    method: 'GET'
  },
  'HOST_RANK': {
    interFace: '/host/hostRank',
    method: 'GET'
  },
  'MY_HOST': {
    interFace: '/host/myHost',
    method: 'POST'
  },
  'WRONG_BOOK': {
    interFace: '/wrongbook/list',
    method: 'GET'
  },
  'WORD_LIST': {
    interFace: '/word/list',
    method: 'GET'
  },
  'SEGMENT_LIST': {
    interFace: '/segment/listAll',
    method: 'GET'
  },
  'LEVEL_LIST': {
    interFace: '/user/listLevel',
    method: 'GET'
  },
  'HOME_LEVEL_LIST': {
    interFace: '/user/homeLevel',
    method: 'GET'
  },
  'RINKING_WORLD_LIST': {
    interFace: '/user/rank',
    method: 'GET'
  },
  'TODAY_RINKING_LIST': {
    interFace: '/user/todayRank',
    method: 'GET'
  },
  'WORLD_RINKING': {
    interFace: '/user/myRank',
    method: 'GET'
  },
  'MY_TODAY_RANK': {
    interFace: '/user/myTodayRank',
    method: 'GET'
  },
  'WORD_JUMPTO': {
    interFace: '/word/jumpTo',
    method: 'POST'
  },
  'JUMP_SETTLEMENT': {
    interFace: '/game/jumpSettlement',
    method: 'POST'
  },
  'BATTLE_START': {
    interFace: '/battle/start',
    method: 'POST'
  },
  'BATTLE_END': {
    interFace: '/battle/end',
    method: 'POST'
  },
  'BATTLE_JOIN': {
    interFace: '/battle/join',
    method: 'POST'
  },
  'BATTLE_HOME': {
    interFace: '/battle/index',
    method: 'GET'
  },
  'BATTLE_WORD': {  // 获取竞技场的单词
    interFace: '/word/battleWord',
    method: 'GET'
  },
  'BATTLE_TIME': { 
    interFace: '/battle/battleTime',
    method: 'POST'
  },
  'BATTLE_RANK': {  // 获取竞技排名
    interFace: '/battle/rank',
    method: 'GET'
  },
  'ROOM_NUMER': { // 获取分配的房间号
    interFace: '/room/distribution',
    method: 'GET'
  },
  'CHECK_BATTLE_ROOM': { // 检查用户是否有尚未完结房间
    interFace: '/room/selectRoomInfo',
    method: 'GET'
  },
  'ROOM_END': { // 房间结算
    interFace: '/room/end',
    method: 'POST'
  },
  'INSERT_FORMID': {  // 发送formId
    interFace: '/word/insertFormId',
    method: 'GET'
  },
  'MATCH_BEGIN': {  // 用户触发手动匹配
    interFace: '/room/match',
    method: 'GET'
  },
  'DESTORY_ROOM': {  // 销毁房间
    interFace: '/room/giveUp',
    method: 'GET'
  },
  'ROOM_START': {  // 1V1销毁房间
    interFace: '/room/start',
    method: 'GET'
  }
}

const searchMap = function (key) {
  for(let e in config) {
    if(e === key) {
      return config[e];
    }
  }
  return 'error';
}


module.exports = {
  searchMap
}