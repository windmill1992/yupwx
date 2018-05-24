// pages/ucenter/ucenter.js
const app = getApp();
const util = require('./../../utils/util.js');
const api = {
	login: app.globalData.baseUrl + '/yup/yup-rest/login',	//登录
}
Page({
	data: {
		isLogin: false,
		userAvatar: '',
		nickName: '',
	},
	onLoad: function (options) {
		const user = wx.getStorageSync('user');
		if (user && user != null && user != '') {
			this.setData({ userAvatar: user.avatarUrl, nickName: user.nickName, isLogin: true });
		} else {
			// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
			// 所以此处加入 callback 以防止这种情况
			app.userInfoReadyCallback = res => {
				this.setData({
					userAvatar: res.userInfo.avatarUrl,
					nickName: res.userInfo.nickName
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
				this.setData({ userAvatar: user.avatarUrl, nickName: user.nickName, isLogin: true, userId: user.userId });
			}else{
				this.setData({ isLogin: false });
				this.showToast('登录已失效');
			}
		}
	},
	getUserInfo: function (e) {
		if (e.detail.userInfo) {
			let user = e.detail.userInfo;
			app.globalData.userInfo = user;
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
		})
		wx.login({
			success: res => {
				wx.request({
					url: api.login,
					method: 'POST',
					header: app.globalData.header,
					data: { loginMethod: 2, wechatCode: res.code, authType: 0, userNickName: this.data.nickName, userAvatar: this.data.userAvatar },
					success: res1 => {
						if (res1.data.resultCode == 200) {
							let r = res1.data.resultData;
							this.setData({ isLogin: true });
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
	noAddr: function () {
		this.showToast('未登录');
	},
	onShareAppMessage: function () {
		return {
			title: 'YUP新潮',
			path: '/pages/index/index',
			imageUrl: '../../img/logo.jpg'
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