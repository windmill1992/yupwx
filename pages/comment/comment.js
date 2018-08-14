// pages/comment/comment.js
const app = getApp().globalData;
const api = {
	commentList: app.baseUrl + '/yup/yup-rest/comment-list',		//评论列表
	comment: app.baseUrl + '/yup/yup-rest/comment',							//评论
	login: app.baseUrl + '/yup/yup-rest/login',									//登录
}
Page({
  data: {
		dialogShow: false,
		list: [],
		isLogin: false,
  },
  onLoad: function (options) {
		if (options.relatedId) {
			this.setData({ relatedId: options.relatedId, relatedType: options.type });
		} else {
			wx.navigateBack();
			return;
		}
		this.page = 1;
		let uid = wx.getStorageSync('user').userId;
		if (uid) {
			app.header.userId = uid;
			this.setData({ userId: uid, isLogin: true });
		}
		this.getCommentList(1, 20);
  },
	getCommentList: function (pn, ps) {
		const dd = this.data;
		wx.showLoading({
			title: '加载中...',
		})
		wx.request({
			url: api.commentList,
			method: 'POST',
			header: app.header,
			data: {
				pageIndex: pn,
				pageSize: ps,
				relatedId: dd.relatedId,
				relatedType: dd.relatedType,
			},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					if (pn == 1) {
						this.setData({ list: [], hasmore: -1 });
					}
					let r = res.data.resultData;
					let more = -1;
					if (r.hasNextPage) {
						more = 2;
					} else {
						more = 1;
					}
					if (r.total == 0) {
						more = 0;
					}
					for (let v of r.list) {
						v.createTime = this.timeFm(v.createTime);
					}
					let arr = [...this.data.list, ...r.list];
					this.setData({ list: arr, hasmore: more });
				}
			},
			complete: () => {
				wx.hideLoading()
			}
		})
	},
	login: function (user) {
		wx.showLoading({
			title: '正在登录...'
		});
		wx.login({
			success: res => {
				wx.request({
					url: api.login,
					method: 'POST',
					header: app.header,
					data: { 
						loginMethod: 2, 
						wechatCode: res.code, 
						authType: 0, 
						userNickName: user.nickName, 
						userAvatar: user.avatarUrl,
					},
					success: res1 => {
						if (res1.data.resultCode == 200) {
							let r = res1.data.resultData;
							app.header.userId = r.userId;
							this.setData({ isLogin: true, userId: r.userId });
							let obj = Object.assign({}, { userId: r.userId, token: r.token }, wx.getStorageSync('userInfo'));
							wx.setStorageSync('user', obj)
							wx.setStorageSync('validTime', Date.now() + r.validTime * 1000);
							this.showToast('登录成功！');
							this.leaveword();
						} else {
							this.setData({ isLogin: false });
							wx.showModal({
								title: '',
								content: res1.data.resultMsg,
								showCancel: false,
							})
						}
					},
					fail: () => {
						this.showToast('未知错误');
					},
					complete: () => {
						wx.hideLoading()
					}
				})
			},
			fail: () => {
				this.showToast('获取code失败！');
			},
			complete: () => {
				wx.hideLoading()
			}
		})
	},
	getUserInfo: function (e) {
		let user = e.detail.userInfo;
		if (user) {
			wx.setStorageSync('userInfo', user);
			this.login(user);
		} else {}
	},
	getContent: function (e) {
		this.setData({ con: e.detail.value });
	},
	leaveword: function () {
		this.setData({ dialogShow: true, commenteeId: 0, replyName: '说点你想说的吧' });
	},
	dialogHide: function () {
		this.setData({ dialogShow: false });
	},
	publish: function () {
		const dd = this.data;
		if (!dd.con) {
			this.showToast('留言不能为空！');
			return;
		}
		wx.request({
			url: api.comment,
			method: 'POST',
			header: app.header,
			data: {
				comment: dd.con,
				commenteeId: dd.commenteeId ? dd.commenteeId : 0,
				relatedId: dd.relatedId,
				relatedType: 1,
				userId: dd.userId,
			},
			success: res => {
				if (res.data.resultCode == 200 && res.data.resultData) {
					wx.showToast({
						title: '评论成功',
					})
					this.setData({ dialogShow: false });
					this.page = 1;
					this.getCommentList(this.page, 20);
				} else {
					this.showToast(res.data.resultMsg);
				}
			}
		})
	},
	reply: function (e) {
		let data = e.currentTarget.dataset;
		let { uid, uname } = data;
		this.setData({ commenteeId: uid, replyName: '@'+ uname, dialogShow: true });
	},
  onPullDownRefresh: function () {
		wx.stopPullDownRefresh();
		if (this.data.dialogShow) return;
  },
	loadmore: function () {
		if (this.data.hasmore == 2) {
			this.page++;
			this.getCommentList(this.page, 20);
		}
  },
	timeFm: function (t) {
		let now = Date.now();
		let time = (now - t) / 1000;
		if (time > 0 && time <= 5) {
			return '刚刚';
		} 
		if (time > 5 && time < 60) {
			return time + '秒前';
		}
		if (time >= 60 && time < 3600) {
			return Number.parseInt(time / 60) + '分钟前';
		}
		if (time >= 3600 && time < 3600 * 24) {
			return Number.parseInt(time / 3600) + '小时前';
		}
		if (time >= 3600 * 24 && time < 3600 * 24 * 7) {
			return Number.parseInt(time / 3600 / 24) + '天前';
		}
		if (time >= 3600 * 24 * 7) {
			let dd = new Date(time);
			let y = dd.getFullYear();
			let m = dd.getMonth() + 1;
			let d = dd.getDate();
			m = m.toString()[1] ? m : ('0' + m);
			d = d.toString()[1] ? d : ('0' + d);
			return y + '-' + m + '-' + d;
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