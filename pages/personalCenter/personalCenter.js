// pages/personalCenter/personalCenter.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userImg: '',
    userName: '',
    userId: ''
  },

  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var userId = res.data.user_id;
        var userImg = res.data.userInfo.avatarUrl;
        var userName = res.data.userInfo.nickName;
        self.setData({
          userImg: userImg,
          userName: userName,
          userId: userId
        })
      }
    })
  }
})