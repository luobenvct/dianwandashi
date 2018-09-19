// pages/shareAward/shareAward.js
var QR = require("../../utils/qrcode.js");
var util_request = require('../../utils/request.js');
var acceptShare = getApp().globalData.baseWapUrl + 'share';
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: null,
    activityId: null,
    storeId: null,
    wheight: 0,
    maskHidden: true,
    imagePath: '',
    placeholder: 'https://wap.dianwandashi.com/',//默认url地址
    shareEvery: {
      showShareCoins: false,
      showLimitCoins: false,
      coins: 0,
      limitCoins: 0
    },
    shareNewUser: {
      showNewUser: false,
      coins: 0,
      sharetype: 0
    },
    newUserRecharge: {
      showThis: false,
      returnMoney: 0,
      day: null
    },
    activityFinish: false
  },

  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    var activityId = options.activity_id;
    app.getSystemInfo(function (systemInfo) {
      self.setData({
        wheight: systemInfo.windowHeight
      })
    })
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var userId = res.data.user_id;
        self.setData({
          userId: userId,
          activityId: activityId,
          placeholder: acceptShare + '?activity_id=' + activityId + '&user_id=' + userId
        })
        self.getActivyInfo()
      }
    })
  },

  /**
   * 监听页面初次渲染完成
   */
  onReady: function () {
    var size = this.setCanvasSize();
    var initUrl = this.data.placeholder;
    this.createQrCode(initUrl, "mycanvas", size.w, size.h);
  },

  /**
   * 设置canvas长宽
   */
  setCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 206;
      var width = res.windowWidth / scale;
      var height = width;
      size.w = width;
      size.h = height;
    } catch (e) {
      console.log("获取设备信息失败" + e);
    }
    return size;
  },

  /**
   * 创建二维码
   */
  createQrCode: function (url, canvasId, cavW, cavH) {
    QR.qrApi.draw(url, canvasId, cavW, cavH);

  },

  /**
   * 获取二维码路径
   */
  canvasToTempImage: function () {
    var self = this;
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        self.setData({
          imagePath: tempFilePath,
        });
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  /**
   * 二维码放大预览
   */
  previewImg: function (e) {
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        wx.previewImage({
          current: tempFilePath,
          urls: [tempFilePath]
        })
      },
      fail: function (res) {
        console.log(res);
      }
    });

  },

  /**
   * 生成二维码
   */
  formSubmit: function (e) {
    var self = this;
    var url = e.detail.value.url;
    self.setData({
      maskHidden: false,
    });
    wx.showToast({
      title: '生成中...',
      icon: 'loading',
      duration: 2000
    });
    var st = setTimeout(function () {
      wx.hideToast()
      var size = self.setCanvasSize();
      //绘制二维码
      self.createQrCode(url, "mycanvas", size.w, size.h);
      self.setData({
        maskHidden: true
      });
      clearTimeout(st);
    }, 2000)

  },

  /**
   * 获取活动信息
   */
  getActivyInfo: function () {
    var self = this;
    var activityId = this.data.activityId
    util_request._postActivity('v1/getActivityByStoreId', { activity_id: activityId }, function (res) {
      if (res.data.ret_code * 1 == 0) {
        var ret_Data = res.data.ret_module;
        var storeId = ret_Data.store_id;
        self.setData({
          storeId: storeId
        })
        self.judgeUIShow(ret_Data);
      }
    }, function (fail) {
      console.log(fail)
    })
  },

  /**
   * 处理活动信息显示不同UI
   */
  judgeUIShow: function (ret_Data) {
    var sharetype = ret_Data.type;
    var coins = ret_Data.coins;
    var coins_limit = ret_Data.coins_limit;
    var couponPrice = ret_Data.couponPrice;
    var percent = ret_Data.percent;
    var days = ret_Data.days;
    if (ret_Data.is_canceled == 1) {
      this.setData({
        activityFinish: false
      })
    }
    if (coins != null && coins_limit != null) {
      this.setData({
        shareEvery: {
          showShareCoins: true,
          showLimitCoins: true,
          coins: coins,
          limitCoins: coins_limit
        }
      })
    } else if (coins != null && coins_limit == null) {
      this.setData({
        shareEvery: {
          showShareCoins: true,
          showLimitCoins: false,
          coins: coins,
          limitCoins: 0
        }
      })
    } else {
      this.setData({
        shareEvery: {
          showShareCoins: false,
          showLimitCoins: false,
          coins: 0,
          limitCoins: 0
        }
      })
    }
    if (couponPrice != null) {
      this.setData({
        shareNewUser: {
          showNewUser: true,
          coins: couponPrice,
          sharetype: sharetype
        }
      })
    } else {
      this.setData({
        shareNewUser: {
          showNewUser: false,
          coins: 0,
          sharetype: sharetype
        }
      })
    }
    if (percent != null && days != null) {
      this.setData({
        newUserRecharge: {
          showThis: true,
          returnMoney: percent * 100 + '%',
          day: days
        }
      })
    } else if (percent != null && days == null) {
      this.setData({
        newUserRecharge: {
          showThis: true,
          returnMoney: percent * 100 + '%',
          day: null
        }
      })
    } else {
      this.setData({
        newUserRecharge: {
          showThis: false,
          returnMoney: 0,
          day: null
        }
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var self = this;
    var activityId = this.data.activityId;
    var userId = this.data.userId;
    var storeId = this.data.storeId;
    return {
      title: '分享本店有奖',
      imageUrl: 'https://metadata.zhutech.net/o_1bvm0u7421t8u1gfrg656d71n60m.png',
      path: '/pages/accpetShare/accpetShare?activity_id=' + activityId + '&user_id=' + userId,
      success: function (res) {
        var putData = {
          activityId: activityId,
          storeId: storeId,
          userId: userId
        }
        self.shareGetCoins(putData)
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  /**
   * 分享获得游戏币
   */
  shareGetCoins: function (putData) {
    var self = this;
    util_request._post('user/v1/shareGetCoins', putData, function (res) {
      if (res.data.ret_code * 1 == 0) {
        var ret_Data = res.data.ret_module;
        if (ret_Data.is_canceled == 1) {
          self.setData({
            activityFinish: false
          })
        }
      }
    }, function (fail) {
      console.log(fail)
    })
  }
})