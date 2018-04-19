// pages/basicsPacket/packetDetails.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    basicsPacket: {

    },
    DailyPacket: {
      Packet: [],
      count: 0,
      allMomey: 0,
    },
    class: {

    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(JSON.parse(options.data));
    // console.log(app.globalData.DailyPacket.Packet)
    wx.showLoading({
      title: '加载中',
    })
    var _this = this;
    // 获取今日红包数
    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/red_envelope/wechatgetlist",
      method: "POST",
      header: app.globalData.userids.postHeader,
      data: {
        appid: "apid_wechat",
        code: app.globalData.userids.code,
        type: 1,
      },
      success: function (result) {
        console.log(result);
        _this.data.DailyPacket.count = result.data.data.count;
        _this.data.DailyPacket.allMomey = result.data.data.allcash;
        _this.data.DailyPacket.Packet = result.data.data.list;

        _this.data.DailyPacket.Packet.forEach(function(val,index){
          // console.log(val)
          // console.log(_this.format(val.ctime))
          if (val.type == 1) val.type = "新手红包";
          if (val.type == 2 || val.type == 4) val.type = "惊喜红包";
          val.ctime = _this.format(val.ctime)
        })        
        _this.setData(_this.data);
        wx.hideLoading()
      },
      fail: function (res) {
        wx.showToast({
          title: '服务器异常，请退出小程序重试！',
          icon: 'none',
          duration: 2000,
          success: function () {}
        })
      }
    })
    this.data.basicsPacket = JSON.parse(options.data);
    if (JSON.parse(options.data).PacketModalText) this.data.basicsPacket.content = [JSON.parse(options.data).PacketModalText]
    this.setData(this.data);
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  // /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function () {

  // }

  // 进入活动红包
  _entryActivityPage: function () {
    wx.navigateTo({
      url: '../activityPacket/activityPacket',
    })
  },

  // 进入我的钱包
  _entryWallet: function () {
    wx.navigateTo({
      url: '../rebate/rebate',
    })
  },


  // 时间戳的转换
  add0: function (m) { return m < 10 ? '0' + m : m },
  format: function (shijianchuo) {
    //shijianchuo是整数，否则要parseInt转换
    var time = new Date(shijianchuo*1000);
    console.log(shijianchuo*1000)
    console.log(time)
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    return y + '-' + this.add0(m) + '-' + this.add0(d) + ' ' + this.add0(h) + ':' + this.add0(mm) + ':' + this.add0(s);
  }
})