// pages/productDetail/productDetail.js
const app = getApp().globalData;
const util = require('./../../utils/util.js');
const api = {
	proDetail: app.baseUrl + '/yup/yup-rest/pro-detail',		//商品详情
	login: app.baseUrl + '/yup/yup-rest/login',							//登录	
	isApply: app.baseUrl + '/yup/yup-rest/user-is-apply'		//是否已申请
}
Page({
	data: {
		state: true,
		restTime: '',
		height: 500,
		isShare: false,
		isApply: false
	},
	onLoad: function (options) {
		const that = this;
		if (options.id){
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
	onShow: function(){
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
					this.setData({ proInfo: r, endTime: r.proEndTime, state: r.proStatus });
					if (this.data.isLogin) {
						if (this.data.state < 2) {
							this.countDown();
						}
						let boo = false;
						for (let i = 0; i < r.winningUserList.length; i++) {
							if (r.winningUserList[i] == this.data.userAvatar) {
								boo = true;
								break;
							}
						}
						this.setData({ isPrized: boo });
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
		let winw = wx.getSystemInfoSync().windowWidth;
		let w = e.detail.width;
		let h = e.detail.height;
		let H = parseFloat(winw * h / w).toFixed(2);
		this.setData({ height: H });
	},
	preview: function (e) {
		let src = e.currentTarget.dataset.src;
		wx.previewImage({
			urls: this.data.proInfo.bannerImgList,
			current: src
		})
	},
	toApply: function () {
		wx.navigateTo({
			url: '/pages/apply/apply?id=' + this.data.id
		});
	},
	toApply2: function () {
		wx.getStorage({
			key: 'hasPhone',
			success: res => {
				if (!res.data) {
					wx.navigateTo({
						url: '/pages/bindPhone/bindPhone?form=pro&id=1'
					});
				} else {
					wx.navigateTo({
						url: '/pages/apply/apply?id=1'
					});
				}
			}, fail: res => {
				wx.navigateTo({
					url: '/pages/bindPhone/bindPhone?form=pro&id=1'
				});
			}
		})
	},
	countDown: function () {
		const that = this;
		let time = this.data.endTime - Date.now();
		if (time <= 0) {
			this.setData({ restTime: 0, state: 2 });
			return;
		}
		this.getTime(time);
		let timer = setInterval(function () {
			time -= 60000;
			if (time <= 0) {
				clearInterval(that.timer);
				that.setData({ timer: null, restTime: 0, state: 2 });
			} else {
				that.getTime(time);
			}
		}, 60000);
	},
	getTime: function (time) {
		let day = parseInt(time / 1000 / 60 / 60 / 24);
		let hh = parseInt(time / 1000 / 60 / 60 % 24);
		let mm = parseInt(time / 1000 / 60 % 60);
		let arr = [day, hh, mm].map(this.formatNum);
		let str = arr[0] + '天' + arr[1] + '小时' + arr[2] + '分';
		this.setData({ restTime: str });
	},
	formatNum: function (n) {
		if (n) {
			n = n.toString();
			return n[1] ? n : '0' + n;
		} else {
			return 0;
		}
	},
	onShareAppMessage: function () {
		let dd = this.data;
		this.setData({ isShare: true });
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
		return {
			title: '',
			path: '/pages/productDetail/productDetail?id=' + dd.id,
			imageUrl: dd.proInfo.bannerImgList[0]
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