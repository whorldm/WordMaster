/**
 * API接口的集成封装
 */

const config = {
  'USER': {
    interFace: 'user',
    method: 'GET',
    header: {'content-type': 'application / json'}
  },
  'GAME': {
    interFace: '/game/start',
    method: 'POST',
    header: { 'content-type': 'application/x-www-form-urlencoded' }
  }
}

const searchMap = function (key) {
  for(let e in config) {
    if(e === key) {
      return config[e];
    }
  }
}


module.exports = {
  searchMap
}