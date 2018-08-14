// pages/address/address.js
const app = getApp().globalData;
const api = {
	saveAddr: app.baseUrl + '/yup/yup-rest/save-user-address',		//添加或保存地址
}
Page({
  data: {
    uname: '',
    phone: '',
    addr: '请选择省市区',
    detailAddr: '',
    defaultAddr: ['浙江省', '杭州市', '西湖区'],
    isEdit: false
  },
  onLoad: function (options) {
    let id = options.id;
    let isEdit = false;
    if (id) {
      isEdit = true;
      this.getAddrInfo();
			this.setData({ id: id })
    }
    this.setData({ isEdit: isEdit });
  },
  getAddrInfo: function () {
		let editAddr = wx.getStorageSync('editAddr');
		let obj = {};
		obj.uname = editAddr.consignee;
		obj.phone = editAddr.mobile;
		obj.addr = editAddr.provice + editAddr.city + editAddr.area;
		obj.detailAddr = editAddr.address;
		obj.defaultAddr = [editAddr.provice, editAddr.city, editAddr.area];
		obj.addrArr = obj.defaultAddr;
		this.setData(obj);
  },
  getName: function (e) {
    let v = e.detail.value;
    this.setData({ uname: v });
  },
  getPhone: function (e) {
    let v = e.detail.value;
    this.setData({ phone: v });
  },
  getDetailAddr: function (e) {
    let v = e.detail.value;
    this.setData({ detailAddr: v });
  },
  selAddr: function (e) {
    let s = e.detail.value;
    let str = s[0] + s[1] + s[2];
    this.setData({ addr: str, addrArr: s });
  },
  saveAddr: function () {
    const that = this;
    const dd = that.data;
    if (!that.validAddrInfo()) return;
		let uid = wx.getStorageSync('user').userId;
		app.header.userId = uid;
		let addrId = dd.isEdit ? dd.id : 0;
		wx.request({
			url: api.saveAddr,
			method: 'POST',
			header: app.header,
			data: { 
				address: dd.detailAddr, 
				area: dd.addrArr[2], 
				city: dd.addrArr[1], 
				provice: dd.addrArr[0], 
				mobile: dd.phone, 
				userAddressId: addrId, 
				userId: uid,
				consignee: dd.uname
			},
			success: res => {
				if(res.data.resultCode == 200){
					wx.showToast({
						title: dd.isEdit ? '保存成功' : '添加成功',
					})
					wx.removeStorageSync('editAddr');
					setTimeout(function(){
						wx.navigateBack()
					}, 1000);
				}else{
					this.showToast(res.data.resultMsg);
				}
			},
			fail: () => {
				this.showToast('操作失败');
			}
		})
  },
  validAddrInfo: function () {
    const dd = this.data;
    if (!dd.uname) {
      this.showToast('请输入姓名！');
      return false
    }
    let reg = /^(13[0-9]|14[579]|15[0-3,5-9]|166|17[0135678]|18[0-9])|19[89]\d{8}$/;
    if (!dd.phone || !reg.test(dd.phone)) {
			this.showToast('手机号错误！');
      return false
    }
    if (!dd.addr || dd.addr == '请选择省市区') {
			this.showToast('请选择省市区！');
      return false
    }
    if (!dd.detailAddr) {
			this.showToast('请输入详细地址！');
      return false
    }
    return true
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