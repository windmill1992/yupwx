// pages/test/test.js
Page({
  data: {
  
  },
  onLoad: function (options) {
		wx.getExtConfig({
			success: res => {
				console.log(res);
			}
		})
  },
	takePhoto: function() {
		const ctx = wx.createCameraContext(this);
		ctx.takePhoto({
			quality: 'high',
			success: res => {
				console.log(res.tempImagePath);
				this.setData({ src: res.tempImagePath });
			}
		})
	},
})