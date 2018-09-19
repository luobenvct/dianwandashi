// pages/myGameRecord/myGameRecord.js
var util_request = require('../../utils/request.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    gameRecords: [],
    page: 1,
    pageSize: 20,
    loadingAll: false,
    pageBottom: true,
    nulldata: false,
    loading: true,
    pagenulldata: {},
    userId: null,
    optType: 1
  },

  /**
   * 监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    app.getSystemInfo(function (systemInfo) {
      self.setData({
        wheight: systemInfo.windowHeight
      })
    })
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
        wx.getStorage({
          key: 'loginInfo',
          success: function (res) {
            var userId = res.data.user_id;
            self.setData({
              userId: userId
            })
            var putData = {
              page_no: self.data.page,
              page_size: self.data.pageSize,
              user_id: userId,
              optType: self.data.optType
            }
            self.getData(putData, 'onLoad');
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
    })
  },

  /**
   * 获取数据
   */
  getData: function (putData, loadingMethod) {
    if (loadingMethod == 'onLoad' || loadingMethod == 'cut') {
      wx.showLoading({
        title: '加载中...'
      })
    } else if (loadingMethod == 'onPullDown') {
      this.setData({
        page: 1,
        pageBottom: true,
        loadingAll: false
      })
    } else if (loadingMethod == 'onRhBottom' && putData.page > 1) {
      this.setData({
        loading: false
      })
    }
    this.spendLogByuserId(putData, loadingMethod);
  },

  /**
   * 请求游戏记录接口
   */
  spendLogByuserId: function (putData, loadingMethod) {
    var self = this;
    var page = this.data.page;
    util_request._post('device/v1/spendLogByuserId', putData, function (data) {
      var data = data.data;
      if (data.ret_code * 1 == 0) {
        var MaxPages = data.ret_module.MaxPages;
        var infos = data.ret_module.infos;
        if (infos.length == 0) {
          self.setData({
            loadingAll: true,
            nulldata: false,
            pagenulldata: {
              imgurl: '/img/nullnear.png',
              text: ['暂无游戏记录']
            }
          })
        } else {
          for (var i = 0; i < infos.length; i++) {
            var recordTime = new Date(infos[i].create_time);
            infos[i].create_time = app.creatTime(recordTime);
          }
          var gameRecords = self.data.gameRecords;
          if (loadingMethod == 'onRhBottom' && (putData.page_no > 1)) {
            self.setData({
              page: page + 1,
              gameRecords: gameRecords.concat(infos)
            })
          } else {
            self.setData({
              nulldata: true,
              gameRecords: infos
            })
          }
          if (putData.page_no == MaxPages) {
            self.setData({
              pageBottom: false,
              loadingAll: true
            })
          }
        }
      } else {
        wx.showModal({
          title: '提示',
          content: data.ret_msg,
          showCancel: false
        })
      }
      if (loadingMethod == 'onLoad' || loadingMethod == 'cut') {
        wx.hideLoading();
      } else if (loadingMethod == 'onRhBottom') {
        self.setData({
          loading: true
        })
      }

    }, function (err) {
      if (loadingMethod == 'onLoad' || isCut == true) {
        wx.hideLoading();
      } else if (loadingMethod == 'onRhBottom') {
        self.setData({
          loading: true
        })
      }
      self.setData({
        hidden: true,
        nulldata: false,
        pagenulldata: {
          imgurl: '/img/unknown.png',
          text: ['操作失败,未知错误~']
        },
      })
    })
  },

  /**
   * 监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
    var pageSize = this.data.pageSize;
    var userId = this.data.userId;
    var optType = this.data.optType
    var putData = {
      page_no: 1,
      page_size: pageSize,
      user_id: userId,
      optType: optType
    }
    this.getData(putData, 'onPullDown');
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var page = this.data.page + 1;
    var pageSize = this.data.pageSize;
    var userId = this.data.userId;
    var optType = this.data.optType
    var putData = {
      page_no: page,
      page_size: pageSize,
      user_id: userId,
      optType: optType
    }
    if (this.data.loadingAll == false) {
      this.getData(putData, 'onRhBottom');
    }
  },

  /**
   * 切换记录
   */
  clickTab: function (e) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0,
    })
    
    if (e.currentTarget.dataset.current == 0) {
      this.setData({
        optType: 1
      })
    } else {
      this.setData({
        optType: 2
      })
    }
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      this.setData({
        currentTab: e.target.dataset.current
      })
      var putData = {
        page_no: 1,
        page_size: this.data.pageSize,
        user_id: this.data.userId,
        optType: this.data.optType
      }
      this.getData(putData, 'cut');
    }
  }
})