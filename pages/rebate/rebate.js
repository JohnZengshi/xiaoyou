// pages/rebate/rebate.js
var app = getApp();
var test = "testflzs.yzrom.com";
var online = "flzs.yzrom.com"
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isOnline: true,
    statusText: "",
    userClipboardData: "",
    rwxid: "",
    status: {
      loginStatus: "noLogin",
      withdrawalstatus: "暂不可提",
      withdrawalClass: "active",
      showWithdrawalBox: "",
      confirmWithdrawal: "",
      confirmWithdrawalClass: "",
      confirmWithdrawalText: "",
      uploadOrder: "",
      uploadOrderClass: "",
      uploadOrderText: "",
      orderConfirmationText: "网络不好,重试！",
      weixinerror: false
    },
    valInput: {
      ordervalInput: "",
      moneyvalInput: "",
    },
    userInfo: {
      user_cashed_money: "0.00",
      rebate_money_sum: "0.00",
      // 用户有返利加可提现金额
      user_grandtotal: "0.00",
      party_money_sum: "0.00",
      has_cash_money: "0.00",
      Allrebate_money_sum: "0.00"
    },
    Modal: {
      "firstEntry": true,
      "beforLead": false,
      "afterLead": false,
      "ImportSuccess_01": false,
      "ImportSuccess_02": false,
      "withdrawal": false,
      "bindweixinis": false,
      "orderConfirmation": false,
      "confirm": false,
      "robotDown": false,
      "withdrawalFail": false,
      "noticePopup": false,
      "addRobot": false,
      "repackPastDue": false,
    },
    closeIng: "pop_up_close_normal.png",
    xScrollText: '', //滚动文字内容
    size: 23, //文字字体大小
    orientation: 'left', //文字滚动方向
    marqueePace: 1, //文字滚动速度，建议为1。数值越大，滚动越快
    interval: 20, // 时间间隔。数值越大，滚动越慢
    marqueeDistance: 0, //初始滚动距离。
    marqueeDistance2: 0, //数值越大，初始左边距的空白区越大
    marquee2copyStatus: false,
    marquee2Margin: 30,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


    setTimeout(function () {
      if (app.globalData.status.entryWalletIng) app.globalData.status.entryWalletIng = false;
    }, 1000)
    // console.log(this.data)
    var _this = this;
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
    // console.log(type);
    if (type == 'first') {
      this.easyModal.show();
    } else if (type == 'second') {
      this.easyModalSecond.show();
    } else {
      this.thridModal.showModal();
    }
  },
  _confirmEventFirst: function (e) {
    var _this = this;
    this.data.closeIng = "pop_up_close_hover.png"
    this.setData(this.data);
    this.Modalinit();
    this.easyModal.hide();
    // 机器人故障提示条
    if (e.currentTarget.dataset.msg == "robotError") {
      _this.data.status.weixinerror = true;
      _this.data.xScrollText = "发红包的小伙伴失联了……添加新好友才能提现……"
      _this.data.status.withdrawalClass = "active";
      _this.data.status.showWithdrawalBox = "";
      _this.data.status.withdrawalstatus = "暂不可提";
      _this.setData(_this.data);
      _this.showTip();

    }
    if (e.currentTarget.dataset.msg == "withdrawalError") {
      _this.data.status.weixinerror = true;
      _this.data.xScrollText = "提现失败了，添加新好友才能重新提现……"
      _this.data.status.withdrawalClass = "active";
      _this.data.status.showWithdrawalBox = "";
      _this.data.status.withdrawalstatus = "暂不可提";
      _this.setData(_this.data);
      _this.showTip();

    }
  },
  _confirmEventSecond: function () {
    // console.log("02 点击确定了!");
    this.easyModalSecond.hide()
  },
  _cancelEvent: function () {
    // console.log("点击取消!");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 第一次进入钱包
    var _this = this;
    // 监听网络状态
    wx.onNetworkStatusChange(function (res) {
      _this.data.isOnline = res.isConnected
    });
    wx.showLoading({
      title: '加载中',
    })
    wx.login({
      success: function (res) {
        // console.log(_this.options)
        app.globalData.userids.code = res.code;
        if (res.code) {
          //发起网络请求
          // 1.检查用户是否登录过
          wx.request({
            url: "https://" + online + "/index.php/api/Account/checkIsBind",
            method: "POST",
            dataType: "json",
            data: {
              appid: "apid_wechat",
              channel: "default",
              code: app.globalData.userids.code,
              // rwxid: _this.options.wxid ? _this.options.wxid:null,
              // is_cash: _this.options.is_cash == 1 ? _this.options.is_cash:null
            },
            success: function (result) {
              // _this.Modalinit("repackPastDue");
              // console.log(result.data.data.session_id);
              // 设置请求的头部
              if (result.data.data.session_id != "" && result.data.data.session_id != null) {
                app.globalData.userids.postHeader = {
                  'content-type': 'application/json',
                  'Cookie': 'PHPSESSID=' + result.data.data.session_id
                }
                app.globalData.userids.getHeader = {
                  'content-type': 'application/x-www-form-urlencoded',
                  'Cookie': 'PHPSESSID=' + result.data.data.session_id
                }
              } else {
                app.globalData.userids.postHeader = {
                  'content-type': 'application/json'
                }
                app.globalData.userids.getHeader = {
                  'content-type': 'application/x-www-form-urlencoded'
                }
              }
              // 用户登录过
              if (result.data.code == 200) {
                _this.data.statusText = "用户登录过，数据库有相关信息";
                _this.data.status.loginStatus = "logined";
                _this.setData(_this.data);

                // 1.1获取用户的信息
                wx.request({
                  url: "https://" + online + "/index.php/api/Account/login",
                  method: "GET",
                  header: app.globalData.userids.getHeader,
                  data: {
                    appid: "apid_wechat",
                    channel: "default",
                    code: app.globalData.userids.code,
                  },
                  success: function (result) {
                    // console.log(result)
                    // 用户已经绑定
                    if (result.data.code == 200) {
                      app.globalData.userInfo.checkIsBind = "exist";
                      // 图片地址的修改
                      result.data.data.weixinqrcodeimg = result.data.data.weixinqrcodeimg.replace("http", "https")
                      result.data.data.user_grandtotal = result.data.data.user_grandtotal.toFixed(2)
                      result.data.data.party_money_sum = result.data.data.party_money_sum.toFixed(2)
                      result.data.data.has_cash_money = result.data.data.has_cash_money.toFixed(2)
                      result.data.data.user_cashed_money = result.data.data.user_cashed_money.toFixed(2)
                      _this.data.userInfo = result.data.data;
                      // result.data.data.weixinerror = 1;
                      // result.data.data.payLog_status = 0

                      // _this.data.userInfo.payLog_status = 0
                      // withdrawalButton(_this.data.userInfo.frozon_state,_this.data.userInfo.payLog_status,_this.data.userInfo.user_cashed_money)
                      // 非提现中
                      if (_this.data.userInfo.frozon_state == 0) {
                        // 用户今日没有提过现
                        if (_this.data.userInfo.payLog_status == 0) {
                          // 用户账户有钱
                          if (_this.data.userInfo.user_cashed_money != 0) {
                            _this.data.status.withdrawalClass = "";
                            _this.data.status.showWithdrawalBox = "showWithdrawalBox";
                            _this.data.status.withdrawalstatus = "立即提现";
                            _this.setData(_this.data);
                            // 用户账户里没钱
                          } else if (_this.data.userInfo.user_cashed_money == 0) {
                            _this.data.status.withdrawalClass = "active";
                            _this.data.status.showWithdrawalBox = "";
                            _this.data.status.withdrawalstatus = "暂不可提";
                            _this.setData(_this.data);
                          }
                          // 用户今日提过现
                        } else if (_this.data.userInfo.payLog_status == 1) {
                          _this.data.status.withdrawalClass = "active";
                          _this.data.status.showWithdrawalBox = "";
                          _this.data.status.withdrawalstatus = "今日已提";
                          _this.setData(_this.data);
                        }
                        // 用户提现中
                      } else if (_this.data.userInfo.frozon_state == 1) {
                        _this.data.status.withdrawalstatus = "提现中";
                        _this.data.status.showWithdrawalBox = "";
                        _this.data.status.withdrawalClass = "active"
                        _this.setData(_this.data);
                        // 用户还没领红包                            
                      } else if (_this.data.userInfo.frozon_state == 2) {
                        _this.data.status.withdrawalstatus = "红包还没领";
                        _this.data.status.showWithdrawalBox = "";
                        _this.data.status.withdrawalClass = "active"
                        _this.setData(_this.data);
                      }

                      // 微信机器人挂了（用户已经登录）
                      if (result.data.data.weixinerror == 1) {
                        // _this.data.status.withdrawalClass = "active";
                        // _this.data.status.showWithdrawalBox = "";
                        // _this.data.status.withdrawalstatus = "暂不可提";
                        // _this.data.status.weixinerror = true;
                        // _this.data.xScrollText = "发红包的小伙伴失联了……添加新好友才能提现……"
                        // _this.showTip();
                        // _this.Modalinit("robotDown")
                        // _this.setData(_this.data);
                      }

                      // 红包过期了
                      // result.data.data.weixinpaycode = 1
                      if (result.data.data.weixinpaycode == 1) {
                        _this.data.status.withdrawalClass = "";
                        _this.data.status.showWithdrawalBox = "showWithdrawalBox";
                        _this.data.status.withdrawalstatus = "立即提现";
                        _this.setData(_this.data);
                        _this.Modalinit("repackPastDue");
                      }
                      _this.setData(_this.data);
                      // 用户没有绑定手机
                    } else if (result.data.code == 230) {
                      wx.showToast({
                        title: "没有绑定手机!",
                        icon: 'loading',
                        duration: 2000,
                        success: function () {
                          _this.easyModal.hide();
                        }
                      })
                      // 用户不存在
                    } else if (result.data.code == 231) {
                      wx.showToast({
                        title: "用户不存在!",
                        icon: 'loading',
                        duration: 2000,
                        success: function () {
                          _this.easyModal.hide();
                        }
                      })
                      // 其他情况
                    } else {
                      _this.data.xScrollText = "服务器开小差了，技术GGMM正在玩命抢修，稍后再试……"
                      _this.data.status.withdrawalClass = "active";
                      _this.data.status.showWithdrawalBox = "";
                      _this.data.status.withdrawalstatus = "暂不可提";
                      _this.setData(_this.data);
                      _this.showTip();
                    }
                  },
                  fail: function () {
                    _this.data.xScrollText = "服务器开小差了，技术GGMM正在玩命抢修，稍后再试……"
                    _this.data.status.withdrawalClass = "active";
                    _this.data.status.showWithdrawalBox = "";
                    _this.data.status.withdrawalstatus = "暂不可提";
                    _this.setData(_this.data);
                    _this.showTip();
                  }

                });
                // 初次弹出恭喜开启钱包
                if (app.globalData.rebate.firstStart.congratulations) {
                  // _this.easyModal.show();
                  app.globalData.rebate.firstStart.congratulations = false;
                }


              }
              //用户没有登录过
              else if (result.data.code == 201) {
                _this.data.statusText = "用户没有登录过，跳转到登录页"
                wx.navigateTo({
                  url: '../../indexPage/pages/login/login?rwxid=' + _this.options.wxid,
                })
                _this.setData(_this.data)
              }
              // 其他情况
              else {
                _this.data.xScrollText = "服务器开小差了，技术GGMM正在玩命抢修，稍后再试……"
                _this.data.status.withdrawalClass = "active";
                _this.data.status.showWithdrawalBox = "";
                _this.data.status.withdrawalstatus = "暂不可提";
                _this.setData(_this.data);
                _this.showTip();
              }

              wx.hideLoading()
              wx.getClipboardData({
                success: function (res) {
                  if (_this.isOrderAvailable(res.data)) {
                    _this.data.userClipboardData = res.data
                    _this.Modalinit("orderConfirmation");
                    wx.setClipboardData({
                      data: " "
                    })
                  }
                }
              });
            },
            fail: function () {
              _this.data.xScrollText = "服务器开小差了，技术GGMM正在玩命抢修，稍后再试……"
              _this.data.status.withdrawalClass = "active";
              _this.data.status.showWithdrawalBox = "";
              _this.data.status.withdrawalstatus = "暂不可提";
              _this.setData(_this.data);
              _this.showTip();
            }
          })
        } else {
          // console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // console.log("页面没了")
    // app.globalData.rebate = this.data;    
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
  onShareAppMessage: function () {

  },
  // 获取验证码
  getSmsCode: function () {
    var _this = this
    wx.request({
      url: "https://" + online + "/index.php/api/Account/smsVerify",
      method: "POST",
      data: {
        appdi: _this.data.appid,
        phone: _this.data.phoneNumber,
        channel: "weixin"
      },
      success: function (res) {
        // console.log(res)


      }
    })
  },

  // 订单号的值保存
  ordervalInput: function (e) {
    var _this = this;
    this.data.valInput.ordervalInput = e.detail.value;
    // 监听网络状态
    wx.onNetworkStatusChange(function (res) {
      _this.data.isOnline = res.isConnected
      if (!_this.data.isOnline) {
        _this.data.status.uploadOrder = "";
        _this.data.status.uploadOrderClass = "";
        _this.data.status.uploadOrderText = "网络不太好，主人请重试"
        _this.setData(_this.data)
      } else if (_this.data.isOnline) {
        _this.data.status.uploadOrder = "";
        _this.data.status.uploadOrderClass = "";
        _this.data.status.uploadOrderText = ""
        _this.setData(_this.data)
      }
    });
    // 输入框为空
    if (this.data.valInput.ordervalInput == "") {
      this.data.status.uploadOrder = "";
      this.data.status.uploadOrderClass = "";
      this.data.status.uploadOrderText = ""
      this.setData(this.data)
      return;
    }
    // 校验是否是18位订单号
    if (this.isOrderAvailable(this.data.valInput.ordervalInput)) {
      this.data.status.uploadOrder = "uploadOrder";
      this.data.status.uploadOrderClass = "";
      this.data.status.uploadOrderText = ""
      this.setData(this.data);
    } else {
      this.data.status.uploadOrder = "";
      this.data.status.uploadOrderClass = "";
      this.data.status.uploadOrderText = "请输入18位数字订单号！"
      this.setData(this.data)
    }
  },

  // 提现金额的值保存
  moneyvalInput: function (e) {
    var _this = this;
    this.data.valInput.moneyvalInput = e.detail.value;
    // 监听网络状态
    wx.onNetworkStatusChange(function (res) {
      _this.data.isOnline = res.isConnected
      if (!_this.data.isOnline) {
        _this.data.status.confirmWithdrawal = "";
        _this.data.status.confirmWithdrawalClass = "";
        _this.data.status.confirmWithdrawalText = "网络不太好，主人请重试"
        _this.setData(_this.data);
      } else if (_this.data.isOnline) {
        _this.data.status.confirmWithdrawal = "";
        _this.data.status.confirmWithdrawalClass = "";
        _this.data.status.confirmWithdrawalText = ""
        _this.setData(_this.data);
      }
    });

    // 输入框为空
    if (this.data.valInput.moneyvalInput == "") {
      this.data.status.confirmWithdrawal = "";
      this.data.status.confirmWithdrawalClass = "";
      this.data.status.confirmWithdrawalText = ""
      this.setData(this.data);
      return;
    }
    // 输入的是数字    
    if (/^[0-9]+.?[0-9]*$/.test(this.data.valInput.moneyvalInput)) {
      // 输入的金额低于0元
      if (this.data.valInput.moneyvalInput - 0 <= 0) {
        this.data.status.confirmWithdrawal = "";
        this.data.status.confirmWithdrawalClass = "";
        this.data.status.confirmWithdrawalText = "主人，提现金额不得低于0元"
        this.setData(this.data);
        // 输入金额大于0
      } else if (this.data.valInput.moneyvalInput - 0 > 0) {
        // 提现金额大于最大提现金额
        if (this.data.valInput.moneyvalInput - 0 > this.data.userInfo.cash_extraction) {
          this.data.status.confirmWithdrawal = "";
          this.data.status.confirmWithdrawalClass = "";
          this.data.status.confirmWithdrawalText = "主人，一次提现金额不能超过¥" + this.data.userInfo.cash_extraction;
          this.setData(this.data);
          // 提现金额小于最大提现金额
        } else if (this.data.valInput.moneyvalInput - 0 <= this.data.userInfo.cash_extraction) {

          // 提现金额小于用户余额
          if (this.data.valInput.moneyvalInput <= this.data.userInfo.user_cashed_money) {


            // 用户提现次数小于3次
            if (this.data.userInfo.paySuccessCount < 3) {
              this.data.status.confirmWithdrawal = "confirmWithdrawal";
              this.data.status.confirmWithdrawalClass = "";
              this.data.status.confirmWithdrawalText = ""
              this.setData(this.data);
              // 用户提现次数大于3次
            } else if (this.data.userInfo.paySuccessCount >= 3) {

              // 用户单笔提现超过10元
              if (this.data.valInput.moneyvalInput - 0 >= 10) {
                this.data.status.confirmWithdrawal = "confirmWithdrawal";
                this.data.status.confirmWithdrawalClass = "";
                this.data.status.confirmWithdrawalText = ""
                this.setData(this.data);
                // 用户单笔提现低于10元
              } else if (this.data.valInput.moneyvalInput - 0 < 10) {
                this.data.status.confirmWithdrawal = "";
                this.data.status.confirmWithdrawalClass = "";
                this.data.status.confirmWithdrawalText = "主人，一次提现金额不能少于¥10"
                this.setData(this.data);
              }
            }


            // 提现金额大于用户余额
          } else if (this.data.valInput.moneyvalInput > this.data.userInfo.user_cashed_money) {
            this.data.status.confirmWithdrawal = "";
            this.data.status.confirmWithdrawalClass = "";
            this.data.status.confirmWithdrawalText = "主人，提现金额不能超过【" + this.data.userInfo.user_cashed_money + "】"
            this.setData(this.data);
          }




        }
      }
      // 输入的不是数字
    } else if (!/^[0-9]+.?[0-9]*$/.test(this.data.valInput.moneyvalInput)) {
      this.data.status.confirmWithdrawal = "";
      this.data.status.confirmWithdrawalClass = "";
      this.data.status.confirmWithdrawalText = "请输入提现金额"
      this.setData(this.data);
    }




  },

  // 3.显示导入订单模态框
  showOrderBox: function () {
    // console.log(res)
    // console.log(app.globalData)
    var _this = this;
    _this.data.status.uploadOrderClass = "";
    _this.data.status.loginStatus = "logined";
    _this.data.status.uploadOrderText = ""
    // wx.hideLoading()
    _this.Modalinit("beforLead");
  },

  // 4.确认提现
  confirmWithdrawal: function () {
    // console.log(app.globalData.userids.postHeader)
    var _this = this;
    wx.request({
      url: "https://" + online + "/index.php/api/wx/cash",
      method: "POST",
      header: app.globalData.userids.postHeader,
      data: {
        appid: "apid_wechat",
        code: app.globalData.userids.code,
        channel: "default",
        money: _this.data.valInput.moneyvalInput,
      },
      success: function (res) {
        // console.log(res.data.code);
        // res.data.code = 201;
        // res.data.msg = "cash error"
        if (res.data.code == 201) {
          if (res.data.msg == "cash error") {
            _this.Modalinit("withdrawalFail");
            _this.setData(_this.data);
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 2000,
              success: function () {}
            })
          }
        } else if (res.data.code == 200) {
          _this.data.status.confirmWithdrawalClass = "";
          _this.data.status.withdrawalstatus = "提现中";
          _this.data.status.showWithdrawalBox = "";
          _this.data.status.withdrawalClass = "active"
          _this.Modalinit("ImportSuccess_02");
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

  // 5.点击确认上传订单
  uploadOrder: function (e) {
    // console.log(app.globalData.userids.postHeader)
    // 网络太差提示
    if (!this.data.isOnline) {
      if (e.currentTarget.dataset.type == "userClipboardData") {
        wx.showToast({
          title: this.data.status.orderConfirmationText,
          icon: 'loading',
          duration: 2000
        })
      }

      if (e.currentTarget.dataset.type == "ordervalInput") {
        this.data.status.uploadOrderText = "网络不太好，请重试"
        this.setData(this.data)
      }
    }
    var _this = this;
    var orderid;
    if (e.currentTarget.dataset.type == "ordervalInput") orderid = _this.data.valInput.ordervalInput;
    if (e.currentTarget.dataset.type == "userClipboardData") orderid = _this.data.userClipboardData
    // console.log(orderid)
    wx.request({
      url: "https://" + online + "/index.php/api/Account/uploadOrder",
      method: "POST",
      header: app.globalData.userids.postHeader,
      data: {
        code: app.globalData.userids.code,
        appid: "apid_wechat",
        channel: "default",
        orderid: orderid,
      },
      success: function (result) {
        // console.log(result.data);
        if (result.data.code == 200) {
          _this.data.uploadOrder = result.data.code
          _this.Modalinit();
          _this.easyModal.hide();
          wx.showToast({
            title: '导入成功',
            icon: 'success',
            duration: 2000,
            success: function () {
              _this.data.valInput.ordervalInput = ""
              _this.setData(_this.data);
            }
          })
          // 清空剪切板
          wx.setClipboardData({
            data: ' ',
            success: function (res) {
              wx.getClipboardData({
                success: function (res) {
                  // console.log(res.data) // data
                }
              })
            }
          })
        } else if (result.data.code == 241) {
          if (e.currentTarget.dataset.type == "userClipboardData") {
            wx.showToast({
              title: "订单重复导入过了",
              icon: 'loading',
              duration: 2000,
              success: function () {
                _this.easyModal.hide();
              }
            })
            return;
          }

          if (e.currentTarget.dataset.type == "ordervalInput") {
            _this.data.status.uploadOrderText = "订单已经导入过了"
            _this.setData(_this.data)
            return;
          }
        } else {
          wx.showToast({
            title: '服务器异常，请退出小程序重试！',
            icon: 'none',
            duration: 2000,
            success: function () {}
          })
        }
        _this.setData(_this.data);
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

  // 3.立即提现
  showWithdrawalBox: function () {
    var _this = this;
    // 如果用户没有加机器人为好友
    // this.data.userInfo.weixinerror = 1
    if (this.data.userInfo.bindweixinis == 1) {
      this.Modalinit("bindweixinis");
      return;
    }
    // 微信机器人挂了（用户已经登录）
    if (this.data.userInfo.weixinerror == 1) {
      _this.Modalinit("robotDown");
      return;
    }
    // wx.hideLoading()
    this.Modalinit("withdrawal");
  },

  // 初始化弹窗
  Modalinit: function (modal) {
    var _this = this;
    this.data.closeIng = "pop_up_close_normal.png"
    for (var key in _this.data.Modal) {
      _this.data.Modal[key] = false;
    };
    if (modal) this.data.Modal[modal] = true
    this.setData(this.data);
    this.easyModal.show();
  },

  // 进入返利红包
  _entryRebatePage: function () {
    this.easyModal.hide()
    wx.navigateTo({
      url: '../../rebatePage/pages/rebatePacket/rebatePacket?user_grandtotal=' + this.data.userInfo.user_grandtotal,
    })
  },

  // 进入活动红包
  _entryActivityPage: function () {
    wx.navigateTo({
      url: '../../rebatePage/pages/activityPacket/activityPacket',
    })
  },

  // 进入提现历史
  _entryWithdrawalHistory: function () {
    wx.navigateTo({
      url: '../../rebatePage/pages/withdrawalHistory/withdrawalHistory',
    })
  },

  // 进入教程页
  _entryTutorial: function () {
    wx.navigateTo({
      url: '../../rebatePage/pages/tutorial/tutorial?robot=' + this.data.userInfo.weixinnamber,
    })
  },

  // 校验订单号
  isOrderAvailable: function (order) {
    var myreg = /^\d{16,18}$/;
    if (!myreg.test(order)) {
      // console.log("不是18位订单号")
      return false;
    } else {
      // console.log("是18位订单号")
      return true;
    }
  },

  // 识别图片二维码
  previewImage: function () {
    wx.previewImage({
      urls: ["https://" + online + "/public/static/qrcodeimg/wxid_bb7ha5jkhfm822.png"] // 需要预览的图片http链接列表   
    })
  },

  // 复制微信号
  copyCode: function (e) {
    // console.log(e.currentTarget.dataset.code);
    wx.setClipboardData({
      data: e.currentTarget.dataset.code,
      success: function () {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000
        })
        wx.vibrateShort()
      }
    })
  },

  // 点击添加机器人
  addRobot: function () {
    this.Modalinit("addRobot");
  },

  // 点击提现须知
  clickNotice: function () {
    this.Modalinit("noticePopup")
  },

  // 机器人故障显示滚条
  showTip: function () {
    var _this = this;
    var length = _this.data.xScrollText.length * _this.data.size; //文字长度
    var windowWidth = wx.getSystemInfoSync().windowWidth; // 屏幕宽度
    _this.setData({
      length: length,
      windowWidth: windowWidth,
      marquee2Margin: length < windowWidth ? windowWidth - length : _this.data.marquee2Margin //当文字长度小于屏幕长度时，需要增加补白
    });
    _this.run1(); // 水平一行字滚动完了再按照原来的方向滚动
    _this.run2(); // 第一个字消失后立即从右边出现
  },

  run1: function () {
    var _this = this;
    var interval = setInterval(function () {
      if (-_this.data.marqueeDistance < _this.data.length) {
        _this.setData({
          marqueeDistance: _this.data.marqueeDistance - _this.data.marqueePace,
        });
      } else {
        clearInterval(interval);
        _this.setData({
          marqueeDistance: _this.data.windowWidth
        });
        _this.run1();
      }
    }, _this.data.interval);
  },

  /**
   * 顶端从左至右方向滚动的跑马灯效果
   * 
   * 第一个字消失后立即从右边出现
   */
  run2: function () {
    var _this = this;
    var interval = setInterval(function () {
      if (-_this.data.marqueeDistance2 < _this.data.length) {
        // 如果文字滚动到出现marquee2Margin=30px的白边，就接着显示
        _this.setData({
          marqueeDistance2: _this.data.marqueeDistance2 - _this.data.marqueePace,
          marquee2copyStatus: _this.data.length + _this.data.marqueeDistance2 <= _this.data.windowWidth + _this.data.marquee2Margin,
        });
      } else {
        if (-_this.data.marqueeDistance2 >= _this.data.marquee2Margin) { // 当第二条文字滚动到最左边时
          _this.setData({
            marqueeDistance2: _this.data.marquee2Margin // 直接重新滚动
          });
          clearInterval(interval);
          _this.run2();
        } else {
          clearInterval(interval);
          _this.setData({
            marqueeDistance2: -_this.data.windowWidth
          });
          _this.run2();
        }
      }
    }, _this.data.interval);
  },


  // 提现按钮的改变
  withdrawalButton: function (frozon_state, payLog_status, user_cashed_money) {
    var _this = this;
    // 非提现中
    if (frozon_state == 0) {
      // 用户今日没有提过现
      if (payLog_status == 0) {
        // 用户账户有钱
        if (payLog_status != 0) {
          _this.data.status.withdrawalClass = "";
          _this.data.status.showWithdrawalBox = "showWithdrawalBox";
          _this.data.status.withdrawalstatus = "立即提现";
          _this.setData(_this.data);
          // 用户账户里没钱
        } else if (payLog_status == 0) {
          _this.data.status.withdrawalClass = "active";
          _this.data.status.showWithdrawalBox = "";
          _this.data.status.withdrawalstatus = "暂不可提";
          _this.setData(_this.data);
        }
        // 用户今日提过现
      } else if (payLog_status == 1) {
        _this.data.status.withdrawalClass = "active";
        _this.data.status.showWithdrawalBox = "";
        _this.data.status.withdrawalstatus = "今日已提";
        _this.setData(_this.data);
      }
      // 用户提现中
    } else if (frozon_state == 1) {
      _this.data.status.withdrawalstatus = "提现中";
      _this.data.status.showWithdrawalBox = "";
      _this.data.status.withdrawalClass = "active"
      _this.setData(_this.data);
      // 用户还没领红包                            
    } else if (frozon_state == 2) {
      _this.data.status.withdrawalstatus = "红包还没领";
      _this.data.status.showWithdrawalBox = "";
      _this.data.status.withdrawalClass = "active"
      _this.setData(_this.data);
    }
  },

})