// pages/priorJackpot/priorJackpot.js
var util_request = require('../../utils/request.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    jackPotScore: null,
    rankNum: null,
    ticketNum: null,
    rankList: null,
    activity_end_time: null,
    activity_start_time: null
  },

  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var storeId = options.storeId;
    var userId = options.userId;
    var historyId = options.historyId;
    var putData = {
      userId: userId,
      id: historyId,
      storeId: storeId
    }
    this.getJackportLogById(putData)
  },

  /**
   * 获取奖池记录
   */
  getJackportLogById: function (putData) {
    var self = this;
    util_request._postActivity('v1/getJackportLogById', putData, function (res) {
      if (res.data.ret_code * 1 == 0) {
        var dataInfo = res.data.ret_module.info;
        var selfrank = res.data.ret_module.selfrank[0];
        if (selfrank == null) {
          selfrank = {
            rownum: 0,
            coupons: 0
          }
        }
        self.setData({
          jackPotScore: dataInfo.money,
          rankNum: selfrank.rownum,
          ticketNum: selfrank.coupons,
          rankList: res.data.ret_module.rankList,
          activity_start_time: dataInfo.activity_start_time,
          activity_end_time: dataInfo.activity_end_time
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.ret_msg,
          showCancel: false
        })
      }

    }, function (fail) {
      console.log(fail)
    })
  }
})