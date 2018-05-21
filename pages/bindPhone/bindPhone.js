// pages/bindPhone/bindPhone.js
Page({
  data: {
    time: -1,
    phone: '',
    code: ''
  },
  onLoad: function (options) {
    let obj = {};
    obj.from = options.from;
    obj.id = options.id;
    this.setData({opts: obj});
  },
  getPhone: function (e) {
    let v = e.detail.value;
    this.setData({ phone: v });
  },
  getCode: function (e) {
    let v = e.detail.value;
    this.setData({ code: v });
  },
  getCodeTap: function () {
    const that = this;
    const dd = that.data;
    let reg = /^(13[0-9]|14[579]|15[0-3,5-9]|166|17[0135678]|18[0-9])|19[89]\d{8}$/;
    if (!dd.phone || !reg.test(dd.phone)) {
      wx.showToast({
        title: '手机号错误！',
        icon: 'none'
      })
    } else {
      that.getCodeTime(10);
      that.setData({ time: 10 });
    }
  },
  getCodeTime: function (t) {
    const that = this;
    const dd = that.data;
    let now = t;
    let timer = setInterval(function () {
      now = Number(dd.time);
      if (now < 0) {
        clearInterval(dd.timer);
        that.setData({ time: -1, timer: null });
      } else {
        now--;
        that.setData({ time: now });
      }
    }, 1000);
    that.setData({ timer: timer });
  },
  bindPhone: function () {
    let o = this.data.opts;
    if(o.from && o.from == 'test'){
      wx.setStorage({
        key: 'hasPhone',
        data: true
      });
      wx.navigateTo({
        url: '/pages/address/address?from=pro&pro_id=1',
      })
    }
  },
  onShow: function(){
    let p = wx.getStorageSync('hasPhone');
    if(p){
      wx.redirectTo({
				url: '/pages/productDetail/productDetail?id=1'
      });
    }
  }
})