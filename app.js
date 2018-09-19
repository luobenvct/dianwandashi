//app.js
var util_request = require('utils/request.js');

App({
  /**
   * 全局参数
   */
  globalData: {
    systemInfo: null,
    networkStatus: null,
    loginInfo: null,
    baseWapUrl: null,
    baseSmsUrl: null,
  },

  /**
   * 监听小程序初始化
   */
  onLaunch: function () {
    this.initBaseUrl();
  },

  /**
   * 初始化全局url
   */
  initBaseUrl: function () {
    if (util_request.isRelease) {
      this.globalData.baseWapUrl = 'https://wap.dianwandashi.com/';
      this.globalData.baseSmsUrl = 'https://sms.dianwandashi.com/';
    } else {
      this.globalData.baseWapUrl = 'https://wap-dev.dianwandashi.com/';
      this.globalData.baseSmsUrl = 'https://sms-dev.dianwandashi.com/';
    }
  },

  /**
   * 获取登录信息
   */
  getUserInfo: function (cb) {
    var self = this
    if (this.globalData.loginInfo) {
      typeof cb == "function" && cb(this.globalData.loginInfo)
    } else {
      self.wxLogin(cb)
    }
  },

  /**
   * 调用登录接口
   */
  wxLogin: function (cb) {
    var self = this;
    wx.login({
      success: function (logindata) {
        var code = logindata.code
        wx.getUserInfo({
          success: function (res) {
            var encryptedData = res.encryptedData;
            var iv = res.iv;
            var putdata = {
              ENCRYPTE_DATA: encryptedData,
              js_code: code,
              WX_IV: iv
            }
            self.getUserInfoByWexOpenid(putdata, code, cb)
          },
          fail(res) {
             cb(false)
          }
        })
      },
      fail: function (fail) {
        wx.showModal({
          title: '提示',
          content: '登录失败请重试',
          showCancel: false,
          success: function () {
            wx.navigateBack({
              delta: 1
            })
          }
        })
      }
    })
  },

  /**
   * 通过接口获取用户信息
   */
  getUserInfoByWexOpenid: function (putdata, code, cb) {
    var self = this;
    util_request._post('v1/getUserInfoByWexOpenid', JSON.stringify(putdata), function (data) {
      if (data.data.ret_code * 1 == 0) {
        var user_id = data.data.user_id;
        var open_id = data.data.open_id;
        var userInfo = data.data.userInfo;
        wx.setStorage({
          key: 'loginInfo',
          data: { user_id: user_id, code: code, open_id: open_id, userInfo: userInfo }
        })
        self.globalData.loginInfo = { user_id: user_id, code: code, open_id: open_id }
        typeof cb == "function" && cb(self.globalData.loginInfo)
      } else {
        wx.showModal({
          title: '提示',
          content: '登录失败请重试',
          showCancel: false,
          success: function () {
            wx.navigateBack({
              delta: 1
            })
          }
        })
      }
    }, function (fail) {
      console.log(fail)
    })
  },

  /**
   * 判断是否有网络
   */
  judgeNetwork: function (cb) {
    var self = this;
    wx.getNetworkType({
      success: function (res) {
        self.globalData.networkStatus = (res.networkType == 'none' ? false : true)
        typeof cb == "function" && cb(self.globalData.networkStatus)
      }
    })
  },

  /**
   * 获取设备信息
   */
  getSystemInfo: function (cb) {
    var self = this;
    wx.getSystemInfo({
      success: function (info) {
        self.globalData.systemInfo = info
        typeof cb == "function" && cb(self.globalData.systemInfo)
      }
    })
  },

  /**
   * 记录时间格式化
   */
  creatTime: function (time) {
    var year = time.getFullYear();
    var month = (time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : (time.getMonth() + 1);
    var day = time.getDate() < 10 ? '0' + time.getDate() : time.getDate();
    var hours = time.getHours() < 10 ? '0' + time.getHours() : time.getHours();
    var minutes = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes();
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes;
  },

   /**
   * 请求错误alert弹窗
   */
  showAlert: function (err){
    wx.showModal({
      title: '提示',
      content: err,
      showCancel: false,
    })
  },

  /**
   * 请求成功toast
   */
  showSuccToast: function(title){
    wx.showToast({
      title:title,
      icon:'none',
      duration: 1000,
      mask: true
    })
  }

})