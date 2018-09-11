/**
 * API接口的集成封装
 */

const config = {
  'AUTHORIZATION':{
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