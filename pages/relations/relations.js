// pages/relations/relations.js
const app = getApp().globalData;
const api = {
	proList: app.baseUrl + '/yup/yup-rest/search-pro-list',			//批量查询相关商品列表
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
			this.setData({ ids: options.ids });
			this.getProList();
		} else {
			wx.navigateBack()
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
			data: { proId: this.data.ids },
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
	buy: function () {
		wx.showModal({
			title: '小提示',
			content: '点击关注公众号：Yup新潮，即可购买',
			showCancel: false,
		})
	},
  onPullDownRefresh: function () {
		setTimeout(() => {
			wx.stopPullDownRefresh();
			this.getProList();
		}, 400);
  },
})