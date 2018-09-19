// pages/couponList/couponList.js
var util_request = require('../../utils/request.js');

Page({

  /**
    * 页面的初始数据
    */
  data: {
    avalibleCouponNum: null,
    avalibleCouponList: [],
    disCouponList: [],
    fall_due_coupons: 0,
    couponListNum: null
  },

  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    wx.showLoading({
      title: '数据加载中',
    })
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var user_id = res.data.user_id
        self.setData({
          user_id: user_id
        })
        util_request._post('v2/readCoupons', { user_id: user_id, type: 1 }, function (data) {
          // 更新优惠券信息
        }, function (fail) {
          console.log(fail)
        })
        self.listBarginCouponsInfoByuserId()
      }
    })
  },

  /**
   * 监听页面渲染完成
   */
  onReady: function (options) {
    wx.hideLoading()
  },

  /**
   * 获取优惠券列表
   */
  listBarginCouponsInfoByuserId: function () {
    var self = this;
    var user_id = this.data.user_id;
    util_request._post('v1/listBarginCouponsInfoByuserId', { user_id: user_id }, function (data) {
      if (data.data.ret_code * 1 == 0) {
        var retData = data.data.ret_module;
        var avalibleCouponList = retData.avalibleCouponsdata;
        var avalibleCouponNum = avalibleCouponList.length;
        var couponListNum = retData.totalCountForeDisAvalibleCoupons;
        var disCouponList = retData.disavalibleCouponsdata;
        var fall_due_coupons = retData.fall_due_coupons;
        self.setData({
          fall_due_coupons: fall_due_coupons,
          avalibleCouponList: avalibleCouponList,
          avalibleCouponNum: avalibleCouponNum,
          disCouponList: disCouponList,
          couponListNum: couponListNum
        })

      } else {
        wx.showModal({
          title: '提示',
          content: data.data.ret_msg,
          showCancel: false
        })
      }
    }, function (fail) {
      // 请求失败
    })
  }
})