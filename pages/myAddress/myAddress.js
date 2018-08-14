// pages/myAddress/myAddress.js
const app = getApp().globalData;
const api = {
	addrList: app.baseUrl + '/yup/yup-rest/get-user-address-list',		//地址列表
}
Page({
	data: {
		hasAddr: 0
	},
	onLoad: function (options) {
		let user = wx.getStorageSync('user');
		if (user) {
			app.header.userId = user.userId;
			this.setData({ userId: user.userId });
			this.getAddrList();
		}
	},
	onShow: function () {
		let uid = wx.getStorageSync('user').userId;
		if (uid) {
			app.header.userId = uid;
		}
		this.getAddrList();
		wx.removeStorageSync('editAddr');
	},
	getAddrList: function () {
		app.header.userId = this.data.userId;
		wx.request({
			url: api.addrList,
			method: 'GET',
			header: app.header,
			data: {},
			success: res => {
				if (res.data.resultCode == 200) {
					let r = res.data.resultData, hasAddr = 0;
					if (!r || r.length == 0) {
						hasAddr = 0
					} else {
						hasAddr = 1
					}
					this.setData({ addrList: r, hasAddr: hasAddr });
				} else {
					this.setData({ addrList: [], hasAddr: 0 });
					this.showToast(res.data.resultMsg);
				}
			},
			fail: () => {
				this.showToast('未知异常');
			},
			complete: () => {
				app.header.userId = null;
			}
		})
	},
	editAddr: function (e) {
		let id = e.currentTarget.dataset.id;
		let addr = e.currentTarget.dataset.addr;
		wx.setStorageSync('editAddr', addr);
		wx.navigateTo({
			url: '/pages/address/address?id=' + id
		})
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