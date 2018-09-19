// pages/storeRecharge/storeRecharge.js
var util_request = require('../../utils/request.js')
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnList: [],
    rechargeMoney: 0,
    rechargeCoins: 0,
    rechargeStyle: 'notRecharge',
    addsrc: '/img/jia_defalt@1x.png',
    rechargeStatus: true,
    modalstatus: true,
    sortList: [],
    unitPrice: 0,
    wheight: '',
    nulldata: null,
    pagenulldata: {},
    device_info: null,
    inputhidden: false,
    lastTapDiffTime: 0,
    couponScrollTop: 0,
    show_coupon_list: false,
    coupon_list: null,
    scrolltimes: 3,
    isCheckSetmeal: false,
    checkComboid: null,
    showVip: false,
    showFirstComb:true,
    userId: null,
    storeId: null,
    entrance: '',
    deviceCombosStyle:null,
    tipIsShow:true,
    putData: null
  },

  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    var storeName = options.storeName;
    var userId = options.userId;
    var storeId = options.storeId;
    var entrance = options.entrance;
    wx.setNavigationBarTitle({
      title: storeName
    })
    this.setData({
      userId: userId,
      storeId: storeId,
      entrance: entrance
    })
    wx.getStorage({
      key: 'getDeviceParas',
      success: function (res) {
        console.log(res)
        self.createRecCob(res.data)
      }
    })
    
    this.getCoupon()
    app.getSystemInfo(function (systemInfo) {
      self.setData({
        wheight: systemInfo.windowHeight
      })
    })
  },

  /**
   * 除法精确计算方法
   */
  floatDiv: function (arg1, arg2) {
    var t1 = 0, t2 = 0, r1, r2;
    try { t1 = arg1.toString().split(".")[1].length } catch (e) { }
    try { t2 = arg2.toString().split(".")[1].length } catch (e) { }
    r1 = Number(arg1.toString().replace(".", ""));
    r2 = Number(arg2.toString().replace(".", ""));
    return (r1 / r2) * Math.pow(10, t2 - t1);
  },

  /**
   * 按优惠力度从小到大重排数据列表
   */
  sortList: function (arr) {
    var middle;
    for (var i = 0; i < arr.length - 1; i++) {
      for (var j = 0; j < arr.length - i - 1; j++) {
        var unit = (arr[j].recharge_money) / (arr[j].recharge_coins);
        var unitT = (arr[j + 1].recharge_money) / (arr[j + 1].recharge_coins);
        if (unit - unitT < 0) {
          middle = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = middle
        }
      }
    }
    return arr;
  },

  /**
   * 创建基础套餐
   */
  createRecCob: function (options) {
    var self = this;
    var userId = this.data.userId;
    var storeId = this.data.storeId;
    util_request._post('device/v1/getDevInfoByDevNo', options,
      function (res) {
        console.log(res)
        if(res.data.ret_code*1 == 0){
          // var vipCombos = res.data.ret_module.vipCombos;
          var vipCombos = [];
          var combos = res.data.ret_module.deviceCombos;
          var isShow = false;
         // var isShow = res.data.ret_module.isShow;
          // if (vipCombos.length != 0) {
          //   self.setData({
          //     showVip: true,
          //     showFirstComb: isShow
          //   })
          // } else {
          //   self.setData({
          //     showVip: false,
          //     showFirstComb: isShow
          //   })
          // }
          // if (combos.length == 0 || (combos.length == 1) ) {
          //   self.setData({
          //     nulldata: false,
          //     pagenulldata: {
          //       imgurl: '/img/nullrecharge.png',
          //       text: ['该商家暂无可充值的套餐'],
          //     }
          //   })
          //   return;
          // }
          res.data.ret_module.deviceCombosStyle.forEach((item,index)=>{
            if (item.pay_type == 0){
              self.setData({
                deviceCombosStyle: res.data.ret_module.deviceCombosStyle[index]
              })
            }
          })
          var combosTest = [];
          combos.forEach((item)=>{
            combosTest.push({
              combosCoins: item.combosCoins,
              combosId: item.combosId,
              combosName: item.combosName,
              deviceId: item.deviceId,
              masterId: item.masterId,
              remark: item.remark,
              combosMoney: item.combosMoney,
              btn_color_before: self.data.deviceCombosStyle.btn_color_before,
              btn_url_before: self.data.deviceCombosStyle.btn_url_before,
              btn_url_after: self.data.deviceCombosStyle.btn_url_after,
            })
          })
          
          console.log(combos)
          self.setData({
            btnList: combosTest,
            deviceCombosStyle: self.data.deviceCombosStyle,
            nulldata: true
          })
          // wx.setNavigationBarColor({
          //   frontColor: '#ffffff',
          //   backgroundColor: self.data.deviceCombosStyle.bg_color
          // })
          self.comeFormInsert(options, combos)
        } 
      }, function (res) {
        console.log(res)
      })
  },

  /**
   * 选择基础套餐
   */
  checkSetMeal: function (event) {
    var coins = event.currentTarget.dataset.coins;
    var money = event.currentTarget.dataset.money;
    var index = event.currentTarget.dataset.index;
    console.log(coins)
    console.log(money)
    console.log(index)
    var btndata = this.data.btnList;
    for (var i = 0; i < btndata.length; i++) {
      btndata[i].btn_url_before = this.data.deviceCombosStyle.btn_url_before
    }
   // btndata[index].btncheck = 'background: #FFEFD9;border: 1px solid #FE7606;'
    btndata[index].btn_url_before = this.data.deviceCombosStyle.btn_url_after
    this.setData({
      rechargeMoney: money,
      rechargeCoins: coins,
      rechargeStatus: false,
      rechargeStyle: 'canRecharge',
      btnList: btndata,
      addsrc: '/img/jia_defalt@1x.png',
      isCheckSetmeal: true,
      checkComboid: btndata[index].combosId,
      deviceCombosStyle: this.data.deviceCombosStyle
    })
  },

  /**
   * 投币时币数不够充值补足余数
   */
  comeFormInsert: function (options, combos) {
    if (options.coinsInsufficient != null) {
      var coinsInsufficient = options.coinsInsufficient;
      var sortListData = this.sortList(combos)
      var unitPrice = sortListData[0].recharge_money / sortListData[0].recharge_coins;
      this.setData({
        rechargeMoney: this.countMoney(coinsInsufficient, sortListData, unitPrice),
        rechargeCoins: coinsInsufficient,
        rechargeStatus: false,
        rechargeStyle: 'canRecharge'
      })
    }
  },

  /**
   * 显示自选套餐
   */
  showModal: function (event) {
    var self = this;
    var sortdata = event.currentTarget.dataset.list;
    var btndata = this.data.btnList;
    for (var i = 0; i < btndata.length; i++) {
      if (btndata[i].btncheck) {
        btndata[i].btncheck = null
      }
    }
    var sortListData = this.sortList(sortdata)
    var unitPrice = sortListData[0].recharge_money / sortListData[0].recharge_coins;
    self.setData({
      addsrc: '/img/jia_selected@1x.png',
      modalstatus: false,
      rechargeMoney: '',
      rechargeCoins: '',
      rechargeStyle: 'notRecharge',
      rechargeStatus: true,
      btnList: btndata,
      sortList: sortListData,
      unitPrice: unitPrice,
      isCheckSetmeal: false
    });
  },

  /**
   * 关闭自选套餐
   */
  cancelModal: function (event) {
    this.setData({
      modalstatus: true,
      rechargeMoney: 0,
      rechargeCoins: 0,
      addsrc: '/img/jia_defalt@1x.png',
      sortList: [],
      unitPrice: 0
    })
  },

  /**
   * 确定自选套餐
   */
  sureModal: function (event) {
    if (this.data.rechargeMoney == 0 && (this.data.rechargeCoins == 0)) {
      wx.showModal({
        title: '提示',
        content: '请输入金额或币数',
        showCancel: false,
      })
    } else {
      this.setData({
        modalstatus: true,
        rechargeStyle: 'canRecharge',
        rechargeStatus: false,
      })
    }
  },

  /**
   * 输入钱算币
   */
  inputMoney: function (event) {
    var money = event.detail.value;
    var unitPrice = event.currentTarget.dataset.unitprice;
    var setMealData = event.currentTarget.dataset.setmealdata;
    var coins = this.countCoins(money, setMealData, unitPrice)
    if (String(coins).length > 6) {
      return this.data.rechargeMoney;
    }
    if (coins > 0) {
      this.setData({
        rechargeMoney: money,
        rechargeCoins: coins
      })
    } else {
      this.setData({
        rechargeCoins: 0,
      })
    }
  },

  /**
   * 输入钱算币的计算公式
   */
  countCoins: function (rechargeTotal, setMealData, unitPrice) {
    var amount = 0;
    while (setMealData.length != 0) {
      if (rechargeTotal < 0) {
        break;
      }
      var listdata = setMealData.pop();
      var list_money = listdata.recharge_money;
      var list_coins = listdata.recharge_coins;
      var aaa = parseInt(rechargeTotal / list_money);
      amount += aaa * list_coins;
      if (list_money > 1) {
        rechargeTotal = rechargeTotal % list_money;
      } else {
        if (rechargeTotal < list_money) {
          rechargeTotal = rechargeTotal;
        } else {
          rechargeTotal = this.floatDiv(rechargeTotal, list_money) - Math.floor(this.floatDiv(rechargeTotal, list_money));
        }
      }
    }
    amount += parseInt(rechargeTotal / unitPrice)
    return amount;
  },

  /**
   * 输入币算钱
   */
  inputCoins: function (event) {
    var inputcoin = event.detail.value;
    var unitPrice = event.currentTarget.dataset.unitprice;
    var setMealData = event.currentTarget.dataset.setmealdata;
    var money = this.countMoney(inputcoin, setMealData, unitPrice);
    if ((parseFloat(money) + '').length > 5) {
      return this.data.rechargeCoins;
    }
    if (money > 0) {
      this.setData({
        rechargeMoney: money,
        rechargeCoins: inputcoin
      })
    } else {
      this.setData({
        rechargeMoney: 0
      })
    }
  },

  /**
   * 输入币算钱的计算公式
   */
  countMoney: function (coins, setMealData, unitPrice) {
    var amount = 0;
    while (setMealData.length != 0) {
      if (coins < 0) {
        break;
      }
      var listdata = setMealData.pop();
      var list_money = listdata.recharge_money;
      var list_coins = listdata.recharge_coins;
      var aaa = parseInt(coins / list_coins);
      amount += aaa * list_money;
      coins = coins % list_coins;
    }
    amount += parseInt(coins / unitPrice)
    return parseFloat(amount.toFixed(2));
  },

  /**
   * 计算点击充值传给后台的套餐对象
   */
  combosInfo: function (rechargeTotal, btnlistdata) {
    var countarr = [];
    var combosInfo = [];
    var btnlistdata = this.sortList(btnlistdata)
    while (btnlistdata.length != 0) {
      if (rechargeTotal < 0) {
        break;
      }
      var listmoneydata = btnlistdata.pop();
      var list_money = listmoneydata.recharge_money;
      var combos_id = listmoneydata.combos_id;
      var aaa = Math.floor(this.floatDiv(rechargeTotal, list_money));
      combosInfo.push({
        comboid: combos_id,
        count: aaa
      });
      rechargeTotal = rechargeTotal % list_money;
    }
    return combosInfo;
  },

  /**
   * 确认订单去支付详情页
   */
  goPayDetails: function (event) {
    var self = this;
    var userId = this.data.userId;
    var storeId = this.data.storeId;
    var rechargeMoney = this.data.rechargeMoney;
    var curtime = event.timeStamp;
    var lastTime = this.data.lastTapDiffTime;
    if (rechargeMoney <= 0){
      wx.showModal({
        title: '提示',
        content: '先选择购买套餐',
        showCancel: false
      })
      return;
    }
    this.setData({
      lastTapDiffTime: curtime
    })
    var btnlistdata = event.currentTarget.dataset.setmealdata;
    if (self.data.isCheckSetmeal == false) {
      var combos_Info = this.combosInfo(rechargeMoney, btnlistdata)
    } else {
      var combos_Info = [{
        comboid: self.data.checkComboid,
        count: 1
      }]
    }
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var openid = res.data.open_id;
        var putData = {
          user_id: userId,
          open_id: openid,
          store_id: storeId,
          comboId: self.data.checkComboid,
          money: self.data.rechargeMoney,
          coins: self.data.rechargeCoins
        }
        self.setData({
          putData: putData
        })
        if (curtime - lastTime > 1000) {
          self.checkIsShowTip()
        }
      }
    })
  },

  /**
   * 首次购买弹窗
   */
  checkIsShowTip: function () {
    var self = this;
    wx.getStorage({
      key: 'tipIsShow',
      success: function(res) {
        console.log(res)
        if (res.data == 'true') {
          self.setData({
            tipIsShow: true
          })
          self.getDueBill()
        } else {
          self.setData({
            tipIsShow: false
          })
        }
      },
      fail: function(){
        self.setData({
          tipIsShow: false
        })
      }
    })
  },

  /**
   * 关闭弹窗
   */
  closeTip: function () {
    var self = this;
    wx.setStorage({
      key: 'tipIsShow',
      data: 'true',
      success: function (res) {
        self.setData({
          tipIsShow: true
        })
        self.getDueBill()
      },
    })
  },

  /**
   * 获取充值订单号
   */
  getDueBill: function () {
    var storeId = this.data.storeId;
    var entrance = this.data.entrance;
    var rechargeMoney = this.data.rechargeMoney;
    var rechargeCoins = this.data.rechargeCoins;
    util_request._post('v3/dueBills', this.data.putData,
      function (res) {
        if (res.data.ret_code * 1 == 0) {
          wx.setStorage({
            key: 'payDetailsData',
            data: res.data.ret_module,
          })
          if (entrance == 'rechargeInsert') {
            wx.redirectTo({
              url: '../payDetails/payDetails?store_id=' + storeId + '&rechargeCoins=' + rechargeCoins + '&chargeAmount=' + rechargeMoney + '&entrance=' + entrance
            });
          } else {
            wx.navigateTo({
              url: '../payDetails/payDetails?store_id=' + storeId + '&rechargeCoins=' + rechargeCoins + '&chargeAmount=' + rechargeMoney + '&entrance=' + entrance
            })
          }
        } else if (res.data.ret_code * 1 == 502) {
          wx.showModal({
            title: '绿游卫士提示您',
            content: res.data.ret_msg,
            showCancel: false
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.ret_msg,
            showCancel: false
          })
        }
      }, function (failMsg) {
        console.log(failMsg)
      })
  },

  /**
   * 页面顶部消息滚动
   */
  goScroll: function (times, scrollHeight, totalHeight) {
    var self = this;
    var timer = setInterval(function () {
      times--;
      if (times == 0) {
        clearInterval(timer);
        times = self.data.scrolltimes;
        self.setData({
          couponScrollTop: self.data.couponScrollTop + scrollHeight
        })
        if (self.data.couponScrollTop < totalHeight) {
          self.goScroll(times, scrollHeight, totalHeight);
        } else if (self.data.couponScrollTop = totalHeight) {
          self.setData({
            couponScrollTop: 0
          })
          self.goScroll(times, scrollHeight, totalHeight);
        }
      }
    }, 1000)
  },

  /**
   * 获取优惠券信息
   */
  getCoupon: function () {
    var self = this;
    var userId = this.data.userId;
    var storeId = this.data.storeId;
    util_request._post('coupon/v1/listBarginCouponsInfoByStoreId', { storeid: Number(storeId), user_id: Number(userId) }, function (data) {
      var data = data.data;
      if (data.ret_code * 1 == 0) {
        var coupon_list = data.ret_module.avalibleCouponsdata;
        var times = self.data.scrolltimes;
        var scrollHeight = 20;
        var totalHeight;
        if (coupon_list.length == 0) {
          self.setData({
            show_coupon_list: false,
          })
        } else if (coupon_list.length == 1) {
          self.setData({
            show_coupon_list: true,
            coupon_list: coupon_list
          })
        } else if (coupon_list.length > 1) {
          totalHeight = scrollHeight * coupon_list.length
          self.setData({
            show_coupon_list: true,
            coupon_list: coupon_list
          })
          self.goScroll(times, scrollHeight, totalHeight)
        }
      } else {
        wx.showModal({
          title: '提示',
          content: data.ret_msg,
          showCancel: false
        })
      }
    }, function (fail) {
      console.log(fail)
    })
  },

  /**
   * 跳转vip页面
   */
  gotoVip: function () {
    wx.navigateTo({
      url: '../gotoVip/gotoVip'
    })
  }
})