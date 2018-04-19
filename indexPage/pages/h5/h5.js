var app = getApp();
//文件引用  

// pages/h5/h5.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: "",
    lastUrl: "",
    item:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var _this = this;
    this.data.url = encodeURI("https://h5.yqhelper.me/detail/index2.html?nid=1000554856897465")
    if (options.url) {
      this.data.item = "url=" + options.url;
      this.data.url = encodeURI("https://mg.yzrom.com/index.php/wxapp/goods/getHtml?url=" + options.url);
      this.data.lastUrl = options.url
      this.setData(_this.data)
    }else if (options.nid || options.taokouling) {
      this.data.item = "nid=" + options.nid;
      this.data.url = encodeURI("https://h5.yqhelper.me/detail/index2.html?nid=1000"+ options.nid+"&taokouling="+ options.taokouling);
      // 如果从分享卡片打开
      if (options.from == "share"){
        this.data.url = this.data.url +"&from=share"
      }

      console.log(this.data.url);
      this.setData(_this.data)
    }
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

  /**
   * 用户点击右上角分享
   */
  // 分享
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    var str;
    if (this.options.url) str = "觉得这篇攻略不错，你也来看看！" 
    if (this.options.nid) str = "觉得张优惠券不错，你也来看看！"
    return {
      title: app.globalData.userInfo.nickName + str,
      path: '/pages/h5/h5?' + this.data.item+"&from=share",
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})