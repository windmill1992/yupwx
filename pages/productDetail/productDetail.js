// pages/productDetail/productDetail.js
const app = getApp().globalData;
const util = require('./../../utils/util.js');
const api = {
	proDetail: app.baseUrl + '/yup/yup-rest/pro-detail',							//商品详情
	login: app.baseUrl + '/yup/yup-rest/login',												//登录	
	apply: app.baseUrl + '/yup/yup-rest/apply-pro',										//申请产品
	isApply: app.baseUrl + '/yup/yup-rest/user-is-apply',							//是否已申请
	userProStatus: app.baseUrl + '/yup/yup-rest/user-pro-status'			//查询用户商品状态
}
Page({
	data: {
		state: true,
		height: 500,
		isShare: false,
		isApply: false
	},
	onLoad: function (options) {
		const that = this;
		if (options.id) {
			if (!options.state) {
				options.state = 1;
				this.setData({ isShare2: true });
			}
			this.setData({ state: options.state, id: options.id });
		}

		let user = wx.getStorageSync('user');
		if (!user || user == '' || user == null) {
			this.setData({ isLogin: false });
		} else {
			if (util.check('validTime')) {
				this.setData({ isLogin: true, userId: user.userId, userAvatar: user.avatarUrl });
			} else {
				this.setData({ isLogin: false });
				this.showToast('登录已失效');
			}
		}
		this.getProDetail();
		let shareIds = wx.getStorageSync('shareProIds');
		if (shareIds && shareIds.length > 0) {
			for (let i = 0; i < shareIds.length; i++) {
				if (options.id == shareIds[i]) {
					this.setData({ isShare: true });
					break;
				}
			}
		}
	},
	onShow: function () {
		this.getProDetail();
	},
	getProDetail: function () {
		wx.request({
			url: api.proDetail,
			method: 'GET',
			header: app.header,
			data: { proId: this.data.id },
			success: res => {
				if (res.data.resultCode == 200) {
					let r = res.data.resultData;
					this.setData({ proInfo: r, state: r.proStatus });
					if (this.data.isLogin) {
						this.getUserProStatus();
						this.getIsApply();
					}
				} else {
					this.showToast(res.data.resultMsg);
				}
			}, fail: () => {
				this.showToast('未知错误！');
			}
		})
	},
	getUserProStatus: function () {
		const header = Object.assign({}, app.header, { userId: this.data.userId });
		wx.request({
			url: api.userProStatus,
			method: 'GET',
			header: header,
			data: { proId: this.data.id },
			success: res => {
				if (res.data.resultCode == 200) {
					this.setData({ isPrized: res.data.resultData.trialProgressType == 2 });
				} else {
					if (res.data.resultMsg) {
						this.showToast(res.data.resultMsg);
					} else {
						this.showToast('查询中奖状态错误');
					}
				}
			}
		})
	},
	getIsApply: function () {
		app.header.userId = this.data.userId;
		wx.request({
			url: api.isApply,
			method: 'POST',
			header: app.header,
			data: { proIdList: [this.data.id] },
			success: res => {
				if (res.data.resultCode == 200) {
					this.setData({ isApply: res.data.resultData[this.data.id] });
				} else if (res.data.resultCode == 4002) {
					this.showToast('登录已失效');
					this.setData({ isLogin: false })
					wx.clearStorageSync();
				} else {
					wx.showModal({
						title: '',
						content: '服务器错误',
						showCancel: false
					})
				}
			},
			complete: () => {
				app.header.userId = null;
			}
		})
	},
	getCoupons: function (e) {
		let url = e.currentTarget.dataset.url;
		wx.setClipboardData({
			data: url,
			success: res => {
				wx.showModal({
					title: '领取成功',
					content: '已成功复制优惠券链接，打开手机淘宝即可查看优惠券',
					showCancel: false
				})
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
							this.setData({ isLogin: true, userId: r.userId });
							this.getProDetail();
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
	imgLoad: function (e) {
		if (e.currentTarget.dataset.idx == 0) {
			let winw = wx.getSystemInfoSync().windowWidth;
			let w = e.detail.width;
			let h = e.detail.height;
			let H = parseFloat(winw * h / w).toFixed(2);
			this.setData({ height: H });
		}
	},
	preview: function (e) {
		let src = e.currentTarget.dataset.src;
		wx.previewImage({
			urls: this.data.proInfo.bannerImgList,
			current: src
		})
	},
	toApply: function (e) {
		const dd = this.data;
		app.header.userId = wx.getStorageSync('user').userId;
		wx.request({
			url: api.apply,
			method: 'POST',
			header: app.header,
			data: {
				formId: e.detail.formId,
				note: '',
				proId: Number(dd.id),
				userAddressId: 0
			},
			success: res => {
				if (res.data.resultCode == 200) {
					wx.showToast({
						title: '申请成功'
					});
					setTimeout(function () {
						wx.redirectTo({
							url: '/pages/applySuccess/applySuccess?id=' + dd.id
						})
					}, 1000);
				} else {
					this.showToast(res.data.resultMsg);
				}
			},
			fail: () => {
				this.showToast('申请失败！');
			},
			complete: () => {
				app.header.userId = null;
			}
		})
	},
	onShareAppMessage: function () {
		let dd = this.data;
		const that = this;
		setTimeout(() => {
			that.setData({ isShare: true });
		}, 1000);
		let ids = wx.getStorageSync('shareProIds');
		if (ids && ids.indexOf(dd.id) == -1) {
			ids.push(dd.id);
		} else {
			ids = [dd.id];
		}
		wx.setStorage({
			key: 'shareProIds',
			data: ids
		})
		let title = dd.proInfo.proName;
		if(!title || title == null){
			title = '潮流好物';
		}
		return {
			title: '免费领取，跟我一起来拿'+ title,
			path: '/pages/productDetail/productDetail?id=' + dd.id,
			imageUrl: dd.proInfo.coverImg
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