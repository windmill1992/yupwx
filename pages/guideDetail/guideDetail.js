// pages/guideDetail/guideDetail.js
const app = getApp().globalData;
const api = {
	detailInfo: app.baseUrl + '/yup/yup-rest/info-detail',						//详情
	handel: app.baseUrl + '/yup/yup-rest/handel',											//点赞转发
	login: app.baseUrl + '/yup/yup-rest/login',												//登录
	isHandel: app.baseUrl + '/yup/yup-rest/validate-user-is-handel',	//是否点赞转发
}
const WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
  
  },
  onLoad: function (options) {
		if (options.id) {
			this.setData({ id: options.id });
			this.getDetail();
		} else {
			wx.redirectTo({
				url: '/pages/index/index',
			})
		}
  },
	onShow: function () {
		let uid = wx.getStorageSync('user').userId;
		if (uid) {
			this.setData({ userId: uid });
			this.isHandel();
		}
	},
	getDetail: function () {
		wx.showLoading({
			title: '加载中...',
		})
		wx.request({
			url: api.detailInfo,
			method: 'GET',
			header: app.header,
			data: { infoId: this.data.id },
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					WxParse.wxParse('contents', 'html', res.data.resultData.content, this);
					this.setData({ info: res.data.resultData });
				} else {
					if (res.data.resultMsg) {
						wx.showModal({
							title: '错误',
							content: res.data.resultMsg,
							showCancel: false,
						})
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
	handel: function (t) {
		const dd = this.data;
		let query = '?relatedId=' + dd.id +'&relatedType=1&handelType='+ t;
		wx.request({
			url: api.handel + query,
			method: 'POST',
			header: { userId: dd.userId },
			data: {},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					let d = this.data.info;
					if (t == 2) {
						this.setData({ 'info.forwardNum': d.forwardNum + 1 });
					} else if (t == 1) {
						this.setData({ 'info.likeNum': d.likeNum + 1, isZan: true });
					}
				} else {}
			}
		})
	},
	like: function () {
		if (!this.data.isZan) {
			this.handel(1);
		}
	},
	comment: function () {
		wx.navigateTo({
			url: '/pages/comment/comment?relatedId='+ this.data.id,
		})
	},
	isHandel: function (f) {
		const dd = this.data;
		let query = '?relatedId=' + dd.id + '&relatedType=1&handelType=1';
		wx.request({
			url: api.handel + query,
			method: 'GET',
			header: { userId: this.data.userId },
			data: {},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					this.setData({ isZan: true });
				} else {
					this.setData({ isZan: false });
					if (f == 1) {
						this.handel(1);
					}
				}
			}
		})
	},
	getUserInfo: function (e) {
		let user = e.detail.userInfo;
		if (user) {
			wx.setStorageSync('userInfo', user);
			this.login(user);
		}
	},
	login: function (user) {
		wx.showLoading({
			title: '正在登录...'
		});
		wx.login({
			success: res => {
				wx.request({
					url: api.login,
					method: 'POST',
					header: app.header,
					data: {
						loginMethod: 2,
						wechatCode: res.code,
						authType: 0,
						userNickName: user.nickName,
						userAvatar: user.avatarUrl,
					},
					success: res1 => {
						if (res1.data.resultCode == 200) {
							let r = res1.data.resultData;
							this.setData({ isLogin: true, userId: r.userId });
							let obj = Object.assign({}, { userId: r.userId, token: r.token }, wx.getStorageSync('userInfo'));
							wx.setStorageSync('user', obj)
							wx.setStorageSync('validTime', Date.now() + r.validTime * 1000);
							this.showToast('登录成功！');
							this.isHandel(1);
						} else {
							this.setData({ isLogin: false });
							wx.showModal({
								title: '',
								content: res1.data.resultMsg,
								showCancel: false,
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
  onShareAppMessage: function () {
		let { title, cover } = this.data.info;
		if (this.data.userId) {
			this.handel(2);
		}
		return {
			title: title,
			path: '/pages/guideDetail/guideDetail?id='+ this.data.id,
			imageUrl: cover,
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