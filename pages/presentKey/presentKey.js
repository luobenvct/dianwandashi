// pages/presentKey/presentKey.js
var util_request = require('../../utils/request.js');
var util = require('../../utils/util.js');

Page({

  /**
   * 页面初始化参数
   */
  data: {
    url: '',
    code: '',
    recordUrl: '',
    oldcode: '',
    storeId: '',
    isExchange: false,
    giftList:[],
    isShow:false
  },

  /**
   * 监听页面初始化
   */
  onLoad: function (options) {
    var code = options.code;
    var self = this;
    this.exchargeSuccCanvas();
    var newcode = code.slice(0, 4) + ' ' + code.slice(4, 8)
    util.barcode('barcode', code, 600, 500);
    this.setData({
      oldcode: options.code,
      storeId: options.store_id,
      code: newcode,
      recordUrl: '../myExchargeRecord/myExchargeRecord'
    })
    this.getGiftList(options.store_id)
    var currentPages = getCurrentPages();
    var prePage = currentPages[currentPages.length - 2];
    prePage.setData({
      keyPageCode: code,
      exchangeBtnSta: false
    })
  },

  /**
   * 监听页面显示是否已兑换
   */
  onShow: function () {
    var self = this;
    var storeId = this.data.storeId;
    if (this.data.isShow) {
      wx.getStorage({
        key: 'loginInfo',
        success: function (res) {
          var userId = res.data.user_id;
          var putData = {
            user_id: userId,
            store_id: storeId,
            page: 1,
            page_size: 20
          }
          self.getExchargeInfo(putData);
        }
      })
    }else{
      this.setData({
        isShow:true
      })
    }
  },

  /**
   * 获取兑换记录比对code判断是否已兑换
   */
  getExchargeInfo:function(putData){
    var self = this;
    var oldcode = this.data.oldcode;
    util_request._post('v1/getExchangeHistory', putData,
      function (res) {
        if (res.data.ret_code * 1 == 0) {
          var exchange_historys = res.data.ret_module.exchange_historys;
          for (var i = 0; i < exchange_historys.length; i++) {
            if (oldcode == exchange_historys[i].scan_code) {
              self.setData({
                isExchange: true
              })
            }
          }
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.ret_msg,
            showCancel: false
          })
        }
      }, function (fail) {
        console.log(fail)
      })
  },

  /**
   * 已兑换设置UI
   */
  exchargeSuccCanvas:function(){
    var query = wx.createSelectorQuery();
    query.select('.out_box').boundingClientRect()
    query.exec(function (res) {
      var out_box_width = res[0].width;
      var out_box_height = res[0].height;
      var ctxwidth = out_box_width * 156 / 345
      const ctx = wx.createCanvasContext('tier')
      ctx.setFillStyle('rgba(255,255,255,.6)')
      ctx.fillRect(0, 0, out_box_width, out_box_height)
      ctx.drawImage('/img/yi_exchange_icon.png', out_box_width - ctxwidth, out_box_height - ctxwidth, ctxwidth, ctxwidth)
      ctx.draw()
    })
  },

  /**
   * 获取本次兑换奖品
   */
  getGiftList:function(storeId){
    wx.getStorage({
      key: 'historyData' + storeId,
      success:res=> {
        this.setData({
          giftList: res.data
        })
      }
    })
  }
})