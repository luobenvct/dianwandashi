// pages/storeExchange/storeExchange.js
var util_request = require('../../utils/request.js')
var app = getApp();

Page({

  /**
   * 页面初始化数据
   */
  data: {
    pageBottom: true,
    userId: null,
    storeId: null,
    storeName: '',
    surplusExchange: 0,
    exchangeHidden: true,
    total: 0,
    wheight: 0,
    giftList: [],
    actionSheetItems: [],
    selticket: 0,
    surplus: 'surplusbefore',
    defaultTicket: 0,
    popHeight: 0,
    exchangeBtnSta: true,
    exchangeBtn: 'btnDisClick',
    lastTapDiffTime: 0,
    nulldata: false,
    pagenulldata: {},
    keyPageCode: 0,
    timeStampArr: []
  },

  /**
   * 监听页面初始化
   */
  onLoad: function (options) {
    var self = this;
    var storeId = options.storeId;
    var storeName = options.merchantName;
    wx.showLoading({
      title: '加载中...',
    })
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
          storeId: storeId,
          userId: userId,
          storeName: storeName
        })
        var putData = {
          storeId: storeId,
          type: 0,
          userId: userId
        }
        self.getGiftsInStore(putData);
      },
    })
  },

  /**
   * 监听页面显示是否已经兑换
   */
  onShow: function () {
    var storeId = this.data.storeId;
    var keyPageCode = this.data.keyPageCode;
    var userId = this.data.userId;
    if (keyPageCode) {
      this.getExchangeHistory(keyPageCode);
    }
  },

  /**
   * 监听页面加载完毕
   */
  onReady: function () {
    wx.hideLoading();
  },

  /**
   * 查询购物车是否已经兑换
   */
  getExchangeHistory: function (keyPageCode) {
    var self = this;
    var giftList = this.data.giftList;
    var storeId = this.data.storeId;
    var userId = this.data.userId;
    util_request._post('v1/getExchangeHistory', {
      user_id: userId,
      store_id: storeId,
      page_size: 20,
      page: 1
    }, function (res) {
      if (res.data.ret_code * 1 == 0) {
        var exchange_historys = res.data.ret_module.exchange_historys;
        for (var i = 0; i < exchange_historys.length; i++) {
          if (keyPageCode == exchange_historys[i].scan_code) {
            for (var i = 0; i < giftList.length; i++) {
              giftList[i].initialnum = 0;
            }
            self.setData({
              giftList: giftList,
              exchangeHidden: true,
              total: 0,
              actionSheetItems: [],
              selticket: 0,
              surplus: 'surplusbefore',
              popHeight: 0,
              exchangeBtnSta: true,
              exchangeBtn: 'btnDisClick'
            })
            var putData = {
              userId: userId,
              storeId: storeId
            }
            self.getStoreCoupons(putData)
            wx.removeStorage({
              key: 'historyData' + storeId,
              success: function (res) {
                console.log('清除购物车成功')
              }
            })
          }
        }
      }
    }, function (res) {
      console.log(res)
    })
  },

  /**
   * 获取该店礼票
   */
  getStoreCoupons: function (putData) {
    var self = this;
    util_request._post('v1/spendHistoryByStoreId', putData,
      function (res) {
        if (res.data.ret_code * 1 == 0) {
          var coupons = res.data.ret_module.coupons;
          self.setData({
            surplusExchange: coupons,
            defaultTicket: coupons
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.ret_msg,
            showCancel: false
          })
        }
      }, function (res) {
        console.log(res)
      })
  },

  /**
   * 获取前台可兑换礼品列表
   */
  getGiftsInStore: function (putData) {
    var self = this;
    util_request._post('store/v1/getGiftsInStore', putData,
      function (res) {
        if (res.data.ret_code * 1 == 0) {
          var giftData = res.data.ret_module.data;
          if (giftData.length == 0) {
            self.setData({
              nulldata: false,
              pagenulldata: {
                imgurl: '/img/nullexcharge.png',
                text: ['该商家暂无可兑换的商品'],
              }
            })
          } else {
            self.setData({
              surplusExchange: res.data.ret_module.remainCoupons,
              defaultTicket: res.data.ret_module.remainCoupons,
            })
            var giftList = [];
            for (var i = 0; i < giftData.length; i++) {
              giftData[i].initialnum = 0;
              giftList.push(giftData[i]);
            }
            self.getHistoryData(giftList)
          }
        }
      }, function (fail) {
        console.log(fail)
      })
  },

  /**
    * 存储购物车选中的记录
    */
  setHistoryData: function () {
    var historyData = [];
    var storeId = this.data.storeId;
    var actionSheetItems = this.data.actionSheetItems;
    for (var i = 0; i < actionSheetItems.length; i++) {
      var gift_id = actionSheetItems[i].gift_id;
      var initialnum = actionSheetItems[i].initialnum;
      var photo_url = actionSheetItems[i].photo_url;
      var name = actionSheetItems[i].name;
      historyData.push({
        gift_id: gift_id,
        photo_url: photo_url,
        name:name,
        initialnum: initialnum
      })
    }
    wx.setStorage({
      key: 'historyData' + storeId,
      data: historyData
    })
  },

  /**
   * 获取购物车原有的记录
   */
  getHistoryData: function (giftList) {
    var self = this;
    var storeId = this.data.storeId;
    var surplusExchange = this.data.surplusExchange
    wx.getStorage({
      key: 'historyData' + storeId,
      success: function (res) {
        var historyData = res.data;
        var actionSheetItems = [];
        var total = 0;
        var selticket = 0;
        for (var i = 0; i < giftList.length; i++) {
          for (var j = 0; j < historyData.length; j++) {
            if (giftList[i].gift_id == historyData[j].gift_id) {
              giftList[i].initialnum = historyData[j].initialnum
              total += historyData[j].initialnum
              selticket += giftList[i].score_req * historyData[j].initialnum
              actionSheetItems.push(giftList[i]);
            }
          }
        }
        self.setData({
          storeId: storeId,
          giftList: giftList,
          total: total,
          actionSheetItems: actionSheetItems,
          selticket: selticket,
          surplusExchange: surplusExchange - selticket,
          surplus: 'surplusafter',
          exchangeBtn: 'btnCanClick',
          exchangeBtnSta: false,
          pageBottom: false,
          nulldata: true
        })
      },
      fail: function () {
        self.setData({
          giftList: giftList,
          pageBottom: false,
          nulldata: true
        })
      }
    })
  },

  /**
   * 加入购物车
   */
  add: function (event) {
    var storeId = this.data.storeId;
    var curtime = event.timeStamp;
    var lastTime = this.data.lastTapDiffTime;
    var surplusExchange = this.data.surplusExchange;
    var gift_id = event.currentTarget.dataset.giftid;
    var score_req = event.currentTarget.dataset.score_req;
    var actionSheetItems = this.data.actionSheetItems;
    var total = this.data.total;
    var giftList = this.data.giftList;
    var selticket = this.data.selticket;
    this.setData({
      lastTapDiffTime: curtime
    })
    if (curtime - lastTime > 300) {
      if (score_req > surplusExchange) {
        wx.showModal({
          title: '提示',
          content: '剩余礼票不足',
          showCancel: false
        })
      } else {
        for (var i = 0; i < giftList.length; i++) {
          if (giftList[i].gift_id == gift_id) {
            giftList[i].initialnum += 1;
            var k = 0;
            for (var j = 0; j < actionSheetItems.length; j++) {
              if (actionSheetItems[j].gift_id == gift_id) {
                actionSheetItems[j].initialnum += 1;
                k++;
              }
            }
            if (k == 0) {
              actionSheetItems.push(giftList[i]);
            }
          }
        }
        total += 1;
        this.setData({
          giftList: giftList,
          total: total,
          actionSheetItems: actionSheetItems,
          surplus: 'surplusafter',
          selticket: selticket + score_req,
          surplusExchange: surplusExchange - score_req,
          exchangeBtnSta: false,
          exchangeBtn: 'btnCanClick'
        })
        this.setHistoryData();
      }
    }

  },

  /**
   * 减少购物车
   */
  subtract: function (event) {
    var storeId = this.data.storeId;
    var curtime = event.timeStamp;
    var lastTime = this.data.lastTapDiffTime;
    var surplusExchange = this.data.surplusExchange;
    var gift_id = event.currentTarget.dataset.giftid;
    var score_req = event.currentTarget.dataset.score_req;
    var popstatus = event.currentTarget.dataset.popstatus;
    var actionSheetItems = this.data.actionSheetItems;
    var total = this.data.total;
    var giftList = this.data.giftList;
    var selticket = this.data.selticket;
    this.setData({
      lastTapDiffTime: curtime
    })
    if (curtime - lastTime > 300) {
      total -= 1;
      if (total > 0) {
        this.btnIsClick(1);
      } else {
        this.setData({
          surplus: 'surplusbefore'
        })
        this.btnIsClick(0);
      }

      for (var i = 0; i < giftList.length; i++) {
        if (giftList[i].gift_id == gift_id) {
          giftList[i].initialnum -= 1;
          for (var j = 0; j < actionSheetItems.length; j++) {
            if (actionSheetItems[j].gift_id == gift_id) {
              actionSheetItems[j].initialnum -= 1;
              if (giftList[i].initialnum == 0) {
                actionSheetItems.splice(j, 1);
              }
            }
          }
        }
      }
      if (popstatus == 1) {
        var k = 0;
        for (var j = 0; j < actionSheetItems.length; j++) {
          if (actionSheetItems[j].initialnum > 0) {
            k++;
          }
        }
        this.setPopHeight(k);
        if (total == 0) {
          this.setData({
            exchangeHidden: true
          })
        }
      }
      this.setData({
        giftList: giftList,
        total: total,
        actionSheetItems: actionSheetItems,
        selticket: selticket - score_req,
        surplusExchange: surplusExchange + score_req
      })
      this.setHistoryData();
    }
  },

  /**
   * 设置购物车弹窗高度
   */
  setPopHeight: function (k) {
    var popHeight = 0;
    if (k == 1) {
      popHeight = 142
    } else if (k <= 5) {
      popHeight = 142 + (k - 1) * 112
    } else {
      popHeight = 590
    }
    this.setData({
      popHeight: popHeight
    })
  },

  /**
   * 切换显示购物车
   */
  togglelist: function () {
    var wheight = this.data.wheight;
    var actionSheetItems = this.data.actionSheetItems;
    if (this.data.exchangeHidden == true) {
      var k = 0;
      for (var j = 0; j < actionSheetItems.length; j++) {
        if (actionSheetItems[j].initialnum > 0) {
          k++;
        }
      }
      this.setPopHeight(k);
      if (k > 0) {
        this.setData({
          exchangeHidden: false
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '请选择兑换礼品',
          showCancel: false
        })
      }
    } else {
      this.setData({
        exchangeHidden: true
      })
    }
  },

  /**
   * 清空购物车
   */
  emptyAll: function () {
    var self = this;
    var giftList = this.data.giftList;
    var defaultTicket = this.data.defaultTicket;
    var storeId = this.data.storeId;
    wx.showModal({
      title: '提示',
      content: '确定清空兑换车',
      success: function (res) {
        if (res.confirm) {
          for (var i = 0; i < giftList.length; i++) {
            giftList[i].initialnum = 0
          }
          self.setData({
            giftList: giftList,
            total: 0,
            exchangeHidden: true,
            actionSheetItems: [],
            selticket: 0,
            surplusExchange: defaultTicket,
            exchangeBtnSta: true,
            exchangeBtn: 'btnDisClick'
          })
          wx.removeStorage({
            key: 'historyData' + storeId,
            success: function (res) {
              console.log('清除购物车成功')
            }
          })
        }
      }
    })
  },

  /**
   * 点击兑换
   */
  exchange: function (e) {
    var self = this;
    var curtime = e.timeStamp;
    var lastTime = this.data.lastTapDiffTime;
    var storeId = this.data.storeId;
    var userId = this.data.userId;
    var gifts = this.exchargeGifts();
    this.setData({
      lastTapDiffTime: curtime
    })
    if (gifts.length == 0) {
      wx.showModal({
        title: '提示',
        content: '请选择需要兑换的礼物',
        showCancel: false
      })
    } else {
      var putData = {
        gifts: gifts,
        user_id: userId,
        store_id: storeId
      }
      if (curtime - lastTime > 500) {
        this.getDrawCode(putData)
      }
    }
  },

  /**
   * 处理上传的数据gifts
   */
  exchargeGifts: function () {
    var actionSheetItems = this.data.actionSheetItems;
    var gifts = [];
    for (var i = 0; i < actionSheetItems.length; i++) {
      gifts[i] = {};
      gifts[i].gift_count = actionSheetItems[i].initialnum;
      gifts[i].gift_id = actionSheetItems[i].gift_id;
    }
    return gifts;
  },

  /**
   * 请求接口获取code
   */
  getDrawCode: function (putData) {
    var self = this;
    var storeName = this.data.storeName;
    var storeId = this.data.storeId;
    util_request._post('v1/get_draw_code', putData,
      function (res) {
        if (res.data.ret_code * 1 == 0) {
          var code = res.data.ret_module.code;
          wx.navigateTo({
            url: '../../pages/presentKey/presentKey?code=' + code + '&storeName=' + storeName + '&store_id=' + storeId
          })
        } else if (res.data.ret_code * 1 == 502) {
          wx.showModal({
            title: '绿游卫士提示您',
            content: res.data.ret_msg,
            showCancel: false
          })
        } else {
          wx.showModal({
            title: '兑换失败',
            content: res.data.ret_msg,
            showCancel: false
          })
        }
      }, function (fail) {
        console.log(fail)
      })
  },

  /**
   * 按钮点击改变按钮状态
   */
  btnIsClick: function (status) {
    if (status == 0) {
      this.setData({
        exchangeBtnSta: true,
        exchangeBtn: 'btnDisClick'
      })
    } else {
      this.setData({
        exchangeBtnSta: false,
        exchangeBtn: 'btnCanClick'
      })
    }
  }
})