// pages/myRechargeRecord/myRechargeRecord.js
var util_request = require('../../utils/request.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rechargeRecords: null,
    page: 1,
    pageSize: 20,
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
    this.chargeLog(putData, loadingMethod);
  },

  /**
   * 请求充值记录接口
   */
  chargeLog: function (putData, loadingMethod) {
    var self = this;
    var page = this.data.page;
    util_request._post('v1/chargeLog', putData, function (data) {
      var data = data.data;
      if (data.ret_code * 1 == 0) {
        var MaxPages = data.ret_module.maxPages;
        var infos = data.ret_module.list_info;
        if (infos.length == 0) {
          self.setData({
            loadingAll: true,
            nulldata: false,
            pagenulldata: {
              imgurl: '/img/nullrecharge.png',
              text: ['暂无充值记录']
            }
          })
        } else {
          for (var i = 0; i < infos.length; i++) {
            infos[i].chargetime = app.creatTime(new Date(infos[i].chargetime))
          }
          var rechargeRecords = self.data.rechargeRecords;
          if (loadingMethod == 'onRhBottom' && (putData.page > 1)) {
            self.setData({
              page: page + 1,
              rechargeRecords: rechargeRecords.concat(infos)
            })
          } else {
            self.setData({
              nulldata: true,
              rechargeRecords: infos
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
    }, function (err) {
      if (loadingMethod == 'onLoad') {
        wx.hideLoading();
      } else if (loadingMethod == 'onRhBottom') {
        self.setData({
          loading: true
        })
      }
      self.setData({
        hidden: true,
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
    var putData = {
      page: 1,
      pageSize: this.data.pageSize,
      user_id: this.data.userId
    }
    this.getData(putData, 'onPullDown');
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var page = this.data.page + 1;
    var putData = {
      page: page,
      pageSize: this.data.pageSize,
      user_id: this.data.userId
    }
    if (this.data.loadingAll == false) {
      this.getData(putData, 'onRhBottom')
    }
  }
})