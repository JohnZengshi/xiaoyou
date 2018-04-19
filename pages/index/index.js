// 导入第三方包
const QQMapWX = require('../../qqmap-wx-jssdk.min.js') //cdn
const Data = require("../../data.js"); //cdn
const hex_md5 = require("../../MD5.js"); //cdn
const app = getApp();
const globalData = app.globalData;
// 实例化API核心类
const MapWX = new QQMapWX({
  key: "XXOBZ-G4E6R-PB4WE-WH4JJ-FWPE6-6OBAE",
});

Page({
  data: {
    // 所有对话的数据
    text: [],
    // 输入框的值
    valInput: "",
    // 动画参数
    animationData: {},
    // bottomOtopnMove: {},
    // 问候语的开关
    isClose: true,
    greetIng: '',
    // 首次进入参数
    firstParameter: {
      firstOption: 'hidden', //底部开关的显示状态
      firstIntroduce: true, //是否第一次给用户介绍小程序
      firstCheckWeather: true, //第一次点击查天气
      firstgetLocation: true, // 第一次定位
      firstRemindBindPhon: true, //第一次提示用户绑定手机
      // firstCheckIsBind: false, //第一次绑定
      firstTipnoBindPhon: true,
      firstTipAboutCoupon: true, // 第一次用户点击找优惠券时的文案
    },
    // 城市列表
    cityList: {
      hotCity: ["上海", "北京", "杭州", "广州", "成都", "苏州", "南京", "天津", "重庆", "厦门", "武汉", "西安"], //固定的热门城市
      checkedCity: [], //搜索过的热门城市列表
      cityModle: ["上海", "北京", "杭州", "广州", "成都", "苏州", "南京", "天津", "重庆", "厦门", "武汉", "西安"], //固定的热门城市模板
      city: [], // 最终城市列表
    },
    // 当前正在点击的按钮
    currentCheck: {
      currentCheckWeather: false,
      currentClickConstellation: false,
    },
    // 记录找好货和看好物有没有数据的状态
    checkAll: "",
    // 用户昵称
    nickName: "",
    // 节点消息
    MultipleNodes: [],
    // 记录聊天条数
    chattingRecords: 0,
    // 刚进页面获取聊天记录
    firstObtainChatRecord: true,
    // 获取历史聊天记录的条数
    GetsChatLogs: 1,
    // 正在上拉刷新
    currentRefresh: false,
    // 基础红包
    basicsPacket: {
      // alreadyReceived pastDue
      // 红包类型
      type: "",
      // 打开红包开关
      isOpen: false,
      // 关闭红包弹窗
      isClose: false,
      // 红包码
      envelope_code: "",
      // 红包金额
      cash: "",
      // 红包弹窗文案
      PacketModalText: "",
      // 红包发去时间
      ctime: "",
      // 发送服务通知的fromId
      fromId: "",
    },
    // 各种弹窗
    Modal: {
      "redPacketCPM": true,
    },
    // 我的钱包入口icon
    entryIngWallet: "home_wallet_normal.png",
  },
  // 一进入页面
  onLoad: function () {
    wx.showLoading({
      title: '加载中',
    })
    var _this = this;
    // 获取三个模块的节点信息
    this.queryMultipleNodes(".bottomPack");

    // 监听网络状态
    wx.onNetworkStatusChange(function (res) {
      _this.setData({
        isOnline: res.isConnected
      })
      // 断网处理
      if (_this.data.isOnline == false) {
        _this.networkOutage();
        return;
      }
    });

    // 获取惊喜红包关键字
    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/red_envelope/getkeywordlist?appid=apid_wechat",
      method: "GET",
      success: (result) => {
        Data.surpriseWord = result.data.data
        // console.log(result.data.data);
      },
      fail: (res) => {
        wx.showToast({
          title: '服务器异常，请退出小程序重试！',
          icon: 'none',
          duration: 2000,
        })
      }
    })

    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/Getyq/arr_strs",
      method: "GET",
      success: (res) => {
        // console.log(res.data)
        this.data.strs = res.data;
      }
    })

  },

  onShow: function () {
    var _this = this;
    this.data.entryIngWallet = "home_wallet_normal.png";
    this.setData(this.data);
    // 检测是否以获取用户信息（如果没有重新授权）
    this.getUserInfo();

    wx.login({
      success: (res) => {
        app.globalData.userids.code = res.code;
        // console.log("code:" + res.code)
        if (res.code) {
          // 1.检查用户是否登录过
          wx.request({
            url: "https://flzs.yzrom.com/index.php/api/Account/checkIsBind",
            header: {
              'content-type': 'application/json'
            },
            method: "POST",
            dataType: "json",
            data: {
              appid: "apid_wechat",
              channel: "default",
              code: app.globalData.userids.code,
            },
            success: (result) => {
              // console.log(result);
              // 记录用户的登录状态
              if (result.data.code == 200) {
                app.globalData.userInfo.checkIsBind = "exist";
              } else {
                app.globalData.userInfo.checkIsBind = "not exist";
              }
              // 首次检测用户已绑定
              // _this.data.firstParameter.firstCheckIsBind = true;
              // _this.refreshPage();
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

              // 初次进入获取聊天记录
              if (this.data.firstObtainChatRecord && app.globalData.userInfo.checkIsBind == "exist") {
                // 首次获取用户的聊天记录
                this._ObtainChatRecord();
                // console.log("获取用户的聊天记录")
                this.data.firstObtainChatRecord = false;
              }

              wx.getClipboardData({
                success: (res) => {
                  // 用户粘贴的是淘口令
                  if (res.data.indexOf("￥") != -1 && res.data.lastIndexOf("￥") != -1) {
                    var index1 = res.data.indexOf("￥");
                    var index2 = res.data.lastIndexOf("￥")
                    var key = res.data.substr(index1, index2 - index1 + 1)
                    _this.popup(0, {
                      content: [_this.data.strs[0] + "【" + key + "】，小优为您找优惠哦~"],
                      from: "ai",
                      ctime: new Date().getTime()
                    })
                    _this.checkCoupon(res.data)
                    // console.log(res.data);
                    // 清空剪切板
                    wx.setClipboardData({
                      data: ' ',
                      success: (res) => {
                        wx.getClipboardData({
                          success: (res) => {
                            // console.log(res.data) // data
                          }
                        })
                      }
                    })
                  } else if (res.data.indexOf("👉手淘👈") != -1) {
                    var goodsName = _this.getGoods(res.data);
                    var index1 = res.data.indexOf("￥");
                    var index2 = res.data.lastIndexOf("￥")
                    var key = res.data.substr(index1, index2 - index1 + 1)
                    _this.popup(0, {
                      content: [_this.data.strs[0] + "【" + key + "】，小优为您找优惠哦~"],
                      from: "ai",
                      ctime: new Date().getTime()
                    })
                    _this.checkCoupon(res.data)
                    // console.log(res.data);
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
                    // 用户粘贴的是18位订单号
                  } else if (_this.isOrderAvailable(res.data)) {
                    // 用户导入订单，没有绑定
                    if (app.globalData.userInfo.checkIsBind != "exist") {
                      if ((app.globalData.userOperation.userClipboardData - 0) != res.data) {
                        // 用户导入订单，但没有绑定手机号
                        _this.popup(0, {
                          content: ["Hi，主人，小优为您自动导入下面的订单，【订单号：" + res.data + "】。这是您第一次导入订单。为了保证您能正常领取现金红包，小优需要验证主人的手机号~"],
                          from: "ai",
                          ctime: new Date().getTime()
                        })
                        _this.popup(0, {
                          content: ["验证手机", "不要导入"],
                          catchtap: "toLogin_uploadOrder",
                          from: "btn",
                          btn: "btn",
                          swicthKey: res.data,
                          ctime: new Date().getTime()
                        })
                        app.globalData.userOperation.userClipboardData = res.data;
                        return;
                      } else {
                        _this.popup(0, {
                          content: ["抱歉，主人还没验证手机号，小优不能为您导入订单。"],
                          from: "ai",
                          ctime: new Date().getTime()
                        });
                        _this.popup(0, {
                          content: ["验证手机", "不要导入"],
                          catchtap: "toLogin_uploadOrder",
                          from: "btn",
                          btn: "btn",
                          swicthKey: res.data,
                          ctime: new Date().getTime()
                        });
                        return;
                      }
                      // 用户导入订单，跳登录页后还没有绑定手机号
                      // 用户导入订单，已经登录
                    } else if (app.globalData.userInfo.checkIsBind == "exist") {
                      if (app.globalData.userOperation.userClipboardData != res.data) {
                        // 用户刚登陆完回来
                        _this.popup(0, {
                          content: ["主人，小优您是不是想导入下面的订单，【订单号：" + res.data + "】？小优已为您自动导入，可以去钱包里查看红包、及时提现~"],
                          from: "ai",
                          ctime: new Date().getTime()
                        })
                        _this.popup(0, {
                          content: ["不要导入"],
                          catchtap: "_notOrder",
                          from: "btn",
                          btn: "btn",
                          swicthKey: res.data,
                          ctime: new Date().getTime()
                        })
                        app.globalData.userOperation.userClipboardData = res.data;
                        // 上传订单
                        wx.request({
                          url: "https://flzs.yzrom.com/index.php/api/Account/uploadOrder",
                          method: "POST",
                          header: app.globalData.userids.postHeader,
                          data: {
                            code: app.globalData.userids.code,
                            appid: "apid_wechat",
                            channel: "default",
                            orderid: res.data,
                          },
                          success: function (result) {
                            // console.log(result.data);
                            if (result.data.code == 241) {
                              _this.popup(0, {
                                content: ["主人，订单【" + res.data + "】已经导入过了，不要重复导入哦~"],
                                from: "ai",
                                ctime: new Date().getTime()
                              });
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
                              return;
                            } else if (result.data.code == 200) {
                              // 用户刚登陆完回来 

                              _this.popup(0, {
                                content: ["主人，小优已为您自动导入订单【" + res.data + "】，可以去钱包里查看并提现~"],
                                from: "ai",
                                ctime: new Date().getTime()
                              })
                              _this.popup(0, {
                                content: ["不要导入"],
                                catchtap: "_notOrder",
                                from: "btn",
                                btn: "btn",
                                swicthKey: keyword,
                                ctime: new Date().getTime()
                              })
                              return;
                            } else {
                              wx.showToast({
                                title: '服务器异常，请退出小程序重试！',
                                icon: 'none',
                                duration: 2000,
                                success: function () {}
                              })
                            }
                          },
                          fail: function () {
                            wx.showToast({
                              title: '服务器异常，请退出小程序重试！',
                              icon: 'none',
                              duration: 2000,
                              success: function () {}
                            })
                          }
                        });
                      }
                    }
                    // 粘贴板无先关内容，输出招呼语
                  } else if (_this.data.isClose) {
                    _this.gettingWord();
                    _this.data.isClose = false;
                    // _this.data.firstParameter.firstOption = "visible";
                    // _this.refreshPage();
                  } else {
                    // 用户第一次登陆成功进入钱包再返回首页
                  }
                }
              });

            },
            fail: function () {
              wx.showToast({
                title: '服务器异常，请退出小程序重试！',
                icon: 'none',
                duration: 2000,
                success: function () {}
              })
            }
          })
        }
      }
    });
    // 清除打招呼机制（防止离开时间太短也打招呼）
    clearTimeout(this.data.greetIng);
  },

  // 授权获取用户信息
  getUserInfo: function () {
    var _this = this;
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo;
        app.globalData.userInfo.nickName = userInfo.nickName;
        app.globalData.userInfo.avatarUrl = userInfo.avatarUrl;
        app.globalData.userInfo.gender = userInfo.gender;
        app.globalData.userInfo.province = userInfo.province;
        app.globalData.userInfo.city = userInfo.city;
        app.globalData.userInfo.country = userInfo.country;
        _this.data.nickName = userInfo.nickName + "，";
        _this.refreshPage();
      },
      fail: function () {
        wx.showModal({
          title: '警告',
          content: '您点击了拒绝授权,将无法正常显示个人信息,点击确定重新获取授权。',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: (res) => {
                  // console.log(res);
                  if (res.authSetting["scope.userInfo"]) { ////如果用户重新同意了授权登录
                    wx.getUserInfo({
                      success: function (res) {
                        var userInfo = res.userInfo;
                        app.globalData.userInfo.nickName = userInfo.nickName;
                        app.globalData.userInfo.avatarUrl = userInfo.avatarUrl;
                        app.globalData.userInfo.gender = userInfo.gender;
                        app.globalData.userInfo.province = userInfo.province;
                        app.globalData.userInfo.city = userInfo.city;
                        app.globalData.userInfo.country = userInfo.country;
                        _this.data.nickName = userInfo.nickName + "，";
                        _this.refreshPage();
                      }
                    })
                  }
                },
                fail: function (res) {

                }
              })

            }
          }
        })
      },
    })
  },

  // 授权获取地理位置
  getLocation: function () {
    var _this = this;
    wx.getLocation({
      success: function (res) {
        MapWX.reverseGeocoder({
          loction: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (res) {
            var location = res.result.address_component.city;
            if (location.indexOf("市") == location.length - 1) location = location.substr(0, location.length - 1)
            _this.data.locationCity = location
            // 保存当前地址到缓存当中
            try {
              wx.setStorageSync("location", location)
            } catch (e) {}
            _this.data.firstParameter.firstgetLocation = false;
            _this.checkWeather(location);
          },
          fail: function (res) {
            _this.data.firstParameter.firstOption = "visible";
            _this.refreshPage();
          }
        })
      },
      fail: function (res) {
        wx.showModal({
          title: '警告',
          content: '您点击了拒绝位置授权,将无法正常显示当前地址的天气,点击确定重新获取授权。',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: (res) => {
                  if (res.authSetting["scope.userLocation"]) { ////如果用户重新同意了授权登录
                    wx.getLocation({
                      success: function (res) {
                        MapWX.reverseGeocoder({
                          loction: {
                            latitude: res.latitude,
                            longitude: res.longitude
                          },
                          success: function (res) {
                            var location = res.result.address_component.city;
                            if (location.indexOf("市") == location.length - 1) location = location.substr(0, location.length - 1)
                            // console.log(location)
                            _this.data.locationCity = location
                            // 保存当前地址到缓存当中
                            try {
                              wx.setStorageSync("location", location)
                            } catch (e) {}
                            _this.data.firstParameter.firstgetLocation = false;
                            _this.checkWeather(location);
                          },
                          fail: function (res) {
                            _this.data.firstParameter.firstOption = "visible";
                            _this.refreshPage();
                          }
                        })
                      },
                    });
                  }
                },
                fail: function (res) {}
              })
              _this.data.currentCheck.currentCheckWeather = false;
            } else {
              _this.popup(0, {
                content: ["好吧如果你暂时不想说，那我下回再问你~"],
                from: "ai",
                ctime: new Date().getTime()
              });
              _this.data.firstParameter.firstOption = "visible";
              _this.data.currentCheck.currentCheckWeather = false;
            }
          }
        })
      }
    });
  },

  onHide: function () {
    var _this = this;
    var greetIngTimeout;
    // 设定15分钟之后用户再次进入就提示欢迎语
    greetIngTimeout = setTimeout(function () {
      // console.log("页面隐藏了")
      _this.data.isClose = true;
    }, 60000)
    this.data.greetIng = greetIngTimeout;

    // 设定2个小时之后用户才可以定位
    setTimeout(function () {
      _this.data.firstParameter.firstgetLocation = true;
    }, 7200000)

    // 没领红包的情况下发送fromId
    if (this.data.basicsPacket.formId) this.sendFormId();
    // console.log(this.data.chattingRecords)
    if (this.data.chattingRecords == 0) return;
    // console.log("上传用户聊天记录")
    this._uploadChatRecord(-this.data.chattingRecords)
    // this.data.chattingRecords = 0

  },

  onUnload: function () {},

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
  _confirmEventFirst: function () {
    // console.log("01 点击确定了!");
    this.easyModal.hide();
  },
  _confirmEventSecond: function () {
    // console.log("02 点击确定了!");
    this.easyModalSecond.hide()
  },
  _cancelEvent: function () {
    // console.log("点击取消!");
  },
  // 输入框的值保存
  valueInput: function (e) {
    this.setData({
      valInput: e.detail.value
    });
  },

  // 点击发送按钮触发事件
  bindButtonTap: function (e, explain) {
    var _this = this;
    var keyword = this.data.valInput;
    this.data.valInput = "";
    // 记录找好货和看好物有没有数据的状态
    this.data.checkAll = "";
    // console.log(this.data.isOnline);

    // 若用户输入的内容为空
    if (keyword == "") return;

    // 如果没有网络
    if (this.data.isOnline == false) {
      this.popup(0, {
        content: [keyword],
        from: "user",
        ctime: new Date().getTime()
      });
      this.popup(1000, {
        content: ["哎呀，主人，网断了……"],
        from: "ai",
        ctime: new Date().getTime()
      });
      return;
    }

    // 用户输入惊喜红包关键字
    // console.log(explain != "surpriseWordPast")
    if (explain != "surpriseWordPast") {
      for (var i = 0; i < Data.surpriseWord.length; i++) {
        if (Data.surpriseWord[i].name == keyword) {
          var ctime = new Date().getTime()
          // 获取红包
          _this.getbasicsPacket(2, Data.surpriseWord[i].keyword_code, ctime, keyword);
          return;
        }
      }
    }

    // 若用户输入找优惠券
    if (keyword == "找优惠券" || keyword == "优惠券") return this._findCoupon("_findCouponWrite")

    // 若用户输入找好物
    if (keyword == "找好物" || keyword == "好物") return this._findGoods();

    // 若用户输入看好货
    if (keyword == "看好货" || keyword == "好货") return this._lookGoods();

    // 若用户输入查星座或者星座
    if (keyword == "星座" || keyword == "查星座" || keyword == "查运势" || keyword == "查星座运势" || keyword == "运势") return console.log("123"), this._checkConstellation();

    // 若用户输入天气或查天气
    if (keyword == "天气" || keyword == "查天气") {
      this.popup(0, {
        content: [keyword],
        from: "user",
        ctime: new Date().getTime()
      });
      setTimeout(function () {
        if (_this.data.firstParameter.firstgetLocation) {
          // 一同意页面自动获取地理位置
          wx.getLocation({
            success: function (res) {
              // console.log(res);
              MapWX.reverseGeocoder({
                loction: {
                  latitude: res.latitude,
                  longitude: res.longitude
                },
                success: function (res) {
                  _this.checkWeather(res.result.address_component.city);
                  _this.data.location = res.result.address_component.city;
                  // 保存当前地址到缓存当中
                  try {
                    wx.setStorageSync("location", res.result.address_component.city)
                  } catch (e) {}
                  _this.data.firstParameter.firstgetLocation = false;

                }
              })
            },
            fail: function (res) {
              _this.popup(0, {
                content: ["好吧如果你暂时不想说，那我下回再问你~"],
                from: "ai",
                ctime: new Date().getTime()
              });
            }
          });
        } else {
          try {
            var value = wx.getStorageSync("location")
            if (value) {
              _this.checkWeather(value);
            } else {}
          } catch (e) {}
        }
      }, 500)
      return;
    }

    // 用户输入的内容判断。。。。。。

    // 如果是天气
    if (Data.cityStr.indexOf(keyword.indexOf("市") == keyword.length - 1 ? keyword.substr(0, keyword.length - 1) : keyword) != -1 && keyword.length >= 2) {
      var _this = this;
      this.popup(0, {
        content: [keyword],
        from: "user",
        ctime: new Date().getTime()
      });
      // const weatherModal = new modal("天气模块",keyword);
      // weatherModal.checkWeather(keyword);
      this.checkWeather(keyword);
      return;
    }

    // 如果是星座
    for (var i = 0; i < Data.map.length; i++) {
      for (var j = 0; j < Data.map[i].data.length; j++) {
        if (keyword == Data.map[i].data[j]) {
          _this.popup(0, {
            content: [keyword],
            from: "user",
            ctime: new Date().getTime()
          });
          _this.checkConstellation(Data.map[i].name);
          return;
        }
      }
    }
    // 如果是淘口令
    if (keyword.indexOf("￥") != -1 && keyword.lastIndexOf("￥") != -1) {
      this.popup(0, {
        content: [keyword],
        from: "user",
        ctime: new Date().getTime()
      });
      this.checkCoupon(keyword);
      return;
    }
    // 如果是淘口令
    if (keyword.indexOf("👉手淘👈") != -1) {
      this.popup(0, {
        content: [keyword],
        from: "user",
        ctime: new Date().getTime()
      });
      this.checkCoupon(keyword);
      return;
    }

    // 用户粘贴的是18位订单号
    if (_this.isOrderAvailable(keyword)) {
      this.popup(0, {
        content: [keyword],
        from: "user",
        ctime: new Date().getTime()
      });
      // console.log(app.globalData.userInfo.checkIsBind);
      // 用户导入订单，没有绑定
      if (app.globalData.userInfo.checkIsBind != "exist") {

        if (app.globalData.userOperation.userClipboardData != keyword) {
          // 用户导入订单，但没有绑定手机号
          _this.popup(0, {
            content: ["Hi，主人，小优为您自动导入下面的订单，【订单号：" + keyword + "】。这是您第一次导入订单。为了保证您能正常领取现金红包，小优需要验证主人的手机号~"],
            from: "ai",
            ctime: new Date().getTime()
          })
          _this.popup(0, {
            content: ["验证手机", "不要导入"],
            catchtap: "toLogin_uploadOrder",
            from: "btn",
            btn: "btn",
            swicthKey: keyword,
            ctime: new Date().getTime()
          })
          app.globalData.userOperation.userClipboardData = keyword;
        } else {
          _this.popup(0, {
            content: ["抱歉，主人还没验证手机号，小优不能为您导入订单。"],
            from: "ai",
            ctime: new Date().getTime()
          });
          _this.popup(0, {
            content: ["验证手机", "不要导入"],
            catchtap: "toLogin_uploadOrder",
            from: "btn",
            btn: "btn",
            swicthKey: keyword,
            ctime: new Date().getTime()
          })
        }

        // // 用户导入订单，跳登录页后还没有绑定手机号

        // 用户导入订单，已经登录
      } else if (app.globalData.userInfo.checkIsBind == "exist") {
        // 上传订单
        wx.request({
          url: "https://flzs.yzrom.com/index.php/api/Account/uploadOrder",
          method: "POST",
          header: app.globalData.userids.postHeader,
          data: {
            code: app.globalData.userids.code,
            appid: "apid_wechat",
            channel: "default",
            orderid: keyword,
          },
          success: function (result) {
            // console.log(result.data);
            if (result.data.code == 241) {
              _this.popup(0, {
                content: ["主人，订单【" + keyword + "】已经导入过了，不要重复导入哦~"],
                from: "ai",
                ctime: new Date().getTime()
              });
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
              return;
            } else if (result.data.code == 200) {
              // 用户刚登陆完回来 

              _this.popup(0, {
                content: ["主人，小优已为您自动导入订单【" + keyword + "】，可以去钱包里查看并提现~"],
                from: "ai",
                ctime: new Date().getTime()
              })
              _this.popup(0, {
                content: ["不要导入"],
                catchtap: "_notOrder",
                from: "btn",
                btn: "btn",
                swicthKey: keyword,
                ctime: new Date().getTime()
              })
              app.globalData.userOperation.userClipboardData = keyword;
              return;
            } else {
              wx.showToast({
                title: '服务器异常，请退出小程序重试！',
                icon: 'none',
                duration: 2000,
                success: function () {}
              })
            }
          },
          fail: function () {
            wx.showToast({
              title: '服务器异常，请退出小程序重试！',
              icon: 'none',
              duration: 2000,
              success: function () {}
            })
          }
        });

      }
      return;
    }

    // 如果是查询好物或好货
    if (keyword.indexOf("看") == 0 || keyword.indexOf("找") == 0) {
      var _this = this;
      this.popup(0, {
        content: [keyword],
        from: "user",
        ctime: new Date().getTime()
      });
      this.checkAllgoods(keyword.substring(1));
      return
    } else {
      this.popup(0, {
        content: [keyword],
        from: "user",
        ctime: new Date().getTime()
      });
      this.checkAllgoods(keyword);
      return
    }

  },

  // 查询天气
  checkWeather: function (city) {
    var _this = this;
    if (city.indexOf("市") == city.length - 1) city = city.substr(0, city.length - 1);
    // 固定热门城市的模板
    var cityStr = _this.data.cityList.cityModle.join(",");
    wx.request({
      url: "https://mg.yzrom.com/index.php/wxapp/Juheweather/getWeather",
      data: {
        city: city,
      },
      method: "GET",
      dataType: "json",
      responseType: "text",
      success: function (res) {
        _this.data.currentCheck.currentCheckWeather = false;
        // console.log(res.data)
        // console.log(_this.data.checkedCity);
        if (res.data.data == null) {
          _this.popup(0, {
            content: ["Sorry，亲爱的，你的城市如此特别，小券没找到那里的天气……要不要试试别的地方？"],
            from: "ai",
            ctime: new Date().getTime()
          });
        } else if (res.data.data.today.weather == "") {
          _this.popup(0, {
            content: ["Sorry，亲爱的，你的城市如此特别，小券没找到那里的天气……要不要试试别的地方？"],
            from: "ai",
            ctime: new Date().getTime()
          });
        } else {
          {
            // 搜索过的城市历史去重
            // 如果检索到所搜索的城市存在固定的热门城市和当前的热门城市当中当中
            var isExist = (_this.cityIndexOf(_this.data.cityList.cityModle, city) != -1 && _this.cityIndexOf(_this.data.cityList.hotCity, city) != -1);
            if (isExist) _this.data.cityList.hotCity.splice(_this.cityIndexOf(_this.data.cityList.hotCity, city), 1)

            // 搜索过的城市列表当中有重复的话，把之前的去掉
            isExist = (_this.data.cityList.checkedCity.join(",").indexOf(city) != -1)
            if (isExist) _this.data.cityList.checkedCity.splice(_this.cityIndexOf(_this.data.cityList.checkedCity, city), 1);

            // 如果搜索过的城市列表的第三项存在固定热门城市模板当中（即将被截掉的那个城市）
            isExist = (cityStr.indexOf(_this.data.cityList.checkedCity[2]) != -1 && _this.cityIndexOf(_this.data.cityList.hotCity, _this.data.cityList.checkedCity[2]) == -1)
            if (isExist) _this.data.cityList.hotCity.unshift(_this.data.cityList.checkedCity[2]);
            // 把所搜索的城市加到搜索过的城市列表
            _this.data.cityList.checkedCity.unshift(city);

            // console.log(_this.data.cityList.hotCity);
            // console.log(_this.data.cityList.checkedCity.slice(0, 3));
            _this.data.cityList.city = _this.data.cityList.checkedCity.slice(0, 3).concat(_this.data.cityList.hotCity);

            // 定义未来两天的天气
            var futureWeather = [];
            var i = 0;
            for (var key in res.data.data.future) {
              // 把星期改成周
              res.data.data.future[key].week = res.data.data.future[key].week.replace(/星期/g, "周");
              // 把天气的转字去掉
              if (res.data.data.future[key].weather.indexOf("转") != -1) {
                var keyIndex = res.data.data.future[key].weather.indexOf("转");
                var newKey = res.data.data.future[key].weather.substr(0, keyIndex)
                res.data.data.future[key].trueWeather = newKey;
              }
              // 把摄氏度的C 去掉
              // console.log(res.data.data.futureWeather.temperature)
              res.data.data.future[key].temperature = res.data.data.future[key].temperature.replace(/℃/g, "°");

              if (i < 3 && i > 0) futureWeather.push(res.data.data.future[key]);
              i++;
            }
            if (res.data.data.today.weather.indexOf("转") != -1) {
              var keyIndex = res.data.data.today.weather.indexOf("转");
              var newKey = res.data.data.today.weather.substr(0, keyIndex)
              res.data.data.today.trueWeather = newKey;
            }
            res.data.data.today.temperature = res.data.data.today.temperature.replace(/℃/g, "°");
            // 匹配天气词库
            for (var Datakey in Data.weather) {
              for (var i = 0; i < Data.weather[Datakey].length; i++) {
                for (var key in res.data.data.future) {
                  if (res.data.data.future[key].weather == Data.weather[Datakey][i] || res.data.data.future[key].trueWeather == Data.weather[Datakey][i]) {
                    res.data.data.future[key].picName = Datakey
                  }
                }
              }
            }
            for (var Datakey in Data.weather) {
              for (var i = 0; i < Data.weather[Datakey].length; i++) {
                if (res.data.data.today.weather == Data.weather[Datakey][i] || res.data.data.today.trueWeather == Data.weather[Datakey][i]) {
                  res.data.data.today.picName = Datakey
                }
              }

            }
            // 判断是天气卡片的标识
            res.data.data.from = "weather"
            res.data.data.futureWeather = futureWeather;
            res.data.data.ctime = new Date().getTime()
            _this.popup(0, res.data.data)

            _this.popup(0, {
              from: "btn",
              content: ["换个城市"],
              catchtap: "_checkWeather",
              btn: "swicth",
              ctime: new Date().getTime()
            })
            // 判断是否是第一次查天气
            if (!_this.data.firstParameter.firstCheckWeather) {}
            _this.data.firstParameter.firstCheckWeather = false;
            //第一次介绍小程序
            // if (_this.data.firstParameter.firstIntroduce) {
            //   setTimeout(_this.introduce, 1000);
            //   _this.data.firstParameter.firstIntroduce = false;
            // };
          };
        }
      },
      fail: function () {
        wx.showToast({
          title: '服务器异常，请退出小程序重试！',
          icon: 'none',
          duration: 2000,
          success: function () {}
        })
      }
    });
  },

  // 查询星座
  checkConstellation: function (content) {
    var _this = this;
    wx.request({
      url: "https://mg.yzrom.com/index.php/wxapp/Pinyin/index",
      data: {
        content: content.indexOf('座') != -1 ? content.substring(0, content.length - 1) : content
      },
      method: "GET",
      dataType: "json",
      responseType: "text",
      success: function (res) {
        wx.request({
          url: "https://mg.yzrom.com/index.php/wxapp/Constellation/getinfo",
          data: {
            xz: res.data.data.result,
          },
          method: "GET",
          dataType: "json",
          responseType: "text",
          success: function (res) {
            if (res.statusCode == 500) {} else {
              // 加上自己
              content = content.indexOf("座") != -1 ? content : (content + "座");
              res.data.data.time = _this.dateFilter(res.data.data.time)
              res.data.data.currentXZ = content;

              // 加上图片名
              for (var i = 0; i < Data.map.length; i++) {
                if (Data.map[i].name.indexOf(content) != -1) {
                  res.data.data.picName = Data.map[i].picName;
                }
              }

              // 判断是星座卡片的标识
              res.data.data.from = "constellation"
              // console.log(_this.data.text);
              res.data.data.ctime = new Date().getTime()
              _this.popup(0, res.data.data);
              _this.popup(0, {
                from: "btn",
                btn: "swicth",
                catchtap: "switchconstellation",
                content: ['换个星座'],
                ctime: new Date().getTime()
              });

            };
          },
          fail: function () {
            wx.showToast({
              title: '服务器异常，请退出小程序重试！',
              icon: 'none',
              duration: 2000,
              success: function () {}
            })
          }
        });

      },
      fail: function () {
        wx.showToast({
          title: '服务器异常，请退出小程序重试！',
          icon: 'none',
          duration: 2000,
          success: function () {}
        })
      }
    });

  },

  // 新接口（找好物）
  checkAllgoods: function (keyword) {
    // console.log(keyword)
    wx.request({
      url: 'https://flzs.yzrom.com/index.php/api/Getyq/search',
      method: "GET",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        keyword: keyword,
        temp: 1,
      },
      success: (res) => {
        // console.log(res.data.code);
        // 请求错误或没有数据
        if (res.data.code == 201) {
          this.checkgoods(keyword, 1);
          return;
        } else if (res.data.code == 200) {
          // 关键词为空
          if (keyword == "") {
            // 关键字为空时的术语
            this.popup(2000, {
              content: [this.data.strs[2]],
              from: "ai",
              ctime: new Date().getTime()
            });
          } else {
            // 关键字不为空时的术语
            this.popup(500, {
              content: ["好的，主人，正在为您找【" + keyword + "】。"],
              from: "ai",
              ctime: new Date().getTime()
            });
            this.popup(2000, {
              content: ["主人，想要找什么样的【" + keyword + "】？可以试试发具体的商品名，小优帮您推荐更多内容。"],
              from: "ai",
              ctime: new Date().getTime()
            });
          }

          //  循环加上用于区分的标志
          for (var key in res.data.data) {
            for (var i = 0; i < res.data.data[key].length; i++) {
              res.data.data[key][i].from = (key == "coupons" ? 'find' : 'look') + "goods";
            }
          }

          if (res.data.data.coupons.length != 0) {
            this.popup(1000, {
              from: "goods",
              goods: res.data.data.coupons.slice(0, 3),
              ctime: new Date().getTime()
            });
            this.popup(1000, {
              from: "btn",
              content: ["更多优惠券"],
              catchtap: "swicthCoupons",
              btn: "",
              swicthKey: keyword,
              ctime: new Date().getTime()
            });
          }

          if (res.data.data.strategys.length != 0) {
            this.popup(1500, {
              from: "goods",
              goods: res.data.data.strategys.slice(0, 1)
            });
            this.popup(1500, {
              from: "btn",
              content: ["更多攻略"],
              catchtap: "swicthStrategys",
              btn: "",
              swicthKey: keyword,
              ctime: new Date().getTime()
            });
          }

          // 保存数据到缓存当中
          try {
            wx.setStorageSync(keyword + "coupons", res.data.data.coupons)
            wx.setStorageSync(keyword + "strategys", res.data.data.strategys)
          } catch (e) {

          }

          if (this.data.checkAll == "noFindnolook") {
            this.data.checkAll = "";
          }
        }
      },
      fail: (res) => {
        wx.showToast({
          title: '服务器异常，请退出小程序重试！',
          icon: 'none',
          duration: 2000,
          success: function () {}
        })
      }
    })
  },

  // 查询找好物或看好货
  checkgoods: function (key, category) {
    var _this = this;
    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/Getyq/getGoods",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        key: key,
        category: category,
        temp: 1
      },
      method: "GET",
      dataType: "json",
      responseType: "text",
      success: (res) => {
        // console.log(res)
        if (res.data.code == 201) {

          // 优惠券
          if (category == 1) {
            // 记录有没有数据的状态
            _this.data.checkAll += "noFind";
            _this.checkgoods(key, 2);
          }
          // 攻略
          else if (category == 2) {
            // 记录有没有数据的状态
            _this.data.checkAll += "nolook";
          }


        } else if (res.data.code == 200) {
          // 优惠券
          if (category == 1) {
            // 记录有数据的状态
            _this.data.checkAll += "find";

            for (var value of res.data.data) {
              value.from = "findgoods"
            }
            _this.popup(0, {
              content: ["好的，主人，正在为你找【" + key + "】。"],
              from: "ai",
              ctime: new Date().getTime()
            });
            _this.popup(500, {
              from: "goods",
              goods: res.data.data.slice(0, 3),
              ctime: new Date().getTime()
            });
            _this.popup(500, {
              from: "btn",
              content: ["更多优惠券"],
              catchtap: "swicthfindGoods",
              btn: "",
              swicthKey: key,
              ctime: new Date().getTime()
            });
            // 看攻略
            _this.checkgoods(key, 2);
          }
          // 攻略
          else if (category == 2) {
            // 记录有数据的状态
            _this.data.checkAll += "look"
            for (var i = 0; i < res.data.data.length; i++) {
              res.data.data[i].from = "lookgoods";
            };
            _this.popup(1000, {
              from: "goods",
              goods: res.data.data.slice(0, 1),
              ctime: new Date().getTime()
            });
            _this.popup(1000, {
              from: "btn",
              content: ["更多攻略"],
              catchtap: "swicthlookGoods",
              btn: "",
              swicthKey: key,
              ctime: new Date().getTime()
            });
          }

          try {
            wx.setStorageSync((category == 1 ? "find" : "look") + key, res.data.data)
          } catch (e) {}
        }

        if (category == 2) {
          if (_this.data.checkAll == "findnolook" || _this.data.checkAll == "noFindlook") {
            _this.popup(1500, {
              content: ["主人，想要找什么样的【" + key + "】？可以试试发具体的商品名，小优帮你推荐更多内容。"],
              from: "ai",
              ctime: new Date().getTime()
            });
          }
          // 如果两个都有数据
          else if (_this.data.checkAll == "findlook") {
            _this.popup(1500, {
              content: ["主人，想要找什么样的【" + key + "】？可以试试发具体的商品名，小优帮你推荐更多内容。"],
              from: "ai",
              ctime: new Date().getTime()
            });
          }
          // 如果两个都没数据
          else if (_this.data.checkAll == "noFindnolook") {
            _this.robotChart(key);
            _this.data.checkAll = "";
          }
        }

      },
      fail: (res) => {
        wx.showToast({
          title: '服务器异常，请退出小程序重试！',
          icon: 'none',
          duration: 2000,
          success: function () {}
        })
      }
    });
  },

  // 查找优惠券
  checkCoupon: function (key) {
    var index1 = key.indexOf("￥");
    var index2 = key.lastIndexOf("￥")
    key = key.substr(index1, index2 - index1 + 1)
    var _this = this;
    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/Getyq/command",
      method: "GET",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        key: key,
        temp: 1
      },
      success: function (res) {
        // console.log(res);
        _this.renderCoupon(res);
      },
      fail: function () {
        wx.showToast({
          title: '服务器异常，请退出小程序重试！',
          icon: 'none',
          duration: 2000,
          success: function () {}
        })
      }
    })
  },

  // 渲染优惠券
  renderCoupon: function (res, _findCoupon) {
    var _this = this;

    // 优惠券没数据
    if (!res.data.data || !res.data.data.data) {
      _this.popup(0, {
        content: [_this.data.strs[3]],
        from: "ai",
        ctime: new Date().getTime()
      });
      return;
    }
    // console.log(res.data.data)
    res.data.data.data.discountprice = this.toDecimal2(res.data.data.data.discountprice);
    var currentPirce = res.data.data.data.discountprice - res.data.data.data.ulanprice;
    res.data.data.data.ulanprice != "" ? res.data.data.data.ulanprice = parseInt(res.data.data.data.ulanprice) : res.data.data.data.ulanprice;
    var ulanprice = res.data.data.data.ulanprice;
    var commission = res.data.data.data.commission;
    // res.data.data.data.commission = 0; 
    // res.data.data.data.ulanprice = "";
    if (res.data.data.data.ulanprice != '' && res.data.data.data.commission > 0) res.data.data.couponStatus = "botn_money_coupon"
    if (res.data.data.data.ulanprice != '' && res.data.data.data.commission == 0) res.data.data.couponStatus = "coupon_no_money"
    if (res.data.data.data.ulanprice == "" && res.data.data.data.commission > 0) res.data.data.couponStatus = "money_no_coupon"
    var couponStatus = res.data.data.couponStatus;
    res.data.data.QHJ = _this.returnFloat(parseFloat(res.data.data.data.discountprice) - parseFloat(res.data.data.data.ulanprice));
    res.data.data.from = "coupon";
    // console.log(res.data.data.data.discountprice - res.data.data.data.ulanprice)
    if (res.data.data.data.ulanprice == "") {
      _this.popup(0, {
        content: ["优惠来啦！"],
        from: "ai",
        ctime: new Date().getTime()
      });
    } else if (!_findCoupon) {
      _this.popup(0, {
        content: ["优惠来啦！"],
        from: "ai",
        ctime: new Date().getTime()
      });
    }
    res.data.data.ctime = new Date().getTime()
    _this.popup(500, res.data.data);
    // 如果是领红包的时候随机返回的优惠券(不用请求历史价格数据)
    if (_findCoupon == "_RedEnvelope") {
      _this.popup(500, {
        from: "btn",
        content: ["更多优惠券"],
        catchtap: "_findCoupon",
        btn: "",
        ctime: new Date().getTime()
      });
      return;
    }
    wx.request({
      url: "https://mg.yzrom.com/index.php/wxapp/goods/price",
      data: {
        key: res.data.data.data.nid,
      },
      method: "GET",
      dataType: "json",
      responseType: "text",
      success: function (res) {
        // Math.min.apply(null, pirce)
        var pirce = [];
        for (var key in res.data.data) {
          pirce.push(res.data.data[key]);
        }
        var maxPirce = Math.max.apply(null, pirce);
        var minPirce = Math.min.apply(null, pirce);

        setTimeout(function () {
          // 有券有返利
          if (couponStatus == "botn_money_coupon") {
            if (currentPirce - ulanprice - commission >= maxPirce) {
              _this.popup(0, {
                content: ["这个东东优惠力度一般，涨价涨的太快了~"],
                from: "ai",
                ctime: new Date().getTime()
              });
            } else if (currentPirce - ulanprice - commission < maxPirce && currentPirce - ulanprice - commission > minPirce) {
              _this.popup(0, {
                content: ["这个东东挺值，有券、有返利红包可以考虑入手！"],
                from: "ai",
                ctime: new Date().getTime()
              });
            } else if (currentPirce - ulanprice - commission <= minPirce) {
              _this.popup(0, {
                content: ["这个东东超值，用券后再领返利红包，比历史最低价还省！"],
                from: "ai",
                ctime: new Date().getTime()
              });
            }
          }

          // 有券无返利
          if (couponStatus == "coupon_no_money") {
            if (currentPirce - ulanprice >= maxPirce) {
              _this.popup(0, {
                content: ["这个东东优惠力度一般，涨价涨的太快了~"],
                from: "ai",
                ctime: new Date().getTime()
              });
            } else if (currentPirce - ulanprice < maxPirce && currentPirce - ulanprice > minPirce) {
              _this.popup(0, {
                content: ["这个东东挺值，有优惠券可以考虑入手！"],
                from: "ai",
                ctime: new Date().getTime()
              });
            } else if (currentPirce - ulanprice <= minPirce) {
              _this.popup(0, {
                content: ["这个东东超值，领券后下单，比历史最低价还省！"],
                from: "ai",
                ctime: new Date().getTime()
              });
            }
          }

          // 无券有返利
          if (couponStatus == "money_no_coupon") {
            if (currentPirce - commission >= maxPirce) {
              _this.popup(0, {
                content: ["这个东东优惠力度一般，涨价涨的太快了~"],
                from: "ai",
                ctime: new Date().getTime()
              });
            } else if (currentPirce - commission < maxPirce && currentPirce - commission > minPirce) {
              _this.popup(0, {
                content: ["这个东东挺值，有返利红包可以考虑入手！"],
                from: "ai",
                ctime: new Date().getTime()
              });
            } else if (currentPirce - commission <= minPirce) {
              _this.popup(0, {
                content: ["这个东东超值，下单后领返利红包，比历史最低还便宜！"],
                from: "ai",
                ctime: new Date().getTime()
              });
            }
          }
        }, 500)
      },
      fail: function () {
        wx.showToast({
          title: '服务器异常，请退出小程序重试！',
          icon: 'none',
          duration: 2000,
          success: function () {}
        })
      }
    })
    // console.log(_this.data);
  },

  // 获取优惠券的商品名
  getGoods: function (goods) {
    var index1 = goods.indexOf("【");
    var index2 = goods.lastIndexOf("】")
    var goodsName;
    goodsName = goods.substr(index1, index2 + 1)
    return goodsName;
  },

  // 对话的滚动
  textScroll: function () {
    this.setData({
      toView: "to" + this.data.text.length,
    });
    this.setData(this.data);
  },

  // 问候语
  gettingWord: function () {
    var _this = this;
    wx.request({
      url: 'https://www.rootfans.com/api/welmsg?sex=',
      success: function (res) {
        // console.log(res.data.data);
        _this.popup(2000, {
          content: [res.data.data],
          from: 'ai',
          ctime: new Date().getTime()
        });
        _this.popup(2500, {
          content: ["有什么需要的，小优一直都在。"],
          from: 'ai',
          ctime: new Date().getTime()
        });
      },
      fail: function () {
        wx.showToast({
          title: '服务器异常，请退出小程序重试！',
          icon: 'none',
          duration: 2000,
          success: function () {}
        })
      }
    })
  },

  // 功能的介绍
  introduce: function () {
    var _this = this;
    // 自动滚到底部 
    this.popup(0, {
      content: ["主人，您已经知道天气了。点击下面的按钮，解锁更多功能吧！"],
      from: "ai",
      ctime: new Date().getTime()
    });
    // 让功能选项显示出来
    this.data.firstParameter.firstOption = "visible";
    setTimeout(function () {
      _this.queryMultipleNodes(".option");
    }, 1000)
  },

  // 商品卡片切换商品——1
  swicthfindGoods: function (e) {
    // 断网处理
    if (this.data.isOnline == false) {
      this.networkOutage();
      return;
    }
    // console.log(e.currentTarget.dataset.swicthkey)
    var _this = this;
    var switchKey = e.currentTarget.dataset.swicthkey;
    try {
      var value = wx.getStorageSync("find" + switchKey)
      if (value) {
        // 对数组进行快速乱序
        value.push(value.shift());
        value.push(value.shift());
        value.push(value.shift());
        _this.popup(0, {
          from: "goods",
          goods: value.slice(0, 3),
          ctime: new Date().getTime()
        });
        try {
          wx.setStorageSync("find" + switchKey, value)
        } catch (e) {}
        // _this.data.text[currentIndex].goods = value.slice(0, 3);
        _this.refreshPage();
      }
    } catch (e) {
      // Do something when catch error
    }
    _this.popup(0, {
      from: "btn",
      content: ["更多优惠券"],
      catchtap: "swicthfindGoods",
      btn: "",
      swicthKey: switchKey,
      ctime: new Date().getTime()
    });

  },
  swicthfindGoods0: function (e) {
    this.swicthfindGoods(e);
  },
  swicthlookGoods: function (e) {
    // 断网处理
    if (this.data.isOnline == false) {
      this.networkOutage();
      return;
    }
    // console.log(e.currentTarget.dataset.swicthkey)
    var _this = this;
    var switchKey = e.currentTarget.dataset.swicthkey;
    try {
      var value = wx.getStorageSync("look" + switchKey)
      if (value) {
        // 对数组进行快速乱序
        value.push(value.shift());
        _this.popup(0, {
          from: "goods",
          goods: value.slice(0, 1),
          ctime: new Date().getTime()
        });
        try {
          wx.setStorageSync("look" + switchKey, value)
        } catch (e) {}
        // _this.data.text[currentIndex].goods = value.slice(0, 3);
        _this.refreshPage();
      }
    } catch (e) {
      // Do something when catch error
    }
    _this.popup(0, {
      from: "btn",
      content: ["更多攻略"],
      catchtap: "swicthlookGoods",
      btn: "",
      swicthKey: switchKey,
      ctime: new Date().getTime()
    });
  },
  swicthlookGoods0: function (e) {
    this.swicthlookGoods(e);
  },
  swicthGoods: function (e) {
    // 断网处理
    if (this.data.isOnline == false) {
      this.networkOutage();
      return;
    }
    // console.log(e.currentTarget.dataset.swicthkey)
    var _this = this;
    var switchKey = e.currentTarget.dataset.swicthkey;
    try {
      var value = wx.getStorageSync(switchKey)
      if (value) {
        // 对数组进行快速乱序
        value.sort(function (a, b) {
          return Math.random() > .5 ? -1 : 1;
        });
        _this.popup(0, {
          from: "goods",
          goods: value.slice(0, 3),
          ctime: new Date().getTime()
        })
        // _this.data.text[currentIndex].goods = value.slice(0, 3);
        _this.refreshPage();
      }
    } catch (e) {
      // Do something when catch error
    }
    this.popup(0, {
      from: "btn",
      content: ["换点别的看看"],
      catchtap: "swicthGoods",
      btn: "swicth",
      swicthKey: switchKey,
      ctime: new Date().getTime()
    });

  },
  // 商品卡片切换商品——2（优惠券）
  swicthCoupons: function (e) {
    // 断网处理
    if (this.data.isOnline == false) {
      this.networkOutage();
      return;
    }
    // console.log(e.currentTarget.dataset.swicthkey)
    var _this = this;
    var switchKey = e.currentTarget.dataset.swicthkey;
    try {
      var value = wx.getStorageSync(switchKey + "coupons")
      if (value) {
        // 对数组进行快速乱序
        value.push(value.shift());
        value.push(value.shift());
        value.push(value.shift());
        _this.popup(0, {
          from: "goods",
          goods: value.slice(0, 3),
          ctime: new Date().getTime()
        })
        try {
          wx.setStorageSync(switchKey + "coupons", value)
        } catch (e) {}
        // _this.data.text[currentIndex].goods = value.slice(0, 3);
        _this.refreshPage();
      }
    } catch (e) {
      // Do something when catch error
    }
    this.popup(0, {
      from: "btn",
      content: ["更多优惠券"],
      catchtap: "swicthCoupons",
      btn: "",
      swicthKey: switchKey,
      ctime: new Date().getTime()
    });

  },
  // 用户点击更多优惠券
  swicthCoupons0: function (e) {
    this.swicthCoupons(e);
  },
  // 商品卡片切换商品——2（攻略）
  swicthStrategys: function (e) {
    // 断网处理
    if (this.data.isOnline == false) {
      this.networkOutage();
      return;
    }
    // console.log(e.currentTarget.dataset.swicthkey)
    var _this = this;
    var switchKey = e.currentTarget.dataset.swicthkey;
    try {
      var value = wx.getStorageSync(switchKey + "strategys")
      if (value) {
        // 对数组进行快速乱序
        value.push(value.shift());
        _this.popup(0, {
          from: "goods",
          goods: value.slice(0, 1),
          ctime: new Date().getTime()
        })
        try {
          wx.setStorageSync(switchKey + "strategys", value)
        } catch (e) {}
        // _this.data.text[currentIndex].goods = value.slice(0, 3);
        _this.refreshPage();
      }
    } catch (e) {
      // Do something when catch error
    }
    this.popup(0, {
      from: "btn",
      content: ["更多攻略"],
      catchtap: "swicthStrategys",
      btn: "",
      swicthKey: switchKey,
      ctime: new Date().getTime()
    });

  },
  // 用户点击更多攻略
  swicthStrategys0: function (e) {
    this.swicthStrategys(e);
  },
  // 点击跳转到指定页面
  toDetail: function (e) {
    // 断网处理
    if (this.data.isOnline == false) {
      this.networkOutage();
      return;
    }
    //因为JSON.parse参数长度受限，需要新创建一个对象

    wx.navigateTo({
      url: '../../indexPage/pages/h5/h5?nid=1000' + e.currentTarget.dataset.item.nid + '&taokouling=' + e.currentTarget.dataset.item.code,
    })
  },

  // 优惠券点击进入详情
  couponToDetail: function (e) {
    // console.log(e.currentTarget.dataset.item)
    // 断网处理
    if (this.data.isOnline == false) {
      this.networkOutage();
      return;
    }
    wx.navigateTo({
      // url: '../../indexPage/pages/h5/h5?taokouling='+ e.currentTarget.dataset.item.data.newcoupon +'&nid=1000' + e.currentTarget.dataset.item.data.nid ,
      url: '../../indexPage/pages/h5/h5?nid=1000' + e.currentTarget.dataset.item.data.nid + '&taokouling=' + e.currentTarget.dataset.item.data.newcoupon
    })
  },

  // 跳转到h5页面
  toH5: function (e) {
    // 断网处理
    if (this.data.isOnline == false) {
      this.networkOutage();
      return;
    }
    // console.log(e.currentTarget.dataset.item.url);
    wx.navigateTo({
      url: '../../indexPage/pages/h5/h5?url=' + e.currentTarget.dataset.item.url,
    })
  },

  // 查看选项的星座
  checkConstellationOption: function (e) {
    var _this = this;
    // 断网处理
    if (this.data.isOnline == false) {
      this.networkOutage();
      return;
    }
    this.popup(0, {
      content: [e.currentTarget.dataset.content],
      from: "user",
      ctime: new Date().getTime()
    });
    setTimeout(function () {
      _this.checkConstellation(e.currentTarget.dataset.content);
    }, 500)
  },

  // 查看选项的热门城市
  checkHotCityOption: function (e) {
    var _this = this;
    // 断网处理
    if (this.data.isOnline == false) {
      this.networkOutage();
      return;
    }
    this.popup(0, {
      content: [e.currentTarget.dataset.content],
      from: "user",
      ctime: new Date().getTime()
    });
    setTimeout(function () {
      _this.checkWeather(e.currentTarget.dataset.content);
    }, 500)
  },

  //换别的星座是显示所有星座
  switchconstellation: function (e) {
    // 断网处理
    if (this.data.isOnline == false) {
      this.networkOutage();
      return;
    }
    this._checkConstellation();
  },

  // 用户点击换个星座
  switchconstellation0: function (e) {
    this.switchconstellation(e);
  },

  // 用户点击查天气
  _checkWeather: function (e) {
    var _this = this;
    // 判断用户是否是点击了天气按钮
    if (e.currentTarget.dataset.content == "查天气") {
      this.popup(0, {
        content: ["帮我查一下天气"],
        from: "user",
        ctime: new Date().getTime()
      });
      this.popup(1000, {
        content: ["好的，马上帮主人查天气"],
        from: "ai",
        ctime: new Date().getTime()
      });
      // 断网处理
      if (this.data.isOnline == false) {
        this.networkOutage();
        return;
      }
      setTimeout(function () {
        //检测是否已经获取用户的地址（如果没有重新授权）
        if (_this.data.firstParameter.firstgetLocation) return _this.getLocation();
        try {
          var value = wx.getStorageSync('location')
          if (value) {
            _this.checkWeather(value);
          } else {
            //检测是否已经获取用户的地址（如果没有重新授权）
            this.getLocation();
          }
        } catch (e) {
          // Do something when catch error
        }
      }, 1500)
    }

    // 判断用户是否是点击了换个城市按钮
    if (e.currentTarget.dataset.content == "换个城市") {
      // 断网处理
      if (this.data.isOnline == false) {
        this.networkOutage();
        return;
      }
      this.data.text.push();
      this.popup(0, {
        content: ["想看哪里的天气，输入城市名，小优来查。"],
        from: "ai",
        ctime: new Date().getTime()
      });
      this.popup(500, {
        from: "btnOption",
        btn: "hotCity",
        catchtap: "checkHotCityOption",
        content: this.data.cityList.city,
        ctime: new Date().getTime()
      });
      return;
    }

  },

  // 用户点击换个城市
  _checkWeather0: function (e) {
    this._checkWeather(e);
  },

  // 用户点击星座运势
  _checkConstellation: function (e) {
    if (this.data.currentCheck.currentClickConstellation) return;
    this.data.currentCheck.currentClickConstellation = true;
    var _this = this;
    // 断网处理
    if (this.data.isOnline == false) {
      this.networkOutage();
      return;
    }
    _this.popup(0, {
      content: ["查看星座运势"],
      from: 'user',
      ctime: new Date().getTime()
    });
    _this.popup(500, {
      content: ["好的，主人想看什么星座呢？"],
      from: 'ai',
      ctime: new Date().getTime()
    });
    _this.popup(1000, {
      from: "btnOption",
      btn: "constellation",
      catchtap: "checkConstellationOption",
      content: ["白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"],
      ctime: new Date().getTime()
    });
    _this.data.currentCheck.currentClickConstellation = false;
  },

  //用户点击找优惠券
  _findCoupon: function (from) {
    var _this = this;
    this.popup(0, {
      content: ["帮我找隐藏优惠券和返利红包"],
      from: "user",
      ctime: new Date().getTime()
    });
    // 断网处理
    if (this.data.isOnline == false) {
      this.networkOutage();
      return;
    }
    // 只发一次
    if (this.data.firstParameter.firstTipAboutCoupon) {
      _this.popup(1000, {
        content: [_this.data.strs[4]],
        from: "ai",
        ctime: new Date().getTime()
      });
      _this.data.firstParameter.firstTipAboutCoupon = false;
    }
    _this.popup(1500, {
      content: ["主人，先看看这张优惠券，还不错哦~"],
      from: "ai",
      ctime: new Date().getTime()
    });

    setTimeout(function () {
      wx.request({
        url: "https://flzs.yzrom.com/index.php/api/Getyq",
        data: {
          temp: 1
        },
        success: function (res) {
          // console.log(res);
          _this.renderCoupon(res, "_findCoupon");
        },
        fail: function () {
          wx.showToast({
            title: '服务器异常，请退出小程序重试！',
            icon: 'none',
            duration: 2000,
            success: function () {}
          })
        }
      })
    }, 1800)
  },

  // 用户领取红包的时候点击更多优惠券
  _findCoupon0: function () {
    var _this = this;
    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/Getyq",
      data: {
        temp: 1
      },
      success: function (res) {
        // console.log(res);
        _this.renderCoupon(res, "_RedEnvelope");
      },
      fail: function () {
        wx.showToast({
          title: '服务器异常，请退出小程序重试！',
          icon: 'none',
          duration: 2000,
          success: function () {}
        })
      }
    })
  },

  // 用户点击找好物
  _findGoods: function (e) {
    var _this = this;
    var keyword = e.currentTarget.dataset
    if (JSON.stringify(keyword) == "{}") keyword = "";
    this.popup(0, {
      content: ["帮我找好物"],
      from: "user",
      ctime: new Date().getTime()
    });
    this.popup(1000, {
      content: ["好的，主人，正在为您找好物。"],
      from: "ai",
      ctime: new Date().getTime()
    });
    // 断网处理
    if (this.data.isOnline == false) {
      this.networkOutage();
      return;
    }
    this.checkAllgoods(keyword)
  },

  // 用户点击看好货
  _lookGoods: function () {
    this.popup(0, {
      content: ["看好货"],
      from: "user",
      ctime: new Date().getTime()
    });
    // 断网处理
    if (this.data.isOnline == false) {
      this.networkOutage();
      return;
    }
    this.popup(0, {
      content: ["亲想买什么好东西？发【看+商品名】，我为你推荐购物攻略，例如【看小白鞋】。"],
      from: "ai",
      ctime: new Date().getTime()
    });
  },

  // 用户点击不要导入
  _notOrder: function (e) {
    this.popup(0, {
      content: ["不要导入"],
      from: "user",
      ctime: new Date().getTime()
    })
    this.popup(1000, {
      content: ["好的，小优知道了，不会导入这个信息。还需要小优为您做别的么~"],
      from: "ai",
      ctime: new Date().getTime()
    })
    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/order/clean",
      header: app.globalData.userids.postHeader,
      method: "POST",
      data: {
        appid: "apid_wechat",
        channel: "default",
        code: app.globalData.userids.code,
        orderid: e.currentTarget.dataset.swicthkey,
      },
      success: function (res) {
        // console.log(res);
      },
      fail: function () {
        wx.showToast({
          title: '服务器异常，请退出小程序重试！',
          icon: 'none',
          duration: 2000,
          success: function () {}
        })
      }
    })
  },
  _notOrder0: function (e) {
    this._notOrder(e);
  },

  // 获取红包
  getbasicsPacket: function (type, event_code, ctime, keyword) {
    var _this = this;
    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/red_envelope/wechatgetone",
      method: "POST",
      header: app.globalData.userids.postHeader,
      data: {
        appid: "apid_wechat",
        channel: "default",
        type: type,
        code: app.globalData.userids.code,
        event_code: event_code,
      },
      success: function (result) {
        // console.log(result.data.data.envelope_code);
        // _this.data.basicsPacket.envelope_code = result.data.data.envelope_code
        // _this.traverseTextToAlter("RedEnvelope", ctime, "envelope_code", result.data.data.envelope_code);
        if (result.data.code == 200) {
          if (result.data.data.type == 0) {
            // 惊喜红包
            if (type == 2) {
              _this.popup(0, {
                content: [keyword],
                from: "user",
                ctime: new Date().getTime()
              });
              _this.popup(500, {
                content: ["猜对暗号啦！给主人笔芯❤️，给主人一个惊喜红包~"],
                from: "ai",
                ctime: new Date().getTime()
              });
              _this.popup(1000, {
                content: [keyword],
                from: "RedEnvelope",
                typeNum: type,
                type: "surprise",
                RedEnvelopeStatus: "unclaimed",
                cash: "",
                envelope_code: result.data.data.envelope_code,
                keyword_code: event_code,
                ctime: new Date().getTime()
              });
              _this.popup(1500, {
                content: ["说对暗号就能领红包~快叫上朋友们一起来呀！"],
                from: "ai",
                ctime: new Date().getTime()
              });
              _this.popup(1500, {
                from: "btn",
                share: "share",
                content: ["分享小程序"],
                catchtap: "onShareAppMessage",
                btn: "",
                swicthKey: "fromRedPacket" + keyword,
                keyword_code: event_code,
                ctime: new Date().getTime()
              });
            }

            // 分享之后再发的红包
            if (type == 4) {
              _this.popup(1000, {
                from: "ai",
                content: ["谢谢主人，邀朋友猜暗号，给您一个爱的包包❤️哦~"],
                ctime: new Date().getTime()
              });
              _this.popup(1500, {
                content: ["谢谢主人，邀朋友猜暗号"],
                typeNum: type,
                from: "RedEnvelope",
                type: "surprise",
                RedEnvelopeStatus: "unclaimed",
                cash: "",
                envelope_code: result.data.data.envelope_code,
                keyword_code: event_code,
                ctime: new Date().getTime()
              });
            }

            // 新手红包
            if (type == 1) {
              _this.popup(2500, {
                content: ["主人，初次见面，请多关照"],
                from: "RedEnvelope",
                typeNum: 1,
                type: "newcomer",
                RedEnvelopeStatus: "unclaimed",
                cash: "",
                envelope_code: result.data.data.envelope_code,
                ctime: ctime
              });
            }

          } else if (result.data.data.type == 1) {
            if (!keyword) return
            _this.data.valInput = keyword
            _this.bindButtonTap(null, "surpriseWordPast")
          }
        } else if (result.data.code == 242) {
          _this.data.valInput = keyword
          _this.bindButtonTap(null, "surpriseWordPast")
        } else {
          _this.data.valInput = keyword
          _this.bindButtonTap(null, "surpriseWordPast")
        }
      },
      fail: function () {
        wx.showToast({
          title: '服务器异常，请退出小程序重试！',
          icon: 'none',
          duration: 2000,
          success: function () {}
        })
      }
    })
  },

  // 获取红包金额(后台记录用户已领取该红包)
  getbasicsPacketCash: function (envelope_code, ctime, from, e) {
    var _this = this;
    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/red_envelope/wechatgetcash",
      method: "POST",
      header: app.globalData.userids.postHeader,
      data: {
        envelope_code: envelope_code,
      },
      success: function (result) {
        // console.log(result);

        // 给红包赋值金额
        if (result.data.code == 200) {
          _this.data.basicsPacket.cash = result.data.data.cash
          _this.traverseTextToAlter("RedEnvelope", ctime, "cash", result.data.data.cash);
        }

        // 已领过此红包
        else if (result.data.code == 242) {

        }

        // 通过红包弹窗才执行此操作
        if (from == "fromPacketModal") {
          e.currentTarget.dataset.item.cash = result.data.data.cash;
          // app.globalData.DailyPacket.Packet.push(e.currentTarget.dataset.item);
          _this._toRedPacketDetail(e);
        }
      }
    })
  },

  // 用户点击红包的弹窗
  _redPacketCPM: function (e) {
    // console.log(this.data.basicsPacket)
    // console.log(e);
    this.data.basicsPacket.type = e.currentTarget.dataset.item.type;
    this.data.basicsPacket.cash = e.currentTarget.dataset.item.cash;
    this.data.basicsPacket.envelope_code = e.currentTarget.dataset.item.envelope_code;
    this.data.basicsPacket.PacketModalText = e.currentTarget.dataset.item.content;
    this.data.basicsPacket.ctime = e.currentTarget.dataset.item.ctime
    this.data.basicsPacket.isOpen = false;
    this.data.basicsPacket.isClose = false;
    // console.log(this.data.basicsPacket.envelope_code)
    // console.log(this.data.basicsPacket)
    // 防止自动跳到最后
    this.data.toView = "";
    this.Modalinit("redPacketCPM");
  },

  // 通过弹窗打开红包
  openPacket: function (e) {
    var _this = this;
    // 通过弹窗打开红包才获取金额
    this.getbasicsPacketCash(this.data.basicsPacket.envelope_code, this.data.basicsPacket.ctime, "fromPacketModal", e)
    this.data.basicsPacket.isOpen = true;
    // 动态改变红包的状态
    this.traverseTextToAlter("RedEnvelope", this.data.basicsPacket.ctime, "RedEnvelopeStatus", "alreadyReceived");
    // this.traverseTextToAlter("RedEnvelope", ctime, "cash", _this.data.basicsPacket.cash);
    setTimeout(function () {
      _this.easyModal.hide()
      if (_this.data.basicsPacket.type == "newcomer") var text = "新手红包";
      if (_this.data.basicsPacket.type == "surprise") var text = "惊喜红包"
      _this.popup(1000, {
        content: ["这次领到￥" + _this.data.basicsPacket.cash + text + "，每天都有好多红包等待被发现~"],
        from: "ai",
        ctime: new Date().getTime()
      })
    }, 1000)

  },

  // 跳转到红包金额页面
  _toRedPacketDetail: function (e) {
    // console.log(e);
    wx.navigateTo({
      // url: '../details/detail?item=' + JSON.stringify(newGoodsObj),
      // url: '../basicsPacket/packetDetails?data=' + JSON.stringify(e.currentTarget.dataset.item),
      url: '../../indexPage/pages/basicsPacket/packetDetails?data=' + JSON.stringify(e.currentTarget.dataset.item)
    });
  },

  // 关闭红包弹窗
  closePacket: function () {
    this.data.basicsPacket.isClose = true;
    this.easyModal.hide()
    this.refreshPage();
  },

  // 获取聊天记录时红包的状态改变
  changeRedPack: function (textArray) {
    var _this = this;
    textArray.forEach(function (val, index) {
      if (val.from == "RedEnvelope") {
        wx.request({
          url: "https://flzs.yzrom.com/index.php/api/red_envelope/wechatgetone",
          method: "POST",
          header: app.globalData.userids.postHeader,
          data: {
            appid: "apid_wechat",
            channel: "default",
            type: val.typeNum,
            code: app.globalData.userids.code,
            event_code: val.keyword_code,
          },
          success: function (result) {
            // console.log(result);
            // 已领过此红包
            if (result.data.code == 242) {
              val.RedEnvelopeStatus = "alreadyReceived";
              val.cash = result.data.data.cash;
            } else if (result.data.code == 201) {
              val.RedEnvelopeStatus = "alreadyReceived";
              val.cash = result.data.data.cash;
              wx.showToast({
                title: '服务器开小差了，技术GGMM正在玩命抢修，稍后再试……',
                icon: 'none',
                duration: 2000,
                success: function () {}
              })
            } else if (result.data.code == 246) {
              val.RedEnvelopeStatus = "pastDue";
            }

            _this.refreshPage();
            // _this.data.toView = "";
            // _this.popup(0,null)
            // console.log("聊天记录长度" + textArray.length)
          },
          fail: function () {
            wx.showToast({
              title: '服务器异常，请退出小程序重试！',
              icon: 'none',
              duration: 2000,
              success: function () {}
            })
          }
        })
      }
    })
  },

  //领红包
  // _Bonus: function (e) {
  //   var _this = this;
  //   this.popup(0, {
  //     content: ["我要红包！"],
  //     from: "user",
  //     ctime: new Date().getTime()
  //   });
  //   // 断网处理
  //   if (this.data.isOnline == false) {
  //     this.networkOutage();
  //     return;
  //   }
  //   this.popup(500, {
  //     content: ["好滴，这就给您发！"],
  //     from: 'ai',
  //     ctime: new Date().getTime()
  //   });
  //   setTimeout(function () {
  //     wx.request({
  //       url: 'https://mg.yzrom.com/index.php/index/wechat/command',
  //       data: {},
  //       success: function (res) {
  //         _this.setData({
  //           Hongbao: res.data.data[0]
  //         })
  //         _this.refreshPage();
  //         // _this.data.Hongbao = res.data[0].data;
  //         wx.showModal({
  //           title: '领取成功',
  //           content: '主人，口令复制成功！马上打开【支付宝】领取吧！',
  //           success: function (res) {
  //             if (res.confirm) {
  //               // console.log('确定');
  //               wx.setClipboardData({
  //                 data: _this.data.Hongbao.data,
  //                 success: function (res) {
  //                   console.log(res);
  //                   wx.getClipboardData({
  //                     success: function (res) {}
  //                   })
  //                 }
  //               })
  //             } else if (res.cancel) {
  //               console.log('取消')
  //             }
  //           }
  //         })
  //       },
  //       fail: function () {
  //         wx.showToast({
  //           title: '服务器异常，请退出小程序重试！',
  //           icon: 'none',
  //           duration: 2000,
  //           success: function () {}
  //         })
  //       }
  //     })
  //   }, 1000)

  // },

  // 进入我的钱包
  _entryWallet: function () {
    // console.log(app.globalData.userInfo.checkIsBind)
    // console.log(app.globalData.status.entryWalletIng)
    if (app.globalData.status.entryWalletIng) return;
    app.globalData.status.entryWalletIng = true;
    var _this = this;
    if (app.globalData.userInfo.checkIsBind != "exist" && app.globalData.userInfo.checkIsBind) {
      if (_this.data.firstParameter.firstRemindBindPhon) {
        _this.popup(0, {
          content: ["Hi，主人，为了让主人的钱包更安全，在您第一次进入钱包前，小优需要知道主人的手机号哦~"],
          from: "ai",
          ctime: new Date().getTime()
        })
        _this.popup(500, {
          content: ["验证手机号"],
          catchtap: "toLogin_firstEntryWallet",
          from: "btn",
          btn: "btn",
          ctime: new Date().getTime()
        })
        _this.data.firstParameter.firstRemindBindPhon = false;
        _this.data.firstParameter.firstTipnoBindPhon = true;
        app.globalData.status.entryWalletIng = false;
        return;
      } else {
        if (_this.data.firstParameter.firstTipnoBindPhon) {
          _this.popup(0, {
            content: ["抱歉，主人还没验证手机号，不能为您开启钱包。"],
            from: "ai",
            ctime: new Date().getTime()
          })
          _this.data.firstParameter.firstTipnoBindPhon = false;
          _this.data.firstParameter.firstRemindBindPhon = true;
          app.globalData.status.entryWalletIng = false;
          return;
        }
      }
    } else if (app.globalData.userInfo.checkIsBind == "exist") {
      _this.data.entryIngWallet = "home_wallet_hover.png";
      _this.setData(_this.data);
      setTimeout(function () {
        wx.navigateTo({
          url: '../rebate/rebate',
        })
      }, 1000);
    } else if (!app.globalData.userInfo.checkIsBind) {
      wx.showToast({
        title: '服务器异常，请退出小程序重试！',
        icon: 'none',
        duration: 2000,
        success: function () {
          app.globalData.status.entryWalletIng = false;
        }
      })
    }
  },

  // 日期过滤
  dateFilter: function (date) {
    // return [date.substr(0, 4), date.substr(4, 2), date.substr(6, 2)].join("-")
    return date.substr(4, 2) + "月" + date.substr(6, 2) + "日"
  },

  // 分享
  onShareAppMessage: function (res) {
    // console.log(res.target.dataset.swicthkey);
    var _this = this;
    var Res = res;
    var title = "";
    var imageUrl = "";

    // 通过页面的按钮分享
    if (res.from === 'button') {
      var str = res.target.dataset.swicthkey;
      // 用户输入惊喜红包关键字
      var strArr = [];
      str = str.replace("fromRedPacket", "");
      // 判断关键词是否过期了
      for (var i = 0; i < Data.surpriseWord.length; i++) {
        if (str == Data.surpriseWord[i].name && Data.surpriseWord[i].end_time < (new Date().getTime() / 1000)) {
          title = app.globalData.userInfo.nickName + ' 为你介绍一位天天发钱的助理！';
          imageUrl = "../../images/小U助理小程序分享图.png"
        } else if (str == Data.surpriseWord[i].name) {
          title = "惊喜到了，对小优说【" + str + "】，给你送现金红包啦！";
          imageUrl = "../../images/basicsPacket/shareFromPack.png";
        }
      }
    }

    // 通过左上角分享
    if (res.from == "menu") {
      title = app.globalData.userInfo.nickName + ' 为你介绍一位天天发钱的助理！';
      imageUrl = "../../images/小U助理小程序分享图.png"
    }

    return {
      title: title,
      imageUrl: imageUrl,
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
        // console.log(Res.target.dataset.event_code);
        if (Res.from === 'button') {
          // var ctime = new Date().getTime();
          _this.getbasicsPacket(4, Res.target.dataset.event_code, "", "")
        }
      },
      fail: function (res) {
        // 转发失败
      }
    }
    // }
  },
  onShareAppMessage0: function (res) {
    this.onShareAppMessage(res);
  },
  // 断网处理
  networkOutage: function () {
    this.popup(500, {
      content: ["哎呀，主人，网断了……"],
      from: "ai",
      ctime: new Date().getTime()
    })
    wx.hideLoading()
    return;
  },

  // 小数保留两位
  returnFloat: function (value) {
    var value = Math.round(parseFloat(value) * 100) / 100;
    var xsd = value.toString().split(".");
    if (xsd.length == 1) {
      value = value.toString() + ".00";
      return value;
    }
    if (xsd.length > 1) {
      if (xsd[1].length < 2) {
        value = value.toString() + "0";
      }
      return value;
    }
  },

  //制保留2位小数，如：2，会在2后面补上00.即2.00 
  toDecimal2: function (x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
      return false;
    }
    var f = Math.round(x * 100) / 100;
    var s = f.toString();
    var rs = s.indexOf('.');
    if (rs < 0) {
      rs = s.length;
      s += '.';
    }
    while (s.length <= rs + 2) {
      s += '0';
    }
    return s;
  },

  // 城市数组检索
  cityIndexOf: function (arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == val) return i;
    }
    return -1;
  },
  // 动画
  // 弹出效果
  popup: function (time, obj) {
    var _this = this;
    setTimeout(function () {
      // console.log(obj);
      if (obj) _this.data.text.push(obj)
      _this.textScroll();
      _this.setData(_this.data);
      // // 保存聊天记录
      // if (obj) _this._uploadChatRecord(obj);
      var animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
      })
      _this.animation = animation
      _this.rotateAndScaleThenTranslate();
      _this.setData({
        animationData: animation.export()
      })

      _this.data.chattingRecords++;
      if (_this.data.chattingRecords == 10) {
        // _this.data.text.slice(-10)
        // 上传用户的聊天记录
        // console.log("上传用户的聊天记录")
        _this._uploadChatRecord(-10);
        _this.data.chattingRecords = 0;
      }
      // console.log(_this.data.chattingRecords)
    }, time)
  },

  // 静态刷新页面
  refreshPage: function () {
    // 防止聊天框自动到最下面
    this.data.toView = "";
    this.setData(this.data);
  },


  rotateAndScaleThenTranslate: function () {
    var _this = this;
    // 先旋转同时放大，然后平移
    if (this.data.MultipleNodes.length == 0) return;
    this.animation.opacity(1).translateY(-(_this.data.MultipleNodes[0].height + 20)).step({
      duration: 500,
      timingFunction: "ease"
    });
    this.setData({
      animationData: this.animation.export()
    })
  },

  // 接图灵机器人
  robotChart: function (keyword) {
    var _this = this;
    var hash = hex_md5(new Date().getTime());
    wx.request({
      url: 'https://mg.yzrom.com/index.php/wxapp/Robot/index',
      data: {
        uuid: hash,
        code: keyword
      },
      success: function (res) {
        if (res.data.data == "用户uuid为空") {
          _this.popup(0, {
            content: ["你说啥？"],
            from: "ai",
            ctime: new Date().getTime()
          });
        } else {
          _this.popup(0, {
            content: [res.data.data],
            from: "ai",
            ctime: new Date().getTime()
          });
        }

      },
      fail: function () {
        wx.showToast({
          title: '服务器异常，请退出小程序重试！',
          icon: 'none',
          duration: 2000,
          success: function () {}
        })
      }
    })
  },


  // 校验订单号
  isOrderAvailable: function (order) {
    var myreg = /^\d{15,20}$/;
    if (!myreg.test(order)) {
      // console.log("不是15到20位订单号")
      return false;
    } else {
      // console.log("是15到20位订单号")
      return true;
    }
  },


  // 跳转到登录页
  toLogin_uploadOrder0: function (from) {
    wx.navigateTo({
      url: '../../indexPage/pages/login/login?from=uploadOrder',
    })
  },
  // 跳转到登录页
  toLogin_firstEntryWallet: function (from) {
    wx.navigateTo({
      url: '../../indexPage/pages/login/login?from=firstEntryWallet',
    })
  },

  toLogin_firstEntryWallet0: function () {
    this.toLogin_firstEntryWallet()
  },

  toLogin_uploadOrder1: function (e) {
    this._notOrder(e);
  },

  // 上拉刷新聊天记录
  loadMore: function (e) {
    var _this = this;
    if (this.data.currentRefresh) return;
    _this.data.currentRefresh = true
    wx.showLoading({
      title: '正在获取记录',
    })
    // that.setData({
    //   hasRefesh: true,
    // });
    // if (!this.data.hasMore) return
    // this.popup(0, { content: ["加载更多内容"], from: "ai", ctime: new Date().getTime() })
    // console.log("正在刷新。。。")
    setTimeout(function () {
      // console.log(wx.getStorageSync("ChatLogs"))
      var ChatLogs = wx.getStorageSync("chatRecord");
      // console.log("刷新成功。。。")
      var len = _this.data.text.length;
      _this.data.GetsChatLogs++;
      if (!ChatLogs[_this.data.GetsChatLogs] || !ChatLogs[_this.data.GetsChatLogs + 1]) return wx.hideLoading(), console.log("没有更多聊天记录了")

      // console.log(ChatLogs.slice((-_this.data.GetsChatLogs * 10), (-(_this.data.GetsChatLogs - 1) * 10)))

      if (ChatLogs[_this.data.GetsChatLogs]) {
        _this.data.text = ChatLogs.slice((-_this.data.GetsChatLogs * 10), (-(_this.data.GetsChatLogs - 1) * 10)).concat(_this.data.text)
      }

      // 红包的状态改变
      _this.changeRedPack(_this.data.text)

      _this.data.toView = "to" + (_this.data.text.length - len);
      _this.setData(_this.data);
      var animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
      })
      _this.animation = animation
      _this.animation.opacity(1).translateY(-(_this.data.MultipleNodes[0].height + 20)).step({
        duration: 0,
        timingFunction: "ease"
      });
      _this.setData({
        animationData: animation.export()
      })
      _this.data.currentRefresh = false;
      wx.hideLoading()
      return;
    }, 1000)

  },
  onPullDownRefresh: function () {
    var _this = this;
    wx.startPullDownRefresh({
      success: function (res) {
        setTimeout(function () {
          wx.stopPullDownRefresh();
        }, 3000)
      }
    });

    // console.log("上拉刷新")
  },
  queryMultipleNodes: function (id) {
    var _this = this;
    var query = wx.createSelectorQuery()
    query.select(id).boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      res[0].top // #the-id节点的上边界坐标
      _this.data.MultipleNodes.push(res[0]);
    })
  },

  // 上传聊天记录
  _uploadChatRecord: function (num) {
    var _this = this;
    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/chat/upload",
      method: "POST",
      header: app.globalData.userids.postHeader,
      data: {
        appid: "apid_wechat",
        channel: "default",
        code: app.globalData.userids.code,
        usersay: _this.data.text.slice(num)
      },
      success: function (res) {
        _this.data.chattingRecords = 0;
        _this.refreshPage();
        // console.log(_this.data.chattingRecords)
      },
      fail: function () {
        wx.showToast({
          title: '服务器异常，请退出小程序重试！',
          icon: 'none',
          duration: 2000,
          success: function () {}
        })
      }
    })
  },

  // 获取聊天记录
  _ObtainChatRecord: function () {
    wx.showLoading({
      title: '加载中',
    })
    var _this = this;
    wx.request({
      url: "https://flzs.yzrom.com/index.php/api/chat/download",
      method: "POST",
      header: app.globalData.userids.postHeader,
      data: {
        appid: "apid_wechat",
        channel: "default",
        code: app.globalData.userids.code,
        time: _this.getCurrentTime(),
        // number: 20
      },
      success: function (res) {
        var chatRecord = [];
        // console.log(res.data.data)
        if (!res.data) return app._fali(Data.fail.download);
        for (var key in res.data.data) {
          if (res.data.data[key].usersay) chatRecord = JSON.parse(_this.decodeUnicode(res.data.data[key].usersay)).concat(chatRecord)
        }
        // console.log(chatRecord)
        wx.setStorageSync("chatRecord", chatRecord);
        // console.log(JSON.parse(_this.decodeUnicode(res.data.data[0].usersay)))
        // var chatRecord = JSON.parse(_this.decodeUnicode(res.data.data[0].usersay))
        if (res.data.code == 201) {
          _this.popup(0, {
            content: ["Hi，", "初次见面。"],
            from: "firstai",
            greetings: "firstWord",
            ctime: new Date().getTime()
          });
          _this.popup(1000, {
            content: ["我是智能助理，小优。", "能查天气、测运势、找优惠券~", "点击下面的按钮，就能解锁更多功能。"],
            from: "ai",
            greetings: "secondWord",
            ctime: new Date().getTime()
          });
          setTimeout(function () {
            // 显示输入框
            _this.data.firstParameter.firstOption = "visible";
            _this.refreshPage();
          }, 1500)

          _this.popup(2000, {
            content: ["不仅如此，小优还会天天给您发现金红包！聊得越多，红包越多~"],
            from: "ai",
            greetings: "thirdWord",
            ctime: new Date().getTime()
          });


          var ctime = new Date().getTime();
          // 获取新手红包
          _this.getbasicsPacket(1, 1000, ctime);

          _this.popup(3500, {
            content: ["再送您一张好券，记得要领❤️"],
            from: "ai",
            ctime: new Date().getTime()
          });
          // 随机返回一个优惠券
          setTimeout(function () {
            wx.request({
              url: "https://flzs.yzrom.com/index.php/api/Getyq",
              data: {
                temp: 1,
              },
              success: function (res) {
                // console.log(res);
                _this.renderCoupon(res, "_RedEnvelope");
              }
            })
          }, 4000)

        } else if (res.data.code == 200) {
          _this.data.firstParameter.firstOption = "visible";
          _this.data.chattingRecords = -1;
          _this.data.text = wx.getStorageSync("chatRecord").slice(-10);
          // 红包的状态改变
          _this.changeRedPack(_this.data.text)
          _this.popup(0, null)
          // var chatRecord_0 = JSON.parse(_this.decodeUnicode(res.data.data[0].usersay));
          // if (res.data.data[1]) var chatRecord_1 = JSON.parse(_this.decodeUnicode(res.data.data[1].usersay))
          // console.log(chatRecord_0)
          // console.log(chatRecord_1)
          // _this.data.firstParameter.firstOption = "visible";
          // _this.data.chattingRecords = -1;
          // if (chatRecord_0.length <= 5 && chatRecord_1) {
          //   _this.data.text = chatRecord_1.concat(chatRecord_0);
          //   // 红包的状态改变
          //   _this.changeRedPack(_this.data.text)
          // } else {
          //   _this.data.text = chatRecord_0

          //   // 红包的状态改变
          //   _this.changeRedPack(_this.data.text)
          // }
        } else {
          _this.data.firstParameter.firstOption = "visible";
          _this.refreshPage();
        }
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
  },

  // 遍历text数组对象，改变某一项的状态
  traverseTextToAlter: function (from, ctime, change, value) {
    this.data.text.forEach(function (val, index) {
      // console.log(val)
      // console.log(val.from)
      if (val && val.from == from) {
        // console.log(from + ctime + change + value)
        if (val.ctime == ctime) {
          val[change] = value
        }
      }
    })

    this.refreshPage();
  },

  // 获取当前时间
  getCurrentTime: function () {
    //tS是时间戳参数，要不要转看具体情况，我这里要转换下parseInt(tS) * 1000  
    var timeStr = new Date().toLocaleString(); // 2017/7/28 下午1:36:36  
    var timeArr = timeStr.split(" "); // timeArr[0]为'2017/7/28'   timeArr[1]为'下午1:36:36'  
    var t_arr_left = timeArr[0].split("/");
    var t_flag = true;
    for (var i = 1; i <= 2; i++) {
      if (parseInt(t_arr_left[i], 10) < 10) {
        t_arr_left[i] = "0" + t_arr_left[i];
      }
    }
    var new_time_left = t_arr_left.join("-");
    var t_arr_right = timeArr[1].split(":");
    if (t_arr_right[0].indexOf("上午") !== -1) {
      if (parseInt(t_arr_right[0].replace(/上午/g, ""), 10) < 10) {
        t_arr_right[0] = "0" + t_arr_right[0].replace(/上午/g, "");
      } else {
        if (parseInt(t_arr_right[0].replace(/上午/g, ""), 10) == 12) { //这里有点怪，上午12点是晚上12点  
          t_arr_right[0] = '00';
        } else {
          t_arr_right[0] = t_arr_right[0].replace(/上午/g, "");
        }
      }
      t_flag = false;
    }

    if (t_arr_right[0].indexOf("下午") !== -1) {
      if (parseInt(t_arr_right[0].replace(/下午/g, ""), 10) == 12) { //这里有点怪，下午12点是中午12点  
        t_arr_right[0] = (parseInt(t_arr_right[0].replace(/下午/g, ""), 10)).toString();
      } else {
        t_arr_right[0] = (12 + parseInt(t_arr_right[0].replace(/下午/g, ""), 10)).toString();
      }
      t_flag = false;
    }

    if (t_flag) {
      return timeStr;
    }

    var new_time_right = t_arr_right.join(":");
    return new_time_left + " " + new_time_right; //返回2017-07-28 13:36:36  


  },
  // 转为unicode 编码  
  encodeUnicode: function (str) {
    var res = [];
    for (var i = 0; i < str.length; i++) {
      res[i] = ("00" + str.charCodeAt(i).toString(16)).slice(-4);
    }
    return "\\u" + res.join("\\u");
  },

  // 解码  
  decodeUnicode: function (str) {
    return unescape(str);
  },

  // 初始化弹窗
  Modalinit: function (modal) {
    var _this = this;
    for (var key in _this.data.Modal) {
      _this.data.Modal[key] = false;
    };
    this.data.Modal[modal] = true
    this.refreshPage();
    this.easyModal.show();
  },

  // 获取formId
  formSubmit: function (e) {
    var _this = this;
    let formId = e.detail.formId;
    // console.log(formId)
    this.data.basicsPacket.formId = e.detail.formId;
    // console.log('form发生了submit事件，推送码为：', _this.data.basicsPacket.formId);
  },

  // 如果红包没领发送formId
  sendFormId: function () {
    var _this = this;
    wx.login({
      success: (res) => {
        for (var value of this.data.text) {
          if (value.from == "RedEnvelope" && value.RedEnvelopeStatus == "unclaimed") {
            wx.request({
              url: 'https://flzs.yzrom.com/index.php/api/wxtpl/collectFormId',
              method: "POST",
              data: {
                appid: "apid_wechat",
                channel: "default",
                form_id: this.data.basicsPacket.formId,
                code: res.code,
              },
              success: function (res) {},
              fail: function () {
                wx.showToast({
                  title: '服务器异常，请退出小程序重试！',
                  icon: 'none',
                  duration: 2000,
                  success: function () {}
                })
              }
            });
          }
        }
      }
    })
  },


});