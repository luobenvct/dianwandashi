// pages/payDetails/payDetails.js
var util_request = require('../../utils/request.js');

Page({

  /**
   * 页面初始化参数
   */
  data: {
    userId: null,
    storeId: null,
    out_trade_no: null,
    old_out_trade_no: null,
    chargeAmount: 0,
    open_id: null,
    bargincoupon_id: null,
    sum_recharge_money: 0,
    defaultCouponMoney: 0,
    selectCoupon: 0,
    nouse: false,
    canuseCoupon: 0,
    couponAfterMoney: 0,
    lastTapDiffTime: 0,
    entrance: ''
  },

  /**
   * 监听页面初始化
   */
  onLoad: function (options) {
    var self = this;
    var entrance = options.entrance;
    var chargeAmount = options.chargeAmount;
    var storeId = options.store_id;
    this.setData({
      entrance: entrance,
      chargeAmount: chargeAmount,
      storeId: storeId,
    })
    this.getTradeNo();
  },

  /**
   * 监听页面显示
   */
  onShow: function () {
    var recharge_money = parseFloat((this.data.sum_recharge_money - this.data.defaultCouponMoney).toFixed(2))
    this.setData({
      couponAfterMoney: recharge_money
    })
  },

  /**
   * 获取订单信息
   */
  getTradeNo: function () {
    var self = this;
    wx.getStorage({
      key: 'payDetailsData',
      success: function (payDetails) {
        var out_trade_no = payDetails.data.out_trade_no
        var sum_recharge_money = payDetails.data.sum_recharge_money
        var bargincoupon_id;
        var defaultCouponMoney;
        if (payDetails.data.recommmend_barginCoupon != null && payDetails.data.recommmend_barginCoupon.length > 0) {
          var barginCoupon = payDetails.data.recommmend_barginCoupon[0]
          bargincoupon_id = barginCoupon.coupon_id;
          defaultCouponMoney = barginCoupon.price
        } else {
          defaultCouponMoney = 0;
          bargincoupon_id = '';
        }
        wx.getStorage({
          key: 'loginInfo',
          success: function (login) {
            self.setData({
              userId: login.data.user_id,
              out_trade_no: out_trade_no,
              open_id: login.data.open_id,
              bargincoupon_id: bargincoupon_id,
              sum_recharge_money: sum_recharge_money,
              defaultCouponMoney: defaultCouponMoney,
              couponAfterMoney: parseFloat((sum_recharge_money - defaultCouponMoney).toFixed(2))
            })
          }

        })
      }
    })
  },

  /**
   * 充值
   */
  goRecharge: function (event) {
    var self = this;
    var putData;
    var out_trade_no = this.data.out_trade_no;
    var curtime = event.timeStamp;
    var bargincoupon_id;
    if (this.data.bargincoupon_id){
      bargincoupon_id = this.data.bargincoupon_id;
    }else{
      bargincoupon_id = '';
    }
    // var bargincoupon_id = this.data.bargincoupon_id;
    var lastTime = this.data.lastTapDiffTime;
    var open_id = this.data.open_id;
    this.setData({
      lastTapDiffTime: curtime
    })
    if (bargincoupon_id) {
      putData = {
        out_trade_no: out_trade_no,
        bargincoupon_id: bargincoupon_id,
        open_id: open_id,
      }
    } else {
      putData = {
        out_trade_no: out_trade_no,
        open_id: open_id,
      }
    }
    if (curtime - lastTime > 500) {
      this.unionOrders(putData)
    }
  },

  /**
   * 下充值订单
   */
  unionOrders: function (putData) {
    var self = this;
    util_request._post('v2/unionOrders', putData,
      function (data) {
        var data = data.data;
        if (data.ret_code * 1 == 0) {
          var out_trade_no = self.data.out_trade_no;
          var old_out_trade_no = self.data.old_out_trade_no;
          if (out_trade_no == old_out_trade_no) {
            wx.showModal({
              title: '提示',
              content: '请勿重复提交订单',
              showCancel: false
            })
          } else {
            var out_trade_no = data.ret_module.out_trade_no;
            var timeStamp = data.ret_module.timeStamp;
            var nonceStr = data.ret_module.nonceStr;
            var packageStr = data.ret_module.package;
            var signType = 'MD5';
            var paySign = data.ret_module.paySign;
            self.setData({
              out_trade_no: out_trade_no,
              old_out_trade_no: out_trade_no
            })
            self.wxRequestPayment(timeStamp, nonceStr, signType, packageStr, paySign);
          }
        } else if (data.ret_code * 1 == 500){
          wx.showModal({
            title: '提示',
            content: data.ret_msg,
            showCancel: false
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '支付失败',
            showCancel: false
          })
        }
      }, function (failMsg) {
        console.log(failMsg)
      })
  },

  /**
   * 调用前端微信支付
   */
  wxRequestPayment: function (timeStamp, nonceStr, signType, packageStr, paySign) {
    var self = this;
    wx.requestPayment({
      'timeStamp': timeStamp,
      'nonceStr': nonceStr,
      'package': packageStr,
      'signType': signType,
      'paySign': paySign,
      'success': function (res) {
        // 支付成功改变对应电玩城数据
        wx.showToast({
          title: '充值成功',
          icon: 'success',
          duration: 1000,
          success: function () {
            self.changePreData()
          }
        })
      },
      'fail': function (res) {
        wx.showModal({
          title: '提示',
          content: '支付失败',
          showCancel: false
        })
        self.setData({
          old_out_trade_no: null
        })
      }
    })
  },

  /**
   * 换优惠券
   */
  goChangeCoupon: function () {
    var storeId = this.data.storeId;
    var sum_recharge_money = this.data.sum_recharge_money;
    var selectCoupon = this.data.selectCoupon;
    wx.navigateTo({
      url: '../couponUse/couponUse?sum_recharge_money=' + sum_recharge_money + '&selectCoupon=' + selectCoupon + '&store_id=' + storeId,
    })
  },

  /**
   * 支付成功后修改充值页数据
   */
  changePreData: function () {
    var self = this;
    var storeId = this.data.storeId
    var entrance = this.data.entrance;
    var currentPages = getCurrentPages();
    var chargeAmount = this.data.chargeAmount;
    var userId = this.data.userId;
    if (entrance == 'onlyRecharge') {
      if (currentPages[0].route == 'pages/recharge/recharge' || currentPages[0].__route__ == 'pages/recharge/recharge') {
        var rechargeListPage = currentPages[currentPages.length - 3];
        rechargeListPage.setData({
          drawInfo: {
            chargeAmount: chargeAmount,
            storeId: storeId,
            userId: userId
          }
        })
        wx.navigateBack({
          delta: 2
        })
      } else {
        wx.navigateBack({
          delta: 2
        })
      }
    } else if (entrance == 'rechargeInsert') {
      this.getDevInfo()
    } else if (entrance == 'comeFromInsert') {
      var insertPage = currentPages[currentPages.length - 3];
      insertPage.setData({
        chargeAmount: chargeAmount
      })
      wx.navigateBack({
        delta: 2
      })
    } else if (entrance == 'cardRecharge') {
      wx.navigateBack({
        delta: 2
      })
    }
  },

  /**
   * 通过首页扫码币数不足跳充值,充值成功处理
   */
  getDevInfo: function () {
    var self = this;
    var userId = this.data.userId;
    var chargeAmount = this.data.chargeAmount;
    wx.getStorage({
      key: 'getDeviceParas',
      success: function (res) {
        var putData = res.data;
        util_request._post('device/v1/getDevInfoByDevNo', putData, function (data) {
          if (data.data.ret_code * 1 == 0) {
            var device_info = data.data.ret_module;
            var slot_num = device_info.slot_num;
            var selSlotNum = device_info.selSlotNum;
            var model_name = device_info.model_name;
            var storeId = device_info.store_id;
            if (device_info.device_typename == '虚拟设备') {
              wx.redirectTo({
                url: '../virtualSceneInsert/virtualSceneInsert'
              })
              return;
            }
            if (slot_num == 1) { //机器位置为1个
              wx.redirectTo({
                url: '../insertCoin/insertCoin?checkposition=0&chargeAmount=' + chargeAmount + '&user_id=' + userId
              })
            } else if (selSlotNum >= 1 && selSlotNum <= slot_num) { //已有选中的位置
              wx.redirectTo({
                url: '../insertCoin/insertCoin?checkposition=' + selSlotNum + '&user_id=' + userId + '&chargeAmount=' + chargeAmount
              })
            } else { //其他
              wx.redirectTo({
                url: '../chosenPosition/chosenPosition?machineName=' + model_name + '&slot_num=' + slot_num + '&user_id=' + userId + '&chargeAmount=' + chargeAmount
              })
            }
          } else {
            wx.showModal({
              title: '提示',
              content: data.data.ret_msg,
              showCancel: false
            })
          }
        }, function (fail) {
          console.log(fail)
        })
      }
    })
  }
})