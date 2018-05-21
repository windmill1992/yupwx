// pages/progress/progress.js
const app = getApp().globalData;
const dataUrl = {
	progress: app.baseUrl + '/yup/yup-rest/trial-progress'		//试用进展
}
Page({
	data: {
		tab: 1,
		hasmore: 0,
		trialList: [],
		page: 1
	},
	onLoad: function (options) {
		this.getProgress(1, 10);
	},
	getProgress: function (pn, ps) {
		const dd = this.data;
		app.header.userId = 1;
		wx.showLoading({
			title: '加载中...'
		})
		this.setData({ loading: true });
		wx.request({
			url: dataUrl.progress,
			method: 'GET',
			header: app.header,
			data: { trialProgressType: dd.tab, pageIndex: pn, pageSize: ps },
			success: res => {
				if (res.data.resultCode == 0) {
					let r = res.data.resultData;
					let more = 0;
					if (r.total == 0) {
						more = 0;
					} else if (r.total <= pn * ps) {
						more = 1;
					} else {
						more = 2;
					}
					this.setData({ trialList: r.trialProgressVOList, hasmore: more });
				} else {
					this.setData({ hasmore: 0 });
					this.showToast(res.data.resultMsg);
				}
			}, fail: () => {
				this.showToast('未知错误！');
			}, complete: () => {
				this.setData({ loading: false });
				wx.hideLoading()
			}
		})
	},
	switchTab: function (e) {
		let t = e.target.dataset.tab;
		this.setData({ tab: t, page: 1, hasmore: -1 });
		this.getProgress(1, 10);
	},
	onReachBottom: function () {
		const dd = this.data;
		if (dd.hasmore != 2 || dd.loading) {
			return
		}
		let page = dd.page;
		page++;
		this.getProgress(page, 10);
		this.setData({ page: page, hasmore: -1 });
	},
	onPullDownRefresh: function () {
		const that = this;
		setTimeout(function () {
			wx.stopPullDownRefresh();
			that.setData({ page: 1, hasmore: -1 });
			that.getProgress(1, 10);
		}, 500);
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