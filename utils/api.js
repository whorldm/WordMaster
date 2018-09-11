/**
 * API接口的集成封装
 */

const config = {
  'AUTHORIZATION':{
    interFace: '/user/authorization',
    method: 'POST',
    header: {'content-type': 'application/x-www-form-urlencoded'}
  },
  'USER': {
    interFace: '/user/rank',
    method: 'GET',
    header: {'content-type': 'application/json'}
  },
  'PROMPT': {
    interFace: '/user/prompt',
    method: 'POST',
    header: {'content-type': 'application/x-www-form-urlencoded'}
  },
  'GAME': {
    interFace: '/game/join',
    method: 'POST',
    header: {'content-type': 'application/x-www-form-urlencoded'}
  },
  'GAME_OVER': {
    interFace: '/game/settlement',
    method: 'POST',
    header: {'content-type': 'application/json'}
  },
  'HOST_INFO' : {
    interFace: '/host/hostInfo',
    method: 'GET',
    header: {'content-type': 'application/json'}
  },
  'HOST_RANK': {
    interFace: '/host/hostRank',
    method: 'GET',
    header: {'content-type': 'application/json'}
  },
  'MY_HOST': {
    interFace: '/host/myHost',
    method: 'POST',
    header: {'content-type': 'application/x-www-form-urlencoded'}
  },
  'WRONG_BOOK': {
    interFace: '/wrongbook/list',
    method: 'GET',
    header: {'content-type': 'application/json'}
  },
  'WORD_LIST': {
    interFace: '/word/list',
    method: 'GET',
    header: {'content-type': 'application/json'}
  },
  'SEGMENT_LIST': {
    interFace: '/segment/listAll',
    method: 'GET',
    header: {'content-type': 'application/x-www-form-urlencoded'}
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