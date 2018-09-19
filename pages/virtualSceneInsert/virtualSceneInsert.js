// pages/virtualSceneInsert/virtualSceneInsert.js
var util = require('../../utils/wxmd5.js');
var util_request = require('../../utils/request.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    insertColor: '#feac69',
    insertButtonDis: true,
    lastTapDiffTime: 0,
    userId: null,
    device_info: null,
    rechargeUrl: null,
    coinsCount: '',
    isShow:false,
    isDisabled:false,
    isNavigaterBackIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    wx.getStorage({
      key: 'loginInfo',
      success: res => {
        this.setData({
          userId: res.data.user_id
        })
        wx.getStorage({
          key: 'getDeviceParas',
          success: res => {
           
            if(res.data.coin){
              this.setData({
                coinsCount: res.data.coin,
                isDisabled:true,
                insertButtonDis:false,
                insertColor:'#FE7606',
                isNavigaterBackIndex: 1
              })
            }
            this.getDevInfo(res.data)
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(this.data.isShow){
      this.upDataCoins();
    } else {
      this.setData({
        isShow:true
      })
    }
  },

  /**
   * 监听输入币数
   */
  inputCoins: function (e) {
    var val = e.detail.value;
    if (val) {
      this.setData({
        insertColor: '#FE7606',
        insertButtonDis: false,
        coinsCount: val
      })
    } else {
      this.setData({
        insertColor: '#feac69',
        insertButtonDis: true,
        coinsCount: ''
      })
    }
  },

  /**
   * 获取设备信息
   */
  getDevInfo: function (putData) {
    util_request._post('device/v1/getDevInfoByDevNo', putData,
      data => {
        if (data.data.ret_code * 1 == 0) {
          var device_info = data.data.ret_module;
          wx.setNavigationBarTitle({
            title: device_info.model_name
          })
          this.setData({
            device_info: device_info,
            rechargeUrl: '../../pages/storeRecharge/storeRecharge?storeName=' + device_info.store_name + '&storeId=' + device_info.store_id + '&userId=' + this.data.userId + '&entrance=comeFromInsert'
          })
        } else {
          getApp().showAlert(data.data.ret_msg);
        }
      }, fail=> {
        console.log(fail)
      })
  },

  /**
   * 投币购买
   */
  insertBuy: function (e) {
    var curtime = e.timeStamp;
    var lastTapDiffTime = this.data.lastTapDiffTime;
    var device_info = this.data.device_info;
    if (curtime - lastTapDiffTime > 500) {//请求
      this.setData({
        lastTapDiffTime: curtime
      })
      var userId = this.data.userId;
      var deviceId = device_info.device_id;
      var coinsCount = this.data.coinsCount;
      var validateStr = userId + ':' + deviceId + ':' + coinsCount;
      validateStr = validateStr.toUpperCase();
      validateStr = util.md5(validateStr);
      util_request._post('device/v1/stackVirtualCoins',{
        slotNum: device_info.slot_num,
        deviceId: Number(deviceId),
        userId: userId,
        storeId: device_info.store_id,
        coinsCount: Number(coinsCount),
        validateStr: validateStr
      },data=>{
        if (data.data.ret_code * 1 == 0) {
          this.upDataCoins();
          this.setData({
            insertColor: '#feac69',
            insertButtonDis: true,
            coinsCount: '',
            isDisabled: false,
          });
          wx.navigateTo({
            url: '../virtualInsertSucc/virtualInsertSucc?modelName=' + device_info.model_name + '&coins=' + coinsCount + '&isNavigaterBackIndex=' + this.data.isNavigaterBackIndex,
          })
        } else {
          getApp().showAlert(data.data.ret_msg)
        }
      },fail=>{
        console.log(fail)
      })
    }
  },

  /**
   * 更新币数
   */
  upDataCoins: function () {
    var storeId = this.data.device_info.store_id;
    var userId = this.data.userId;
    util_request._post('v1/spendHistoryByStoreId', {
      storeId: storeId, userId: userId
    }, data=> {
      if (data.data.ret_code * 1 == 0) {
        var coins = data.data.ret_module.coins;
        var device_info = this.data.device_info;
        device_info.coins = coins;
        this.setData({
          device_info: device_info
        })
      } else {
        getApp().showAlert(data.data.ret_msg)
      }
    }, fail=> {
      console.log(fail)
    })
  },

  /**
   * 跳转充值页
   */
  goRecharge: function () {
    var rechargeUrl = this.data.rechargeUrl;
    wx.navigateTo({
      url: rechargeUrl
    })
  },

})