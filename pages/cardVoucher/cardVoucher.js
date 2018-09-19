// pages/cardVoucher/cardVoucher.js
var util_request = require('../../utils/request.js');
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showMsg: false,
    user_id: null,
    card_list: [],
    nulldata: true,
    wheight: 0,
    pagenulldata: {},
    cardName: null,
    restTimes: 0,
    endTime: null,
    newCode: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;

    getApp().getSystemInfo(function (systemInfo) {
      self.setData({
        wheight: systemInfo.windowHeight - 48
      })
    })

    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var user_id = res.data.user_id
        self.setData({
          user_id: user_id
        })
        self.getCardList()
      }
    })
    util_request.linkWebSocket(function (res) {
      self.translateMsg(res);
    })
  },

  getCardList: function () {
    var self = this;
    var user_id = this.data.user_id;
    util_request._post('store/v1/user/card/list', { userId: user_id, page: 1, pageSize:999}, function (data) {
      if (data.data.ret_code * 1 == 0) {
        var retData = data.data.ret_module.data;
        self.setBarCodeView(retData);
        self.loadBackground(retData);
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

  loadBackground: function (list) {
    if (list.length == 0) {
      this.setData({
        nulldata: false,
        pagenulldata: {
          imgurl: '/img/nullnear.png',
          text: ['暂无卡券']
        }
      })
    } else {
      this.setData({
        nulldata: true
      })
    }
  },

  setBarCodeView: function (list) {    
    for (var i = 0; i < list.length; i++) {
      var card = list[i];
      util.barcode('barcode' + card.card_id, card.virtual_no, 420, 108);
      card.new_virtual_no = card.virtual_no.replace(/\s/g, '').replace(/(.{4})/g, "$1 ")
    }
    this.setData({
      card_list: list
    })
  },

  toCardDetail: function (e) {
    wx.navigateTo({
      url: '../cardVoucherDetail/cardVoucherDetail?store_id=' + e.currentTarget.dataset.storeid,
    })
  },

  confirm: function () {
    var self = this;
    self.setData({
      showMsg:false
    })
    self.getCardList()
  },

  /**
   * 收到服务器推送后处理消息
   */
  translateMsg: function (res) {
    var self = this;
    var InfoObj = JSON.parse(res.data);
    if (InfoObj.WEXType == 3) {
      if (InfoObj.endTime != -1) {
        InfoObj.endTime = InfoObj.endTime.split(' ')[0]
      } else {
        InfoObj.endTime = '不限'
      }
      this.setData({
        showMsg: true,
        cardName: InfoObj.cardName,
        restTimes: InfoObj.restTimes,
        endTime: InfoObj.endTime
      })
    }
  },

})