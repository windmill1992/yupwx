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
		let uid = wx.getStorageSync('user').userId;
		if (uid) {
			app.header.userId = uid;
		}
		this.page = 1;
		this.getRecommendList(1, 10);
  },
	onShow: function () {
		let uid = wx.getStorageSync('user').userId;
		if (uid) {
			app.header.userId = uid;
		}
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
					if (this.page == 1) {
						this.setData({ list: [] });
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
	onReachBottom: function () {
		if (this.data.hasmore == 2 && !this.flag) {
			this.page++;
			this.flag = true;
			this.getRecommendList(this.page, 10);
		}
	},
  onShareAppMessage: function () {
		return {
			title: 'Yup新潮，解锁潮流高级感，点击获取宇宙潮范儿必备指南',
			path: '/pages/index/index',
			imageUrl: '../../img/share1.png',
		}
  },
	onPullDownRefresh: function () {
		setTimeout(() => {
			wx.stopPullDownRefresh();
			this.page = 1;
			this.getRecommendList(this.page, 10);
		}, 400);
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