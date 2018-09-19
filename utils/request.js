import util from 'util.js';

var isRelease = false;
var baseApiUrl = isRelease ? 'https://api.dianwandashi.com' : 'https://openapi-dev.dianwandashi.com'; 
var wsUrl = isRelease ? 'wss://nettywebsocket.dianwandashi.com/ws' : 'ws://47.97.121.228:7777/ws'
var deviceApiUrl = isRelease ? 'https://deviceapi.dianwandashi.com' : 'https://deviceapi-dev.dianwandashi.com' 
var gatewayUrl = isRelease ? 'https://apigateway.dianwandashi.com' : 'https://apigateway-dev.dianwandashi.com' 
var wsIsConn = false

/**
 * 请求api接口
 * url     地址
 * success 成功的回调
 * fail    失败的回调
 */
function _post(url, data, success, fail) {
  var ur = baseApiUrl + '/apiBean/' + url;
  _basePost(ur, data, success, fail);
}

/**
 * 请求活动类接口
 * url     地址
 * success 成功的回调
 * fail    失败的回调 
 */
function _postActivity(url, data, success, fail) {
  var ur = baseApiUrl + '/activityBean/' + url;
  _basePost(ur, data, success, fail);
}

/**
 * 新微信支付
 */
function _postWxPay(url, data, success, fail) {
  var ur = baseApiUrl + '/wxPay/' + url;
  _basePost(ur, data, success, fail);
}

/**
 * deviceApi post
 */
function _postDeviceApi(url, data, success, fail) {
  var ur = deviceApiUrl + url;
  _basePost(ur, data, success, fail);
}

/**
 * gateway get
 */
function _getGatewayApi(url, data, success, fail) {
  var ur = gatewayUrl + url;
  _baseGet(ur, data, success, fail);
}

/**
 * gateway post
 */
function _postGatewayApi(url, data, success, fail) {
  var ur = gatewayUrl + url;
  _basePost(ur, data, success, fail);
}

/**
 * 基础的请求接口 post
 * url     地址
 * success 成功的回调
 * fail    失败的回调
 */
function _basePost(url, data, success, fail) {
  wx.request({
    url: url,
    header: {
      'content-type': 'application/json',
      'X-Platform-With': '3'
    },
    method: 'POST',
    data: data,
    success: function (res) {
      success(res);
    },
    fail: function (res) {
      fail(res);
    }
  });
}

/**
 * 基础的请求接口 get
 * url     地址
 * success 成功的回调
 * fail    失败的回调
 */
function _baseGet(url, data, success, fail) {
  wx.request({
    url: url,
    header: {
      'content-type': 'application/json',
      'X-Platform-With': '3'
    },
    method: 'GET',
    data: data,
    success: function (res) {
      success(res);
    },
    fail: function (res) {
      fail(res);
    }
  });
}

/**
 * 推送长连接
 */
function linkWebSocket(success) {
  if (wsIsConn) {
    wx.closeSocket()
  }
  wx.getStorage({
    key: 'loginInfo',
    success: function (res) {
      var union_id = res.data.userInfo.unionId
      wx.connectSocket({
        url: wsUrl
      })
      wx.onSocketOpen(function (res) {
        // console.log('WebSocket 已打开')
        wsIsConn = true
        wx.sendSocketMessage({
          data: union_id
        })
      })
      wx.onSocketMessage(function (res) {
        success(res)
      })
      // wx.onSocketClose(function (res) {
      //   console.log('WebSocket 已关闭')
      // })
      // wx.onSocketError(function (res) {
      //   console.log('WebSocket连接打开失败，请检查！')
      // })
    }
  })
}

module.exports = {
  isRelease: isRelease,
  _post: _post,
  _postActivity: _postActivity,
  linkWebSocket: linkWebSocket,
  _postWxPay: _postWxPay,
  _postDeviceApi: _postDeviceApi,
  _getGatewayApi: _getGatewayApi,
  _postGatewayApi: _postGatewayApi
}