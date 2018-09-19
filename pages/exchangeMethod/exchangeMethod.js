// pages/rechargeMethod/rechargeMethod.js
var util_request = require('../../utils/request.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: null,
    merchantName: null,
    nulldata: false,
    pagenulldata: {},
    navArr: []
  },


  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var storeId = options.storeId;
    this.setData({
      storeId: storeId,
      merchantName: options.merchantName
    })
    this.getExchangeType(storeId)
  },

  /**
   * 获取兑换方式
   */
  getExchangeType: function (storeId) {
    var self = this;
    util_request._post('store/v1/getExchangeType', { storeId: storeId },
      function (res) {
        if (res.data.ret_code * 1 == 0) {
          var rechargeMethod = res.data.ret_module;
          if (rechargeMethod.length == 0) {
            self.setData({
              nulldata: false,
              pagenulldata: {
                imgurl: '/img/nullexcharge.png',
                text: ['该商家暂无可兑换的商品'],
              }
            })
            return;
          } else {
            self.setData({
              nulldata: true
            })
            self.setPageUI(rechargeMethod)
          }
        }
      }, function (fail) {
        console.log(fail)
      })
  },

  /**
   * 设置页面UI
   */
  setPageUI: function (rechargeMethod) {
    for (var i = 0; i < rechargeMethod.length; i++) {
      var exchange_type = rechargeMethod[i].exchange_type
      if (exchange_type == 0) {
        this.data.navArr.push({
          icon: 'https://metadata.zhutech.net/o_1c1a1no04e02753m8go1t135es.png',
          text: '前台兑换',
          targetPage: 'storeExchange'
        })
      } else if (exchange_type == 1) {
        this.data.navArr.push({
          icon: 'https://metadata.zhutech.net/o_1c1a1no044de11sn7c214p0167jr.png',
          text: '在线兑换',
          targetPage: 'onlineExchange'
        })
      } else if (exchange_type == 2) {
        this.data.navArr.push({
          icon: 'https://metadata.zhutech.net/o_1c1a1no04e41lli1fv91f6l11ruq.png',
          text: '自动兑换',
          targetPage: 'autoExchange'
        })
      } else if (rechargeMethod[i].exchange_type == 3) {
        this.data.navArr.push({
          icon: 'https://metadata.zhutech.net/o_1c1a1no041l1v1sq41h9kr071f67p.png',
          text: '游戏币兑换',
          targetPage: 'coinsExchange'
        })
      }
      this.setData({
        navArr: this.data.navArr
      })
    }
  },

  /**
   * 选择兑换方式后跳转
   */
  nav: function (e) {
    var storeId = this.data.storeId
    var giftTickets = this.data.giftTickets
    var merchantName = this.data.merchantName
    var targetPage = e.currentTarget.dataset.gopage;
    if (targetPage == 'storeExchange') {
      wx.navigateTo({
        url: '../storeExchange/storeExchange?merchantName=' + merchantName + '&storeId=' + storeId
      })
    } else if (targetPage == 'onlineExchange') {
      wx.navigateTo({
        url: '../onlineExchange/onlineExchange?storeId=' + storeId
      })
    } else if (targetPage == 'autoExchange') {

    }
  }
})