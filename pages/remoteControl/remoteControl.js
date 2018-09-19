// pages/remoteControl/remoteControl.js
var util_request = require('../../utils/request.js');
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modeList: ['舒缓模式', '强力按摩', '拉伸模式', '睡眠模式', '肩部模式', '腰部模式'],
    modeName: '舒缓模式',
    modeIndex: 0,
    gasbag: 2,
    gasbagImage: '/img/remote_gasbag_nor.png',
    shock: 2,
    shockImage: '/img/remote_shock_nor.png',
    power: 1,
    lazyback: 1,
    deviceNo: null,
    countDownMinute: '00',
    countDownSecond: '00',
    start: true,
    background: 'url(https://metadata.dianwandashi.com/remote_ctrl_bg.png) no-repeat center',
    startPauseImg: '/img/remote_control_pause.png',
    interval: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.model_name
    })
    this.setData({
      deviceNo: options.device_no
    })
  },

  onShow: function () {
    clearInterval(this.data.interval)
    this.getEndtime()
  },

  onUnload: function () {
    clearInterval(this.data.interval)
  },

  getEndtime: function () {
    var self = this;
    wx.getStorage({
      key: 'endTime',
      success: function (res) {
        self.countDown(res.data)
      },
    })
  },

  countDown: function (endTime) {
    var nowTime = Date.parse(new Date())
    var totalSecond = (endTime - nowTime) / 1000

    var interval = setInterval(function () {
      // 秒数
      var second = totalSecond;

      // 天数位
      var day = Math.floor(second / 3600 / 24);
      var dayStr = day.toString();
      if (dayStr.length == 1) dayStr = '0' + dayStr;

      // 小时位
      var hr = Math.floor((second - day * 3600 * 24) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;

      // 分钟位
      var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;

      // 秒位
      var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr;

      this.setData({
        countDownMinute: minStr,
        countDownSecond: secStr,
      });
      totalSecond--;
      if (totalSecond < 0) {
        clearInterval(interval);
        wx.navigateBack({
          delta: 1
        })
        this.setData({
          countDownMinute: '00',
          countDownSecond: '00',
        });
      }
    }.bind(this), 1000);
    this.setData({ interval: interval})
  },

  chairControl: function (putData) {
    putData['deviceNo'] = this.data.deviceNo;
    util_request._postDeviceApi('/v1/netty/chairControl', putData, function (res) {
      if (res.data.code * 1 == 0) {
        console.log(res)
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.msg,
          showCancel: false,
        })
      }
    }, function (res) {
      console.log(res)
    })
  },

  modeLeft: function () {
    if (this.data.start) {
      if (this.data.modeIndex > 0) {
        this.setData({
          modeIndex: this.data.modeIndex - 1,
        })
        this.setData({
          modeName: this.data.modeList[this.data.modeIndex]
        })
        this.chairControl({ autoState: this.data.modeIndex + 1 })
      }
    }
  },

  modeRight: function () {
    if (this.data.start) {
      if (this.data.modeIndex < this.data.modeList.length-1) {
        this.setData({
          modeIndex: this.data.modeIndex + 1,
        })
        this.setData({
          modeName: this.data.modeList[this.data.modeIndex]
        })
        this.chairControl({ autoState: this.data.modeIndex + 1 })
      }
    }
  },

  gasbag: function () {
    if (this.data.start) {
      if (this.data.gasbag == 2) {
        this.setData({
          gasbag: 1,
          gasbagImage: '/img/remote_gasbag_sel.png'
        })
      } else {
        this.setData({
          gasbag: 2,
          gasbagImage: '/img/remote_gasbag_nor.png'
        })
      }
      this.chairControl({ gasbag: this.data.gasbag })
    }
  },

  shock: function () {
    if (this.data.start) {
      if (this.data.shock == 2) {
        this.setData({
          shock: 1,
          shockImage: '/img/remote_shock_sel.png'
        })
      } else {
        this.setData({
          shock: 2,
          shockImage: '/img/remote_shock_nor.png'
        })
      }
      this.chairControl({ shake: this.data.shock })
    }
  },

  startPause: function () {
    if (this.data.start) {
      this.setData({
        start: false,
        startPauseImg: '/img/remote_control_start.png'
      })
      this.chairControl({ autoState: 's' })
    } else {
      this.setData({
        start: true,
        startPauseImg: '/img/remote_control_pause.png'
      })
      this.chairControl({ autoState: this.data.modeIndex + 1 })
    }
  },

  lazybackPlus: function () {
    if (this.data.start) {
      if (this.data.lazyback < 7) {
        var lazyback = this.data.lazyback + 1
        this.setData({
          lazyback: lazyback
        })
        var res = util.convert(lazyback);
        this.chairControl({ lazyback: res })
      }
    }
  },

  lazybackPlusTouch: function () {
    if (this.data.start) {
      this.setData({
        background: 'url(https://metadata.dianwandashi.com/remote_lazyback_plus.png) no-repeat center'
      })
    }
  },

  lazybackSub: function () {
    if (this.data.start) {
      if (this.data.lazyback > 1) {
        var lazyback = this.data.lazyback - 1
        this.setData({
          lazyback: lazyback
        })
        var res = util.convert(lazyback);
        this.chairControl({ lazyback: res })
      }
    }
  },

  lazybackSubTouch: function () {
    if (this.data.start) {
      this.setData({
        background: 'url(https://metadata.dianwandashi.com/remote_lazyback_sub.png) no-repeat center'
      })
    }
  },

  powerPlus: function () {
    if (this.data.start) {
      if (this.data.power < 6) {
        var power = this.data.power + 1
        this.setData({
          power: power
        })
        this.chairControl({ power: power })
      }
    }
  },

  powerPlusTouch: function () {
    if (this.data.start) {
      this.setData({
        background: 'url(https://metadata.dianwandashi.com/remote_power_plus.png) no-repeat center'
      })
    }
  },

  powerSub: function () {
    if (this.data.start) {
      if (this.data.power > 1) {
        var power = this.data.power - 1
        this.setData({
          power: power
        })
        this.chairControl({ power: power })
      }
    }
  },

  powerSubTouch: function () {
    if (this.data.start) {
      this.setData({
        background: 'url(https://metadata.dianwandashi.com/remote_power_sub.png) no-repeat center'
      })
    }
  },

  resetBackImg: function () {
    this.setData({
      background: 'url(https://metadata.dianwandashi.com/remote_ctrl_bg.png) no-repeat center'
    })
  },

})