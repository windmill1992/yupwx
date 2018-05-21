// pages/address/address.js
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
    let obj = {};
    obj.from = options.from;
    obj.proId = options.proId;
    obj.id = options.id;
    let isEdit = false;
    if (obj.id) {
      isEdit = true;
      this.getAddrInfo(obj.id);
    }
    this.setData({ opts: obj, isEdit: isEdit });

  },
  getAddrInfo: function (id) {

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
    this.setData({ addr: str });
  },
  addAddr: function () {
    const that = this;
    const dd = that.data;
    if (!that.validAddrInfo()) return;
		
		let obj = {name: dd.uname, phone: dd.phone, addr: dd.addr, detailAddr: dd.detailAddr};
		wx.setStorageSync('addrInfo', obj);
    if (dd.opts.from && dd.opts.from == 'apply') {
      wx.redirectTo({
				url: '/pages/apply/apply?id=' + dd.opts.proId
      });
    } else {
      wx.redirectTo({
        url: '/pages/myAddress/myAddress'
      });
    }
  },
  saveAddr: function () {
    const that = this;
    const dd = that.data;
    if (!that.validAddrInfo()) return;
    if (dd.opts.from && dd.opts.from == 'apply') {
      wx.redirectTo({
        url: '/pages/apply/apply?id=' + dd.opts.proId
      });
		} else {
      wx.redirectTo({
        url: '/pages/myAddress/myAddress'
      });
    }
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