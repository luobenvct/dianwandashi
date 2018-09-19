// pages/easter/easter.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:''
  },

  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var easter_id = options.easterId
    var urlbefore = getApp().globalData.baseWapUrl + 'easter/easter.html?easter_id='
    this.setData({
      url: urlbefore + easter_id
    })
  }
})