//index.js
const app = getApp().globalData;
const api = {
	proList: app.baseUrl + '/yup/yup-rest/pro-index',		//产品列表
}
Page({
	data: {
		state: 1
	},
	onLoad: function () {
		this.getProList(1, 10);
	},
	getProList: function (pn, ps) {
		const that = this;
		wx.showLoading({
			title: '加载中...'
		});
		wx.request({
			url: api.proList,
			method: 'GET',
			header: app.header,
			data: { pageIndex: pn, pageSize: ps },
			success: res => {
				if (res.data.resultCode == 200) {
					let r = res.data.resultData;
					that.setData({ inProcessProList: r.inProcessProList, endProList: r.endProList, todayNewProCount: r.todayNewProCount, allProCount: r.allProCount });
				} else {
					that.showToast(res.data.resultMsg);
				}
			},
			fail: () => {
				that.showToast('未知错误！');
			},
			complete: () => {
				wx.hideLoading()
			}
		})
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
