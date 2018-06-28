// pages/testDetail/testDetail.js
const app = getApp().globalData;
const api = {
  proDetail: app.baseUrl + '/yup/yup-rest/pro-detail', 							//商品详情
  qrcode: app.baseUrl + '/yup/yup-rest/pro-wechat-code', 						//获取小程序码
	login: app.baseUrl + '/yup/yup-rest/login',												//登录
	isApply: app.baseUrl + '/yup/yup-rest/user-is-apply',							//是否已申请
	takeUserYup: app.baseUrl + '/yup/yup-rest/take-user-pro-yup',			//获取yup值
	userYup: app.baseUrl + '/yup/yup-rest/user-pro-yup',							//获取用户yup值
	recommendList: app.baseUrl + '/yup/yup-rest/pro-recommend-list',	//推荐商品列表
	userYupList: app.baseUrl + '/yup/yup-rest/user-yup-list'					//yup获取记录
}
const util = require('./../../utils/util.js');
Page({
  data: {
    id: '',
    canIUse: false,
    qrCode: '../../img/qrcode.jpg',
    isSelf: true,
    signTime: 0,
    showCare: false,
    showJinzhu: false,
    showTip: false,
    showSign: false,
    showGet: false,
    showPic: false,
		showRecord: false,
		showZan: false,
    preview: false,
		isLogin: false
  },
  onLoad: function(options) {
		console.log(options);
		this.setData({ id: options.id, canIUse: app.canIUse });
		if(options.userId){
			this.setData({ shareUserId: options.userId });
			if(options.userId != wx.getStorageSync('user').userId){
				this.setData({ isSelf: false });
				wx.setNavigationBarTitle({
					title: '为TA加速'
				})
				if (options.yupTypeId) {
					this.setData({ shareTypeId: options.yupTypeId });
				}
			}else{
				this.setData({ isSelf: true });
				if (options.apply == 1) {
					wx.setNavigationBarTitle({
						title: '我的申请'
					})
				}
			}
		}else{
			this.setData({ isSelf: true });
			if (options.apply == 1){
				wx.setNavigationBarTitle({
					title: '我的申请'
				})
			}
		}
		if (wx.getStorageSync('user').userId) {
			this.setData({ isLogin: true });
		}
    this.getProDetail();
    // this.getQRCode();
		this.getUserYupList();
		this.getRecommendList();

		wx.authorize({
			scope: 'scope.writePhotosAlbum',
			success: () => {
				this.setData({ refuseAuth: false });
			},
			fail: () => {
				this.setData({ refuseAuth: true });
			}
		})
  },
	onShow: function(){
		let uid = wx.getStorageSync('user').userId;
		if(uid){
			this.setData({ userId: uid });
			this.getIsApply();
			this.getUserYup();
		}
	},
  getProDetail: function() {
    wx.request({
      url: api.proDetail,
      method: 'GET',
      header: app.header,
      data: {
        proId: this.data.id
      },
      success: res => {
        if (res.data.resultCode == 200) {
          let r = res.data.resultData;
          this.setData({ proInfo: r });
        } else {
          this.showToast(res.data.resultMsg);
        }
      },
      fail: () => {
        this.showToast('未知错误！');
      }
    })
  },
  getProp: function(e) {
    this.setData({
      imgW: e.detail.width,
      imgH: e.detail.height
    });
  },
  getQRCode: function() {
    wx.request({
      url: api.qrcode,
      method: 'GET',
      data: {
        proId: this.data.id
      },
      success: res => {
        if (res.data.resultCode == 200) {
          if (res.data.resultData) {
            this.setData({
              qrCode: res.data.resultData
            });
          } else {
            this.showToast('生成小程序码出错');
          }
        } else {
          this.showToast(res.data.resultMsg);
        }
      }
    })
  },
	getUserInfo: function (e) {
		if (e.detail.userInfo) {
			let user = e.detail.userInfo;
			app.userInfo = user;
			wx.setStorageSync('userInfo', user);
			this.setData({
				userAvatar: user.avatarUrl,
				nickName: user.nickName
			});
			this.login()
		} else {
			this.showToast('拒绝授权！')
		}
	},
	login: function () {
		wx.showLoading({
			title: '正在登录...'
		});
		wx.login({
			success: res => {
				wx.request({
					url: api.login,
					method: 'POST',
					header: app.header,
					data: { loginMethod: 2, wechatCode: res.code, authType: 0, userNickName: this.data.nickName, userAvatar: this.data.userAvatar },
					success: res1 => {
						if (res1.data.resultCode == 200) {
							let r = res1.data.resultData;
							this.setData({ isLogin: true, userId: r.userId });
							let obj = Object.assign({}, { userId: r.userId, token: r.token }, wx.getStorageSync('userInfo'));
							wx.setStorageSync('user', obj)
							wx.setStorageSync('validTime', Date.now() + r.validTime * 1000);
							this.showToast('登录成功！');
							this.getIsApply();
							this.handleZan();
							this.getUserYup();
						} else {
							this.setData({ isLogin: false });
							wx.showModal({
								title: '',
								content: res1.data.resultMsg,
								showCancel: false
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
	handleZan: function(){
		this.setData({ showZan: true, zaned: true });
		let id = this.data.shareTypeId;
		if (id) {
			this.takeUserYup(id, 'SHARE_FRIENDS');
		}
	},
	getIsApply: function () {
		app.header.userId = this.data.userId;
		let pid = this.data.id;
		wx.request({
			url: api.isApply,
			method: 'POST',
			header: app.header,
			data: { proIdList: [pid] },
			success: res => {
				if (res.data.resultCode == 200) {
					if (res.data.resultData[0]) {
						this.setData({ isApply: res.data.resultData[0][pid] });
					}
				} else if (res.data.resultCode == 4002) {
					this.showToast('登录已失效');
					this.setData({ isLogin: false })
					wx.clearStorageSync();
				} else {
					wx.showModal({
						title: '',
						content: '服务器错误',
						showCancel: false
					})
				}
			},
			complete: () => {
				app.header.userId = null;
			}
		})
	},
	takeUserYup: function(id, code) {
		let userId = wx.getStorageSync('user').userId;
		let uid = this.data.isSelf ? userId : this.data.shareUserId;
		let tuid = userId;
		wx.request({
			url: api.takeUserYup,
			method: 'POST',
			header: { 'Content-type': 'application/x-www-form-urlencoded', userId: uid },
			data: {
				proId: this.data.id,
				yupTypeId: id,
				triggerUserId: tuid
			},
			success: res => {
				if (res.data.resultCode == 200) {
					if (code == 'SIGN') {
						let num = this.data.myYup;
						let add = res.data.resultData | 0;
						num += add;
						this.setData({ addSignYup: add, myYup: num });
					}
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
	getUserYup: function() {
		let uid = this.data.isSelf ? wx.getStorageSync('user').userId : this.data.shareUserId;
		wx.request({
			url: api.userYup,
			method: 'GET',
			header: { userId: uid },
			data: { proId: this.data.id },
			success: res => {
				if (res.data.resultCode == 200) {
					let r = res.data.resultData;
					let { myYup, maxYup, userProYupInfoList: yupList, yupListInfoVO: yupBoard } = r;
					this.setData({ myYup: myYup, maxYup: maxYup, yupList: yupList, yupBoard: yupBoard });
					for (let v of yupList) {
						if (v.yupTypeCode == 'SHARE_FRIENDS') {
							this.setData({ friendYup: v.yup });
						}
					}
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
	getUserYupList: function() {
		let uid = this.data.isSelf ? wx.getStorageSync('user').userId : this.data.shareUserId;
		wx.request({
			url: api.userYupList,
			method: 'GET',
			header: { userId: uid },
			data: { proId: this.data.id },
			success: res => {
				if(res.data.resultCode == 200){
					let r = res.data.resultData;
					if(r && r.length > 0){
						for(let i of r){
							i.getTime = util.formatTime(new Date(i.getTime), '-').substr(5);
							i.userName = i.userName.substr(0, 1) + '**';
						}
					}else{
						r = [];
					}
					this.setData({ userYupList: r });
				}else{
					if(res.data.resultMsg){
						this.showToast(res.data.resultMsg);
					}else{
						this.showToast('yup记录获取错误！');
					}
				}
			}
		})
	},
	getRecommendList: function() {
		wx.request({
			url: api.recommendList,
			method: 'GET',
			data: { proId: this.data.id },
			success: res => {
				if (res.data.resultCode  == 200) {
					this.setData({ recommendList: res.data.resultData });
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
  signIn: function(e) {
		let data = e.currentTarget.dataset;
		let id = Number.parseInt(data.id);
		let code = data.code;
		this.takeUserYup(id, code);
    let dd = new Date();
    dd.setHours(23);
    dd.setMinutes(59);
    dd.setSeconds(59);
    let signTimes = dd.getTime() - Date.now();
    this.setData({ showSign: true });
    if (signTimes > 0) {
      this.countdown(signTimes);
      let timer = setInterval(() => {
        if (signTimes > 1000) {
          signTimes -= 1000;
          this.countdown(signTimes);
        } else {
          clearInterval(timer);
          this.setData({ showSign: false })
        }
      }, 1000);
    }
  },
  countdown: function(t) {
    let h = parseInt(t / 1000 / 60 / 60);
    let m = parseInt(t / 1000 / 60 % 60);
    let s = parseInt(t / 1000 % 60);
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    let time = h + ':' + m + ':' + s;
    this.setData({ signTime: time });
  },
	openSetting: function(e) {
		console.log(e);
		const that = this;
		if (e.detail.authSetting['scope.writePhotosAlbum']) {
			this.makeShareImg();
		} else {
			this.showToast('授权失败！');
		}
	},
  savePhoto: function(path) {
    const that = this;
    wx.getSetting({
      success: res1 => {
        if (!res1.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              wx.saveImageToPhotosAlbum({
                filePath: path,
                success: () => {
                  wx.showToast({
                    title: '保存成功~',
                  })
                }
              })
            },
            fail: () => {
              wx.showModal({
                title: '未授权，无法保存到相册',
                content: '是否授权？',
                cancelColor: '#ff6960',
                confirmColor: '#151419',
                confirmText: '授权',
                success: res => {
                  if (res.confirm) {
                    wx.openSetting({
                      success: res2 => {
                        if (res2.authSetting['scope.writePhotosAlbum']) {
                          wx.showToast({
                            title: '授权成功~'
                          })
                          setTimeout(function() {
                            wx.saveImageToPhotosAlbum({
                              filePath: path,
                              success: () => {
                                wx.showToast({
                                  title: '保存成功~'
                                })
                              }
                            })
                          }, 1000);
                        } else {
                          that.showToast('授权失败！')
                        }
                      }
                    })
                  }
                }
              })
            }
          })
        } else {
          wx.saveImageToPhotosAlbum({
            filePath: path,
            success: () => {
              wx.showToast({
                title: '保存成功~',
              })
            }
          })
        }
      }
    })
  },
  preview: function(e) {
    if (this.data.isPreview) {
      this.setData({ isPreview: false });
    } else {
      this.setData({ isPreview: true });
    }
  },
  makeShareImg: function() {
    if (this.data.making) return;
    this.setData({ making: true, showPic: true });
    wx.showLoading({
      title: '正在保存...'
    })
    let dd = this.data;
    let img = dd.proInfo.coverImg;
    let code = dd.qrCode;
    img = img.replace('http://', '');
    img = img.replace(img.split('/')[0], app.imgHost2);
    code = code.replace('http://', '');
    code = code.replace(code.split('/')[0], app.imgHost);
    wx.downloadFile({
      url: img,
      success: res => {
        img = res.tempFilePath;
        wx.downloadFile({
          url: code,
          success: res1 => {
            code = res1.tempFilePath;
            exec();
          },
          fail: res1 => {
            wx.hideLoading();
            this.setData({ making: false });
            wx.showModal({
              title: '',
              content: JSON.stringify(res1),
              showCancel: false
            })
          }
        })
      },
      fail: res => {
        wx.hideLoading();
        this.setData({ making: false });
        wx.showModal({
          title: '',
          content: JSON.stringify(res),
          showCancel: false
        })
      }
    })
    const that = this;

    function exec() {
      let name = dd.proInfo.proName;
      name = name.length > 13 ? (name.substr(0, 13) + '...') : name;
      let r = wx.getSystemInfoSync().windowWidth / 375;
      let w = 550 * r;
      let h = 750 * r;
      let imgWidth = dd.imgW / dd.imgH * 550;
      let imgX = (550 - imgWidth) * r / 2;
      imgX = imgX < 0 ? 0 : imgX;
      let ctx = wx.createCanvasContext('cv', that);

      ctx.beginPath();
      ctx.setFillStyle('#F5F7F6');
      ctx.fillRect(0, 0, w, 550 * r);
      ctx.closePath();

      ctx.beginPath();
      ctx.drawImage(img, imgX, 0, imgWidth, 550 * r);
      ctx.setFillStyle('#ffffff');
      ctx.fillRect(0, 550 * r, w, 250 * r);
      ctx.closePath();

      ctx.beginPath();
      ctx.setFontSize(24 * r);
      ctx.setTextBaseline('top');
      ctx.setFillStyle('#262628');
      ctx.fillText('我正在YUP新潮申请试用', 20, 580 * r);
      ctx.fillText('「' + name + '」', 20, 614 * r);
      ctx.fillText('你也来一起参与领取吧', 20, 648 * r);
      ctx.closePath();

      ctx.beginPath();
      ctx.setFontSize(20 * r);
      ctx.setFillStyle('rgba(0,0,0,0.5)');
      ctx.fillText('扫描小程序码免费领取！', 20, 690 * r);
      ctx.closePath();

      ctx.beginPath();
      ctx.drawImage(code, 352 * r + 20, 570 * r, 158 * r, 158 * r);
      ctx.closePath();

      ctx.draw(true, setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'cv',
          x: 0,
          y: 0,
          width: w,
          height: h,
          destWidth: 1100,
          destHeight: 1500,
          success: res => {
            wx.hideLoading();
            that.setData({ making: false });
            that.savePhoto(res.tempFilePath);
          },
          fail: res => {
            that.setData({ making: false });
            wx.hideLoading();
          }
        }, that)
      }, 100));
    }
  },
  save2photo: function(e) {
    let src = e.currentTarget.dataset.src;
    wx.showModal({
      title: '',
      content: '是否保存图片？',
      success: res => {
        if (res.confirm) {
          this.savePhoto(src);
        }
      }
    })
  },
  showDialog: function(e) {
    let name = e.currentTarget.dataset.name;
    this.setData({ [name]: true });
  },
  closeDialog: function(e) {
    let name = e.currentTarget.dataset.name;
    this.setData({ [name]: false });
  },
  onShareAppMessage: function() {
    let dd = this.data.proInfo;
		let uid = '', isSelf = false;
		if (!this.data.isSelf){
			uid = this.data.shareUserId;
		}else{
			isSelf = true;
			uid = wx.getStorageSync('user').userId;
		}
		let query = '?id=' + dd.proId;
		if(uid){
			query += '&userId=' + uid;
		}
		if(isSelf){
			let yupId = 0;
			for(let v of this.data.yupList) {
				if (v.yupTypeCode == 'SHARE_FRIENDS') {
					yupId = v.yupTypeId;
					break;
				}
			}
			query += '&apply=1&yupTypeId='+ yupId;
		}
    return {
      title: dd.proName,
			path: 'pages/applySuccess/applySuccess' + query,
      imageUrl: dd.coverImg
    }
  },
  showToast: function(txt) {
    const that = this;
    let obj = {};
    obj.show = true;
    obj.title = txt;
    this.setData({
      toast: obj
    });
    setTimeout(function() {
      obj.show = false;
      obj.title = '';
      that.setData({
        toast: obj
      });
    }, 2000);
  }
})