// pages/progress/progress.js
const app = getApp().globalData;
const util = require('./../../utils/util.js');
const api = {
	progress: app.baseUrl + '/yup/yup-rest/trial-progress',		//试用进展
	login: app.baseUrl + '/yup/yup-rest/login',								//登录
}
Page({
	data: {
		tab: 0,
		hasmore: 0,
		trialList: [],
		page: 1,
		isLogin: false,
		showTip: false,
	},
	onLoad: function (options) {
		let uid = wx.getStorageSync('user').userId;
		if (uid) {
			app.header.userId = uid;
		}
		this.setData({ canIUse: app.canIUse });
		wx.authorize({
			scope: 'scope.writePhotosAlbum',
			success: () => {
				this.setData({ refuseAuth: false });
			},
			fail: () => {
				this.setData({ refuseAuth: true });
			}
		})
	},
	onShow: function () {
		let user = wx.getStorageSync('user');
		if (!user || user == '' || user == null) {
			this.setData({ isLogin: false });
		} else {
			if (util.check('validTime')) {
				app.header.userId = user.userId;
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
					if (!r.trialProgressVOList){
						r.trialProgressVOList = [];
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
				nickName: user.nickName,
			});
			this.login()
		} else {
			this.showToast('拒绝授权！')
		}
	},
	login: function () {
		wx.showLoading({
			title: '正在登录...'
		});
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
							app.header.userId = r.userId;
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
					},
					complete: () => {
						wx.hideLoading()
					}
				})
			},
			fail: () => {
				this.showToast('获取code失败！');
			},
			complete: () => {
				wx.hideLoading()
			}
		})
	},
	getCoupons: function (e) {
		let url = e.currentTarget.dataset.url;
		url = url.replace('http://', '');
		url = url.replace(url.split('/')[0], app.imgHost2);
		wx.downloadFile({
			url: url,
			success: res => {
				this.savePhoto(res.tempFilePath);
			}
		})
	},
	savePhoto: function (path) {
		const that = this;
		wx.getSetting({
			success: res1 => {
				if (!res1.authSetting['scope.writePhotosAlbum']) {
					wx.authorize({
						scope: 'scope.writePhotosAlbum',
						success: () => {
							wx.saveImageToPhotosAlbum({
								filePath: path,
								success: () => {
									wx.showModal({
										title: '小提示',
										content: '购买二维码已经保存到本地，打开淘宝扫码即可购买',
										showCancel: false,
									})
								}
							})
						},
						fail: () => {
							wx.showModal({
								title: '未授权，无法保存到相册',
								content: '是否授权？',
								cancelColor: '#ff6960',
								confirmColor: '#151419',
								confirmText: '授权',
								success: res => {
									if (res.confirm) {
										wx.openSetting({
											success: res2 => {
												if (res2.authSetting['scope.writePhotosAlbum']) {
													wx.showToast({
														title: '授权成功~',
													})
													setTimeout(function () {
														wx.saveImageToPhotosAlbum({
															filePath: path,
															success: () => {
																wx.showModal({
																	title: '小提示',
																	content: '购买二维码已经保存到本地，打开淘宝扫码即可购买',
																	showCancel: false,
																})
															}
														})
													}, 1000);
												} else {
													that.showToast('授权失败！')
												}
											}
										})
									}
								}
							})
						}
					})
				} else {
					wx.saveImageToPhotosAlbum({
						filePath: path,
						success: () => {
							wx.showModal({
								title: '小提示',
								content: '购买二维码已经保存到本地，打开淘宝扫码即可购买',
								showCancel: false,
							})
						}
					})
				}
			}
		})
	},
	openSetting: function (e) {
		const that = this;
		if (e.detail.authSetting['scope.writePhotosAlbum']) {
			this.showToast('授权成功~');
			this.setData({ refuseAuth: false });
		}
	},
	switchTab: function (e) {
		let t = e.target.dataset.tab;
		this.setData({ tab: t, page: 1, hasmore: -1 });
		this.getProgress(1, 10);
	},
	showTip: function () {
		this.setData({ showTip: true });
	},
	closeTip: function () {
		this.setData({ showTip: false });
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