// pages/shakingMachineRecharge/shakingMachineRecharge.js
var util_request = require('../../utils/request.js');
var util = require('../../utils/wxmd5.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    buttonData: [
      { money: 1, btnStyle: 'btnDefault' }
      // ,
      // { money: 2, btnStyle: 'btnDefault' },
      // { money: 3, btnStyle: 'btnDefault' }
    ],
    oldTimeStamp: 0,
    device_info: null,
    showModal: false,
    insertData: {}
  },

  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var self = this
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var userId = res.data.user_id;
        self.setData({
          userId: userId
        })
        wx.getStorage({
          key: 'getDeviceParas',
          success: function (res) {
            self.getDevInfo(res.data)
          }
        })
      }
    })
  },

  /**
   * 获取设备信息
   */
  getDevInfo: function (putData) {
    var self = this;
    util_request._post('device/v1/getDevInfoByDevNo', putData,
      function (data) {
        if (data.data.ret_code * 1 == 0) {
          var device_info = data.data.ret_module;
          wx.setNavigationBarTitle({
            title: device_info.model_name
          })
          var ratio = self.accMul(device_info.cost_per_coin, device_info.leastCoins)
          for (var i = 0; i < self.data.buttonData.length; i++) {
            self.data.buttonData[i].money = self.accMul(self.data.buttonData[i].money, ratio)
          }
          self.setData({
            buttonData: self.data.buttonData,
            device_info: device_info,
            leastCoins: device_info.leastCoins
          })
        } else {
          wx.showModal({
            title: '提示',
            content: data.data.ret_msg,
            showCancel: false,
          })
        }
      }, function (fail) {
        console.log(fail)
      })
  },

  /**
   * 投币金额换算方法
   */
  accMul: function (arg1, arg2) {
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try { m += s1.split(".")[1].length } catch (e) { }
    try { m += s2.split(".")[1].length } catch (e) { }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
  },

  /**
   * 投币
   */
  insert: function (e) {
    var timeStamp = e.timeStamp;
    var device_info = this.data.device_info;
    var money = e.currentTarget.dataset.money;
    var coins = e.currentTarget.dataset.coins;
    var index = e.currentTarget.dataset.index;
    var self = this;
    if (timeStamp - this.data.oldTimeStamp > 500) {
      this.data.buttonData[index].btnStyle = 'checkBtn'
      if (device_info.device_typename == "摇摇机" || "摇摇车" || "摇摆机") {
        wx.getStorage({
          key: 'hiddenToolTip',
          success: function (res) {
            self.insertFun(index, coins, money)
          },
          fail: function () {
            self.setData({
              insertData: {
                coins: coins,
                index: index,
                money: money,
              },
              showModal: true
            })
          }
        })
      } else {
        this.insertFun(index, coins, money)
      }
    }
    this.setData({
      oldTimeStamp: timeStamp,
      buttonData: this.data.buttonData
    })
  },

  /**
   * 点击知道了
   */
  tipKnowInsert: function (e) {
    var self = this;
    var timeStamp = e.timeStamp;
    var money = this.data.insertData.money;
    var coins = this.data.insertData.coins;
    var index = this.data.insertData.index;
    if (timeStamp - this.data.oldTimeStamp > 500) {
      this.insertFun(index, coins, money)
      this.setData({
        showModal: false
      })
    }
    this.setData({
      oldTimeStamp: timeStamp,
    })
  },

  /**
   * 点击不再提示
   */
  neverTipInsert: function (e) {
    var self = this;
    var timeStamp = e.timeStamp;
    var money = this.data.insertData.money;
    var coins = this.data.insertData.coins;
    var index = this.data.insertData.index;
    if (timeStamp - this.data.oldTimeStamp > 500) {
      this.insertFun(index, coins, money)
      this.setData({
        showModal: false
      })
      wx.setStorage({
        key: 'hiddenToolTip',
        data: 'true'
      })
    }
    this.setData({
      oldTimeStamp: timeStamp,
    })
  },

  /**
   * 投币方法
   */
  insertFun: function (index, coins, money) {
    var self = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var openId = res.data.open_id;
        var device_info = self.data.device_info;
        var userId = res.data.user_id;
        var device_id = device_info.device_id;
        var slot_num = device_info.selSlotNum;
        var device_no = device_info.device_no;
        var validate_str = userId + ':' + device_id + ':' + coins;
        validate_str = validate_str.toUpperCase();
        validate_str = util.md5(validate_str);
        var putData = {
          type: 3,
          deviceId: device_id,
          storeId: device_info.store_id,
          userId: userId,
          money: money,
          coins: coins,
          openId: openId,
          deviceNo: device_no,
          slotNum: slot_num,
          devTypeName: device_info.device_typename,
          comboId: device_info.comboId
        }
        self.takeBills(putData);
      },
    })
  },

  /**
   * 投币请求接口
   */
  takeBills: function (putData) {
    var self = this;
    util_request._post('store/v2/takeBills', putData,
      function (res) {
        if (res.data.ret_code * 1 == 0) {
          var data = res.data;
          var timeStamp = data.ret_module.timeStamp;
          var nonceStr = data.ret_module.nonceStr;
          var packageStr = data.ret_module.package;
          var paySign = data.ret_module.paySign;
          self.wxRetPayment(timeStamp, nonceStr, packageStr, paySign);
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.ret_msg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                self.resetBtnData();
              }
            }
          })
        }
      }, function (res) {
        console.log(res)
      })
  },

  /**
   * 调起微信支付
   */
  wxRetPayment: function (timeStamp, nonceStr, packageStr, paySign) {
    var self = this;
    wx.requestPayment({
      'timeStamp': timeStamp,
      'nonceStr': nonceStr,
      'package': packageStr,
      'signType': 'MD5',
      'paySign': paySign,
      'success': function (res) {
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 1000,
          mask: true
        })
        self.resetBtnData();
      },
      'fail': function (res) {
        wx.showModal({
          title: '提示',
          content: '支付失败',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              self.resetBtnData();
            }
          }
        })
      }
    })
  },

  /**
   * 重置按钮样式
   */
  resetBtnData: function () {
    for (var i = 0; i < this.data.buttonData.length; i++) {
      this.data.buttonData[i].btnStyle = 'btnDefault'
    }
    this.setData({
      buttonData: this.data.buttonData
    })
  },

  /**
   * 重新投币
   */
  againInsert: function () {
    var self = this;
    var userId = this.data.userId;
    var device_info = this.data.device_info;
    var device_id = device_info.device_id
    var slot_num = device_info.slot_num == 1?1:device_info.selSlotNum
    var device_no = device_info.device_no
    var putData = {
      deviceId: device_id,
      userId: userId,
      deviceNo: device_no,
      slotNum: slot_num
    }
    wx.showToast({
      title: '重新投币中...',
      icon: 'loading',
      duration: 2000,
      mask: true
    })
    setTimeout(function () {
      self.reStackCoins(putData);
    }, 2000)
  },

  /**
   * 重新投币后联系客服
   */
  reStackCoins: function (putData) {
    util_request._post('device/v1/reStackCoins', putData,
      function (res) {
        if (res.data.ret_code * 1 == 0) {
          wx.showModal({
            title: '提示',
            content: '机器仍未启动?联系客服 0571-87778782',
            confirmText: '拨打',
            success: function (res) {
              if (res.confirm) {
                wx.makePhoneCall({
                  phoneNumber: '0571-87778782'
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: res.data.ret_msg,
            duration: 1000
          })
        }
      },
      function (fail) {
        console.log(fail)
      })
  }
})