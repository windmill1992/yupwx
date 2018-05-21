// pages/about/about.js
Page({
  data: {
    height: 300,
    cur: 1,
    canIUse: false
  },
  onLoad: function (options) {
    let use = wx.canIUse('swiper.previous-margin');
    this.setData({ canIUse: use });
  },
  setHeight: function (e) {
    let that = this;
    wx.createSelectorQuery().select('.hd .bg').boundingClientRect(function (rect) {
      that.setData({ height: rect.height });
    }).exec();
  },
  changeItem: function (e) {
    this.setData({ cur: e.detail.current });
  }
})