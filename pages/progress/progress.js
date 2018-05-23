// pages/progress/progress.js
const app = getApp().globalData;
const util = require('./../../utils/util.js');
const api = {
	progress: app.baseUrl + '/yup/yup-rest/trial-progress',		//试用进展
	login: app.baseUrl + '/yup/yup-rest/login',								//登录
}
Page({
	data: {
		tab: 1,
		hasmore: 0,
		trialList: [],
		page: 1,
		isLogin: false
	},
	onLoad: function (options) {
		// this.getProgress(1, 10);
	},
	onShow: function () {
		let user = wx.getStorageSync('user');
		if (!user || user == '' || user == null) {
			this.setData({ isLogin: false });
		} else {
			if (util.check('validTime')) {
				this.setData({ isLogin: true, userId: user.userId });
				this.getProgress(1, 10);
			}else{
				this.setData({ isLogin: false });
				this.showToast('登录已失效');
			}
		}
	},
	getProgress: function (pn, ps) {
		const dd = this.data;
		app.header.userId = dd.userId;
		wx.showLoading({
			title: '加载中...'
		})
		this.setData({ loading: true });
		wx.request({
			url: api.progress,
			method: 'GET',
			header: app.header,
			data: { trialProgressType: dd.tab, pageIndex: pn, pageSize: ps },
			success: res => {
				if (res.data.resultCode == 200) {
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
			},
			fail: () => {
				this.showToast('未知错误！');
			},
			complete: () => {
				this.setData({ loading: false });
				wx.hideLoading()
			}
		})
	},
	getUserInfo: function (e) {
		if (e.detail.userInfo) {
			let user = e.detail.userInfo;
			app.userInfo = user;
			wx.setStorageSync('userInfo', user);
			this.setData({
				userAvatar: user.avatarUrl,
				nickName: user.nickName
			});
			this.login()
		} else {
			this.showToast('拒绝授权！')
		}
	},
	login: function () {
		wx.login({
			success: res => {
				wx.request({
					url: api.login,
					method: 'POST',
					header: app.header,
					data: { loginMethod: 2, wechatCode: res.code, authType: 0, userNickName: this.data.nickName, userAvatar: this.data.userAvatar },
					success: res1 => {
						if (res1.data.resultCode == 200) {
							let r = res1.data.resultData;
							this.setData({ isLogin: true, userId: r.userId });
							this.getProgress(1, 10);
							let obj = Object.assign({}, { userId: r.userId, token: r.token }, wx.getStorageSync('userInfo'));
							wx.setStorageSync('user', obj)
							wx.setStorageSync('validTime', Date.now() + r.validTime * 1000);
							this.showToast('登录成功！');
						} else {
							this.setData({ isLogin: false });
							wx.showModal({
								title: '',
								content: res1.data.resultMsg,
								showCancel: false
							})
						}
					},
					fail: () => {
						this.showToast('未知错误');
					}
				})
			},
			fail: () => {
				this.showToast('获取code失败！');
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