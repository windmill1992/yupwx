// pages/myAddress/myAddress.js
const app = getApp().globalData;
const api = {
	addrList: app.baseUrl + '/yup/yup-rest/',		//地址列表
}
Page({
  data: {
    hasAddr: 1
  },
  onLoad: function (options) {

  },
	getAddrList:  function(){
		wx.request({
			url: api.addrList,
			method: 'GET',
			header: app.header,
			data: {},
			success: res => {
				if(res.data.resultCode == 200){
					this.setData({ addrList: res.data.resultData, hasAddr: 1 });
				}else{
					this.setData({ addrList: [], hasAddr: 0 });
					this.showToast(res.data.resultMsg);
				}
			},
			fail: () => {
				this.showToast('未知异常');
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