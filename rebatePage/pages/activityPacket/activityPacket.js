// pages/rebatePage/activityPacket.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    accumulatedIncome: 0,
    rebatePacket: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    if (app.globalData.userInfo.checkIsBind != "exist") {
      this.toLogin();
    }
    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/red_envelope/wechatgetlist",
      method: "POST",
      header: app.globalData.userids.postHeader,
      data: {
        appid: "apid_wechat",
        code: app.globalData.userids.code,
        // channel:"default",
        type: 2
      },
      success: function (res) {
        console.log(res);
        res.data.data.list.forEach(function (item, index) {
          switch (item.type) {
            case "1":
              item.describe = "新手红包"
              break;
            case "2":
              item.describe = "惊喜红包"
              break;
            case "3":
              item.describe = "每日红包"
              break;
            case "4":
              item.describe = "分享红包"
              break;
          }
          switch (item.app_id) {
            case "apid_yqhelper":
              item.channel = "APP红包"
              break;
            case "apid_wechat":
              item.channel = "小程序红包"
              break;
          }

          item.ctime = _this.format(item.ctime);
        })
        _this.data.accumulatedIncome = res.data.data.allcash.toFixed(2);
        _this.data.rebatePacket = res.data.data.list;
        _this.setData(_this.data);
        console.log(res.data.data.list);
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


  // 跳转到登录页面
  toLogin: function () {
    wx.navigateTo({
      url: '../login/login',
    })
  },

  // 时间戳的转换
  add0: function (m) {
    return m < 10 ? '0' + m : m
  },
  format: function (shijianchuo) {
    //shijianchuo是整数，否则要parseInt转换
    var time = new Date(shijianchuo * 1000);
    console.log(shijianchuo * 1000)
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