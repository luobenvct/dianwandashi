// pages/gotoVip/gotoVip.js
Page({

  /**
   * 点击按钮保存图片
   */
  saveImg: function () {
    wx.downloadFile({
      url: 'https://metadata.zhutech.net/o_1bsptj986g471vr87911aqc1h87m.png',
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success() {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 1000
            })
          },
          fail: function (res) {
            console.log(res)
          }
        })
      }
    })
  },

  /**
   * 点击二维码放大
   */
  previewPic: function () {
    wx.previewImage({
      current: 'https://metadata.zhutech.net/o_1bsptj986g471vr87911aqc1h87m.png',
      urls: ['https://metadata.zhutech.net/o_1bsptj986g471vr87911aqc1h87m.png']
    })
  }
})