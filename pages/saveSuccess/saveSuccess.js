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
})