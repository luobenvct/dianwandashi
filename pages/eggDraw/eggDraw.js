var util_request = require('../../utils/request.js');
var app = getApp()
Page({
  data: {
    userId: 0,
    code: null,
    awardsList: {},
    animationData: {},
    btnDisabled: '',
    left:0,
    top:0,
    eggNum1: 0,
    eggNum2: 0,
    eggNum3: 0,
    eggNum4: 0,
    eggNum5: 0,
    eggNum6: 0,
    userName: null,
    headUrl: null,
    eggBalance: 0,
    eggNum: [0, 0, 0, 0, 0, 0],
    alertHidden: true,
    windowWidth:0,                //屏幕宽度
    marginLeft:0,
    marginLeftcontainer:61,
    drawResult: null,
    drawViewHidden: false
  },

  onLoad: function (e) {
    this.setData({
      windowWidth: wx.getSystemInfoSync().windowWidth   
    })
    var containerleft = this.data.marginLeftcontainer+(wx.getSystemInfoSync().windowWidth - 375)/2
    this.setData({
      marginLeft: (wx.getSystemInfoSync().windowWidth - 375)/2,
      marginLeftcontainer: containerleft
    })
    console.log(this.data.windowWidth)
    var self = this;
    app.getUserInfo(function (loginInfo) { // 调用登录接口
      if (loginInfo == null) return;
      self.setData({
        userId: loginInfo.user_id,
        code: e.code,
      })
      self.loadData()
    })
  },

  loadData: function () {
    var self = this;
    util_request._getGatewayApi('/activityApi/egg/v1/price/detail', { qrCode: self.data.code, userId: self.data.userId},
      function (res) {
        var data = res.data.data;
        self.setData({
          headUrl: data.avatar,
          userName: data.userName,
          eggBalance: data.eggBalance
        })
        if (res.data.code * 1 == 0) {
          self.setData({
            drawViewHidden: false,
            eggNum1: data.eggNum1,
            eggNum2: data.eggNum2,
            eggNum3: data.eggNum3,
            eggNum4: data.eggNum4,
            eggNum5: data.eggNum5,
            eggNum6: data.eggNum6,
            eggNum: [data.eggNum1, data.eggNum2, data.eggNum3, data.eggNum4, data.eggNum5, data.eggNum6]
          })
          self.getAwards()
        } else {
          self.setData({
            drawViewHidden: true,
          })
        }
      }, function (res) {
        console.log(res)
      })
  },

  refresh: function () {
    var self = this;
    util_request._getGatewayApi('/activityApi/egg/v1/price/detail', { qrCode: self.data.code, userId: self.data.userId },
      function (res) {
        var data = res.data.data;
        self.setData({
          headUrl: data.avatar,
          userName: data.userName,
          eggBalance: data.eggBalance
        })
      }, function (res) {
        console.log(res)
      })
  },

  testfun:function(){
    var that = this;
    app.awardsConfig = {
      chance: true,
      awards: [
        { 'index': 0, 'name': that.data.eggNum1 },
        { 'index': 1, 'name': that.data.eggNum2 },
        { 'index': 2, 'name': that.data.eggNum3 },
        { 'index': 3, 'name': that.data.eggNum4 },
        { 'index': 4, 'name': that.data.eggNum5 },
        { 'index': 5, 'name': that.data.eggNum6 }
      ]
    }
    var awardsConfig = app.awardsConfig.awards,
      len = awardsConfig.length,
      html = [],
      turnNum = 1 / len  // 文字旋转 turn 值
    
    for (var i = 0; i < len; i++) {
      html.push({ turn: i * turnNum + 'turn', lineTurn: i * turnNum + turnNum / 2 + 'turn', award: awardsConfig[i].name });
    }
    that.setData({
      awardsList: html
    });
  },

  getAwards: function () {
    var that = this;
    // getAwardsConfig
    app.awardsConfig = {
      chance: true,
      awards: [
        { 'index': 0, 'name': that.data.eggNum1 },
        { 'index': 1, 'name': that.data.eggNum2 },
        { 'index': 2, 'name': that.data.eggNum3 },
        { 'index': 3, 'name': that.data.eggNum4 },
        { 'index': 4, 'name': that.data.eggNum5 },
        { 'index': 5, 'name': that.data.eggNum6 }
      ]
    }
    // 绘制转盘
    var awardsConfig = app.awardsConfig.awards,
      len = awardsConfig.length,
      rotateDeg = 360 / len / 2 + 90,
    
      html = [],
      turnNum = 1 / len  // 文字旋转 turn 值
    that.setData({
      btnDisabled: app.awardsConfig.chance ? '' : 'disabled'
    })
    var ctx = wx.createCanvasContext('lotteryCanvas', this)
    for (var i = 0; i < len; i++) {
      // 保存当前状态
      ctx.save();
      // 开始一条新路径
      ctx.beginPath();
      // 位移到圆心，下面需要围绕圆心旋转
      ctx.translate(125, 125);
      // 从(0, 0)坐标开始定义一条新的子路径
      ctx.moveTo(0, 0);
      // 旋转弧度,需将角度转换为弧度,使用 degrees * Math.PI/180 公式进行计算。
      ctx.rotate((360 / len * i - rotateDeg) * Math.PI / 180);
      // 绘制圆弧
      ctx.arc(0, 0, 125, 0, 2 * Math.PI / len, false);

      // 颜色间隔
      if( i % 2 == 0){
        ctx.setFillStyle('rgba(255,152,111,.1)');
      }else{
        ctx.setFillStyle('rgba(255,199,119,.1)');
      }

      // 填充扇形
      ctx.fill();

      // 恢复前一个状态
      ctx.restore();

      // 奖项列表
      html.push({ turn: i * turnNum + 'turn', lineTurn: i * turnNum + turnNum / 2 + 'turn', award: awardsConfig[i].name });
    }
    ctx.draw(true)
    that.setData({
      awardsList: html
    });
  },

  getLottery: function () {
    var self = this
    util_request._postGatewayApi('/activityApi/egg/v1/draw', { qrCode: self.data.code, userId: self.data.userId },
      function (res) {
        if (res.data.code * 1 == 0) {
          self.draw(res.data.data)
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false
          })
        }
      }, function (res) {
        console.log(res)
      })
  },

  draw: function (drawResult) {
    var that = this
    // 获取奖品配置
    var awardsConfig = app.awardsConfig, runNum = 8
    // if (awardIndex < 2) awardsConfig.chance = false

    if (that.data.btnDisabled == '' && awardsConfig.chance == true) {
      var awardIndex = 0;
      var zhongjiang = drawResult; //Math.random() * 6 >>> 0
      console.log(zhongjiang)
      if (zhongjiang == 0) {
        that.setData({
          eggNum1: that.data.eggNum[0],
          eggNum2: that.data.eggNum[1],
          eggNum3: that.data.eggNum[2],
          eggNum4: that.data.eggNum[3],
          eggNum5: that.data.eggNum[4],
          eggNum6: that.data.eggNum[5]
        })
      } else if (zhongjiang == 1) {
        that.setData({
          eggNum1: that.data.eggNum[1],
          eggNum2: that.data.eggNum[0],
          eggNum3: that.data.eggNum[2],
          eggNum4: that.data.eggNum[3],
          eggNum5: that.data.eggNum[4],
          eggNum6: that.data.eggNum[5]
        })
      } else if (zhongjiang == 2) {
        that.setData({
          eggNum1: that.data.eggNum[2],
          eggNum2: that.data.eggNum[1],
          eggNum3: that.data.eggNum[0],
          eggNum4: that.data.eggNum[3],
          eggNum5: that.data.eggNum[4],
          eggNum6: that.data.eggNum[5]
        })
      } else if (zhongjiang == 3) {
        that.setData({
          eggNum1: that.data.eggNum[3],
          eggNum2: that.data.eggNum[1],
          eggNum3: that.data.eggNum[2],
          eggNum4: that.data.eggNum[0],
          eggNum5: that.data.eggNum[4],
          eggNum6: that.data.eggNum[5]
        })
      } else if (zhongjiang == 4) {
        that.setData({
          eggNum1: that.data.eggNum[4],
          eggNum2: that.data.eggNum[1],
          eggNum3: that.data.eggNum[2],
          eggNum4: that.data.eggNum[3],
          eggNum5: that.data.eggNum[0],
          eggNum6: that.data.eggNum[5]
        })
      } else if (zhongjiang == 5) {
        that.setData({
          eggNum1: that.data.eggNum[5],
          eggNum2: that.data.eggNum[1],
          eggNum3: that.data.eggNum[2],
          eggNum4: that.data.eggNum[3],
          eggNum5: that.data.eggNum[4],
          eggNum6: that.data.eggNum[0]
        })
      }

      awardsConfig.awards[awardIndex].name = that.data.eggNum1;
      //this.getAwards();
      this.testfun()

      // 旋转抽奖
      app.runDegs = app.runDegs || 0
      // app.runDegs = app.runDegs + (360 - app.runDegs % 360) + (360 * runNum - awardIndex * (360 / 6))
      app.runDegs = app.runDegs + (360 - app.runDegs % 360) + (360 * runNum - awardIndex * (360 / 6))
      var animationRun = wx.createAnimation({
        duration: 4000,
        timingFunction: 'ease'
      })
      that.animationRun = animationRun
      animationRun.rotate(app.runDegs).step();

      that.setData({
        animationData: animationRun.export(),
        btnDisabled: 'disabled'
      })

      // 记录奖品
      var winAwards = wx.getStorageSync('winAwards') || { data: [] }
      winAwards.data.push(awardsConfig.awards[awardIndex].name + '1个')
      wx.setStorageSync('winAwards', winAwards)

      // 中奖提示
      setTimeout(function () {
        that.setData({
          drawResult: awardsConfig.awards[awardIndex].name,
          alertHidden: false
        })
        that.refresh()
        if (awardsConfig.chance) {
          that.setData({
            btnDisabled: ''
          })
        }
      }, 4000);
    }
  },

  toExchange: function () {
    wx.navigateTo({
      url: '../eggShop/eggShop',
    })
  },

  getMore: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  closeAlert: function () {
    this.setData({
      alertHidden: true
    })
  }

})