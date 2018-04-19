// pages/login/login.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOnline: true,
    from: "",
    phoneValue: "",
    authCodeValue: "",
    active: {
      getauthCodeActive: "",
      btnActive: "",
      getAuthCode: "",
      getauthCodeSecond: "获取验证码",
      bindPhone: "",
    },
    Modal: {
      "authCodeFaile": false,
      "authCodeSuccess": false,
      "networkOutage": false,
      "phonHasBind": false,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    // app.globalData.status.entryWalletIng = false;
    this.data.from = options.from;
    console.log(this.data.from)
    // 监听网络状态
    wx.onNetworkStatusChange(function (res) {
      _this.data.isOnline = res.isConnected
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //获得easyModal
    this.easyModal = this.selectComponent("#easyModal");
    this.easyModalSecond = this.selectComponent("#easyModalSecond");
    this.thridModal = this.selectComponent("#thridModal");

  },
  _onShowModal: function (e) {
    let type = e.currentTarget.dataset.type;
    console.log(type);
    if (type == 'first') {
      this.easyModal.show();
    } else if (type == 'second') {
      this.easyModalSecond.show();
    } else {
      this.thridModal.showModal();
    }
  },
  _confirmEventFirst: function () {
    console.log("01 点击确定了!");
    this.easyModal.hide();
  },
  _confirmEventSecond: function () {
    console.log("02 点击确定了!");
    this.easyModalSecond.hide()
  },
  _cancelEvent: function () {
    console.log("点击取消!");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var _this = this;
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

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
  onShareAppMessage: function () {

  },

  // 获取验证码
  getAuthCode: function () {
    var _this = this;
    var second = 60;
    this.data.active.getAuthCode = "";
    var timeout = setInterval(function () {
      _this.data.active.getauthCodeSecond = "重新获取(" + second + "S)";
      _this.setData(_this.data);
      second--;
      if (second == -1) {
        clearInterval(timeout)
        _this.data.active.getauthCodeSecond = "获取验证码";
        _this.data.active.getAuthCode = "getAuthCode";
        _this.setData(_this.data);
      }
    }, 1000)

    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/Account/smsVerify",
      method: "POST",
      data: {
        appid: "apid_wechat",
        phone: _this.data.phoneValue,
        channel: "default",
      },
      success: function (result) {
        console.log(result)
        if (res.data.code == 200) {

        } else if (res.data.code == 203) {
          wx.showToast({
            title: '请求验证码还没有超过60秒不得再次发送!',
            icon: 'none',
            duration: 2000,
            success: function () {}
          })
        } else if (res.data.code == 204) {
          wx.showToast({
            title: '短信发送失败!请60秒后重试！',
            icon: 'none',
            duration: 2000,
            success: function () {}
          })
        } else {
          wx.showToast({
            title: '服务器异常，请退出小程序重试！',
            icon: 'none',
            duration: 2000,
            success: function () {}
          })
        }
      }
    })
  },

  // 用户的输入值保存
  phoneInput: function (e) {
    this.setData({
      phoneValue: e.detail.value
    });
    this.isPoneAvailable(this.data.phoneValue);
    // console.log(this.data.phoneValue)
  },
  authCodeInput: function (e) {
    this.setData({
      authCodeValue: e.detail.value
    });
    if (this.isPoneAvailable(this.data.phoneValue) && this.data.authCodeValue != "") {
      this.data.active.btnActive = "btnActive";
      this.data.active.bindPhone = "bindPhone";
      this.setData(this.data);
    } else {
      this.data.active.btnActive = "";
      this.data.active.bindPhone = "";
      this.setData(this.data);
    }
  },

  // 验证手机号
  isPoneAvailable: function (phone) {
    var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (!myreg.test(phone)) {
      this.data.active.getauthCodeActive = "";
      this.data.active.getAuthCode = "";
      this.setData(this.data);
      // console.log("不是11位手机号")
      return false;
    } else {
      this.data.active.getauthCodeActive = "getauthCodeActive";
      this.data.active.getAuthCode = "getAuthCode";
      this.setData(this.data);
      // console.log("是11位手机号")
      return true;
    }
  },

  // 开始检验
  bindPhone: function () {
    var _this = this;

    if (!this.data.isOnline) {
      _this.Modalinit("networkOutage");
    }
    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/Account/checkCode",
      method: "POST",
      data: {
        phone: _this.data.phoneValue,
        code: _this.data.authCodeValue,
      },
      success: function (res) {
        // 请求成功
        if (res.data.code == 200) {
          wx.request({
            url: "https://flzs.yzrom.com/index.php/api/Account/bindPhone",
            method: "POST",
            header: app.globalData.userids.postHeader,
            data: {
              appid: "apid_wechat",
              phone: _this.data.phoneValue,
              channel: "default",
              code: app.globalData.userids.code,
              rwxid: _this.options.rwxid,
            },
            success: function (res) {
              console.log(res);
              if (res.data.code == 200) {
                // 登陆成功
                app.globalData.firstParameter.firstOpenWallet = false;
                _this.Modalinit("authCodeSuccess");
                wx.redirectTo({
                  url: '../rebate/rebate',
                })
              } else if (res.data.code == 201) {
                console.log("客户端请求错误");
                if (_this.data.from == "firstEntryWallet") {
                  wx.redirectTo({
                    url: '../index/index?from=login' + _this.data.from + "fail",
                  })
                }
              } else if (res.data.code == 202) {
                console.log("手机已经绑定过");
                _this.Modalinit("phonHasBind");
              } else {
                wx.showToast({
                  title: '服务器异常，请退出小程序重试！',
                  icon: 'none',
                  duration: 2000,
                  success: function () {}
                })
              }
            }
          })
          // 客户端请求错误
        } else if (res.data.code == 201) {
          _this.Modalinit("authCodeFaile");
          // 用户绑定过
        } else if (res.data.code == 202) {
          console.log("手机已绑定");
          _this.Modalinit("phonHasBind");
          // 客户端请求错误
        } else if (res.data.code == 203) {
          // _this.easyModal.show();
          // 输入超时
          _this.Modalinit("authCodeFaile");
        } else {
          wx.showToast({
            title: '服务器异常，请退出小程序重试！',
            icon: 'none',
            duration: 2000,
            success: function () {}
          })
        }
      }
    })


  },


  // 初始化弹窗
  Modalinit: function (modal) {
    console.log(modal)
    var _this = this;
    for (var key in _this.data.Modal) {
      _this.data.Modal[key] = false;
    }
    this.data.Modal[modal] = true;
    this.setData(this.data);
    this.easyModal.show();
  },

  // 联系客服
  Notescontact: function () {
    wx.navigateTo({
      url: '../tutorial/tutorial',
    });
    this.easyModal.hide()
  }

})