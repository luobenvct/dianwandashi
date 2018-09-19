// pages/cardRecharge/cardRecharge.js
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
    product_list: [],
    note: null,
    name: null,
    cardId:null,
    detailId:'',
    price:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.store_name,
    })
    var self = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var user_id = res.data.user_id
        self.setData({
          user_id: user_id,
          store_id: options.store_id
        })
        self.getCardList4Store();
      }
    })
  },

  getCardList4Store() {
    var self = this;
    var store_id = this.data.store_id;
    util_request._post('store/v1/queryCardList4Store', { storeId: store_id, page: 1, pageSize: 50 }, function (data) {
      if (data.data.ret_code * 1 == 0) {
        var retData = data.data.ret_module.data;
        retData.forEach((item)=>{
          item.detail.forEach((item)=>{
            item.checked = false;
          })
        })
        self.setData({
          product_list: retData
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

  showMsg: function (e) {
    var note = e.currentTarget.dataset.note;
    var name = e.currentTarget.dataset.name;
    var self = this;
    self.setData({
      showMsg: true,
      note: note,
      name: name
    })
  },

  confirm: function () {
    var self = this;
    self.setData({
      showMsg: false
    })
  },

  check(e){
    this.data.product_list.forEach((item) => {
      item.detail.forEach((item) => {
        item.checked = false;
      })
    })
    var length = this.data.product_list.length;
    var cardId = e.currentTarget.dataset.cardid;
    var detailId = e.currentTarget.dataset.detailid;
    var price = e.currentTarget.dataset.price;
    for (var i = 0; i < length; i++) {
      if (this.data.product_list[i].card_id == cardId){
        var detailLength = this.data.product_list[i].detail.length;
        for (var j = 0; j < detailLength; j++) {
          if (this.data.product_list[i].detail[j].combo_id == detailId) {
            this.data.product_list[i].detail[j].checked = true;
          }else{
            this.data.product_list[i].detail.checked = false;
          }
        }
      }
      this.setData({
        product_list: this.data.product_list,
        cardId: cardId,
        detailId: detailId,
        price: price
      })
    } 
  },

  buy: function() {
    var self = this;
    var store_id = this.data.store_id;
    var user_id = this.data.user_id;
    var store_card_id = this.data.cardId;
    var card_detail_id = this.data.detailId;
    if (card_detail_id == ''){
      wx.showModal({
        title: '提示',
        content: '请先选择套餐',
        showCancel: false
      })
      return;
    }
    util_request._post('v1/shopCard/dueBills', { user_id: user_id, store_id: store_id, store_card_id: store_card_id, card_detail_id: card_detail_id }, function (data) {
      if (data.data.ret_code * 1 == 0) {
        var retData = data.data.ret_module;
        wx.setStorage({
          key: 'payDetailsData',
          data: retData,
        })
        wx.navigateTo({
          url: '../payDetails/payDetails?store_id=' + store_id + '&chargeAmount=' + retData.sum_recharge_money + '&entrance=cardRecharge'
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
  }
})