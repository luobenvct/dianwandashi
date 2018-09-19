// pages/couponUse/couponUse.js
var util_request = require('../../utils/request.js');

Page({

  /**
    * 页面的初始数据
    */
  data: {
    couponsNum: 0,
    isUsedIconUrl: null,
    couponlist: null,
    selectCoupon: 0,
    fivepages: null,
  },

  /**
    * 监听页面加载
    */
  onLoad: function (options) {
    var self = this;
    var store_id = Number(options.store_id);
    var sum_recharge_money = options.sum_recharge_money;
    var selectCoupon = options.selectCoupon;
    this.setData({
      fivepages: false
    })
    var currentPages = getCurrentPages();
    if (currentPages.length == 5) {
      this.setData({
        fivepages: true
      })
    }
    if (selectCoupon == 'noselect') {
      self.setData({
        isUsedIconUrl: 'https://metadata.zhutech.net/o_1bf664gn81tbonumhlu84s7uvr.png'
      })
    } else {
      self.setData({
        isUsedIconUrl: 'https://metadata.zhutech.net/o_1bf65iih91aa81l3sh3n1kut1n7om.png'
      })
    }
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var user_id = res.data.user_id;
        var putData = {
          user_id: user_id,
          price: sum_recharge_money,
          storeId: store_id
        }
        self.getCouponsByPrice(putData, selectCoupon);
      }
    })
  },

  /**
    * 获取优惠券
    */
  getCouponsByPrice: function (putData, selectCoupon) {
    var self = this;
    util_request._post('v2/getCouponsByPrice', putData, function (data) {
      if (data.data.ret_code * 1 == 0) {
        var couponlist = data.data.ret_module;
        var couponsNum = couponlist.length;
        for (var i = 0; i < couponlist.length; i++) {
          if (i == selectCoupon) {
            couponlist[i].select = true;
          } else {
            couponlist[i].select = false;
          }
        }
        self.setData({
          couponsNum: couponsNum,
          couponlist: couponlist
        })
      }
    }, function (fail) {
      console.log(fail)
    })
  },

  /**
    * 选择不使用优惠券
    */
  noUseCoupon: function () {
    var self = this;
    var couponlist = this.data.couponlist;
    for (var i = 0; i < couponlist.length; i++) {
      couponlist[i].select = false
    }
    this.setData({
      couponlist: couponlist,
      isUsedIconUrl: 'https://metadata.zhutech.net/o_1bf664gn81tbonumhlu84s7uvr.png'
    })
    this.setPayDetail({
      canuseCoupon: this.data.couponsNum,
      nouse: true,
      bargincoupon_id: null,
      defaultCouponMoney: 0,
      selectCoupon: 'noselect',
    });
  },

  /**
   * 选择使用优惠券
   */
  selectCoupon: function (event) {
    var couponlist = this.data.couponlist;
    var index = event.currentTarget.dataset.index;
    var coupon_id = couponlist[index].coupon_id;
    var price = couponlist[index].price;
    for (var i = 0; i < couponlist.length; i++) {
      couponlist[i].select = false;
      if (i == index) {
        couponlist[i].select = true
      }
    }
    this.setData({
      isUsedIconUrl: 'https://metadata.zhutech.net/o_1bf65iih91aa81l3sh3n1kut1n7om.png',
      couponlist: couponlist
    })
    this.setPayDetail({
      bargincoupon_id: coupon_id,
      defaultCouponMoney: price,
      selectCoupon: index,
      nouse: false
    });
  },

  /**
   * 选择后重设详情页信息
   */
  setPayDetail: function (setData) {
    var currentPages = getCurrentPages();
    var prePage = currentPages[currentPages.length - 2];
    prePage.setData(setData)
    wx.navigateBack({
      delta: 1
    })
  }
})