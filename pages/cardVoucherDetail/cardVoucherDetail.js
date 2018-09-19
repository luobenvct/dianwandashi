// pages/cardVoucherDetail/cardVoucherDetail.js
var util_request = require('../../utils/request.js');
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showMsg: false,
    user_id: null,
    store_id: null,
    store_name: null,
    card_info: null,
    product_list: [],
    isFirst: true,
    cardName: null,
    restTimes: 0,
    endTime: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var user_id = res.data.user_id
        self.setData({
          user_id: user_id,
          store_id: options.store_id,
          store_name: options.store_name
        })
        self.getCardInfo()
      }
    })
    util_request.linkWebSocket(function (res) {
      self.translateMsg(res)
    })
  },

  onShow: function () {
    if (!this.data.isFirst) {
      this.getCardInfo();
    }
  },

  getCardInfo: function () {
    var self = this;
    var user_id = this.data.user_id;
    var storeId = this.data.store_id;
    util_request._post('store/v1/user/card/info', { userId: user_id, storeId: storeId, page: 1, pageSize: 999 }, function (data) {
      if (data.data.ret_code * 1 == 0) {
        var retData = data.data.ret_module;
        if (retData.cardInfo.card_id > 0){
          retData.cardInfo.new_virtual_no = retData.cardInfo.virtual_no.replace(/\s/g, '').replace(/(.{4})/g, "$1 ")
          self.setData({
            card_info: retData.cardInfo,
            product_list: retData.data,
            store_name: retData.cardInfo.name,
          })
          util.barcode('barcode', retData.cardInfo.virtual_no, 562, 148);
        } else {
          if (self.data.isFirst) {
            wx.navigateTo({
              url: '/pages/cardRecharge/cardRecharge?store_id=' + storeId + '&store_name=' + self.data.store_name,
            })
          }
        }
        self.setData({
          isFirst: false
        })
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

  confirm: function () {
    var self = this;
    self.setData({
      showMsg: false
    })
    self.getCardInfo()
  },

  toRecharge: function () {
    wx.navigateTo({
      url: '/pages/cardRecharge/cardRecharge?store_id=' + this.data.store_id + '&store_name=' + this.data.store_name,
    })
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
  }


})