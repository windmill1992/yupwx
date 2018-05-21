// pages/productDetail/productDetail.js
const app = getApp().globalData;
const dataUrl = {
	proDetail: app.baseUrl + '/yup/yup-rest/pro-detail',		//商品详情
}
Page({
	data: {
		state: true,
		restTime: '',
		height: 500,
		isShare: false
	},
	onLoad: function (options) {
		const that = this;
		let st = options.state;
		let id = options.id;
		this.setData({ state: st, id: id });
		this.getProDetail();
		let time = 123780000;
		this.getTime(time);
		let timer = setInterval(function () {
			time -= 60000;
			if (time <= 0) {
				clearInterval(that.timer);
				that.setData({ timer: null, restTime: 0, state: 2 });
			} else {
				that.getTime(time);
			}
		}, 60000);
	},
	getProDetail: function () {
		wx.request({
			url: dataUrl.proDetail,
			method: 'GET',
			header: app.header,
			data: { proId: this.data.id },
			success: res => {
				if (res.data.resultCode == 0) {
					this.setData({ proInfo: res.data.resultData });
				} else {
					this.showToast(res.data.resultMsg);
				}
			}, fail: () => {
				this.showToast('未知错误！');
			}
		})
	},
	imgLoad: function (e) {
		let winw = wx.getSystemInfoSync().windowWidth;
		let w = e.detail.width;
		let h = e.detail.height;
		let H = parseFloat(winw * h / w).toFixed(2);
		this.setData({ height: H });
	},
	toApply: function () {
		wx.navigateTo({
			url: '/pages/apply/apply?id=' + this.data.id
		});
		// wx.getStorage({
		// 	key: 'hasAddr',
		// 	success: res => {
		// 		if(res.data){
		// 		}else{
		// 			wx.navigateTo({
		// 				url: '/pages/address/address?from=apply&proId='+ this.data.id,
		// 			})
		// 		}
		// 	},fail: () => {
		// 		wx.navigateTo({
		// 			url: '/pages/address/address?from=apply&proId=' + this.data.id,
		// 		})
		// 	}
		// })
	},
	toApply2: function () {
		wx.getStorage({
			key: 'hasPhone',
			success: res => {
				if (!res.data) {
					wx.navigateTo({
						url: '/pages/bindPhone/bindPhone?form=pro&id=1'
					});
				} else {
					wx.navigateTo({
						url: '/pages/apply/apply?id=1'
					});
				}
			}, fail: res => {
				wx.navigateTo({
					url: '/pages/bindPhone/bindPhone?form=pro&id=1'
				});
			}
		})
	},
	getTime: function (time) {
		let day = parseInt(time / 1000 / 60 / 60 / 24);
		let hh = parseInt(time / 1000 / 60 / 60 % 24);
		let mm = parseInt(time / 1000 / 60 % 60);
		let arr = [day, hh, mm].map(this.formatNum);
		let str = arr[0] + '天' + arr[1] + '小时' + arr[2] + '分';
		this.setData({ restTime: str });
	},
	formatNum: function (n) {
		if (n) {
			n = n.toString();
			return n[1] ? n : '0' + n;
		} else {
			return 0;
		}
	},
	onShareAppMessage: function () {
		let dd = this.data;
		return {
			title: '',
			path: '/pages/productDetail/productDetail?id=1',
			imageUrl: '../../img/test.png',
			success: () => {
				this.setData({ isShare: true });
				wx.showToast({
					title: '分享成功~'
				});
			}, fail: () => {
				this.showToast('分享失败！');
			}
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