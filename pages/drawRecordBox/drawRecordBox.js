// pages/drawRecordBox/drawRecordBox.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:null
  },

  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var lotteryId = options.lotteryId
    var storeId = options.storeId
    var userId = options.userId
    var urlbefore = getApp().globalData.baseWapUrl + 'draw/drawRecord.html?'
    this.setData({
      url: urlbefore + 'lotteryId=' + lotteryId + '&storeId=' + storeId + '&userId=' + userId
    })
  }
})