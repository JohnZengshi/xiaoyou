//app.js
App({
  globalData: {
    userids: {
      code: "",
      postHeader: "",
      getHeader: "",
    },
    // 用户的参数
    userInfo: {
      nickName: "",
      avatarUrl: "",
      gender: "",
      province: "",
      city: "",
      country: "",
      checkIsBind: "",
    },
    // 用户的操作
    userOperation: {
      userClipboardData: "",
    },
    // 返利系统
    rebate: {
      firstStart: {
        congratulations: true,
      },
      clickWithdrawal: false
    },
    // 状态
    status: {
      entryWalletIng: false,
    },
    // 第一次进入的参数
    firstParameter: {
      firstOpenWallet: true,
    },
    // 红包记数
    DailyPacket: {
      DailyPacketCount: 0,
      Packet: []
    }

  },

  onUnload: function () {},
  // 报错
  _fail: function (num) {
    wx.showToast({
      title: '服务器异常，请退出小程序重试！错误码：' + num,
      icon: 'none',
      duration: 2000,
      success: function () {}
    })
  },
  onLoad: function () {
   
  }

});