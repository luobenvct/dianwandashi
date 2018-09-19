// pages/chosenPosition/chosenPosition.js
var util_request = require('../../utils/request.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chargeAmount: '',
    positiondata: [],
    machineName: '',
    user_id: null
  },

  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var positiondata = [];
    var slot_num = Number(options.slot_num);
    for (var i = 0; i < slot_num; i++) {
      positiondata.push(i + 1);
    }
    this.setData({
      chargeAmount: options.chargeAmount,
      positiondata: positiondata,
      machineName: options.machineName,
      user_id: options.user_id
    })
  },

  /**
   * 选位后跳转
   */
  checkPosition: function (event) {
    var chargeAmount = this.data.chargeAmount;
    var checkposition = event.currentTarget.dataset.index + 1;
    var user_id = this.data.user_id;
    wx.redirectTo({
      url: '../insertCoin/insertCoin?checkposition=' + checkposition + '&user_id=' + user_id + '&chargeAmount=' + chargeAmount
    })
  }
})