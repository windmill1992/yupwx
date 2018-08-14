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
		let uid = wx.getStorageSync('user').userId;
		if (uid) {
			app.header.userId = uid;
		}
		if (options.id) {
			this.setData({ 
				id: options.id, 
				forwardNum: options.share, 
				likeNum: options.like,
				canIUse: app.canIUse,
			});
			this.getDetail();
			wx.authorize({
				scope: 'scope.writePhotosAlbum',
				success: () => {
					this.setData({ refuseAuth: false });
				},
				fail: () => {
					this.setData({ refuseAuth: true });
				}
			})
		} else {
			wx.redirectTo({
				url: '/pages/index/index',
			})
		}
  },
	onShow: function () {
		let user = wx.getStorageSync('user');
		if (user.userId) {
			app.header.userId = user.userId;
			this.setData({ userId: user.userId, isLogin: true, userAvatar: user.avatarUrl, nickName: user.nickName });
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
					let r = res.data.resultData;
					WxParse.wxParse('contents', 'html', r.content, this);
					if (!this.data.forwardNum) {
						this.setData({
							forwardNum: r.forwardNum,
							likeNum: r.likeNum,
						})
					}
					this.setData({ info: r, ids: r.relatedProIdList.join(',') });
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
	getProp: function (e) {
		this.setData({
			imgW: e.detail.width,
			imgH: e.detail.height,
		});
	},
	handel: function (t) {
		const dd = this.data;
		let query = '?relatedId=' + dd.id +'&relatedType=1&handelType='+ t;
		wx.request({
			url: api.handel + query,
			method: 'POST',
			header: app.header,
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
			url: '/pages/comment/comment?type=1&relatedId='+ this.data.id,
		})
	},
	isHandel: function (f) {
		const dd = this.data;
		let query = '?relatedId=' + dd.id + '&relatedType=1&handelType=1';
		wx.request({
			url: api.handel + query,
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
							app.header.userId = r.userId;
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
	showShare: function () {
		this.setData({ showDialog: true });
	},
	shareOnline: function () {
		this.setData({ showPic: true, showDialog: false });
	},
	closeDialog: function () {
		this.setData({ showPic: false });
	},
	cancelShare: function () {
		this.setData({ showDialog: false });
	},
	openSetting: function (e) {
		const that = this;
		if (e.detail.authSetting['scope.writePhotosAlbum']) {
			this.makeShareImg();
		}
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
									wx.showToast({
										title: '保存成功~',
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
														title: '授权成功~'
													})
													setTimeout(function () {
														wx.saveImageToPhotosAlbum({
															filePath: path,
															success: () => {
																wx.showToast({
																	title: '保存成功~'
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
							wx.showToast({
								title: '保存成功~',
							})
						}
					})
				}
			}
		})
	},
	makeShareImg: function () {
		if (this.data.making) return;
		this.setData({ making: true, showPic: true });
		wx.showLoading({
			title: '正在保存...'
		})
		let dd = this.data;
		let img = dd.info.cover;
		let code = dd.info.wechatCode;
		let avatar = dd.userAvatar;
		img = img.replace('http://', '');
		img = img.replace(img.split('/')[0], app.imgHost2);
		code = code.replace('http://', '');
		code = code.replace(code.split('/')[0], app.imgHost);
		wx.downloadFile({
			url: img,
			success: res => {
				img = res.tempFilePath;
				wx.downloadFile({
					url: code,
					success: res1 => {
						code = res1.tempFilePath;
						wx.downloadFile({
							url: avatar,
							success: res2 => {
								avatar = res2.tempFilePath;
								exec();
							}
						})
					},
					fail: res1 => {
						wx.hideLoading();
						this.setData({ making: false });
						wx.showModal({
							title: '',
							content: JSON.stringify(res1),
							showCancel: false
						})
					}
				})
			},
			fail: res => {
				wx.hideLoading();
				this.setData({ making: false });
				wx.showModal({
					title: '',
					content: JSON.stringify(res),
					showCancel: false
				})
			}
		})
		const that = this;

		function exec() {
			let name = dd.info.title;
			let proNum = dd.ids.split(',').length;
			let r = wx.getSystemInfoSync().windowWidth / 375;
			let w = 750 * r;
			let h = 1334 * r;
			let imgWidth = 690 * r;
			let imgHeight = 690 * 9 / 16 * r;
			let imgX = (w - imgWidth) / 2;
			imgX = imgX < 0 ? 0 : imgX;
			let ctx = wx.createCanvasContext('cv', that);

			ctx.beginPath();
			ctx.setFillStyle('#ffffff');
			ctx.fillRect(0, 0, w, h);
			ctx.closePath();

			ctx.beginPath();
			ctx.setFillStyle('#000000');
			ctx.setFontSize(26 * r);
			ctx.fillText(dd.nickName + '给你推荐了一篇潮流指南', 108 * r, 75 * r, 640 * r);
			ctx.closePath();

			ctx.beginPath();
			ctx.setFillStyle('#c5c5c5');
			ctx.setFontSize(26 * r);
			ctx.fillText(dd.info.authorName, 108 * r, imgHeight + 350 * r, 640 * r);
			ctx.closePath();

			ctx.beginPath();
			ctx.setFillStyle('#ffffff');
			ctx.setFontSize(26 * r);
			ctx.drawImage('../../img/red_bg.png', 606 * r, imgHeight + 310 * r, 144 * r, 48 * r);
			ctx.fillText(proNum + '件单品', 630 * r, imgHeight + 343 * r);
			ctx.closePath();

			ctx.beginPath();
			ctx.setFillStyle('#F5F7F6');
			ctx.fillRect(imgX, 108 * r, imgWidth, imgHeight);
			ctx.closePath();

			ctx.beginPath();
			ctx.drawImage('../../img/share.png', imgX, 108 * r, imgWidth, imgHeight);
			ctx.closePath();

			ctx.beginPath();
			ctx.setFontSize(44 * r);
			ctx.setTextBaseline('top');
			ctx.setFillStyle('#202020');
			ctx.setTextAlign('justify');
			if (name.length > 14) {
				ctx.fillText(name.substr(0, 14), 30, imgHeight + 148 * r, imgWidth);
				ctx.fillText(name.substr(14), 30, imgHeight + 208 * r, imgWidth);
			} else {
				ctx.fillText(name, 30, imgWidth + 148 * r, imgWidth);
			}
			ctx.closePath();

			ctx.beginPath();
			ctx.drawImage('../../img/qrcode.jpg', (w - 200 * r) / 2, h / 2 + 320, 200 * r, 200 * r);
			ctx.closePath();

			ctx.beginPath();
			ctx.setFontSize(28 * r);
			ctx.setTextAlign('center');
			ctx.setFillStyle('#000000');
			ctx.fillText('扫码查看指南', w / 2, h - 80);
			ctx.closePath();

			ctx.save();
			ctx.beginPath();
			ctx.arc(64 * r, 64 * r, 24 * r, 0, Math.PI * 2);
			ctx.clip();
			ctx.drawImage('../../img/defAvatar.png', 40 * r, 40 * r, 48 * r, 48 * r);
			ctx.closePath();
			ctx.restore();

			ctx.save();
			ctx.beginPath();
			ctx.arc(64 * r, imgHeight + 334 * r, 24 * r, 0, Math.PI * 2);
			ctx.clip();
			ctx.drawImage('../../img/defAvatar.png', 40 * r, imgHeight + 310 * r, 48 * r, 48 * r);
			ctx.closePath();
			ctx.restore();

			ctx.draw(true, setTimeout(() => {
				wx.canvasToTempFilePath({
					canvasId: 'cv',
					x: 0,
					y: 0,
					width: w,
					height: h,
					destWidth: 1260,
					destHeight: 2400,
					success: res => {
						wx.hideLoading();
						that.setData({ making: false });
						that.savePhoto(res.tempFilePath);
					},
					fail: res => {
						that.setData({ making: false });
						wx.hideLoading();
					}
				}, that)
			}, 100));
		}
	},
  onShareAppMessage: function () {
		let { title, cover } = this.data.info;
		if (this.data.userId) {
			this.handel(2);
		}
		this.setData({ showDialog: false });
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