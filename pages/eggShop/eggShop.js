// pages/eggShop/eggShop.js
var util_request = require('../../utils/request.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: 0,
    giftList: [],
    imgDomain: null,
    headUrl: null,
    userName: null,
    eggBalance: 0,
    giftId: 0,
    alertHidden: true,
    mobile: null,
    giftName: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this
    app.getUserInfo(function (loginInfo) { // 调用登录接口
      if (loginInfo == null) return;
      self.setData({
        userId: loginInfo.user_id,
      })
      self.loadData()
    })
  },

  loadData: function () {
    var self = this;
    util_request._getGatewayApi('/activityApi/egg/v1/user/'+self.data.userId+'/gift/list', {},
      function (res) {
        var data = res.data.data;
        self.setData({
          headUrl: data.avatar,
          userName: data.userName,
          eggBalance: data.eggBalance
        })
        if (res.data.code * 1 == 0) {
          self.setData({
            giftList: data.giftList
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false
          })
        }
      }, function (res) {
        console.log(res)
      })
  },

  exchange: function (e) {
    console.log(e.currentTarget.dataset)
    var self = this
    self.setData({
      giftId: e.currentTarget.dataset.giftid,
      giftName: e.currentTarget.dataset.giftname
    })
    util_request._getGatewayApi('/activityApi/egg/v1/gift/check', { userId: self.data.userId, giftId: self.data.giftId},
      function (res) {
        if (res.data.code * 1 == 0) {
          var data = res.data.data;
          console.log(data)
          self.setData({
            alertHidden: false
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false
          })
        }
      }, function (res) {
        console.log(res)
      })
  },

  setMobile: function (e) {
    this.setData({
      mobile: e.detail.value
    })
  },

  confirm: function () {
    var self = this
    util_request._postGatewayApi('/activityApi/egg/v1/gift/trans', { userId: self.data.userId, giftId: self.data.giftId, phone: self.data.mobile },
      function (res) {
        if (res.data.code * 1 == 0) {
          self.setData({
            alertHidden: true
          })
          wx.showModal({
            title: '提示',
            content: '兑换成功',
            showCancel: false,
            success: function (res) { 
              self.loadData()
            },
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false
          })
        }
      }, function (res) {
        console.log(res)
      })
  },

  cancel: function () {
    this.setData({
      alertHidden: true
    })
  }
})