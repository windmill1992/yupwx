// pages/productDetail/productDetail.js
const app = getApp().globalData;
const util = require('./../../utils/util.js');
const api = {
	proDetail: app.baseUrl + '/yup/yup-rest/pro-detail',							//商品详情
	login: app.baseUrl + '/yup/yup-rest/login',												//登录	
	apply: app.baseUrl + '/yup/yup-rest/apply-pro',										//申请产品
	isApply: app.baseUrl + '/yup/yup-rest/user-is-apply',							//是否已申请
	userProStatus: app.baseUrl + '/yup/yup-rest/user-pro-status',			//查询用户商品状态
	handel: app.baseUrl + '/yup/yup-rest/handel',											//点赞转发
	isHandel: app.baseUrl + '/yup/yup-rest/validate-user-is-handel',	//是否点赞转发
	handelData: app.baseUrl + '/yup/yup-rest/handel-data',						//点赞转发数量
	recommendList: app.baseUrl + '/yup/yup-rest/pro-recommend-list',	//推荐商品列表
}
Page({
	data: {
		state: true,
		height: 500,
		isApply: false,
	},
	onLoad: function (options) {
		const that = this;
		if (options.id) {
			if (!options.state) {
				options.state = 1;
				this.setData({ isShare2: true });
			}
			this.setData({ state: options.state, id: options.id, canIUse: app.canIUse });
		}

		let user = wx.getStorageSync('user');
		if (!user || user == '' || user == null) {
			this.setData({ isLogin: false });
		} else {
			if (util.check('validTime')) {
				app.header.userId = user.userId;
				this.setData({ isLogin: true, userId: user.userId, userAvatar: user.avatarUrl });
				this.isHandel();
			} else {
				this.setData({ isLogin: false });
				this.showToast('登录已失效');
			}
		}
		this.getProDetail();
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
		let uid = wx.getStorageSync('user').userId;
		if (uid) {
			app.header.userId = uid;
		}
		this.getProDetail();
		this.getHandelData();
		this.getRecommendLNum();
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
		wx.request({
			url: api.userProStatus,
			method: 'GET',
			header: app.header,
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
							app.header.userId = r.userId;
							this.setData({ isLogin: true, userId: r.userId });
							this.getProDetail();
							let obj = Object.assign({}, { userId: r.userId, token: r.token }, wx.getStorageSync('userInfo'));
							wx.setStorageSync('user', obj)
							wx.setStorageSync('validTime', Date.now() + r.validTime * 1000);
							this.showToast('登录成功！');
							this.isHandel();
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
	handel: function (t) {
		const dd = this.data;
		let query = '?relatedId=' + dd.id + '&relatedType=2&handelType=' + t;
		wx.request({
			url: api.handel + query,
			method: 'POST',
			header: app.header,
			data: {},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					let d = this.data.handelData;
					if (t == 2) {
						this.setData({ 'handelData.forwardNum': d.forwardNum + 1 });
					} else if (t == 1) {
						this.liking = false;
						this.setData({ 'handelData.likeNum': d.likeNum + 1, isZan: true });
					}
				} else { }
			}
		})
	},
	like: function () {
		if (!this.data.isZan && !this.liking) {
			this.liking = true;
			this.handel(1);
		}
	},
	comment: function () {
		wx.navigateTo({
			url: '/pages/comment/comment?type=2&relatedId=' + this.data.id,
		})
	},
	isHandel: function (f) {
		const dd = this.data;
		let query = '?relatedId=' + dd.id + '&relatedType=2&handelType=1';
		wx.request({
			url: api.isHandel + query,
			method: 'POST',
			header: app.header,
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
	getHandelData: function () {
		const dd = this.data;
		let query = '?relatedId=' + dd.id + '&relatedType=2&handelType=1';
		wx.request({
			url: api.handelData + query,
			method: 'GET',
			header: app.header,
			data: {},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					let r = res.data.resultData;
					this.setData({ handelData: {
						forwardNum: r.forwardNum,
						likeNum: r.likeNum,
						commentNum: r.commentNum,
					} })
				} else {
					if (res.data.resultMsg) {
						this.showToast(res.data.resultMsg);
					} else {

					}
				}
			}
		})
	},
	getRecommendLNum: function () {
		wx.request({
			url: api.recommendList,
			method: 'GET',
			header: app.header,
			data: { proId: this.data.id },
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					let r = res.data.resultData;
					let len = 0;
					if (r && r.length > 0) {
						len = r.length;
					}
					this.setData({ proNum: len });
				} else {
					if (res.data.resultMsg) {
						this.showToast(res.data.resultMsg);
					} else {
						this.showToast('服务器错误！');
					}
				}
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
		})
	},
	buy: function (e) {
		let code = this.data.proInfo.tbCouponUrl;
		code = code.replace('http://', '');
		code = code.replace(code.split('/')[0], app.imgHost2);
		wx.downloadFile({
			url: code,
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
	onShareAppMessage: function () {
		let dd = this.data;
		const that = this;
		let title = dd.proInfo.proName;
		if(!title || title == null){
			title = '潮流好物';
		}
		this.handel(2);
		return {
			title: '免费领取，跟我一起来拿'+ title,
			path: '/pages/productDetail/productDetail?id=' + dd.id,
			imageUrl: dd.proInfo.coverImg,
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