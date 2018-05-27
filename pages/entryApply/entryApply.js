// pages/entryApply/entryApply.js
const app = getApp().globalData;
const api = {
	enterApply: app.baseUrl + '/yup/yup-rest/enter-apply',	//商家入驻申请
}
Page({
	data: {

	},
	onLoad: function (options) {

	},
	getName: function (e) {
		this.setData({ name: e.detail.value });
	},
	getPhone: function (e) {
		this.setData({ phone: e.detail.value });
	},
	getWxId: function (e) {
		this.setData({ wxId: e.detail.value });
	},
	getService: function (e) {
		this.setData({ service: e.detail.value });
	},
	submitApply: function () {
		const that = this;
		const dd = that.data;
		if (!dd.name || dd.name == '') {
			this.showToast('请填写姓名！');
			return
		}
		let reg = /^(13[0-9]|14[579]|15[0-3,5-9]|166|17[0135678]|18[0-9])|19[89]\d{8}$/;
		if (!dd.phone || dd.phone == '' || !reg.test(dd.phone)) {
			this.showToast('手机号错误！');
			return
		}
		if (!dd.wxId || dd.wxId == '') {
			this.showToast('请填写微信号！');
			return
		}
		if (!dd.service || dd.service == '') {
			this.showToast('请填写经营产品或服务！');
			return
		}
		wx.showLoading({
			title: '正在提交...'
		});
		app.header.userId = wx.getStorageSync('user').userId;
		wx.request({
			url: api.enterApply,
			method: 'POST',
			header: app.header,
			data: { entryApplyId: 0, mobile: dd.phone, note: dd.service, userName: dd.name, wechat: dd.wxId },
			success: res => {
				if (res.data.resultCode == 200) {
					wx.showToast({
						title: '申请成功'
					});
					setTimeout(() => {
						wx.redirectTo({
							url: '/pages/entrySuccess/entrySuccess',
						});
					}, 1000);
				} else {
					wx.showModal({
						title: '',
						content: res.data.resultMsg
					})
				}
			},
			fail: () => {
				this.showToast('未知异常');
			},
			complete: () => {
				wx.hideLoading();
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