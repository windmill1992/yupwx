// pages/discovery/discovery.js
const app = getApp().globalData;
const api = {
	proList: app.baseUrl + '/yup/yup-rest/pro-index',				//试用列表
	infoList: app.baseUrl + '/yup/yup-rest/info-list',			//资讯列表
}
Page({
  data: {
		proList: [],
		infoList1: [],
		infoList2: [],
  },
  onLoad: function (options) {
		let uid = wx.getStorageSync('user').userId;
		if (uid) {
			app.header.userId = uid;
		}
		this.getProList();
		this.getInfoList(0, 1);
		this.getInfoList(1, 2);
  },
	onShow: function () {
		let uid = wx.getStorageSync('user').userId;
		if (uid) {
			app.header.userId = uid;
		}
	},
	getProList: function () {
		wx.showLoading({
			title: '加载中...',
		})
		wx.request({
			url:api.proList,
			method: 'GET',
			header: app.header,
			data: { pageIndex: 1, pageSize: 10 },
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					let r = res.data.resultData;
					let arr = [...r.inProcessProList, ...r.endProList];
					this.setData({ proList: arr });
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
	getInfoList: function (id, n) {
		wx.request({
			url: api.infoList,
			method: 'POST',
			header: app.header,
			data: {
				infoStatus: null,
				labelId: id,
				pageIndex: 1,
				pageSize: 5,
				title: '',
			},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					this.setData({ ['infoList' + n]: res.data.resultData.list });
				} else {
					if (res.data.resultMsg) {
						this.showToast(res.data.resultMsg);
					} else {
						this.showToast('服务器错误！');
					}
				}
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