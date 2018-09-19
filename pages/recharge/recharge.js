// pages/recharge/recharge.js
var util_request = require('../../utils/request.js');
var app = getApp();

Page({

  /**
   * 页面初始化数据
   */
  data: {
    rechargeList: [],
    pageBottom: true,
    nulldata: true,
    loading: true,
    wheight: 0,
    page: 1,
    pageSize: 20,
    maxPsize: 0,
    pagenulldata: {},
    couponCount: 0,
    userId: null,
    drawInfo: {
      chargeAmount: null,
      storeId: null,
      userId: null
    },
    rechargeDrawInfo: {
      rechargeDrawStatus: false,
      showGetNewTitle: true,
      lotteryId: null
    }
  },

  /**
   * 监听页面初始化
   */
  onLoad: function (options) {
    var self = this;
    app.getSystemInfo(function (systemInfo) {
      self.setData({
        wheight: systemInfo.windowHeight - 48
      })
    })
    wx.showLoading({
      title: '加载中...'
    })
  },

  /**
   * 监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideLoading();
  },

  /**
   * 监听页面显示
   */
  onShow: function () {
    var self = this;
    var chargeAmount = this.data.drawInfo.chargeAmount;
    app.judgeNetwork(function (networkStatus) {
      if (!networkStatus) {
        self.setData({
          nulldata: false,
          pagenulldata: {
            imgurl: '/img/nointernet.png',
            text: ['暂无网络', '请检查网络或刷新～'],
            showRefresh: true
          }
        })
      } else {
        self.setData({
          page: 1,
          maxPsize: 0
        })
        self.getData();
        if (chargeAmount != null) {
          var storeId = self.data.drawInfo.storeId;
          var userId = self.data.drawInfo.userId;
          var putData = {
            store_id: Number(storeId),
            user_id: Number(userId),
            chargeAmount: Number(chargeAmount)
          }
          self.getLotteryCountById(putData);
        }
      }
    })
  },

  /**
   * 获取数据
   */
  getData: function () {
    var self = this;
    var maxPsize = this.data.maxPsize;
    var pageSize = this.data.pageSize;
    var page = this.data.page;

    if ((maxPsize != 0) && (maxPsize <= pageSize * (page - 1))) {
      this.setData({
        pageBottom: false
      })
    } else {
      if (page > 1) {
        this.setData({
          loading: false
        })
      }
      wx.getStorage({
        key: 'loginInfo',
        success: function (res) {
          var userId = res.data.user_id
          var putData = {
            userId: userId,
            pageSize: pageSize,
            page: page
          }
          self.setData({
            userId: userId
          })
          self.spendHistory(putData)
        },
        fail: function () {
          self.setData({
            nulldata: false,
            pagenulldata: {
              imgurl: '/img/unknown.png',
              text: ['操作失败,未知错误~']
            },
          })
        }
      })
    }
  },

  /**
   * 请求接口拿取数据
   */
  spendHistory: function (putData) {
    var self = this;
    var page = this.data.page;
    var pageSize = this.data.pageSize;
    util_request._post('store/v2/spendHistory', putData,
      function (res) {
        if (res.data.ret_code * 1 == 0) {
          var maxPsize = res.data.ret_module.totalCount;
          var couponCount = res.data.ret_module.couponCount
          self.setData({
            maxPsize: maxPsize,
            couponCount: couponCount
          })
          var listdata = res.data.ret_module.data;
          var rechargeList = page == 1 ? [] : self.data.rechargeList;
          for (var i = 0; i < listdata.length; i++) {
            rechargeList.push(listdata[i]);
          }
          if (rechargeList.length == 0) {
            self.setData({
              nulldata: false,
              pagenulldata: {
                imgurl: '/img/nullexcharge.png',
                text: ['暂无充值过的商家', '快去电玩城扫码嗨起来吧']
              }
            })
          } else {
            self.setData({
              nulldata: true
            })
          }
          if (page > 1) {
            self.setData({
              loading: true
            })
          }
          page++;
          self.setData({
            rechargeList: rechargeList,
            page: page
          })
          if ((maxPsize != 0) && (maxPsize <= pageSize)) {
            self.setData({
              pageBottom: false
            });
          }
        } else {
          self.setData({
            nulldata: false,
            pagenulldata: {
              imgurl: '/img/unknown.png',
              text: ['操作失败,未知错误~']
            },
          })
        }
      }, function (res) {
        self.setData({
          nulldata: false,
          pagenulldata: {
            imgurl: '/img/unknown.png',
            text: ['操作失败,未知错误~']
          },
        })
      })
  },

  /**
   * 下拉刷新数据
   */
  onPullDownRefresh: function () {
    var self = this;
    wx.stopPullDownRefresh()
    app.judgeNetwork(function (networkStatus) {
      if (!networkStatus) {
        self.setData({
          nulldata: false,
          pagenulldata: {
            imgurl: '/img/nointernet.png',
            text: ['暂无网络', '请检查网络或刷新～'],
            showRefresh: true
          }
        })
      } else {
        self.setData({
          page: 1,
          maxPsize: 0
        })
        self.getData();
      }
    })
  },

  /**
   * 上拉加载数据
   */
  onReachBottom: function () {
    if (this.data.nulldata) {
      this.getData();
    }
  },

  /**
   * 跳转充值页
   */
  gotoRecharge: function (event) {
    var rechargeList = this.data.rechargeList;
    var index = event.currentTarget.dataset.index;
    var data = rechargeList[index];
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var userId = res.data.user_id;
        wx.navigateTo({
          url: '../storeRecharge/storeRecharge?storeName=' + data.name + '&storeId=' + data.store_id + '&userId=' + userId + '&entrance=onlyRecharge'
        })
      }
    })
  },

  /**
   * 刷新页面
   */
  reload: function () {
    var self = this;
    self.setData({
      page: 1,
      maxPsize: 0
    })
    app.getUserInfo(function (loginInfo) {
      self.getData();
    })
  },

  /**
   * 去奖池页面
   */
  gotoActivityPage: function (e) {
    var activityId = e.currentTarget.dataset.activityid;
    var storeId = e.currentTarget.dataset.storeid;
    wx.navigateTo({
      url: '../jackpot/jackpot?storeId=' + storeId + '&activityId=' + activityId,
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
  },

  /**
  * 获取抽奖数据
  */
  getLotteryCountById: function (putData) {
    var self = this;
    util_request._post('store/v1/getLotteryCountById', putData, function (data) {
      if (data.data.ret_code * 1 == 0) {
        var ret_data = data.data.ret_module;
        if (ret_data.lotteryCount > 0) {
          self.data.drawInfo.chargeAmount = null
          self.setData({
            drawInfo: self.data.drawInfo,
            rechargeDrawInfo: {
              rechargeDrawStatus: true,
              showGetNewTitle: true,
              lotteryId: ret_data.lotteryId
            }
          })
        } else {
          if (ret_data.isLottery == 0) {
            self.data.drawInfo.chargeAmount = null
            self.setData({
              rechargeDrawInfo: {
                drawInfo: self.data.drawInfo,
                rechargeDrawStatus: true,
                showGetNewTitle: false,
                lotteryId: ret_data.lotteryId
              }
            })
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
      console.log(fail)
    })
  },

  /**
   * 去充值抽奖页
   */
  goToRecDraw: function () {
    var self = this;
    var userId = this.data.drawInfo.userId;
    var storeId = this.data.drawInfo.storeId;
    wx.navigateTo({
      url: '../rechargeDraw/rechargeDraw?lotteryId=' + self.data.rechargeDrawInfo.lotteryId + '&userId=' + userId + '&storeId=' + storeId
    })
  }
})