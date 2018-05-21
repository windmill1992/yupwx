// pages/apply/apply.js
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
	getAddr: function () {
		wx.chooseAddress({
			success: res => {
				let obj = {
					name: res.userName,
					phone: res.telNumber,
					addr: res.provinceName + res.cityName + res.countyName,
					detailAddr: res.detailInfo
				};
				this.setData({ addrInfo: obj, hasAddr: 1 });
			}, fail: () => {
				this.setData({ hasAddr: 0 })
			}
		})
	},
	getWord: function (e) {
		this.setData({ declaration: e.detail.value });
	},
	apply: function () {
		const dd = this.data;
		if (!!!dd.hasAddr) {
			this.showToast('您还未添加收货地址！');
			return
		}
		if (!dd.declaration || dd.declaration.length < 50) {
			this.showToast('试用宣言不能少于50字！');
			return
		}
		wx.navigateTo({
			url: '/pages/applySuccess/applySuccess?from=apply&id=' + dd.id
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