// pages/discovery/discovery.js
const app = getApp().globalData;
const api = {
	proList: app.baseUrl + '/yup/yup-rest/pro-index',							//试用列表
	infoList: app.baseUrl + '/yup/yup-rest/info-list',						//资讯列表
	labelList: app.baseUrl + '/yup/yup-rest/manage/label-list',		//标签列表
}
Page({
  data: {
		proList: [],
		infoList: [],
  },
  onLoad: function (options) {
		let uid = wx.getStorageSync('user').userId;
		if (uid) {
			app.header.userId = uid;
		}
		this.page = 1;
		this.getProList();
		this.getLabelList();
  },
	onShow: function () {
		let uid = wx.getStorageSync('user').userId;
		if (uid) {
			app.header.userId = uid;
		}
	},
	getLabelList: function () {
		wx.request({
			url: api.labelList,
			method: 'POST',
			header: app.header,
			data: {
				pageIndex: this.page,
				pageSize: 3,
			},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					let r = res.data.resultData;
					let more = r.hasNextPage;
					if (this.page == 1) {
						this.setData({ labelList: [] });
					}
					let arr = [...this.data.labelList, ...r.list];
					this.setData({ labelList: arr, hasmore: more });
					for (let v of r.list) {
						this.getInfoList(v.labelId);
					}
				}
			},
			complete: () => {
				this.loading = false;
			}
		})
	},
	getProList: function () {
		wx.showLoading({
			title: '加载中...',
		})
		wx.request({
			url:api.proList,
			method: 'GET',
			header: app.header,
			data: { pageIndex: 1, pageSize: 10 },
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					let r = res.data.resultData;
					this.setData({ proList: r.inProcessProList });
				} else {
					if (res.data.resultMsg) {
						this.showToast(res.data.resultMsg);
					} else {
						this.showToast('服务器错误！');
					}
				}
			},
			complete: () => {
				wx.hideLoading()
			}
		})
	},
	getInfoList: function (id) {
		wx.request({
			url: api.infoList,
			method: 'POST',
			header: app.header,
			data: {
				infoStatus: null,
				labelId: id,
				pageIndex: 1,
				pageSize: 5,
				title: '',
			},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					let arr = this.data.infoList;
					let r = res.data.resultData;
					if (r.list && r.list.length > 0) {
						arr.push(r.list);
					}
					this.setData({ infoList: arr });
				} else {
					if (res.data.resultMsg) {
						this.showToast(res.data.resultMsg);
					} else {
						this.showToast('服务器错误！');
					}
				}
			}
		})
	},
	onPullDownRefresh: function () {
		setTimeout(() => {
			wx.stopPullDownRefresh();
			this.getProList();
		}, 400);
	},
	onReachBottom: function () {
		if (this.data.hasmore && !this.loading) {
			this.loading = true;
			this.page++;
			this.getLabelList();
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