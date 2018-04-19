Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    innerText: {
      type: String,
      value: 'default value',
    }
  },
  data: {
    // 这里是一些组件内部数据
    someData: {}
  },
  methods: {
    // 这里是一个自定义方法
    customMethod: function () { }
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

    console.log("上拉刷新")
  },
})