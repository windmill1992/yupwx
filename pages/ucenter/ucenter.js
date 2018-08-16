// pages/ucenter/ucenter.js
const app = getApp();
const util = require('./../../utils/util.js');
const api = {
	login: app.globalData.baseUrl + '/yup/yup-rest/login',							//登录
	sign: app.globalData.baseUrl + '/yup/yup-rest/sign',								//签到
	signDays: app.globalData.baseUrl + '/yup/yup-rest/user-sign-days',	//连续签到天数
	regDays: app.globalData.baseUrl + '/yup/yup-rest/user-registry-days',//注册天数
}
Page({
	data: {
		isLogin: false,
		userAvatar: '',
		nickName: '',
		regDays: 0,
	},
	onLoad: function (options) {
		const user = wx.getStorageSync('user');
		if (user && user != null && user != '') {
			app.globalData.header.userId = user.userId;
			this.setData({ userAvatar: user.avatarUrl, nickName: user.nickName, isLogin: true });
		} else {
			// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
			// 所以此处加入 callback 以防止这种情况
			app.userInfoReadyCallback = res => {
				this.setData({
					userAvatar: res.userInfo.avatarUrl,
					nickName: res.userInfo.nickName,
				})
				this.login()
			}
		}
	},
	onShow: function(){
		let user = wx.getStorageSync('user');
		if (!user || user == '' || user == null) {
			this.setData({ isLogin: false });
		} else {
			if(util.check('validTime')){
				app.globalData.header.userId = user.userId;
				this.setData({ userAvatar: user.avatarUrl, nickName: user.nickName, isLogin: true, userId: user.userId });
				this.getRegDays();
			}else{
				this.setData({ isLogin: false });
				this.showToast('登录已失效');
			}
		}
		let dd = new Date();
		let y = dd.getFullYear();
		let m = dd.getMonth() + 1;
		let d = dd.getDate();
		m = m < 10 ? '0' + m : m;
		d = d < 10 ? '0' + d : d;
		let day = y + '.' + m + '.' + d;
		this.setData({ today: day });
	},
	getUserInfo: function (e) {
		if (e.detail.userInfo) {
			let user = e.detail.userInfo;
			app.globalData.userInfo = user;
			wx.setStorageSync('userInfo', user);
			this.setData({
				userAvatar: user.avatarUrl,
				nickName: user.nickName,
			});
			this.login()
		}
	},
	login: function () {
		wx.showLoading({
			title: '正在登录...'
		})
		wx.login({
			success: res => {
				wx.request({
					url: api.login,
					method: 'POST',
					header: app.globalData.header,
					data: { loginMethod: 2, wechatCode: res.code, authType: 0, userNickName: this.data.nickName, userAvatar: this.data.userAvatar },
					success: res1 => {
						if (res1.data.resultCode == 200 && res1.data.resultData) {
							let r = res1.data.resultData;
							app.globalData.header.userId = r.userId;
							this.setData({ isLogin: true });
							let obj = Object.assign({}, { userId: r.userId, token: r.token }, wx.getStorageSync('userInfo'));
							wx.setStorageSync('user', obj)
							wx.setStorageSync('validTime', Date.now() + r.validTime * 1000);
							this.showToast('登录成功！');
							this.getRegDays();
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
	noLogin: function () {
		this.showToast('未登录');
	},
	signIn: function () {
		wx.request({
			url: api.sign,
			method: 'POST',
			header: app.globalData.header,
			data: {},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					this.setData({ copyWrite: res.data.resultData });
					this.getSignDays();
				} else {
					if (res.data.resultMsg) {
						this.showToast(res.data.resultMsg);
					} else {
						this.showToast('签到失败！');
					}
				}
			}
		})
	},
	getSignDays: function () {
		wx.request({
			url: api.signDays,
			method: 'GET',
			header: app.globalData.header,
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					this.setData({ signDays: res.data.resultData, showSign: true });
				} else {
					this.showToast('获取连续签到天数失败');
				}
			}
		})
	},
	getRegDays: function () {
		wx.request({
			url: api.regDays,
			method: 'GET',
			header: app.globalData.header,
			data: {},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					this.setData({ regDays: res.data.resultData });
				}
			}
		})
	},
	closeDialog: function (e) {
		this.setData({ hideSign: true });
		setTimeout( () => {
			this.setData({ showSign: false, hideSign: false });
		}, 400);
	},
	onShareAppMessage: function () {
		return {
			title: 'Yup新潮，解锁潮流高级感，点击获取宇宙潮范儿必备指南',
			path: '/pages/index/index',
			imageUrl: '../../img/share1.png',
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