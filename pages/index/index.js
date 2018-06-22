//index.js
const app = getApp().globalData;
const util = require('./../../utils/util.js');
const api = {
	proList: app.baseUrl + '/yup/yup-rest/pro-index',			//产品列表
	login: app.baseUrl + '/yup/yup-rest/login',						//登录
	isApply: app.baseUrl + '/yup/yup-rest/user-is-apply'	//是否已申请
}
Page({
	data: {
		state: 1,
		isLogin: false,
		endProList: []
	},
	onLoad: function () {

	},
	onShow: function () {
		this.setData({ endPage: 1, endProList: [] });
		this.getProList(1, 10);
		let user = wx.getStorageSync('user');
		if (!user || user == '' || user == null) {
			this.setData({ isLogin: false });
		} else {
			if (util.check('validTime')) {
				this.setData({ isLogin: true, userId: user.userId });
				if (this.data.ids) {
					this.getIsApply();
				}
			} else {
				this.setData({ isLogin: false });
				this.showToast('登录已失效');
			}
		}
	},
	getUserInfo: function (e) {
		let obj = {}, data = e.currentTarget.dataset;
		obj.id = data.id;
		obj.state = data.state;
		if (e.detail.userInfo) {
			let user = e.detail.userInfo;
			app.userInfo = user;
			wx.setStorageSync('userInfo', user);
			this.setData({
				userAvatar: user.avatarUrl,
				nickName: user.nickName
			});
			this.login(obj)
		} else {
			this.showToast('拒绝授权！')
		}
	},
	login: function (o) {
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
							this.getIsApply();
							let obj = Object.assign({}, { userId: r.userId, token: r.token }, wx.getStorageSync('userInfo'));
							wx.setStorageSync('user', obj)
							wx.setStorageSync('validTime', Date.now() + r.validTime * 1000);
							this.showToast('登录成功！');
							if (o) {
								setTimeout(() => {
									wx.navigateTo({
										url: '/pages/productDetail/productDetail?id=' + o.id + '&state=' + o.state
									}, 2000)
								})
							}
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
	getProList: function (pn, ps) {
		const that = this;
		wx.showLoading({
			title: '加载中...'
		});
		this.setData({ loading: true });
		wx.request({
			url: api.proList,
			method: 'GET',
			header: app.header,
			data: { pageIndex: pn, pageSize: ps },
			success: res => {
				if (res.data.resultCode == 200) {
					let r = res.data.resultData;
					if (r.inProcessProList && r.inProcessProList.length > 0) {
						let arr = [];
						for (let i = 0; i < r.inProcessProList.length; i++) {
							arr.push(r.inProcessProList[i].proId);
							r.inProcessProList[i].endTime = 1529413331730
						}
						this.setData({ ids: arr, hasInprocess: true });
					}
					let hasmore = 0;
					if (r.allProCount == 0) {
						hasmore = 0;
					} else if (r.allProCount <= pn * ps) {
						hasmore = 1;
					} else {
						hasmore = 2;
					}
					let arr2 = this.data.endProList.concat(r.endProList);
					that.setData({
						inProcessProList: r.inProcessProList,
						endProList: arr2,
						todayNewProCount: r.todayNewProCount,
						allProCount: r.allProCount,
						hasmore: hasmore
					});
					if (that.data.isLogin && util.check('validTime')) {
						that.getIsApply();
					}
				} else {
					that.showToast('服务器错误！');
				}
			},
			fail: () => {
				that.showToast('未知错误！');
			},
			complete: () => {
				wx.hideLoading();
				this.setData({ loading: false });
			}
		})
	},
	getIsApply: function () {
		app.header.userId = this.data.userId;
		wx.request({
			url: api.isApply,
			method: 'POST',
			header: app.header,
			data: { proIdList: this.data.ids },
			success: res => {
				if (res.data.resultCode == 200) {
					this.setData({ isApplys: res.data.resultData });
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
	navToDetail: function (e) {
		let data = e.currentTarget.dataset;
		if (this.data.isLogin) {
			if(this.data.isApplys[data.id]){
				wx.navigateTo({
					url: '/pages/applySuccess/applySuccess?id=' + data.id + '&apply=1'
				})
			}else{
				wx.navigateTo({
					url: '/pages/productDetail/productDetail?id=' + data.id + '&state=' + data.state
				})
			}
		}
	},
	toDetail: function (e) {
		let data = e.currentTarget.dataset;
		wx.navigateTo({
			url: '/pages/productDetail/productDetail?id=' + data.id + '&state=' + data.state
		})
	},
	onShareAppMessage: function () {
		return {
			title: '免费领取，跟我一起来拿潮流好物',
			path: '/pages/index/index',
			imageUrl: '../../img/share.png'
		}
	},
	onPullDownRefresh: function () {
		wx.stopPullDownRefresh();
		this.getProList(1, 10);
		this.setData({ endPage: 1, endProList: [] });
	},
	onReachBottom: function () {
		if (this.data.hasmore == 2 && !this.data.loading) {
			let page = this.data.endPage;
			page++;
			this.getProList(page, 10);
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
