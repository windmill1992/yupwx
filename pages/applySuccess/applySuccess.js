// pages/testDetail/testDetail.js

Page({
	data: {
		id: ''
	},
	onLoad: function (options) {
		this.setData({ id: options.id });
		this.getQRCode();
	},
	getQRCode: function () {
		const dd = this.data;
		wx.request({
			url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=',
			method: 'POST',
			header: { 'content-type': 'application/json' },
			data: {
				scene: encodeURI('pro_' + dd.id),
				page: 'pages/productDetail/productDetail'
			},
			success(res) {
				console.log(res);
			}
		})
	},
	savePhoto: function () {
		const that = this;
		wx.downloadFile({
			url: 'https://e.9.cn/static/pc/images/dev-1.jpg',
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