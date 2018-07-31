// pages/comment/comment.js
const app = getApp().globalData;
const api = {

}
Page({
  data: {
		dialogShow: false,
  },
  onLoad: function (options) {
  
  },
	getContent: function (e) {
		this.setData({ con: e.detail.value });
	},
	leaveword: function () {
		this.setData({ dialogShow: true });
	},
	dialogHide: function () {
		this.setData({ dialogShow: false });
	},
	publish: function () {
		if (!this.data.con) {
			this.showToast('留言不能为空！');
			return;
		}
		this.setData({ dialogShow: false });
	},
  onPullDownRefresh: function () {
		wx.stopPullDownRefresh();
		if (this.data.dialogShow) return;
  },
	loadmore: function () {
		console.log('1');
  },
	showToast: function (txt) {
		const that = this;
		let obj = {};
		obj.show = true;
		obj.title = txt;
		this.setData({ toast: obj });
		setTimeout(function () {
			obj.show = false;
			obj.title = '';
			that.setData({ toast: obj });
		}, 2000);
	}
})