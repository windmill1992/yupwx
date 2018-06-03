// pages/testDetail/testDetail.js
const app = getApp().globalData;
const api = {
	proDetail: app.baseUrl + '/yup/yup-rest/pro-detail',		//商品详情
}
Page({
	data: {
		id: '',
		qrCode: '../../img/qrcode.jpg'
	},
	onLoad: function (options) {
		console.log(decodeURIComponent(options.scene));
		this.setData({ id: options.id });
		this.getToken();
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
					this.setData({ proInfo: r });
				} else {
					this.showToast(res.data.resultMsg);
				}
			}, fail: () => {
				this.showToast('未知错误！');
			}
		})
	},
	getToken: function () {
		wx.request({
			url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + app.appid + '&secret=' + app.appSecret,
			method: 'GET',
			data: {},
			success: res => {
				if (res.data) {
					this.getQRCode(res.data.access_token);
				} else {
					this.showToast('获取token失败！');
				}
			}
		})
	},
	getQRCode: function (token) {
		const dd = this.data;
		wx.request({
			url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' + token,
			method: 'POST',
			header: { 'content-type': 'application/json' },
			data: {
				scene: encodeURI('pro_' + dd.id),
				page: 'pages/productDetail/productDetail'
			},
			success: res => {
				console.log(res.data);
				if (res.data) {
					// this.setData({ qrCode: res.data });
				}
			}
		})
	},
	savePhoto: function () {
		const that = this;
		let imgUrl = this.data.proInfo.coverImg;
		wx.downloadFile({
			url: imgUrl,
			success(res) {
				console.log(res);
				if (res.statusCode == 200) {
					let path = res.tempFilePath;
					wx.getSetting({
						success(res1) {
							if (!res1.authSetting['scope.writePhotosAlbum']) {
								wx.authorize({
									scope: 'scope.writePhotosAlbum',
									success() {
										wx.saveImageToPhotosAlbum({
											filePath: path,
											success() {
												wx.showToast({
													title: '保存成功~',
												})
											}
										})
									},
									fail() {
										wx.showModal({
											title: '未授权，无法保存到相册',
											content: '是否授权？',
											cancelColor: '#ff6960',
											confirmColor: '#151419',
											confirmText: '授权',
											success(res) {
												if (res.confirm) {
													wx.openSetting({
														success(res2) {
															if (res2.authSetting['scope.writePhotosAlbum']) {
																wx.showToast({
																	title: '授权成功~'
																})
																setTimeout(function () {
																	wx.saveImageToPhotosAlbum({
																		filePath: path,
																		success() {
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
									success() {
										wx.showToast({
											title: '保存成功~',
										})
									}
								})
							}
						}
					})
				}
			},
			fail(res) {
				that.showToast('图片保存失败！');
			}
		})
	},
	preview: function (e) {
		// wx.previewImage({
		// 	urls: [this.data.qrCode]
		// })
		this.setData({ isPreview: true });
	},
	closePreview: function () {
		this.setData({ isPreview: false });
	},
	onShareAppMessage: function () {

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