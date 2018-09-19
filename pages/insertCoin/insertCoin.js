// pages/insertCoin/insertCoin.js
var util = require('../../utils/wxmd5.js');
var util_request = require('../../utils/request.js');
var timer;
var drawTimer;

Page({
  data: {
    userId: null,
    storeId: null,
    chargeAmount: 0,
    deviceType: 0,
    gameCoin: 10,
    btnList: [1, 2, 3, 10, 50, 100],
    inputCoin: '',
    rechargeUrl: '',
    exchangeUrl: '',
    checkposition: '',
    device_info: '',
    returncoinurl: '',
    lastTapDiffTime: 0,
    timerNow: 3,
    inputCoinsStyle: 'inputCoinsDefault',
    getTicketNum: 0,
    getTicket: false,
    showJackPot: false,
    showEaster: false,
    easterId: null,
    activityId: null,
    easterNum: 0,
    drawNumber: [0, 0, 0, 0, 0],
    showEasterBox: false,
    drawEasterStatus: 'start',
    rechargeDrawInfo: {
      rechargeDrawStatus: false,
      showGetNewTitle: true,
      lotteryId: null
    },
    isShow:false,
    deviceCombosStyle: null,
    srcImg:'../../img/insertcoin_two.png',
    styleColor: '#C4541C',
    bgColor:'#FFF',
    styleBackground: 'https://metadata.dianwandashi.com/insertcoin_bg_two.png',
  },

  /**
   * 页面的初始数据
   */
  onLoad: function (options) {
    var self = this;
    var userId = options.user_id;
    var checkposition = options.checkposition
    var chargeAmount = options.chargeAmount;
    this.setData({
      userId: userId,
      chargeAmount: chargeAmount,
      checkposition: checkposition
    })
    wx.getStorage({
      key: 'getDeviceParas',
      success: function (res) {
        self.getDevInfo(res.data)
      }
    })
    util_request.linkWebSocket(function (res) {
      self.translateMsg(res)
    })
  },

  /**
   * 充值成功返回更新页面
   */
  onShow: function () {
    var chargeAmount = this.data.chargeAmount;
    if (this.data.isShow) {
      this.upDataCoins();
    } else {
      this.setData({
        isShow:true
      })
    }
    if (this.data.isShow && chargeAmount > 0) {
      this.getLotteryCountById();
      this.getStackCoinsUrlById();
    }
  },

  /**
   * 收到服务器推送后处理消息
   */
  translateMsg: function (res) {
    var self = this;
    var InfoObj = JSON.parse(res.data);
    if (InfoObj.WEXType == 1) {
      this.setData({
        timerNow: 3,
        getTicket: true,
        getTicketNum: InfoObj.coupon
      })
      timer = setInterval(function () {
        if (self.data.timerNow > 1) {
          self.data.timerNow--;
          self.setData({
            timerNow: self.data.timerNow
          })
        } else {
          self.setData({
            timerNow: 3,
            getTicket: false
          })
          clearInterval(timer)
          timer = null;
        }

      }, 1000)
    } else if (InfoObj.WEXType == 2) {
      this.setData({
        showEasterBox: true,
        easterNum: InfoObj.lotteryCount
      })
    }
  },

  /**
   * 获取设备信息
   */
  getDevInfo: function (putData) {
    var self = this;
    var userId = this.data.userId;
    var checkposition = this.data.checkposition;
    util_request._post('device/v1/getDevInfoByDevNo', putData, function (data) {
      if(data.data.ret_code*1 == 0){
        var device_info = data.data.ret_module;
        var device_no = device_info.device_no;
        var device_id = device_info.device_id;
        var model_name = device_info.model_name;
        var store_name = device_info.store_name;
        var device_typename = device_info.device_typename;
        var storeId = device_info.store_id;
        if (device_typename == "兑币机") {
          self.setData({
            deviceType: 1
          })
        } else {
          self.setData({
            deviceType: 0
          })
        }
        var leastCoins = device_info.leastCoins;
        if (checkposition > 0) {
          wx.setNavigationBarTitle({
            title: model_name + checkposition + '号位'
          })
        } else {
          wx.setNavigationBarTitle({
            title: model_name
          })
        }
        self.setData({
          storeId: storeId,
          gameCoin: device_info.coins,
          rechargeUrl: '../../pages/storeRecharge/storeRecharge?storeName=' + store_name + '&storeId=' + storeId + '&userId=' + userId + '&entrance=comeFromInsert',
          device_info: device_info,
          returncoinurl: '../contactCustomer/contactCustomer'
        })
       self.creatInsertBtn(leastCoins)
        data.data.ret_module.deviceCombosStyle.forEach((item, index) => {
          if (item.pay_type == 2) {
            self.setData({
              deviceCombosStyle: data.data.ret_module.deviceCombosStyle[index]
            })
          }
        })
        // var combos = data.data.ret_module.deviceCombos;
        // var buttonData = [];
        // combos.forEach(function (item) {
        //   buttonData.push({
        //     money: item.combosMoney * device_info.leastCoins,
        //     coins: item.combosCoins * device_info.leastCoins,
        //     combosName: item.combosName,
        //     comboId: item.combosId
        //   })
        // })
        self.setData({
          // btnList: buttonData,
          deviceCombosStyle: self.data.deviceCombosStyle
        })
        // wx.setNavigationBarColor({
        //   frontColor: '#ffffff',
        //   backgroundColor: device_info.deviceCombosStyle[0].bg_color
        // })
        self.setExchangeUrl(device_info);
        self.getLotteryCountById();
        self.getStackCoinsUrlById();
      }
    }, function (fail) {
      console.log(fail)
    })
  },

  /**
   * 创建投币按钮
   */
  creatInsertBtn: function (leastCoins) {
    var btnList = this.data.btnList;
    for (var i = 0; i < btnList.length; i++) {
      btnList[i] = btnList[i] * leastCoins
    }
    this.setData({
      btnList: btnList
    })
  },

  /**
   * 获取充值抽奖信息
   */
  getLotteryCountById: function () {
    var self = this;
    var storeId = this.data.storeId;
    var chargeAmount = this.data.chargeAmount;
    var userId = this.data.userId;
    if (chargeAmount > 0) {
      util_request._post('store/v1/getLotteryCountById', { store_id: Number(storeId), user_id: userId, chargeAmount: Number(chargeAmount) }, function (data) {
        if (data.data.ret_code * 1 == 0) {
          var retData = data.data.ret_module;
          if (retData.lotteryCount > 0) {
            self.setData({
              chargeAmount: 0,
              rechargeDrawInfo: {
                rechargeDrawStatus: true,
                showGetNewTitle: true,
                lotteryId: retData.lotteryId
              }
            })
          } else {
            if (retData.isLottery == 0) {
              self.setData({
                rechargeDrawInfo: {
                  rechargeDrawStatus: true,
                  showGetNewTitle: false,
                  lotteryId: retData.lotteryId
                }
              })
            }
          }
        }
      }, function (fail) {
        console.log(fail)
      })
    }
  },

  /**
   * 获取彩蛋和奖池信息
   */
  getStackCoinsUrlById: function () {
    var self = this;
    var storeId = this.data.storeId;
    var chargeAmount = this.data.chargeAmount;
    var userId = this.data.userId;
    util_request._post('store/v1/getStackCoinsUrlById', { userId: userId, storeId: storeId, chargeAmount: Number(chargeAmount) }, function (data) {
      if (data.data.ret_code * 1 == 0) {
        var data_module = data.data.ret_module
        if (data_module.activityId != null) {
          self.setData({
            showJackPot: true,
            activityId: data_module.activityId
          })
        }
        if (data_module.easterId != null) {
          self.setData({
            showEaster: true,
            easterId: data_module.easterId,
            easterNum: data_module.easterCount
          })
        }
      }
    }, function (fail) {
      console.log(fail)
    })
  },

  /**
   * 投币
   */
  goInsertCoins: function (e) {
    console.log(e)
    var coins = e.currentTarget.dataset.coin;
    var curtime = e.timeStamp;
    //var curtime = new Date().getTime();
    var self = this;
    console.log(coins)
    if (!coins){
      return;
    }
    this.requestInsertCoins(curtime, coins, function () {
      self.upDataCoins();
      self.setData({
        gameCoin: self.data.gameCoin - coins
      })
    })
  },

  /**
   * 自选投币记录投币数
   */
  inputCoins: function (event) {
    var value = event.detail.value;
    var inputCoinsStyle = this.data.inputCoinsStyle;
    if (value > 0) {
      inputCoinsStyle = 'inputCoinsSelect'
    } else {
      inputCoinsStyle = 'inputCoinsDefault'
    }
    this.setData({
      inputCoin: value,
      inputCoinsStyle: inputCoinsStyle
    })
  },

  /**
   * 自选输入币数
   */
  insertCoins: function (e) {
    var self = this;
    var inputCoin = this.data.inputCoin;
    var curtime = e.timeStamp;
    //var curtime = new Date().getTime();
    this.requestInsertCoins(curtime, inputCoin, function () {
      self.upDataCoins();
      self.setData({
        inputCoinsStyle: 'inputCoinsDefault',
        inputCoin: '',
        gameCoin: self.data.gameCoin - inputCoin
      })
    })
  },

  /**
  * 清除输入
  */
  clearInput: function () {
    this.setData({
      inputCoin: '',
    })
  },

  /**
   * 投币请求接口
   */
  requestInsertCoins: function (curtime, coins_count, SetTime) { //投币请求接口
    var self = this;
    var userId = this.data.userId;
    var device_id = this.data.device_info.device_id;
    var storeName = this.data.device_info.store_name;
    var storeId = this.data.storeId;
    var deviceType = this.data.deviceType;
    var checkposition = this.data.checkposition == 0 ? 1 : this.data.checkposition;
    var validate_str = userId + ':' + device_id + ':' + coins_count;
    validate_str = validate_str.toUpperCase();
    validate_str = util.md5(validate_str);
    var lastTime = this.data.lastTapDiffTime;
    self.setData({
      lastTapDiffTime: curtime
    })
    if (coins_count > self.data.gameCoin) {
      var coinsInsufficient = coins_count - self.data.gameCoin;
      wx.showModal({
        title: '提示',
        content: '余币不足',
        confirmText: '充值',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../storeRecharge/storeRecharge?storeName=' + storeName + '&storeId=' + storeId + '&coinsInsufficient=' + coinsInsufficient + '&userId=' + userId + '&entrance=comeFromInsert'
            })
          }
        }
      })
    } else {
      var putdata = {
        user_id: userId,
        device_id: device_id,
        coins_count: coins_count,
        validate_str: validate_str,
        slot_num: checkposition,
        force_stackin_flag: 0,
        seize_code: "",
        deviceType: deviceType
      }
      if (curtime - lastTime > 2000) {
        console.log(curtime)
        console.log(lastTime)
        util_request._post('device/v2/stack_coins', putdata, function (data) {
          if (data == null || data.data == null) {
            return;
          }
          if (data.data.ret_code * 1 == 0) {
            wx.showToast({
              title: deviceType == 1 ? '兑币成功' : '投币成功',
              icon: 'success',
              duration: 1000,
              mask: true
            })
            setTimeout(SetTime, 1000)
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
      }else{
        console.log(curtime)
        console.log(lastTime)
        wx.showModal({
          title: '提示',
          content: '您的手速惊人，请稍候再点哦',
          showCancel: false,
        })
      }
    }
  },

  /**
   * 更新币数
   */
  upDataCoins: function () {
    var self = this;
    var storeId = this.data.storeId;
    var userId = this.data.userId;
    util_request._post('v1/spendHistoryByStoreId', {
      storeId: storeId, userId: userId
    }, function (data) {
      if (data.data.ret_code * 1 == 0) {
        var coins = data.data.ret_module.coins;
        var device_info = self.data.device_info;
        device_info.coins = coins;
        wx.setStorage({
          key: 'device_info',
          data: device_info
        })
        self.setData({
          gameCoin: coins
        })
      }
    }, function (fail) {
      console.log(fail)
    })
  },

  /**
   * 跳转充值页
   */
  goRecharge: function () {
    var self = this;
    var rechargeUrl = this.data.rechargeUrl;
    wx.navigateTo({
      url: rechargeUrl
    })
  },

  /**
   * 设置兑换url
   */
  setExchangeUrl: function (device_info) {
    var self = this;
    var storeId = this.data.storeId
    util_request._post('store/v1/getExchangeType', { storeId: storeId },
      function (res) {
        if (res.data.ret_code * 1 == 0) {
          var rechargeMethod = res.data.ret_module;
          var rechargeLength = rechargeMethod.length;
          console.log(rechargeLength)
          if (rechargeLength == 0) {
            self.setData({
              exchangeUrl: '../exchangeMethod/exchangeMethod?merchantName=' + device_info.store_name + '&storeId=' + storeId,
            })
          } else if (rechargeLength == 1) {
            var exchange_type = rechargeMethod[0].exchange_type;
            if (exchange_type || exchange_type == 0) {
              self.setData({
                exchangeUrl: '../storeExchange/storeExchange?merchantName=' + device_info.store_name + '&storeId=' + storeId,
              })
            } else if (exchange_type == 1) {
              self.setData({
                exchangeUrl: '../onlineExchange/onlineExchange?storeId=' + storeId,
              })
            }
          } else {
            self.setData({
              exchangeUrl: '../exchangeMethod/exchangeMethod?merchantName=' + device_info.store_name + '&storeId=' + storeId,
            })
          }

        }
      }, function (fail) {
        console.log(fail)
      })
  },

  /**
   * 跳转兑换页
   */
  goExchange: function () {
    var exchangeUrl = this.data.exchangeUrl;
    this.closeEaster();
    wx.navigateTo({
      url: exchangeUrl
    })
  },

  /**
   * 隐藏礼票提示窗口
   */
  hiddenModal: function () {
    clearInterval(timer)
    timer = null;
    this.setData({
      timerNow: 3,
      getTicket: false
    })
  },

  /**
   * 跳转奖池页
   */
  goToJackpot: function () {
    var storeId = this.data.storeId;
    var activityId = this.data.activityId;
    wx.navigateTo({
      url: '../jackpot/jackpot?storeId=' + storeId + '&activityId=' + activityId
    })
  },

  /**
   * 跳转彩蛋记录页
   */
  goToEaster: function () {
    var easter = this.data.easterId;
    if (this.data.easterNum == 0) {
      wx.navigateTo({
        url: '../easter/easter?easterId=' + easter
      })
    } else {
      this.setData({
        showEasterBox: true
      })
    }
  },

  /**
   * 彩蛋抽奖开始
   */
  drawStart: function (e) {
    var self = this;
    var storeId = this.data.storeId;
    if (this.data.easterNum > 0 && e.target.dataset.status == "start") {
      self.setData({
        drawEasterStatus: 'opening'
      })
      util_request._post('user/v1/couponLotteryDraw', { userId: self.data.userId, storeId: storeId }, function (data) {
        if (data.data.ret_code * 1 == 0) {
          self.setData({
            easterNum: data.data.ret_module.easterCount
          })
          var score = String(data.data.ret_module.coupon);
          self.easter(score);
        }
      }, function (fail) {
        console.log(fail)
      })
    }
  },

  /**
   * 彩蛋抽奖方法
   */
  easter: function (score) {
    var self = this;
    var unitsDigit;
    var tensDigit;
    var hundredsDigit;
    var thousandDigit;
    var AllDigits;
    if (score.length == 1) {
      AllDigits = 0;
      thousandDigit = 0;
      hundredsDigit = 0;
      tensDigit = 0;
      unitsDigit = score;
    } else if (score.length == 2) {
      AllDigits = 0;
      thousandDigit = 0;
      hundredsDigit = 0;
      tensDigit = score.substring(0, 1);
      unitsDigit = score.substring(1, 2);
    } else if (score.length == 3) {
      AllDigits = 0;
      thousandDigit = 0;
      hundredsDigit = score.substring(0, 1);
      tensDigit = score.substring(1, 2);
      unitsDigit = score.substring(2, 3);
    } else if (score.length == 4) {
      AllDigits = 0;
      thousandDigit = score.substring(0, 1);
      hundredsDigit = score.substring(1, 2);
      tensDigit = score.substring(2, 3);
      unitsDigit = score.substring(3, 4);
    } else if (score.length == 5) {
      AllDigits = score.substring(0, 1);
      thousandDigit = score.substring(1, 2);
      hundredsDigit = score.substring(2, 3);
      tensDigit = score.substring(3, 4);
      unitsDigit = score.substring(4, 5);
    }
    var step = 0;
    drawTimer = setInterval(function () {
      step++;
      if (step < 8) {
        self.setData({
          drawNumber: [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)]
        })
      } else if (step == 8) {
        self.data.drawNumber[4] = unitsDigit
        self.setData({
          drawNumber: self.data.drawNumber
        })
      } else if (step < 16) {
        self.setData({
          drawNumber: [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), unitsDigit]
        })
      } else if (step == 16) {
        self.data.drawNumber[3] = tensDigit
        self.setData({
          drawNumber: self.data.drawNumber
        })
      } else if (step < 24) {
        self.setData({
          drawNumber: [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), tensDigit, unitsDigit]
        })
      } else if (step == 24) {
        self.data.drawNumber[2] = hundredsDigit
        self.setData({
          drawNumber: self.data.drawNumber
        })
      } else if (step < 32) {
        self.setData({
          drawNumber: [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), hundredsDigit, tensDigit, unitsDigit]
        })
      } else if (step == 32) {
        self.data.drawNumber[1] = thousandDigit
        self.setData({
          drawNumber: self.data.drawNumber
        })
      } else if (step < 40) {
        self.setData({
          drawNumber: [Math.floor(Math.random() * 10), thousandDigit, hundredsDigit, tensDigit, unitsDigit]
        })
      } else if (step == 40) {
        self.data.drawNumber[0] = AllDigits
        self.setData({
          drawNumber: self.data.drawNumber
        })
        clearInterval(drawTimer)
        drawTimer = null;
        step = 0;
        self.setData({
          drawEasterStatus: 'start'
        })
      }
    }, 50)
  },

  /**
   * 关闭彩蛋抽奖
   */
  closeEaster: function () {
    clearInterval(drawTimer)
    drawTimer = null;
    this.setData({
      showEasterBox: false,
      drawNumber: [0, 0, 0, 0, 0],
      drawEasterStatus: 'start'
    })
  },

  /**
   * 跳转充值抽奖页
   */
  goToRecDraw: function () {
    var self = this
    var storeId = this.data.storeId;
    var userId = this.data.userId;
    wx.navigateTo({
      url: '../rechargeDraw/rechargeDraw?lotteryId=' + self.data.rechargeDrawInfo.lotteryId + '&userId=' + userId + '&storeId=' + storeId
    })
  },

  /**
   * 关闭充值抽奖
   */
  closeDrawBox: function () {
    this.data.rechargeDrawInfo.rechargeDrawStatus = false
    this.setData({
      rechargeDrawInfo: this.data.rechargeDrawInfo
    })
  }
})