// pages/accpetShare/accpetShare.js
var util_request = require('../../utils/request.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addr: '杭州万达广场C座1301室',
    activity_id: '',
    recommendUserId: '',
    user_id: '',
    storeId: '',
    firend: {
      name: '',
      photo: ''
    },
    videoGame: {
      name: '',
      photo: ''
    },
    coins: null,
    coupons: null,
    hasShare: false,
    acceptMessage: '您已在该店充值过，不能被推荐哦!'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    var activity_id = options.activity_id;
    var user_id = options.user_id;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var recommendUserId = res.data.user_id;
        self.setData({
          activity_id: activity_id,
          recommendUserId: recommendUserId,
          user_id: user_id
        })
        self.getActivyInfo()
      }
    })
  },

  /**
   * 获取活动信息
   */
  getActivyInfo: function () {
    var self = this;
    var recommendUserId = this.data.recommendUserId;
    var activity_id = this.data.activity_id;
    var user_id = Number(this.data.user_id);
    util_request._postActivity('v1/getActivityByStoreId', { activity_id: activity_id, user_id: user_id }, function (res) {
      if (res.data.ret_code * 1 == 0) {
        var ret_Data = res.data.ret_module;
        var storeId = ret_Data.store_id;
        var coins = ret_Data.coinsNew != null ? ret_Data.coinsNew : 0;
        self.setData({
          storeId: storeId,
          addr: ret_Data.address,
          firend: {
            name: (ret_Data.userName != null && ret_Data.userName != '') ? ret_Data.userName : '电玩小子',
            photo: (ret_Data.userAvatar != null && ret_Data.userAvatar != '') ? ret_Data.userAvatar : 'https://metadata.dianwandashi.com/default_head.png'
          },
          videoGame: {
            name: ret_Data.name != null ? ret_Data.name : '电玩大师店铺',
            photo: ret_Data.photo != null ? ret_Data.photo : 'https://metadata.dianwandashi.com/default_store.png'
          },
          coins: coins,
          coupons: ret_Data.couponPrice != null ? ret_Data.couponPrice : null
        })
        var putData = {
          activity_id: activity_id,
          user_id: user_id,
          store_id: storeId,
          recommendUserId: recommendUserId,
          days: ret_Data.days,
          coins: coins,
          couponDays: ret_Data.coupon_valid_days,
          type: ret_Data.type
        }
        self.acceptRecommend(putData)
      }
    }, function (fail) {
      console.log(fail)
    })
  },

  /**
   * 进入小程序
   */
  gotoIndex: function () {
    wx.switchTab({
      url: '../index/index'
    })
  },

  /**
   * 接受分享修改UI
   */
  acceptRecommend: function (putData) {
    var self = this;
    util_request._postActivity('v3/acceptRecommend', putData, function (res) {
      if (res.data.ret_code * 1 == 0) {
        self.setData({
          hasShare: false
        })
      } else if (res.data.ret_code * 1 == 500) {
        self.setData({
          hasShare: true,
          acceptMessage: res.data.ret_msg
        })
      }
    }, function (fail) {
      console.log(fail)
    })
  }
})