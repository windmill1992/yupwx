// pages/index/index.js
const app = getApp().globalData;
const api = {
	recommendList: app.baseUrl + '/yup/yup-rest/info-list',		//推荐列表
}
Page({
  data: {
		list: [],
  },
  onLoad: function (options) {
		this.page = 1;
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
				if (res.data.resultCode == 200 && res.data.resultData) {
					let { hasNextPage, list, total } = res.data.resultData;
					let more = -1;
					if (hasNextPage) {
						more = 2;
					} else {
						more = 1;
					}
					if (total == 0) {
						more = 0;
					}
					let arr = [...this.data.list, ...list];
					this.setData({ list: arr, hasmore: more });
				} else {
					this.showToast(res.data.resultMsg);
				}
			},
			complete: () => {
				wx.hideLoading();
				this.flag = false;
			}
		})
	},
	loadmore: function () {
		if (this.data.hasmore == 2 && !this.flag) {
			this.page++;
			this.flag = true;
			this.getRecommendList(this.page, 10);
		}
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