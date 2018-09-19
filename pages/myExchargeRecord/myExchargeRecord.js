// pages/myExchargeRecord/myExchargeRecord.js
var util_request = require('../../utils/request.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    exchargeRecords: null,
    page: 1,
    pageSize: 10,
    loadingAll: false,
    pageBottom: true,
    nulldata: false,
    loading: true,
    pagenulldata: {},
    userId: null
  },

  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    app.getSystemInfo(function (systemInfo) {
      self.setData({
        wheight: systemInfo.windowHeight
      })
    })
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
        wx.getStorage({
          key: 'loginInfo',
          success: function (res) {
            var userId = res.data.user_id;
            self.setData({
              userId: userId
            })
            var putData = {
              page: self.data.page,
              pageSize: self.data.pageSize,
              user_id: userId
            }
            self.getData(putData, 'onLoad');
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
    })
  },

  /**
   * 获取数据
   */
  getData: function (putData, loadingMethod) {
    if (loadingMethod == 'onLoad') {
      wx.showLoading({
        title: '加载中...'
      })
    } else if (loadingMethod == 'onPullDown') {
      this.setData({
        page: 1,
        pageBottom: true,
        loadingAll: false
      })
    } else if (loadingMethod == 'onRhBottom' && putData.page > 1) {
      this.setData({
        loading: false
      })
    }
    this.mineExchangeLog(putData, loadingMethod);
  },

  /**
   * 请求兑换记录接口
   */
  mineExchangeLog: function (putData, loadingMethod) {
    var self = this;
    var page = this.data.page;
    var pageSize = this.data.pageSize;
    util_request._post('user/v1/mineExchangeLog', putData, function (data) {
      var data = data.data;
      if (data.ret_code * 1 == 0) {
        var recCount = data.ret_module.recCount;
        var MaxPages = Math.ceil(recCount / pageSize)
        var infos = data.ret_module.list_info;
        if (infos.length == 0) {
          self.setData({
            loadingAll: true,
            nulldata: false,
            pagenulldata: {
              imgurl: '/img/nullexcharge.png',
              text: ['暂无兑换记录']
            }
          })
        } else {
          for (var i = 0; i < infos.length; i++) {
            var exchangeTime = new Date(infos[i].exchange_time * 1000);
            infos[i].exchange_time = app.creatTime(exchangeTime)
          }
          var exchargeRecords = self.data.exchargeRecords;
          if (loadingMethod == 'onRhBottom' && (putData.page > 1)) {
            self.setData({
              page: page + 1,
              exchargeRecords: exchargeRecords.concat(infos)
            })
          } else {
            self.setData({
              nulldata: true,
              exchargeRecords: infos
            })
          }
          if (putData.page == MaxPages) {
            self.setData({
              pageBottom: false,
              loadingAll: true
            })
          }
        }

      } else {
        wx.showModal({
          title: '提示',
          content: data.ret_msg,
          showCancel: false
        })
      }
      if (loadingMethod == 'onLoad') {
        wx.hideLoading();
      } else if (loadingMethod == 'onRhBottom') {
        self.setData({
          loading: true
        })
      }
    }, function (fail) {
      if (loadingMethod == 'onLoad') {
        wx.hideLoading();
      } else if (loadingMethod == 'onRhBottom') {
        self.setData({
          loading: true
        })
      }
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
   * 监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
    var pageSize = this.data.pageSize;
    var userId = this.data.userId;
    var putData = {
      page: 1,
      pageSize: pageSize,
      user_id: userId
    }
    this.getData(putData, 'onPullDown');
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var page = this.data.page + 1;
    var pageSize = this.data.pageSize;
    var userId = this.data.userId;
    var putData = {
      page: page,
      pageSize: pageSize,
      user_id: userId
    }
    if (this.data.loadingAll == false) {
      this.getData(putData, 'onRhBottom');
    }
  }
})