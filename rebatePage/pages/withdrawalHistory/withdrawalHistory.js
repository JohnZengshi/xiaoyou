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
    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/user_center/userpaylist",
      method: "POST",
      header: app.globalData.userids.postHeader,
      data: {
        appid: "apid_wechat",
        code: app.globalData.userids.code,
        channel: "default",
      },
      success: function (res) {
        console.log(res)
        res.data.data.list.forEach(function (item, index) {
          item.describe = "微信助理【" + item.weixinname +"】已发送红包";
          _this.data.accumulatedIncome += (item.money-0);
        })
        _this.data.accumulatedIncome = _this.data.accumulatedIncome.toFixed(2)
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


})