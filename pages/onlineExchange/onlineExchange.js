// pages/onlineExchange/onlineExchange.js
var util_request = require('../../utils/request.js')
var app = getApp()

Page({

  /**
   * 页面初始数据
   */
  data: {
    userId: null,
    storeId: null,
    pageBottom: true,
    giftList: [],
    surplusExchange: 0,
    lastTapDiffTime: 0,
    wheight: '',
    nulldata: false,
    pagenulldata: {},
    exchangeSucc: false,
    exchangeSuccUrl: ''
  },

  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    var storeId = options.storeId;
    app.getSystemInfo(function (systemInfo) {
      self.setData({
        wheight: systemInfo.windowHeight
      })
    })
    wx.showLoading({
      title: '加载中...',
    })
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var userId = res.data.user_id
        var putData = {
          storeId: storeId,
          type: 1,// 在线兑换
          userId: userId
        }
        self.setData({
          userId: userId,
          storeId: storeId
        })
        self.getData(putData)
      },
    })
  },

  /**
   * 监听页面加载完毕
   */
  onReady: function () {
    wx.hideLoading();
  },

  /**
   * 获取数据
   */
  getData: function (putData) {
    var self = this;
    util_request._post('store/v1/getGiftsInStore', putData,
      function (data) {
        var data = data.data;
        if (data.ret_code * 1 == 0) {
          var giftData = data.ret_module.data;
          var giftTickets = data.ret_module.remainCoupons;
          self.setData({
            surplusExchange: giftTickets
          })
          if (giftData.length == 0) {
            self.setData({
              nulldata: false,
              pagenulldata: {
                imgurl: '/img/nullexcharge.png',
                text: ['该商家暂无可兑换的商品'],
              }
            })
          } else {
            self.processData(giftData);
            self.setData({
              pageBottom: false,
              nulldata: true,
              surplusExchange: giftTickets
            })
          }
        } else {
          wx.showModal({
            title: '提示',
            content: data.ret_msg,
            showCancel: false
          })
        }
      }, function (fail) {
        console.log(fail)
      })
  },

  /**
   * 对获取到对数据进行处理
   */
  processData: function (giftData) {
    var giftList = [];
    for (var i = 0; i < giftData.length; i++) {
      if (giftData[i].exchange_limit == 0) {
        giftData[i].btnStatus = false;
        giftData[i].btnStyle = 'canBtn'
      } else if (giftData[i].exchange_limit == 1) {
        if (giftData[i].status == 1) {
          giftData[i].btnStatus = true;
          giftData[i].btnStyle = 'disabledBtn'
        } else {
          giftData[i].btnStyle = 'canBtn'
        }
      }
      giftList.push(giftData[i]);
    }
    this.setData({
      giftList: giftList
    })
  },

  /**
   * 点击兑换
   */
  excharge: function (e) {
    var coupons = e.currentTarget.dataset.coupons;
    var giftId = e.currentTarget.dataset.giftid;
    var link_url = e.currentTarget.dataset.url;
    var curtime = e.timeStamp;
    var lastTime = this.data.lastTapDiffTime;
    var storeId = this.data.storeId;
    var userId = this.data.userId;
    var giftTickets = this.data.surplusExchange;
    this.setData({
      lastTapDiffTime: curtime,
      exchangeSuccUrl: link_url
    })
    if (coupons > giftTickets) {
      wx.showModal({
        title: '提示',
        content: '剩余礼票不足',
        showCancel: false
      })
    } else {
      if (curtime - lastTime > 500) {
        var putData = {
          coupons: coupons, storeId: storeId, giftId: giftId, userId: userId
        }
        this.onlineExchange(putData)

      }
    }
  },

  /**
   * 请求接口兑换
   */
  onlineExchange: function (putData) {
    var self = this;
    var storeId = this.data.storeId;
    var userId = this.data.userId;
    util_request._post('store/v1/onlineExchange', putData,
      function (res) {
        if (res.data.ret_code * 1 == 0) {
          var putData = {
            storeId: storeId,
            type: 1,
            userId: userId
          }
          self.getData(putData)
          self.setData({
            exchangeSucc: true
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.ret_msg,
            showCancel: false
          })
        }
      }, function (fail) {
        console.log(fail)
      })
  },

  /**
   * 复制兑换地址的h5地址
   */
  copyUrl: function () {
    var self = this;
    wx.setClipboardData({
      data: this.data.exchangeSuccUrl,
      success: function (res) {
        wx.showToast({
          title: '复制成功'
        })
        self.setData({
          exchangeSucc: false
        })
      }
    })
  }
})