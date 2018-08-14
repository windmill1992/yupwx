// pages/myLikes/myLikes.js
const app = getApp().globalData;
const api = {
	infoList: app.baseUrl + '/yup/yup-rest/my-like-info-list',		//我喜欢的资讯列表
}
Page({
  data: {
		list: [],
  },
  onLoad: function (options) {
		let uid = wx.getStorageSync('user').userId;
		if (uid) {
			app.header.userId = uid;
			this.setData({ userId: uid });
			this.page = 1;
			this.getInfoList(1, 15);
		} else {
			wx.navigateBack()
		}
  },
	getInfoList: function (pn, ps) {
		wx.showLoading({
			title: '加载中...',
			mask: true,
		})
		wx.request({
			url: api.infoList,
			method: 'GET',
			header: app.header,
			data: {
				pageIndex: pn, 
				pageSize: ps,
			},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					let { hasNextPage, list, total } = res.data.resultData;
					if (list == null) {
						list = [];
					}
					let more = -1;
					if (hasNextPage) {
						more = 2;
					} else {
						more = 1;
					}
					if (total == 0) {
						more = 0;
					}
					if (pn == 1) {
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
	loadmore: function () {
		if (this.data.hasmore == 2 && !this.flag) {
			this.page++;
			this.flag = true;
			this.getInfoList(this.page, 15);
		}
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