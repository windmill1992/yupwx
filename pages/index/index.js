//index.js
const app = getApp().globalData;
const api = {
	proList: app.baseUrl + '/yup/yup-rest/pro-index',			//产品列表
	login: app.baseUrl + '/yup/yup-rest/login',						//登录
	isApply: app.baseUrl + '/yup/yup-rest/user-is-apply'	//是否已申请
}
Page({
	data: {
		state: 1,
		isLogin: false
	},
	onLoad: function () {
		this.getProList(1, 10);
	},
	onShow: function () {
		let user = wx.getStorageSync('user');
		if (!user || user == '' || user == null) {
			this.setData({ isLogin: false });
		} else {
			this.setData({ isLogin: true, userId: user.userId });
			if(this.data.ids){
				this.getIsApply();
			}
		}
	},
	getUserInfo: function (e) {
		if (e.detail.userInfo) {
			let user = e.detail.userInfo;
			app.userInfo = user;
			wx.setStorageSync("userInfo", user);
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
					data: { loginMethod: 2, wechatCode: res.code, authType: 0, userNickName: this.data.nickName },
					success: res1 => {
						if (res1.data.resultCode == 200) {
							let r = res1.data.resultData;
							this.setData({ isLogin: true, userId: r.userId });
							this.getIsApply();
							let obj = Object.assign({}, { userId: r.userId, token: r.token }, wx.getStorageSync('userInfo'));
							wx.setStorage({
								key: 'user',
								data: obj
							})
						} else {
							this.setData({ isLogin: false });
							this.showToast(res1.data.resultMsg);
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
	getProList: function (pn, ps) {
		const that = this;
		wx.showLoading({
			title: '加载中...'
		});
		wx.request({
			url: api.proList,
			method: 'GET',
			header: app.header,
			data: { pageIndex: pn, pageSize: ps },
			success: res => {
				if (res.data.resultCode == 200) {
					let r = res.data.resultData;
					if (r.inProcessProList && r.inProcessProList.length > 0){
						let arr = [];
						for (let i = 0; i < r.inProcessProList.length;i++){
							arr.push(r.inProcessProList[i].proId);
						}
						this.setData({ids: arr});
					}
					that.setData({ inProcessProList: r.inProcessProList, endProList: r.endProList, todayNewProCount: r.todayNewProCount, allProCount: r.allProCount });
					that.getIsApply();
				} else {
					that.showToast(res.data.resultMsg);
				}
			},
			fail: () => {
				that.showToast('未知错误！');
			},
			complete: () => {
				wx.hideLoading()
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
				}else{
					wx.removeStorageSync('user');
					this.showToast('登录已过期！');
					this.setData({ isLogin : false });
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
			wx.navigateTo({
				url: '/pages/productDetail/productDetail?id=' + data.id + '&state=' + data.state
			})
		}
	},
	onShareAppMessage: function () {
		let shareImg = this.data.inProcessProList[0].coverImg;
		return {
			title: 'YUP新潮',
			path: '/pages/index/index',
			imageUrl: shareImg
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
