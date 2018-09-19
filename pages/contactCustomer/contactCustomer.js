// pages/contactCustomer/contactCustomer.js
const qiniuUploader = require("../../utils/qiniuUploader.js");
const util_request = require('../../utils/request.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['请选择反馈问题', '支付后机器不启动', '支付后未出币', '其他'],
    index: 0,
    coinsNum: 0,
    deviceNo: 0,
    mobile: null,
    image: '/img/add_photo.png',
    userId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this
    getApp().getUserInfo(function (loginInfo) { // 调用登录接口
      if (loginInfo == null) return;
      self.setData({
        userId: loginInfo.user_id,
      })
    })
  },

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  coinsInput: function (e) {
    this.setData({
      coinsNum: e.detail.value
    })
  },

  deviceNoInput: function (e) {
    this.setData({
      deviceNo: e.detail.value
    })
  },

  mobileInput: function (e) {
    this.setData({
      mobile: e.detail.value
    })
  },

  uploadImg: function () {
    var self = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], 
      sourceType: ['album', 'camera'],
      success: function (res) {
        self.getToken(res.tempFilePaths[0]);
      }
    })
  },

  getToken: function (path) {
    var self = this
    util_request._post('/v1/getqnToken', null, function (res) {
      if (res.data.ret_code * 1 == 0) {
        var token = res.data.ret_module.token;
        self.uploadToServer(path, token)
      } else {
        console.log(res)
      }
    }, function (res) {
      console.log(res)
    })
  },

  uploadToServer: function(path, token) {
    qiniuUploader.upload(path, (res) => {
      this.setData({
        image: res.imageURL
      })
    }, (error) => {
      console.log('error: ' + error);
    }, {
        region: 'ECN',
        uptoken: token,
        domain: 'https://metadata.dianwandashi.com/',
        uploadURL: 'https://up.qbox.me',
      }, (res) => {
        console.log('上传进度', res.progress)
        console.log('已经上传的数据长度', res.totalBytesSent)
        console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
      });
  },

  submit: function () {
    if (this.data.index == 0) {
      wx.showToast({
        title: '请选择反馈问题',
        image: '/img/closeCopon.png',
        duration: 1000
      })
      return;
    } else if (this.data.coinsNum <= 0) {
      wx.showToast({
        title: '请填写退款/币数',
        image: '/img/closeCopon.png',
        duration: 1000
      })
      return;
    } else if (this.data.deviceNo <= 0) {
      wx.showToast({
        title: '请输入设备编号',
        image: '/img/closeCopon.png',
        duration: 1000
      })
      return;
    } else {
      this.feedback();
    }
  },

  feedback: function () {
    var self = this
    let imageUrl = self.data.image != '/img/add_photo.png' ? self.data.image : null
    let phone = self.data.mobile > 0 ? self.data.mobile : null
    util_request._post('/user/v1/feedback', { 
      feedbackType: self.data.index,
      coins: self.data.coinsNum, 
      deviceNo: self.data.deviceNo,
      phone: phone,
      photos: imageUrl,
      userId: self.data.userId
      }, function (res) {
      if (res.data.ret_code * 1 == 0) {
        wx.showToast({
          title: '提交成功',
          duration: 1000,
          success: function (res) {
            wx.navigateBack({
              delta: 1
            })
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.ret_msg,
          showCancel: false,
        })
      }
    }, function (res) {
      console.log(res)
    })
  }
  
})