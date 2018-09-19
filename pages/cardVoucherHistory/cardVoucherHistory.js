// pages/cardVoucherHistory/cardVoucherHistory.js
var util_request = require('../../utils/request.js');
var util = require('../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    user_id: null,
    store_id: null,
    card_history_list: [],
    page: 1,
    pageSize: 10,
    nulldata: true,
    wheight: 0,
    pagenulldata: {},
    pageBottom: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;

    app.getSystemInfo(function (systemInfo) {
      self.setData({
        wheight: systemInfo.windowHeight - 48
      })
    })

    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var user_id = res.data.user_id
        self.setData({
          user_id: user_id,
          store_id: options.store_id
        })
        self.getConsumeHistory();
      }
    })
  },

  /**
   * 监听用户下拉动作
   */
  onPullDownRefresh: function () {
    if (this.data.currentTab == 1) {
      this.getCardHistory();
    } else {
      this.getConsumeHistory();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var newPage = this.data.page + 1
    this.setData({
      page: newPage
    })
    if (this.data.currentTab == 1) {
      this.getCardHistory();
    } else {
      this.getConsumeHistory();
    }
  },

  // 购买记录
  getCardHistory: function () {
    var self = this;
    var user_id = this.data.user_id;
    var store_id = this.data.store_id;
    util_request._post('store/v1/queryuserCardHistory', { userId: user_id, storeId: store_id, page: self.data.page, pageSize: self.data.pageSize }, function (data) {
      wx.stopPullDownRefresh();
      if (data.data.ret_code * 1 == 0) {
        var history_list = self.data.card_history_list;
        if (self.data.page == 1) {
          history_list = [];
          self.setData({
            pageBottom: true
          })
        }
        for (var i = 0; i < data.data.ret_module.data.length; i++) {
          history_list.push(data.data.ret_module.data[i]);
        }
        self.setData({
          card_history_list: history_list
        })
        if (data.data.ret_module.totalCount > 0 && self.data.page * self.data.pageSize > data.data.ret_module.totalCount) {
          self.setData({
            pageBottom: false
          })
        }
        self.loadBackground();
      } else {
        wx.showModal({
          title: '提示',
          content: data.data.ret_msg,
          showCancel: false
        })
      }
    }, function (fail) {
      // 请求失败
    })
  },

  //消费记录
  getConsumeHistory: function () {
    var self = this;
    var user_id = this.data.user_id;
    var store_id = this.data.store_id;
    util_request._post('store/v1/queryUserConsumeHistory', { userId: user_id, storeId: store_id, page: self.data.page, pageSize: self.data.pageSize }, function (data) {
      wx.stopPullDownRefresh();
      if (data.data.ret_code * 1 == 0) {
        var history_list = self.data.card_history_list;
        if (self.data.page == 1) {
          history_list = [];
          self.setData({
            pageBottom: true
          })
        }
        for (var i = 0; i < data.data.ret_module.data.length; i++) {
          history_list.push(data.data.ret_module.data[i]);
        }
        self.setData({
          card_history_list: history_list
        })
        if (data.data.ret_module.totalCount > 0 && self.data.page * self.data.pageSize > data.data.ret_module.totalCount) {
          self.setData({
            pageBottom: false
          })
        }
        self.loadBackground();
      } else {
        wx.showModal({
          title: '提示',
          content: data.data.ret_msg,
          showCancel: false
        })
      }
    }, function (fail) {
      // 请求失败
    })
  },

  loadBackground: function () {
    if (this.data.card_history_list.length == 0) {
      this.setData({
        nulldata: false,
        pagenulldata: {
          imgurl: '/img/nullnear.png',
          text: ['暂无记录']
        }
      })
    } else {
      this.setData({
        nulldata: true
      })
    }
  },

  //点击切换
  clickTab: function (e) {
    var self = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      self.setData({
        currentTab: e.target.dataset.current,
        page: 1
      })

      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0,
      })
      
      if (e.target.dataset.current == 1) {
        self.getCardHistory();
      } else {
        self.getConsumeHistory();
      }
    }
  }
})