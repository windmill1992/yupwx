// pages/entryApply/entryApply.js
Page({
  data: {

  },
  onLoad: function (options) {

  },
  getName: function (e) {
    this.setData({ name: e.detail.value });
  },
  getPhone: function (e) {
    this.setData({ phone: e.detail.value });
  },
  getWxId: function (e) {
    this.setData({ wxId: e.detail.value });
  },
  getService: function (e) {
    this.setData({ service: e.detail.value });
  },
  submitApply: function () {
    const that = this;
    const dd = that.data;
    if (!dd.name || dd.name == '') {
      wx.showToast({
        title: '请填写姓名！',
        icon: 'none'
      });
      return
    }
    let reg = /^(13[0-9]|14[579]|15[0-3,5-9]|166|17[0135678]|18[0-9])|19[89]\d{8}$/;
    if (!dd.phone || dd.phone == '' || !reg.test(dd.phone)) {
      wx.showToast({
        title: '手机号错误！',
        icon: 'none'
      });
      return
    }
    if (!dd.wxId || dd.wxId == '') {
      wx.showToast({
        title: '请填写微信号！',
        icon: 'none'
      });
      return
    }
    if (!dd.service || dd.service == '') {
      wx.showToast({
        title: '请填写经营产品或服务！',
        icon: 'none'
      });
      return
    }
    wx.navigateTo({
      url: '/pages/entrySuccess/entrySuccess',
    });

  }
})