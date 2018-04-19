// pages/rebatePage/rebatePacket.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    withdrawDeposit: 0.00,
    accumulatedIncome: 0.00,
    rebatePacket: [],
    inTheImport:[],
    hasRebate:[],
    canWithdraw:[],
    invalid:[],
    noRebate:[],
    tab: 0,
    tip: "订单导入需5到10分钟，查询订单是否有返利红包。",
    type:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    this.getPackList(this.data.type)
    // this.getPackList(1)
    // this.getPackList(2)
    // this.getPackList(3)
    // this.getPackList(4)
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

  menuClick: function (e) {
    this.data.tab = e.currentTarget.dataset.tab;
    if (this.data.tab == 0){
      this.data.rebatePacket = this.data.inTheImport
      this.data.tip = "订单导入需5到10分钟，查询订单是否有返利红包。"
    } 
    if (this.data.tab == 1){
      this.data.rebatePacket = this.data.hasRebate
      this.data.tip = "已付款订单确认收货7天后，返利红包即可提现。"
    } 
    if (this.data.tab == 2) {
      this.data.rebatePacket = this.data.canWithdraw
      this.data.tip = ""
    }
    if (this.data.tab == 3){
      this.data.rebatePacket = this.data.invalid
      this.data.tip = "订单退款后，返利红包自动失效。"
    } 
    if (this.data.tab == 4){
      this.data.rebatePacket = this.data.noRebate
      this.data.tip = "未付款订单、付款时使用其他平台优惠订单、异常订单均无返利红包。"
    } 
    this.setData(this.data);
  },

  // 请求列表数据
  getPackList:function(type){
    var _this = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/user_center/userrebatelist_new",
      method: "POST",
      header: app.globalData.userids.postHeader,
      data: {
        appid: "apid_wechat",
        code: app.globalData.userids.code,
        channel: "default",
        type:type,
      },
      success: function (res) {
        // console.log(app.globalData.userids.code)
        console.log(res);
        res.data.data.list.forEach(function (item, index) {
          if (item.appid == "apid_yqhelper") item.from = "APP导入"
          if (item.appid == "apid_wechat") item.from = "小程序导入"
          if(item.moneytype == "100" || item.moneytype == "6"){
            item.money = 0;
          }
          if(item.ithdrawals == 1){
            _this.data.withdrawDeposit += (item.money - 0)
          }
          item.ctime = item.ctime.substr(0,16)
        })
        if(type == 0) _this.data.inTheImport = res.data.data.list
        if(type == 1) _this.data.hasRebate = res.data.data.list
        if(type == 2) _this.data.canWithdraw = res.data.data.list
        if(type == 3) _this.data.invalid = res.data.data.list
        if(type == 4) _this.data.noRebate = res.data.data.list
        _this.data.type++;
        if(_this.data.type == 5) return
        _this.getPackList(_this.data.type)
        
        if(_this.data.type == 4){
          _this.data.rebatePacket = _this.data.inTheImport
          _this.data.withdrawDeposit = (_this.data.withdrawDeposit - 0).toFixed(2);
          _this.data.accumulatedIncome = (_this.options.user_grandtotal - 0).toFixed(2);
          _this.setData(_this.data);
          wx.hideLoading();
        }
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
    // wx.hideLoading()
    
    
  }
})