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
		wx.showLoading({
			title: '正在保存图片',
		})
		let index = e.currentTarget.dataset.idx;
		let code = this.data.list[index].qrCode;
		this.setData({ imgUrl: code });
		code = code.replace('http://', '');
		code = code.replace(code.split('/')[0], app.imgHost2);
		wx.downloadFile({
			url: code,
			success: res => {
				this.savePhoto(res.tempFilePath);
			},
			fail: () => {
				this.showToast('图片下载失败');
				wx.hideLoading()
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
									wx.hideLoading();
									wx.navigateTo({
										url: '/pages/saveSuccess/saveSuccess?imgUrl='+ that.data.imgUrl,
									})
								},
								fail: () => {
									that.showToast('保存图片失败');
									wx.hideLoading();
								}
							})
						},
						fail: () => {
							wx.hideLoading();
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
													wx.showLoading({
														title: '正在保存图片',
													})
													setTimeout(function () {
														wx.saveImageToPhotosAlbum({
															filePath: path,
															success: () => {
																wx.hideLoading();
																wx.navigateTo({
																	url: '/pages/saveSuccess/saveSuccess?imgUrl=' + that.data.imgUrl,
																})
															},
															fail: () => {
																that.showToast('保存图片失败');
																wx.hideLoading()
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
							wx.hideLoading();
							wx.navigateTo({
								url: '/pages/saveSuccess/saveSuccess?imgUrl=' + that.data.imgUrl,
							})
						},
						fail: () => {
							that.showToast('保存图片失败');
							wx.hideLoading()
						}
					})
				}
			},
			fail: () => {
				wx.hideLoading()
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