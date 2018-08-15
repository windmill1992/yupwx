// pages/relations/relations.js
const app = getApp().globalData;
const api = {
	proList: app.baseUrl + '/yup/yup-rest/tbpro-list',			//批量查询相关商品列表
}
Page({
  data: {
		list: [],
  },
  onLoad: function (options) {
		let uid = wx.getStorageSync('user').userId;
		if (uid) {
			app.header.userId = uid;
		}
		if (options.ids) {
			this.setData({ ids: options.ids, canIUse: app.canIUse });
			this.getProList();
			wx.authorize({
				scope: 'scope.writePhotosAlbum',
				success: () => {
					this.setData({ refuseAuth: false });
				},
				fail: () => {
					this.setData({ refuseAuth: true });
				}
			})
		}
  },
	getProList: function () {
		wx.showLoading({
			title: '加载中...',
		})
		wx.request({
			url: api.proList,
			method: 'GET',
			header: app.header,
			data: { tbProIdList: this.data.ids },
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					this.setData({ list: res.data.resultData });
				} else {
					if (res.data.resultMsg) {
						this.showToast(res.data.resultMsg);
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
	buy: function (e) {
		let index = e.currentTarget.dataset.idx;
		let code = this.data.list[index].qrCode;
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
  onPullDownRefresh: function () {
		setTimeout(() => {
			wx.stopPullDownRefresh();
			this.getProList();
		}, 400);
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