// pages/coinMachine/coinMachine.js
var util_request = require('../../utils/request.js');
var util = require('../../utils/wxmd5.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    buttonData: [],
    oldTimeStamp: 0,
    device_info: null,
    unit:'币',
    deviceCombosStyle:null,
    srcImg:'../../img/insertcoin_two.png',
    styleColor:'#FFF',
    styleBackground:'https://metadata.dianwandashi.com/insertcoin_bg_three.png',
    styleBgColor:'#584A59',
    tipShow: true,          //是否显示弹框提示按摩椅
    tipShowTwo: false,      //是否点击过
    isArmchair: false,      //是否是按摩椅
    childCar: true,         //是否显示弹框提示摇摇车
    childCarTwo: false,     //是否点击过
    isChildCar: false,       //是否是摇摇车
    coins: 0
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
    }),
    wx.getStorage({
      key: 'tipShows',
      success: (res) => {
        if (res.data) {
          self.setData({
            tipShowTwo: true
          })
        } else {
          self.setData({
            tipShowTwo: false
          })
        }
      }
    }),
    wx.getStorage({
      key: 'childCars',
      success: (res) => {
        if (res.data) {
          self.setData({
            childCarTwo: true
          })
        } else {
          self.setData({
            childCarTwo: false
          })
        }
      }
    })
  },

  //不再提示
  doReminder(){
    this.setData({
      childCarTwo: true,
      childCar: true
    })
    wx.setStorage({
      key: 'childCars',
      data: 1
    });
  },

  //知道了
  GotIt(){
    this.setData({
      childCarTwo: true,
      childCar: true
    })
    wx.removeStorage({
      key: 'childCars',
      success: (res) => {

      }
    })
  },

  // 不同意
  dotAgree() {
    wx.navigateBack({
      delta: 1
    })
  },
  //同意
  Agree() {
    this.setData({
      tipShowTwo: true,
      tipShow: true
    })
    wx.setStorage({
      key: 'tipShows',
      data: 1
    });
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
          if (device_info.device_typename == '按摩椅'){
            self.setData({
              unit: '分钟'
            })
          } else if (device_info.device_typename == '兑币机'){
            self.setData({
              unit: '币'
            })
          }

          data.data.ret_module.deviceCombosStyle.forEach((item, index) => {
            if (item.pay_type == 1) {
              self.setData({
                deviceCombosStyle: data.data.ret_module.deviceCombosStyle[index]
              })
            }
          })

          if (device_info.device_typename == '按摩椅') {
            //手动删除测试用的
            // wx.removeStorage({
            //   key: 'tipShows',
            //   success: (res) => {
                
            //   }
            // })
            self.setData({
              isArmchair: true
            })
          } else {
            self.setData({
              isArmchair: false,
              tipShow: true
            })
          }
          if (self.data.isArmchair) {
            if (!self.data.tipShowTwo) {
              self.setData({
                tipShow: false
              })
            } else {
              self.setData({
                tipShow: true
              })
            }
          }

          if (device_info.device_typename == '摇摇车') {
            //手动删除测试用的
            // wx.removeStorage({
            //   key: 'childCars',
            //   success: (res) => {

            //   }
            // })
            self.setData({
              isChildCar: true
            })
          } else {
            self.setData({
              isChildCar: false,
              childCar: true
            })
          }
          if (self.data.isChildCar) {
            if (!self.data.childCarTwo) {
              self.setData({
                childCar: false
              })
            } else {
              self.setData({
                childCar: true
              })
            }
          }

          var combos = data.data.ret_module.deviceCombos;
          var buttonData = [];
          combos.forEach(function(item){
            buttonData.push({
              money: item.combosMoney,
              coins: item.combosCoins,
              combosName: item.combosName,
              comboId: item.combosId,
              remark: item.remark
            })
          })

          var putData = {
            userId: self.data.userId,
            storeId: device_info.store_id
          }
          //self.createRecCob(putData, device_info.leastCoins)
          self.setData({
            device_info: device_info,
            buttonData: buttonData
          })
          // wx.setNavigationBarColor({
          //   frontColor: '#ffffff',
          //   backgroundColor: device_info.deviceCombosStyle[0].bg_color
          // })
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
   * 创建基础套餐
   */
  // createRecCob: function (putData, leastCoins) {
  //   var self = this;
  //   util_request._post('store/v1/getStoreCombos', putData,
  //     function (res) {
  //       if (res.data.ret_code * 1 == 0) {
  //         var combos = res.data.ret_module.combos;
  //         var buttonData = [];
  //         combos.forEach(function(item){
  //           buttonData.push({
  //             money: item.recharge_money * leastCoins,
  //             coins: item.recharge_coins * leastCoins,
  //             btnStyle: 'btnDefault',
  //             comboId: item.combos_id
  //           })
  //         })
  //         self.setData({
  //           buttonData: buttonData,
  //           showFirstComb: res.data.ret_module.isShow
  //         })
  //       }
  //     }, function (res) {
  //       console.log(res)
  //     })
  // },

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
    var comboId = e.currentTarget.dataset.comboid;
    var self = this;
    if (timeStamp - this.data.oldTimeStamp > 500) {
      this.data.buttonData[index].btnStyle = 'checkBtn';
      this.insertFun(index, coins, money, comboId)
    }
    this.setData({
      oldTimeStamp: timeStamp,
      buttonData: this.data.buttonData
    })    
  },

  /**
   * 投币方法
   */
  insertFun: function (index, coins, money, comboId) {
    var self = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var openId = res.data.open_id;
        var device_info = self.data.device_info;
        var userId = res.data.user_id;
        var device_id = device_info.device_id;
        var slot_num = device_info.selSlotNum;
        if (slot_num == 'null'){
          slot_num = '-1';
        }
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
          open_id: openId,
          deviceNo: device_no,
          slotNum: slot_num,
          devTypeName: device_info.device_typename,
          leastCoins: device_info.leastCoins,
          comboId: comboId,
        }
        self.setData({
          coins: coins
        })
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
          var signType = 'MD5';
          self.wxRetPayment(timeStamp, nonceStr, signType, packageStr, paySign);
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
  wxRetPayment: function (timeStamp, nonceStr, signType, packageStr, paySign) {
    var self = this;
    wx.requestPayment({
      'timeStamp': timeStamp,
      'nonceStr': nonceStr,
      'package': packageStr,
      'signType': signType,
      'paySign': paySign,
      'success': function (res) {
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 1000,
          mask: true
        })
        self.resetBtnData();
        self.toArmchair();
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

  toArmchair: function () {
    var self = this
    if (self.data.device_info.device_typename == '按摩椅') {
      setTimeout
      util_request._post('device/v1/getStackCoinTime',
        {
          userId: self.data.userId,
          storeId: self.data.device_info.store_id,
          deviceId: self.data.device_info.device_id,
          slotNum: self.data.device_info.slot_num
        },
        function (res) {
          if (res.data.ret_code * 1 == 0) {
            var time = self.data.coins * 60 * 1000;
            var endTime = res.data.ret_module.createTime + time
            wx.setStorage({
              key: 'endTime',
              data: endTime,
              success: function() {
                wx.navigateTo({
                  url: '../remoteControl/remoteControl?device_no=' + self.data.device_info.device_no + '&model_name=' + self.data.device_info.model_name
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
    var slot_num = device_info.slot_num == 1 ? 1 : device_info.selSlotNum;
    if (slot_num == 'null') {
      slot_num = '-1';
    }
    var device_no = device_info.device_no
    var putData = {
      deviceId: device_id,
      userId: userId,
      deviceNo: device_no,
      slotNum: slot_num
    }
    wx.showToast({
      title: '正在重试中...',
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
            content: '机器没反应?联系客服 0571-87778782',
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