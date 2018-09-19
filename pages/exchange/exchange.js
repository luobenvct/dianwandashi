// pages/exchange/exchange.js
var util_request = require('../../utils/request.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    exchangeList: [],
    pageBottom: true,
    nulldata: true,
    loading: true,
    wheight: '',
    pagenulldata: {},
    page: 1,
    pageSize: 20,
    maxPsize: 0
  },

  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    app.getSystemInfo(function (systemInfo) {
      self.setData({
        wheight: systemInfo.windowHeight - 48
      })
    })
    wx.showLoading({
      title: '加载中...'
    })
  },

  /**
   * 监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideLoading();
  },

  /**
   * 监听每次页面显示
   */
  onShow: function () {
    var self = this;
    app.judgeNetwork(function (networkStatus) {
      if (!networkStatus) {
        self.setData({
          nulldata: false,
          pagenulldata: {
            imgurl: '/img/nointernet.png',
            text: ['暂无网络', '请检查网络或刷新～'],
            showRefresh: true
          }
        })
      } else {
        self.setData({
          page: 1,
          maxPsize: 0
        })
        self.getData();
      }
    })
  },

  /**
   * 数据处理
   */
  getData: function () {
    var self = this;
    var maxPsize = this.data.maxPsize;
    var pageSize = this.data.pageSize;
    var page = this.data.page;
    if ((maxPsize != 0) && (maxPsize <= pageSize * (page - 1))) {
      this.setData({
        pageBottom: false
      })
    } else {
      if (page > 1) {
        this.setData({
          loading: false
        })
      }
      wx.getStorage({
        key: 'loginInfo',
        success: function (res) {
          var putData = {
            userId: res.data.user_id,
            pageSize: pageSize,
            page: page
          }
          self.spendHistory(putData)
        },
        fail: function () {
          self.setData({
            nulldata: false,
            pagenulldata: {
              imgurl: '/img/unknown.png',
              text: ['操作失败,未知错误~']
            },
          })
        }
      })
    }
  },

  /**
   * 请求接口拿取数据
   */
  spendHistory: function (putData) {
    var self = this;
    var page = this.data.page;
    var pageSize = this.data.pageSize;
    util_request._post('store/v2/spendHistory', putData,
      function (res) {
        if (res.data.ret_code * 1 == 0) {
          var maxPsize = res.data.ret_module.totalCount;
          self.setData({
            maxPsize: maxPsize
          })
          var listdata = res.data.ret_module.data;
          var exchangeList = page == 1 ? [] : self.data.exchangeList;
          for (var i = 0; i < listdata.length; i++) {
            exchangeList.push(listdata[i]);
          }
          if (exchangeList.length == 0) {
            self.setData({
              nulldata: false,
              pagenulldata: {
                imgurl: '/img/nullexcharge.png',
                text: ['暂无兑换过的商家', '快去电玩城扫码嗨起来吧']
              }
            })
          } else {
            self.setData({
              nulldata: true
            })
          }
          if (page > 1) {
            self.setData({
              loading: true
            })
          }
          page++;
          self.setData({
            exchangeList: exchangeList,
            page: page
          })
          if ((maxPsize != 0) && (maxPsize <= pageSize)) {
            self.setData({
              pageBottom: false
            });
          }
        } else {
          self.setData({
            nulldata: false,
            pagenulldata: {
              imgurl: '/img/unknown.png',
              text: ['操作失败,未知错误~']
            },
          })
        }
      }, function (res) {
        self.setData({
          nulldata: false,
          pagenulldata: {
            imgurl: '/img/unknown.png',
            text: ['操作失败,未知错误~']
          },
        })
      })
  },

  /**
   * 下拉刷新数据
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
    this.onShow()
  },



  /**
   * 加载更多数据
   */
  onReachBottom: function () {
    if (this.data.nulldata) {
      this.getData();
    }
  },

  /**
   * 跳转礼物兑换页
   */
  gotoExchange: function (event) {
    var exchangeList = this.data.exchangeList;
    var index = event.currentTarget.dataset.index;
    var data = exchangeList[index];
    util_request._post('store/v1/getExchangeType', { storeId: data.store_id },
      function (res) {
        if (res.data.ret_code * 1 == 0) {
          var rechargeMethod = res.data.ret_module;
          if (rechargeMethod.length == 0) {
            wx.navigateTo({
              url: '../exchangeMethod/exchangeMethod?merchantName=' + data.name + '&storeId=' + data.store_id,
            })
          } else if (rechargeMethod.length == 1) {
            var exchange_type = rechargeMethod[0].exchange_type;
            if (exchange_type == 0) {
              wx.navigateTo({
                url: '../storeExchange/storeExchange?merchantName=' + data.name + '&storeId=' + data.store_id,
              })
            } else if (exchange_type == 1) {
              wx.navigateTo({
                url: '../onlineExchange/onlineExchange?storeId=' + data.store_id,
              })
            }

          } else if (rechargeMethod.length == 2){
            wx.navigateTo({
              url: '../exchangeMethod/exchangeMethod?merchantName=' + data.name + '&storeId=' + data.store_id,
            })
          }
        }
      }, function (fail) {
        console.log(fail)
      })
  },

  /**
   * 重新刷新页面
   */
  reload: function () {
    var self = this;
    this.setData({
      page: 1,
      maxPsize: 0
    })
    app.getUserInfo(function (loginInfo) {
      self.onShow()
    })
  }
})