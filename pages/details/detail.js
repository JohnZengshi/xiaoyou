var app = getApp();
var wxCharts = require('../../utils/wxcharts.js');
var lineChart = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    markup: "降价",
    lowerPrice: "",
    buyIndex: "",
  },

  onLoad: function (options) {
    var item = JSON.parse(options.item)
    // var item = {"autoId":0,"commission":"5.94","couponcount":5.0,"id":0,"itemid":"556767094776","longurl":"https://uland.taobao.com/coupon/edetail?e\u003dOrfck676u%2FMGQASttHIRqUBwwzy0QYwPp%2BEaHsD%2F3nSEdvD4wwM%2BY6u8W04Q9ck3qfz%2B36m11vM27jEhErymcoowvWPhtFDlDfqEFBOhTcyIUEvicRwwG3VPr%2B8pTNxWG87GeO0pAAE0AD7Pb6hWvDPzhuC81WZi\u0026dx\u003d1","nid":"556767094776","oldprice":198.0,"pic":"http://img.alicdn.com/tfscom/i1/2736018942/TB2drpnalH8F1Jjy0FnXXb5AXXa_!!2736018942.png","price":193.0,"title":"韩后化妆品套装补水美白雪玲珑保湿祛黄淡斑护肤品套装正品专柜女"}
    this.setData({
      goods: item,
    });
    console.log(this.data.goods)
    if (this.data.goods.couponend) this.data.goods.couponend = this.dateFilter_2(this.data.goods.couponend)
    this.data.goods.coupon = this.returnFloat(this.data.goods.oldprice - this.data.goods.price);
    this.data.goods.price = this.returnFloat(this.data.goods.price)
    var couponcount = this.data.goods.coupon;
    var _this = this;
    // this.data.goods.commission = 0; 
    // this.data.goods.coupon = ""; 
    this.setData(this.data);

    wx.request({
      url: "https://mg.yzrom.com/index.php/wxapp/goods/price",
      data: {
        key: _this.data.goods.nid,
      },
      method: "GET",
      dataType: "json",
      responseType: "text",
      success: function (res) {
        console.log(res.data.data);
        // 将日期保存起来
        _this.setData({
          date: []
        });

        // 把价格值都保存起来
        _this.setData({
          val: []
        })

        // 把值和日期放到数据当中
        for (var key in res.data.data) {
          _this.data.date.push(key);
          _this.data.val.push(res.data.data[key]);
        }
        // 数据间隔
        var dataSpacing = Math.ceil(_this.data.date.length / 5)
        var categories = [];

        for (var i = 0; i < _this.data.date.length; i++) {
          _this.data.date[i] = _this.dateFilter_1(_this.data.date[i]);
          if (i % dataSpacing == 0 || i == 0) {

          } else {
            _this.data.date[i] = ""
          }
        }

        var pirce = _this.data.val;

        // 定义最高价和最低价的指标
        var max = Math.max.apply(null, pirce);
        var min = Math.min.apply(null, pirce);

        _this.data.lowerPrice = min;
        _this.setData(_this.data);
        console.log(max);
        console.log(min);

        if ((pirce[pirce.length - 1] - couponcount) >= Math.max.apply(null, pirce)) {
          _this.data.buyIndex = "一般，涨价猛于虎也"
          _this.setData(_this.data);
        } else if ((pirce[pirce.length - 1] - couponcount) < Math.max.apply(null, pirce) && (pirce[pirce.length - 1] - couponcount) > Math.min.apply(null, pirce)) {
          _this.data.buyIndex = "值，有券就可以考虑入手！"
          _this.setData(_this.data);
        } else if ((pirce[pirce.length - 1] - couponcount) < Math.min.apply(null, pirce)) {
          _this.data.buyIndex = "超值，用券后比历史最低价还便宜！"
          _this.setData(_this.data);
        } else if (pirce[pirce.length - 1] >= Math.max.apply(null, pirce)) {
          _this.data.buyIndex = "一般，涨价猛于虎也。"
          _this.setData(_this.data);
        } else if (pirce[pirce.length - 1] < Math.max.apply(null, pirce) && pirce[pirce.length - 1] > Math.min.apply(null, pirce)) {
          _this.data.buyIndex = "值，可以考虑入手哦~"
          _this.setData(_this.data);
        } else if (pirce[pirce.length - 1] <= Math.min.apply(null, pirce)) {
          _this.data.buyIndex = "超值，历史新低价（老板可能跑路了）。"
          _this.setData(_this.data);
        } else {}

        // var canvasWidth = _this.data.canvasNode.width;
        // var canvasHeight = _this.data.canvasNode.height;
        var windowWidth = 320;
        try {
          var res = wx.getSystemInfoSync();
          windowWidth = res.windowWidth;
        } catch (e) {
          console.error('getSystemInfoSync failed!');
        }
        var simulationData = _this.createSimulationData();
        lineChart = new wxCharts({
          canvasId: 'Chart',
          type: 'line',
          categories: simulationData.categories,
          animation: true,
          background: '#f5f5f5',
          width: windowWidth,
          height: 300,
          series: [{
            name: '价格',
            data: simulationData.data,
            format: function (val, name) {
              // return val.toFixed(2);
            }
          }],
          xAxis: {
            disableGrid: true,
          },
          yAxis: {
            // title: '成交金额 (万元)',
            format: function (val) {
              return val.toFixed(2);
            },
            max: max,
            min: min,
          },
          dataLabel: false,
          dataPointShape: true,
          extra: {
            lineStyle: 'curve'
          }
        });
      }
    });

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
  onShareAppMessage: function () {

  },

  copyNewcoupon: function (e) {
    console.log(this.data.goods.newcoupon)
    var _this = this;
    wx.showModal({
      title: '领劵成功',
      content: '主人，淘口令复制成功！' + this.data.goods.newcoupon + '快打开【淘宝】查看哦~',
      success: function (res) {
        if (res.confirm) {
          console.log('确定');

          wx.setClipboardData({
            data: _this.data.goods.newcoupon,
            success: function (res) {
              wx.getClipboardData({
                success: function (res) {
                  console.log(res.data) // data
                }
              })
            }
          })
        } else if (res.cancel) {
          console.log('取消')
        }
      }
    })
  },


  // 分享
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: app.globalData.userInfo.nickName + ' 觉得这张优惠券超值，分享给你！',
      path: '/pages/details/detail?item=' + JSON.stringify(this.data.goods),
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },


  // 日期过滤1  
  dateFilter_1: function (date) {
    return [date.substr(0, 4), date.substr(4, 2), date.substr(6, 2)].join("-")
  },

  // 日期过滤2  
  dateFilter_2: function (date) {
    return date.substr(0, 10)
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


  touchHandler: function (e) {
    var _this = this;
    console.log(e);
    // console.log(lineChart.getCurrentDataIndex(e));
    var dataIndex = lineChart.getCurrentDataIndex(e)
    lineChart.showToolTip(e, {
      // background: '#7cb5ec',
      format: function (item, category) {
        item.data = _this.data.val[dataIndex];
        return item.name + ':' + "￥" + item.data
      }
    });
  },
  createSimulationData: function () {
    var categories = [];
    var data = [];
    for (var i = 0; i < this.data.val.length; i++) {
      categories.push(this.data.date[i]);
      data.push(this.data.val[i]);
    }
    // data[4] = null;
    return {
      categories: categories,
      data: data
    }
  },
  updateData: function () {
    var simulationData = this.createSimulationData();
    var series = [{
      name: '价格',
      data: simulationData.data,
      format: function (val, name) {
        // return val.toFixed(2)
      }
    }];
    lineChart.updateData({
      categories: simulationData.categories,
      series: series
    });
  },



})