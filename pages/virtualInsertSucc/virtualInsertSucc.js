// pages/virtualInsertSucc/virtualInsertSucc.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coins:null,
    isNavigaterBackIndex: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title:options.modelName
    })
    this.setData({
      coins:options.coins,
      isNavigaterBackIndex: Number(options.isNavigaterBackIndex)
    })
  },

  /**
   * 返回
   */
  back: function(){
    if (!this.data.isNavigaterBackIndex){
      wx.navigateBack({
        delta: 1
      })
    } else {
      wx.navigateBack({
        delta: 2
      })
    }
    
  }
})