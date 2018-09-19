// pages/coinReturn/coinReturn.js
var util_request = require('../../utils/request.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    coinreturndata: [],
    wheight: '',
    nulldata: false,
    pagenulldata: {},
    userId: null
  },

  /**
   * 页面初始化
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
            self.getMyStuckCoins(userId)
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
   * 获取退币信息
   */
  getMyStuckCoins: function (userId) {
    var self = this;
    util_request._post("v1/getMyStuckCoins", { user_id: userId }, function (data) {
      var coinreturndata = data.data.ret_module;
      if (coinreturndata.length == 0) {
        self.setData({
          nulldata: false,
          pagenulldata: {
            imgurl: '/img/nullmessage.png',
            text: ['暂无退币信息', '请稍后再试']
          }
        })
      } else {
        for (var i = 0; i < coinreturndata.length; i++) {
          var time = coinreturndata[i].create_time
          var datetime = new Date(time * 1000);
          coinreturndata[i].create_time = app.creatTime(datetime)
        }
        self.setData({
          nulldata: true,
          coinreturndata: coinreturndata,
        })
      }
      
    }, function (fail) {
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
   * 一键退币
   */
  returnCoins: function () {
    var self = this;
    var userId = this.data.userId;
    util_request._post("v1/rollbackStackCoins", { user_id: userId }, function (data) {
      if (data.data.ret_code * 1 == 0) {
        wx.showToast({
          title: '退币成功',
          icon: 'success',
          duration: 2000,
        })
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 2000)
      } else {
        wx.showModal({
          title: '退币失败',
          content: data.data.ret_msg,
          showCancel: false
        })
      }
    }, function (fail) {
      console.log(fail)
    })
  }
})