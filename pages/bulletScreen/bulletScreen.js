// pages/bulletScreen/bulletScreen.js
var sensitiveLib = require('../../utils/sensitiveWord.js');
var util_request = require('../../utils/request.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    textareaNum: 0,
    bulletStyle: 'disSendBullet',
    isSendBullet: true,
    inputVal: '',
    deviceNo: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      deviceNo: options.device_no
    })
  },

  /**
   * 监听输入弹幕
   */
  inputBullet: function (e) {
    var bulletVal = e.detail.value
    if (bulletVal.length > 0) {
      this.setData({
        bulletStyle: 'canSendBullet',
        isSendBullet: false
      })
    } else {
      this.setData({
        bulletStyle: 'disSendBullet',
        isSendBullet: true
      })
    }
    this.setData({
      textareaNum: bulletVal.length,
      inputVal: bulletVal
    })
  },

  /**
   * 发送弹幕
   */
  sendBullet: function () {
    var self = this;
    var deviceNo = this.data.deviceNo;
    var message = this.data.inputVal;
    var isCanSend = true;
    sensitiveLib.forEach(item => {
      if (message == item) {
        self.bulletShowToast('请文明用语');
        isCanSend = false;
      }
    })
    if (isCanSend) {
      util_request._post('index/v1/sendBarrage', { deviceNo: deviceNo, message: message }, function (data) {
        if (data.data.ret_code * 1 == 0) {
          self.bulletShowToast('发送成功');
          self.setData({
            textareaNum: 0,
            inputVal: '',
            bulletStyle: 'disSendBullet',
            isSendBullet: true
          })
        }
      }, function (fail) {
        console.log(fail)
      })
    }
  },

  /**
   * toast弹窗
   */
  bulletShowToast:function(content){
    wx.showToast({
      title: content,
      icon: "none",
      mask: 'true'
    })
  }
})