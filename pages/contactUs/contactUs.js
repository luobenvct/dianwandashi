// pages/contactUs/contactUs.js
Page({

  /**
  * 打电话
  */
  callphone: function () {
    wx.makePhoneCall({
      phoneNumber: '400-069-8068'
    })
  }
})