// pages/apply/apply.js
const app = getApp().globalData;
const api = {
	apply: app.baseUrl + '/yup/yup-rest/apply-pro',							//申请产品
	addr: app.baseUrl + '/yup/yup-rest/get-user-address-list',	//获取地址
}
Page({
	data: {
		hasAddr: 0
	},
	onLoad: function (options) {
		if (options.id) {
			this.setData({ id: options.id });
		} else {
			wx.switchTab({
				url: '/pages/index/index'
			})
		}
	},
	onShow: function () {
		this.getAddr();
		wx.removeStorageSync('editAddr');
	},
	getAddr: function () {
		app.header.userId = wx.getStorageSync('user').userId;
		wx.request({
			url: api.addr,
			method: 'GET',
			header: app.header,
			data: {},
			success: res => {
				if (res.data.resultCode == 200) {
					if (res.data.resultData && res.data.resultData.length > 0){
						this.setData({ addrInfo: res.data.resultData[0], hasAddr: 1 });
					}else{
						this.setData({ hasAddr: 0 });
					}
				} else {
					this.showToast(res.data.resultMsg);
					this.setData({ hasAddr: 0 });
				}
			},
			fail: () => {
				this.showToast('未知错误');
				this.setData({ hasAddr: 0 });
			},
			complete: () => {
				app.header.userId = null;
			}
		})
	},
	editAddr: function (e) {
		let data = e.currentTarget.dataset;
		wx.setStorageSync('editAddr', data.addr);
		wx.navigateTo({
			url: '/pages/address/address?id=' + data.id
		})
	},
	getWord: function (e) {
		this.setData({ note: e.detail.value });
	},
	apply: function () {
		const dd = this.data;
		if (!!!dd.hasAddr) {
			this.showToast('您还未添加收货地址！');
			return
		}
		if (!dd.note || dd.note.length < 20) {
			this.showToast('试用宣言不能少于20字！');
			return
		}
		app.header.userId = wx.getStorageSync('user').userId;
		wx.request({
			url: api.apply,
			method: 'POST',
			header: app.header,
			data: {
				note: dd.note,
				proId: Number(dd.id),
				userAddressId: Number(dd.addrInfo.userAddressId)
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
			complete: () => {
				app.header.userId = null;
			}
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