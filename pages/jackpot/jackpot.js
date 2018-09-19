// pages/jackpot/jackpot.js
var startTime;
var util_request = require('../../utils/request.js');
var util_md5 = require('../../utils/wxmd5.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    jackPotScore: '',
    phone: null,
    code: null,
    timer: {
      day1: 0,
      day2: 0,
      hour1: 0,
      hour2: 0,
      minutes1: 0,
      minutes2: 0,
      second1: 0,
      second2: 0
    },
    sendCodeBtn: {
      status: false,
      text: '获取验证码'
    },
    activityEnd: false,
    show: true,
    sendBtn: {
      status: true,
      style: 'disableBtn'
    },
    showBox: false,
    waitTime: 60,
    userId: null,
    storeId: null,
    historyId: null,
    jackPotScale: {
      playerScale: 0,
      activityScale: 0,
      firstPlayerScale: 0,
      secondPlayerScale: 0,
      thirdPlayerScale: 0,
      elsePlayerScale: 0
    },
    ticketNum: '',
    rankNum: '',
    rankList: null,
    activityHistory: true
  },

  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    var activityId = options.activityId;
    var storeId = options.storeId;
    wx.getStorage({
      key: 'loginInfo',
      success: function (resInfo) {
        var userId = resInfo.data.user_id;
        self.setData({
          userId: userId,
          storeId: storeId
        })
        wx.getStorage({
          key: 'showBoxNum',
          fail: function (res) {
            self.isBindPhone();
          }
        })
        var putData = {
          userId: userId,
          id: activityId,
          storeId: storeId
        }
        getJackportLogById(putData);
      },
    })
  },

  /**
   * 活动倒计时
   */
  ShowCountDown: function (year, month, day) {
    var now = new Date();
    var endDate = new Date(year, month - 1, day);
    var leftTime = endDate.getTime() + 79200000 - now.getTime();
    var leftsecond = parseInt(leftTime / 1000);
    var day1 = Math.floor(leftsecond / (60 * 60 * 24));
    if (day1 < 10 && day1 >= 0) {
      day1 = '0' + day1;
    } else {
      day1 = '' + day1;
    }
    var hour = Math.floor((leftsecond - day1 * 24 * 60 * 60) / 3600);
    if (hour < 10) {
      hour = '0' + hour;
    } else {
      hour = '' + hour;
    }
    var minute = Math.floor((leftsecond - day1 * 24 * 60 * 60 - hour * 3600) / 60);
    if (minute < 10) {
      minute = '0' + minute
    } else {
      minute = '' + minute;
    }
    var second = Math.floor(leftsecond - day1 * 24 * 60 * 60 - hour * 3600 - minute * 60);
    if (second < 10) {
      second = '0' + second;
    } else {
      second = '' + second;
    }
    this.setData({
      timer: {
        day1: day1.slice(0, 1),
        day2: day1.slice(1, 2),
        hour1: hour.slice(0, 1),
        hour2: hour.slice(1, 2),
        minutes1: minute.slice(0, 1),
        minutes2: minute.slice(1, 2),
        second1: second.slice(0, 1),
        second2: second.slice(1, 2),
      },
      show: false
    })
    if (day1 < 0) {
      clearInterval(startTime);
      this.setData({
        activityEnd: true
      })
    }
  },

  /**
   * 跳转上一期活动页
   */
  goToBeforeRank: function () {
    var self = this;
    var userId = this.data.userId;
    var historyId = this.data.historyId;
    var storeId = this.data.storeId;
    wx.navigateTo({
      url: '../priorJackpot/priorJackpot?historyId=' + historyId + '&storeId=' + storeId + '&userId=' + userId
    })
  },

  /**
   * 判断是否绑定手机号
   */
  isBindPhone: function () {
    var self = this;
    var userId = this.data.userId;
    util_request._post('user/v1/isBindPhone', { userId: userId }, function (res) {
      if (res.data.ret_module.isBind == 0) {
        self.setData({
          showBox: true,
        })
        wx.setStorage({
          key: 'showBoxNum',
          data: '1',
        })
      } else {
        self.setData({
          showBox: false,
        })
      }
    }, function (err) {
      console.log(err);
    })
  },

  /**
   * 获取奖池记录
   */
  getJackportLogById: function (putData) {
    var self = this;
    util_request._postActivity('v1/getJackportLogById', putData, function (res) {
      var retData = res.data.ret_module;
      var dataInfo = retData.info;
      var selfrank = retData.selfrank[0];
      var activity_end_time = dataInfo.activity_end_time;
      var year = activity_end_time.slice(0, 4);
      var month = activity_end_time.slice(5, 7);
      var day = activity_end_time.slice(8, 10);
      if (selfrank == null) {
        selfrank = {
          rownum: 0,
          coupons: 0
        }
      }
      startTime = setInterval(function () { self.ShowCountDown(year, month, day); }, 1000);
      self.setData({
        jackPotScore: dataInfo.money,
        jackPotScale: {
          playerScale: dataInfo.averge_percent * 100 + '%',
          activityScale: (1 - dataInfo.averge_percent) * 100 + '%',
          firstPlayerScale: dataInfo.first_percent * 100 + '%',
          secondPlayerScale: dataInfo.second_percent * 100 + '%',
          thirdPlayerScale: dataInfo.third_percent * 100 + '%',
          elsePlayerScale: (dataInfo.averge_percent - dataInfo.first_percent - dataInfo.second_percent - dataInfo.third_percent) * 100 + '%'
        },
        rankNum: selfrank.rownum,
        ticketNum: selfrank.coupons,
        rankList: retData.rankList
      })
      if (retData.historyId == null) {
        self.setData({
          activityHistory: false
        })
      } else {
        self.setData({
          historyId: retData.historyId
        })
      }
    }, function (fail) {
      console.log(fail)
    })
  },

  /**
   * 输入手机号
   */
  inputPhone: function (e) {
    var phone = e.detail.value;
    var code = this.data.code;
    this.setData({
      phone: e.detail.value
    })
    this.setBtnUI(phone, code);
  },

  /**
   * 输入验证码
   */
  inputCode: function (e) {
    var phone = this.data.phone;
    var code = e.detail.value;
    this.setData({
      code: code
    })
    this.setBtnUI(phone, code);
  },

  /**
   * 输入正确后设置按钮UI
   */
  setBtnUI: function (phone, code) {
    if ((phone != null && phone.length == 11) && (code != null && code.code.length == 4)) {
      this.setData({
        sendBtn: {
          status: false,
          style: 'normalBtn'
        }
      })
    } else {
      this.setData({
        sendBtn: {
          status: true,
          style: 'disableBtn'
        }
      })
    }
  },

  /**
   * 校验手机格式
   */
  validatePhone: function (e) {
    var phone = e.detail.value
    var reg = /^0?1[3|4|5|7|8][0-9]\d{8}$/;
    if (phone == '') {
      wx.showToast({
        title: '请输入手机号',
        image: '/img/closeCopon.png',
        duration: 1000
      })
    } else if (!reg.test(phone)) {
      wx.showToast({
        title: '手机号输入有误',
        image: '/img/closeCopon.png',
        duration: 1000
      })
    }
  },

  /**
   * 发送验证码
   */
  sendCode: function () {
    var self = this;
    var phone = this.data.phone;
    var reg = /^0?1[3|4|5|7|8][0-9]\d{8}$/;
    if (phone == '' || phone == null) {
      wx.showToast({
        title: '请输入手机号',
        image: '/img/closeCopon.png',
        duration: 1000
      })
    } else if (!reg.test(phone)) {
      wx.showToast({
        title: '手机号输入有误',
        image: '/img/closeCopon.png',
        duration: 1000
      })
    } else {
      wx.request({
        method: 'POST',
        url: 'https://sms.dianwandashi.com/sms/sendMessage',
        data:
        JSON.stringify({
          phone: phone,
          product: "微信小程序",
          type: "0",
          time: '5'
        }),
        header: {
          'content-type': 'application/json',// 默认值
          'X-Platform-With': '3'
        },
        success: function (res) {
          wx.showModal({
            title: '提示',
            content: '验证码已发送，注意接收',
            showCancel: false
          })
          self.countDown60()
        }
      })
    }
  },

  /**
   * 发送验证码60秒
   */
  countDown60: function () {
    var self = this;
    if (this.data.waitTime == 0) {
      this.setData({
        sendCodeBtn: {
          status: false,
          text: '获取验证码'
        },
        waitTime: 60
      })
    } else {
      this.setData({
        sendCodeBtn: {
          status: true,
          text: '已发送' + this.data.waitTime
        },
        waitTime: this.data.waitTime - 1
      })

      setTimeout(function () {
        self.countDown60()
      },
        1000)
    }
  },

  /**
   * 绑定手机
   */
  bindPhone: function () {
    var self = this;
    var phone = this.data.phone;
    var code = this.data.code;
    var strMd5 = util_md5.md5(self.data.userId + ':' + phone + ':' + code)
    var putdata = {
      phone: phone,
      code: code,
      key: strMd5
    }
    util_request._post('v1/bindPhone', putdata, function (data) {
      wx.showModal({
        title: '提示',
        content: '手机号绑定成功',
        showCancel: false
      })
      self.setData({
        showBox: false,
      })
    }, function (fail) {
      console.log(fail)
    })
  },

  /**
   * 关闭输入框
   */
  closeBox: function () {
    this.setData({
      showBox: false
    })
  }
})