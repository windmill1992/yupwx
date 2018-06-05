// pages/testDetail/testDetail.js
const app = getApp().globalData;
const api = {
	proDetail: app.baseUrl + '/yup/yup-rest/pro-detail',		//商品详情
	qrcode: app.baseUrl + '/yup/yup-rest/pro-wechat-code'		//获取小程序码
}
Page({
	data: {
		id: '',
		canIUse: false,
		qrCode: '../../img/qrcode.jpg'
	},
	onLoad: function (options) {
		this.setData({ id: options.id });
		this.getProDetail();
		this.getQRCode();
		if (wx.canIUse('button.open-type.openSetting')) {
			this.setData({ canIUse: true });
		}
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
	getProp: function (e) {
		this.setData({ imgW: e.detail.width, imgH: e.detail.height });
	},
	getQRCode: function () {
		wx.request({
			url: api.qrcode,
			method: 'GET',
			data: { proId: this.data.id },
			success: res => {
				if (res.data.resultCode == 200) {
					if (res.data.resultData) {
						this.setData({ qrCode: res.data.resultData });
					} else {
						this.showToast('生成小程序码出错');
					}
				} else {
					this.showToast(res.data.resultMsg);
				}
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
	preview: function (e) {
		if (this.data.isPreview) {
			this.setData({ isPreview: false });
		} else {
			this.setData({ isPreview: true });
		}
	},
	makeShareImg: function () {
		let dd = this.data;
		let img = dd.proInfo.coverImg;
		let code = dd.qrCode;
		img = img.replace('http://', '');
		img = img.replace(img.split('/')[0], app.imgHost2);
		code = code.replace('http://', '');
		code = code.replace(code.split('/')[0], app.imgHost);
		console.log(img);
		wx.downloadFile({
			url: 'https://propic.yupfashion.cn/1528101785495.jpg',
			success: res => {
				img = res.tempFilePath;
				wx.downloadFile({
					url: 'https://pic.yupfashion.cn/1528100388031.png?Expires=1843552401&OSSAccessKeyId=LTAIUEHkf3brTwt1&Signature=pcyTJXf7isI53wRedzJUsHAl%2B7Q%3D',
					success: res1 => {
						code = res1.tempFilePath;
						exec();
					}
				})
			}
		})
		const that = this;
		function exec() {
			let name = dd.proInfo.proName;
			name = name.length > 13 ? (name.substr(0, 13) + '...') : name;
			let r = wx.getSystemInfoSync().windowWidth / 375;
			let w = 550 * r;
			let h = 750 * r;
			let imgWidth = dd.imgW / dd.imgH * 550 * r;
			let imgX = (550 - imgWidth) * r / 2;
			imgX = imgX < 0 ? 0 : imgX;
			let ctx = wx.createCanvasContext('cv', that);

			ctx.beginPath();
			ctx.setFillStyle('#F5F7F6');
			ctx.fillRect(0, 0, w, 550 * r);
			ctx.closePath();

			ctx.beginPath();
			ctx.drawImage(img, imgX, 0, imgWidth, 550 * r);
			ctx.setFillStyle('#ffffff');
			ctx.fillRect(0, 550 * r, w, 250 * r);
			ctx.closePath();

			ctx.beginPath();
			ctx.setFontSize(24 * r);
			ctx.setTextBaseline('top');
			ctx.setFillStyle('#262628');
			ctx.fillText('我正在YUP新潮申请试用', 20, 580 * r);
			ctx.fillText('「' + name + '」', 20, 614 * r);
			ctx.fillText('你也来一起参与领取吧', 20, 648 * r);
			ctx.closePath();

			ctx.beginPath();
			ctx.setFontSize(20 * r);
			ctx.setFillStyle('rgba(0,0,0,0.5)');
			ctx.fillText('扫描小程序码免费领取！', 20, 690 * r);
			ctx.closePath();

			ctx.beginPath();
			ctx.drawImage(code, 352 * r + 20, 570 * r, 158 * r, 158 * r);
			ctx.closePath();

			ctx.draw(true, setTimeout(() => {
				wx.canvasToTempFilePath({
					canvasId: 'cv',
					x: 0,
					y: 0,
					width: w,
					height: h,
					destWidth: 1100,
					destHeight: 1500,
					success: res => {
						that.savePhoto(res.tempFilePath);
					}
				}, that)
			}, 100));
		}
	},
	onShareAppMessage: function () {
		let dd = this.data.proInfo;
		return {
			title: dd.proName,
			path: 'pages/productDetail/productDetail?id=' + dd.proId,
			imageUrl: dd.coverImg
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