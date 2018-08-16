// pages/saveSuccess/saveSuccess.js
Page({
  data: {
		
  },
  onLoad: function (options) {
		this.setData({ imgUrl: options.imgUrl });
		setTimeout(() => {
			this.setData({ show: true });
		}, 400);
  },
	getImg: function (e) {
		let w = wx.getSystemInfoSync().windowWidth;
		let r = w / 375;
		let h = 240 * (e.detail.height / e.detail.width) * r;
		this.setData({ height: h + 115 * r });
	}
})