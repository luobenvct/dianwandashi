//index.js
var util_request = require('../../utils/request.js');
var app = getApp();
var gotoURL = app.globalData.baseWapUrl + 'coin';
var shareUrl = app.globalData.baseWapUrl + 'recommend/recommendIndex.html';
var rechargeUrl = app.globalData.baseWapUrl + 'recharge';
var acceptShare = app.globalData.baseWapUrl + 'share';
var barrage = app.globalData.baseWapUrl + 'barrage';
var cardUrl = app.globalData.baseWapUrl + 'card';
var cardPayUrl = app.globalData.baseWapUrl + 'cardpay';
var integralUrl = app.globalData.baseWapUrl + 'integral';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    user_id: null,
    isCouponRead: false,
    expireCouponCount: 0,
    isHidden: true,
    scrollStatus: true,
    newCoupons: null,
    coupon_list_box_style: 'coupon_list_box',
    optionsUrl: null,
    isShow: false,
  },

  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    var optionsUrl = decodeURIComponent(options.q);
    this.setData({
      optionsUrl: optionsUrl
    })

    app.getUserInfo(function (loginInfo) { // 调用登录接口
      if (!loginInfo) {
        self.openAutoSetting()
      } else {
        if (loginInfo == null) return;
        var user_id = loginInfo.user_id;
        self.setData({
          user_id: user_id
        })
        self.isUnReadNews(user_id);
        self.getNewCoupon(user_id);
        self.goToUrl(optionsUrl, true);
      }
    })
  },

  /**
   * 调起客户端小程序设置界面
   */
  openAutoSetting: function () {
    wx.showModal({
      title: '提示',
      content: '因为您拒绝授予权限，所以无法进行扫码，请重新点击允许哦！',
      success: res => {
        if (res.confirm) {
          wx.openSetting({
            success: (res) => {
              if (res.authSetting["scope.userInfo"]) {
                app.getUserInfo(loginInfo => {
                  var user_id = loginInfo.user_id;
                  this.setData({
                    user_id: user_id
                  })
                  this.isUnReadNews(user_id);
                  this.getNewCoupon(user_id);
                  this.goToUrl(this.data.optionsUrl, true);
                })
              }
            }
          })
        } else if (res.cancel) {
          wx.navigateBack({
            delta: 1
          })
        }
      }
    })

  },


  /**
   * 监听页面显示
   */
  onShow: function () {
    if (this.data.isShow) {
      wx.getSetting({
        success: (res) => {
          if (!res.authSetting["scope.userInfo"]) {
            this.openAutoSetting()
          }
        }
      })
      this.isUnReadNews(this.data.user_id);
      this.getUserLocation(this.data.user_id);
      this.getNewCoupon(this.data.user_id);
    } else {
      this.setData({
        isShow: true
      })
    }
  },

  /**
   * 扫码跳转页面
   */
  scanCode: function () {
    wx.scanCode({
      success: (res) => {
        var url = res.result;
        this.goToUrl(url, false);
      }
    })
  },

  /**
   * 页面跳转判断
   */
  goToUrl: function (url, isWxScanCode) {
    var user_id = this.data.user_id;
    if (url != 'undefined') {
      var arr = url.split("?");
      var isRead = false;
      if (arr[0] == gotoURL) {
        var parasObj = this.processParas(arr[1]);
        parasObj.user_id = user_id;
        this.getDevInfo(parasObj, 'rechargeInsert');
        isRead = true;
      } else if (arr[0] == shareUrl) {
        wx.navigateTo({
          url: '../shareAward/shareAward?' + arr[1] + '&type=share'
        })
        isRead = true;
      }
      //  else if (arr[0] == rechargeUrl) {
      //   this.getDevInfo(parasObj, 'onlyRecharge')
      //   isRead = true;
      // } 
      else if (arr[0] == acceptShare) {
        wx.navigateTo({
          url: '../accpetShare/accpetShare?' + arr[1]
        })
        isRead = true;
      } else if (arr[0] == barrage) {
        wx.navigateTo({
          url: '../bulletScreen/bulletScreen?' + arr[1]
        })
        isRead = true;
      } else if (arr[0] == cardUrl) {
        var obj = this.processParas(arr[1]);
        wx.navigateTo({
          url: '../cardVoucherDetail/cardVoucherDetail?store_id=' + obj.store_id + '&store_name=' + decodeURIComponent(obj.store_name)
        })
        isRead = true;
      } else if (arr[0] == cardPayUrl) {
        var parasObj = this.processParas(arr[1]);
        var payData = { 'out_trade_no': parasObj.order_id, 'sum_recharge_money': parasObj.price}
        wx.setStorage({
          key: 'payDetailsData',
          data: payData,
        })
        wx.navigateTo({
          url: '../payDetails/payDetails?store_id=' + parasObj.store_id + '&chargeAmount=' + parasObj.price + '&entrance=cardRecharge'
        })
        isRead = true;
      } else if (arr[0] == integralUrl) {
        var parasObj = this.processParas(arr[1]);
        wx.navigateTo({
          url: '../eggDraw/eggDraw?code=' + parasObj.code 
        })
        isRead = true;
      }
      if (!isWxScanCode) {
        if (url.indexOf('https://a.app.qq.com/o/simple.jsp?pkgname=com.dianwandashi.game') != -1) {
          wx.showModal({
            title: '提示',
            content: '请扫席位二维码',
            showCancel: false
          })
        } else if (!isRead) {
          wx.showModal({
            title: '提示',
            content: '无法识别',
            showCancel: false
          })
        }
      }
    }
  },

  /**
  * url后参数处理
  */
  processParas: function (str) {
    var parasFirstArr = str.split('&');
    var parasObj = {}
    for (var i = 0; i < parasFirstArr.length; i++) {
      var paraName = parasFirstArr[i].split('=')[0];
      var paraVal = parasFirstArr[i].split('=')[1];
      parasObj[paraName] = paraVal
    }
    return parasObj
  },

  /**
  * 获取设备信息
  */
  getDevInfo: function (putData, entrance) {
    var self = this;
    var user_id = this.data.user_id;
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 60000,
      mask: true,
    })
    util_request._post('device/v1/getDevInfoByDevNo', putData, function (data) {
      wx.hideToast()
      if (data.data.ret_code * 1 == 0) {
        var device_info = data.data.ret_module;
        wx.setStorage({
          key: 'device_info',
          data: device_info
        })
        wx.setStorage({
          key: 'getDeviceParas',
          data: putData
        })
        var storeName = device_info.store_name;
        var slot_num = device_info.slot_num;
        var selSlotNum = device_info.selSlotNum;
        var consume_type = device_info.consume_type;
        var coins = device_info.coins;
        var model_name = device_info.model_name;
        var storeId = device_info.store_id;
        if (device_info.deviceCombos.length <= 0 || device_info.deviceCombosStyle.length <=0){
          wx.showModal({
            title: '提示',
            content: '未设置基础套餐,请联系商家',
            showCancel: false
          })
          return;
        }

        if (entrance == 'onlyRecharge') {
          wx.navigateTo({
            url: '../storeRecharge/storeRecharge?storeId=' + storeId + '&user_id=' + user_id + '&store_name=' + store_name + '&entrance=onlyRecharge'
          })
        } else {
          if (consume_type == 1){
            wx.getStorage({
              key: 'endTime',
              success: function (res) {
                if (Date.parse(new Date()) < res.data && device_info.device_typename == '按摩椅') {
                  wx.navigateTo({
                    url: '../remoteControl/remoteControl?device_no=' + device_info.device_no + '&model_name=' + device_info.model_name
                  })
                } else {
                  wx.navigateTo({
                    url: '../coinMachine/coinMachine'
                  })
                }
              },
              fail: function (res) {
                wx.navigateTo({
                  url: '../coinMachine/coinMachine'
                })
              }
            })
          }else{
            if (device_info.device_typename == '虚拟设备') {//判断是否是虚拟设备
              if (coins != 0) {
                wx.navigateTo({
                  url: '../virtualSceneInsert/virtualSceneInsert'
                })
              } else {
                wx.navigateTo({
                  url: '../storeRecharge/storeRecharge?storeId=' + storeId + '&userId=' + user_id + '&storeName=' + storeName + '&entrance=' + entrance
                })
              }
              return;
            }else{
              if (coins != 0) {
                if (slot_num == 1) { //机器位置为1个
                  wx.navigateTo({
                    url: '../insertCoin/insertCoin?checkposition=0&chargeAmount=0&user_id=' + user_id
                  })
                } else if (selSlotNum >= 1 && selSlotNum <= slot_num) { //已有选中的位置
                  wx.navigateTo({
                    url: '../insertCoin/insertCoin?checkposition=' + selSlotNum + '&user_id=' + user_id + '&chargeAmount=0'
                  })
                } else { //其他
                  wx.navigateTo({
                    url: '../chosenPosition/chosenPosition?machineName=' + model_name + '&slot_num=' + slot_num + '&user_id=' + user_id + '&chargeAmount=0'
                  })
                }
              } else {
                wx.navigateTo({
                  url: '../storeRecharge/storeRecharge?storeId=' + storeId + '&userId=' + user_id + '&storeName=' + storeName + '&entrance=rechargeInsert'
                })
              }
            }
          } 
        }
      } else {
        wx.showModal({
          title: '提示',
          content: data.data.ret_msg,
          showCancel: false
        })
      }
    }, function (fail) {
      wx.hideToast()      
      console.log(fail)
    })
  },

  /**
   * 获取坐标
   */
  getUserLocation: function (user_id) {
    var self = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var getLocationInfo = res;
        var latitude = res.latitude
        var longitude = res.longitude
        wx.request({
          url: 'https://api.map.baidu.com/geocoder/v2/',
          type: 'POST',
          data: {
            location: latitude + ',' + longitude,
            ak: 'xMjFYNbds2pFmAymmrbguseciGaHOuGG',
            output: 'json',
            pois: 1,
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            if (res.data.status == 0) {
              var area_name = res.data.result.addressComponent.city;
              var putData = {
                user_id: user_id,
                area_name: area_name
              }
              self.updateAreaCode(putData)
            }
          }
        })
      }
    })
  },

  /**
   * 更新坐标
   */
  updateAreaCode: function (putData) {
    util_request._post('v1/updateAreaCode', putData, function (res) { }, function (res) { })
  },

  /**
    * 判断是否有未阅读的优惠券
    */
  isUnReadNews: function (user_id) {
    var self = this;
    util_request._post('v1/isUnReadNews', { user_id: user_id }, function (data) {
      if (data.data.ret_code * 1 == 0) {
        var resData = data.data.ret_module;
        var hasUnReadCouponInfos = false;
        if (resData.isCouponRead != null)
          hasUnReadCouponInfos = resData.isCouponRead;
        if (!hasUnReadCouponInfos) {
          self.setData({
            isCouponRead: true
          })
        } else {
          self.setData({
            isCouponRead: false
          })
        }
        self.setData({
          expireCouponCount: resData.expireCouponCount
        })
        self.isHintExpire();
      }
    }, function (fail) {
      console.log(fail)
    })
  },

  /**
   * 即将过期优惠券提示
   */
  isHintExpire: function () {
    var self = this;
    var expireCouponCount = this.data.expireCouponCount
    wx.getStorage({
      key: 'isHintExpireTime',
      success: function (res) {
        var beforeTime = res.data;
        var nowTime = new Date().toLocaleDateString();
        if (expireCouponCount > 0 && nowTime != beforeTime) {
          self.setData({
            isHidden: false
          })
          wx.setStorage({
            key: 'isHintExpireTime',
            data: new Date().toLocaleDateString()
          })
        }
      },
      fail: function () {
        if (expireCouponCount > 0) {
          self.setData({
            isHidden: false
          })
          wx.setStorage({
            key: 'isHintExpireTime',
            data: new Date().toLocaleDateString()
          })
        }
      }
    })
  },

  /**
   * 跳转优惠券详情页
   */
  goToCoupon: function () {
    this.setData({
      scrollStatus: true
    })
  },

  /**
   * 新优惠券提示
   */
  getNewCoupon: function (userId) {
    var self = this;
    util_request._post('v1/getNewCouponsByUserId', { userId: userId }, function (data) {
      if (data.data.ret_code * 1 == 0) {
        var newCoupons = data.data.ret_module;
        if (newCoupons == null || newCoupons.length == 0) {
          self.setData({
            scrollStatus: true
          })
        } else {
          self.readCoupons(userId)
          self.setData({
            scrollStatus: false,
            newCoupons: newCoupons
          })
          if (newCoupons.length <= 3) {
            self.setData({
              coupon_list_box_style: 'coupon_list_box'
            })
          } else {
            self.setData({
              coupon_list_box_style: 'coupon_list_box_full'
            })
          }
        }
      }
    }, function (fail) {
      console.log(fail)
    })
  },

  /**
   * 关闭优惠券提示弹窗
   */
  closeCouponBox: function () {
    this.setData({
      scrollStatus: true
    })
  },

  /**
   * 更新优惠券提示
   */
  readCoupons: function (userId) {
    util_request._post('v2/readCoupons', { user_id: userId, type: 2 },
      function (data) { }, function (fail) {
      })
  },

  /**
   * 转发首页
   */
  onShareAppMessage: function (res) {
    return {
      title: '电玩爱好者就来电玩大师！',
      path: '/pages/index/index',
      imageUrl: 'https://metadata.zhutech.net/o_1c2g0f3diia919gd1hpkqrl152am.jpg'
    }
  }
})