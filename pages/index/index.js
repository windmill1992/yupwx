// pages/index/index.js
const app = getApp().globalData;
const api = {
	recommendList: app.baseUrl + '/yup/yup-rest/info-list',		//推荐列表
}
Page({
  data: {
  
  },
  onLoad: function (options) {
		this.getRecommendList(1, 10);
  },
	getRecommendList: function (pn, ps) {
		wx.showLoading({
			title: '加载中...',
			mask: true,
		})
		wx.request({
			url: api.recommendList,
			method: 'POST',
			header: app.header,
			data: {
				pageIndex: pn, 
				pageSize: ps,
				labelId: 0,
				title: '',
				infoStatus: 2,
			},
			success: res => {
					console.log(res.data); 
				if (res.data.resultCode == 200 && res.data.resultData) {
				} else {
					this.showToast(res.data.resultMsg);
				}
			},
			complete: () => {
				wx.hideLoading()
			}
		})
	},
  onShareAppMessage: function () {
  
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