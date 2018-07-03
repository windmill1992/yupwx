// pages/testDetail/testDetail.js
const app = getApp().globalData;
const api = {
  proDetail: app.baseUrl + '/yup/yup-rest/pro-detail', 							//商品详情
  // qrcode: app.baseUrl + '/yup/yup-rest/pro-wechat-code', 						//获取小程序码1
	qrcode: app.baseUrl + '/yup/yup-rest/pro-user-wechat-code', 			//获取小程序码
	login: app.baseUrl + '/yup/yup-rest/login',												//登录
	isApply: app.baseUrl + '/yup/yup-rest/user-is-apply',							//是否已申请
	takeUserYup: app.baseUrl + '/yup/yup-rest/take-user-pro-yup',			//获取yup值
	userYup: app.baseUrl + '/yup/yup-rest/user-pro-yup',							//获取用户yup值
	recommendList: app.baseUrl + '/yup/yup-rest/pro-recommend-list',	//推荐商品列表
	userYupList: app.baseUrl + '/yup/yup-rest/user-yup-list',					//yup获取记录
	userProStatus: app.baseUrl + '/yup/yup-rest/user-pro-status'			//查询用户商品状态
}
const util = require('./../../utils/util.js');
Page({
  data: {
    id: '',
    canIUse: false,
    qrCode: '../../img/qrcode.jpg',
    isSelf: true,
    showCare: false,
    showJinzhu: false,
    showTip: false,
    showSign: false,
    showGet: false,
    showPic: false,
		showRecord: false,
		showZan: false,
    preview: false,
		isLogin: false,
		userStatus: {}
  },
  onLoad: function(options) {
		console.log(options);
		if (options.scene) {
			let id = 0, userId = 0;
			let arr = decodeURIComponent(options.scene).split('&');
			let arr1 = arr[0].split('_');
			let arr2 = arr[1].split('_');
			if (arr1[0] == 'proId') {
				id = arr1[1];
				userId = arr2[1];
			} else {
				id = arr2[1];
				userId = arr1[1];
			}
			this.setData({ id: id, shareUserId: userId, shareOnline: true });
			if (userId != wx.getStorageSync('user').userId) {
				this.setData({ isSelf: false });
				wx.setNavigationBarTitle({
					title: '为TA加速'
				})
				if (options.yupTypeId) {
					this.setData({ shareTypeId: options.yupTypeId });
				} else {
					this.setData({ shareTypeId: 5 });
				}
			} else {
				this.setData({ isSelf: true });
				if (options.apply == 1) {
					wx.setNavigationBarTitle({
						title: '我的申请'
					})
				}
			}
		} else {
			this.setData({ id: options.id, canIUse: app.canIUse });
			if (options.isPush && options.isPush == 1) {
				this.setData({ isSelf: true, shareUserId: options.userId, isPush: true });
				wx.setNavigationBarTitle({
					title: '我的申请'
				})
			} else {
				if (options.userId) {
					this.setData({ shareUserId: options.userId });
					if (options.userId != wx.getStorageSync('user').userId) {
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
					wx.authorize({
						scope: 'scope.writePhotosAlbum',
						success: () => {
							this.setData({ refuseAuth: false });
						},
						fail: () => {
							this.setData({ refuseAuth: true });
						}
					})
				}
			}
		}
		if (wx.getStorageSync('user').userId) {
			let user = wx.getStorageSync('user');
			this.setData({ 
				isLogin: true, 
				userId: user.userId,
				userAvatar: user.avatarUrl,
				nickName: user.nickName
			});
		}
    this.getProDetail();
		if (this.data.isSelf && this.data.isLogin) {
    	this.getQRCode();
			this.getUserProStatus();
		}
		this.getUserYupList();
		this.getRecommendList();
  },
	onShow: function(){
		let uid = wx.getStorageSync('user').userId;
		if (uid) {
			this.setData({ userId: uid });
			this.getIsApply();
		}
		this.getUserYup();
		this.getUserYupList();
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
		app.header.userId = this.data.userId;
    wx.request({
      url: api.qrcode,
      method: 'GET',
			header: app.header,
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
	getUserProStatus: function () {
		app.header.userId = this.data.userId;
		wx.request({
			url: api.userProStatus,
			method: 'GET',
			header: app.header,
			data: { proId: this.data.id },
			success: res => {
				if (res.data.resultCode == 200) {
					this.setData({ userStatus: res.data.resultData });
				} else {
					if (res.data.resultMsg) {
						this.showToast(res.data.resultMsg);
					} else {
						this.showToast('查询中奖状态错误');
					}
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
							let userInfo = wx.getStorageSync('userInfo');
							this.setData({ 
								isLogin: true, 
								userId: r.userId, 
								userAvatar: userInfo.avatarUrl, 
								nickName: userInfo.nickName,
							});
							let obj = Object.assign({}, { userId: r.userId, token: r.token }, userInfo);
							wx.setStorageSync('user', obj);
							wx.setStorageSync('validTime', Date.now() + r.validTime * 1000);
							this.showToast('登录成功！');
							this.getIsApply();
							this.getUserYup();
							this.getQRCode();
							this.getUserProStatus();
							if (!this.data.isPush) {
								this.handleZan();
							} else {
								wx.authorize({
									scope: 'scope.writePhotosAlbum',
									success: () => {
										this.setData({ refuseAuth: false });
									},
									fail: () => {
										this.setData({ refuseAuth: true });
									}
								})
							}
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
			if (this.data.shareOnline) {
				this.takeUserYup(id, 'SHARE_MOMENTS');
			} else {
				this.takeUserYup(id, 'SHARE_FRIENDS');
			}
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
					if (res.data.resultData) {
						this.setData({ isApply: res.data.resultData[pid] });
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
		let uid = (this.data.isSelf && userId) ? userId : this.data.shareUserId;
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
					if (code == 'SIGN' || code == 'SHARE_FRIENDS') {
						let num = this.data.myYup;
						let add = res.data.resultData | 0;
						num += add;
						this.setData({ addSignYup: add, myYup: num });
						this.getUserYup();
						if (code == 'SHARE_FRIENDS' && add == 0) {
							this.showToast('您已点过赞了哦~');
						}
					}
					this.getUserYupList();
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
		let userId = wx.getStorageSync('user').userId;
		let uid = (this.data.isSelf && userId) ? userId : this.data.shareUserId;
		app.header.userId = uid;
		wx.showLoading({
			title: '加载中...'
		})
		wx.request({
			url: api.userYup,
			method: 'GET',
			header: app.header,
			data: { proId: this.data.id },
			success: res => {
				if (res.data.resultCode == 200) {
					let r = res.data.resultData;
					let { myYup, maxYup, userProYupInfoList: yupList, yupListInfoVO: yupBoard } = r;
					for (let v of yupBoard.yupList) {
						if (v.userId != this.data.userId) {
							v.userName = [...v.userName][0] + '**';
						}
					}
					this.setData({ myYup: myYup, maxYup: maxYup, yupList: yupList, yupBoard: yupBoard });
				} else {
					if (res.data.resultMsg) {
						this.showToast(res.data.resultMsg);
					} else {
						this.showToast('服务器错误！');
					}
				}
			},
			complete: () => {
				wx.hideLoading();
			}
		})
	},
	getUserYupList: function() {
		let userId = wx.getStorageSync('user').userId;
		let uid = (this.data.isSelf && userId) ? userId : this.data.shareUserId;
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
    this.setData({ showSign: true });
  },
	getCoupons: function (e) {
		let url = e.currentTarget.dataset.url;
		wx.setClipboardData({
			data: url,
			success: res => {
				this.setData({ showGet: true });
			}
		})
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
      let r = wx.getSystemInfoSync().windowWidth / 375;
      let w = 750 * r;
      let h = 1334 * r;
			let x = 60 * r;
			let y = 67 * r;
      let imgWidth = dd.imgW / dd.imgH * 400;
			let imgX = (w - imgWidth * r) / 2;
      imgX = imgX < 0 ? 0 : imgX;
      let ctx = wx.createCanvasContext('cv', that);
			
			ctx.beginPath();
			ctx.setFillStyle('#3d3bee');
			ctx.fillRect(0, 0, w, h);
			ctx.closePath();

      ctx.beginPath();
			ctx.drawImage('../../img/share-bg.png', x, y, w - 120 * r, h - 134 * r);
      ctx.closePath();

      ctx.beginPath();
      ctx.setFillStyle('#F5F7F6');
      ctx.fillRect(imgX, 30 + y, imgWidth, imgWidth);
      ctx.closePath();

      ctx.beginPath();
			ctx.drawImage(img, imgX, 30 + y, imgWidth, imgWidth);
      ctx.closePath();

      ctx.beginPath();
      ctx.setFontSize(22 * r);
      ctx.setTextBaseline('top');
      ctx.setFillStyle('#262628');
			ctx.fillText('我正在YUP新潮申请试用：' + name.substr(0, 8), imgX, imgWidth + 50 + y, imgWidth);
			ctx.fillText(name.substr(8, 22), imgX, imgWidth + 90 + y, imgWidth);
			ctx.fillText(name.substr(22) + '，你也来一起参与领取吧', imgX, imgWidth + 130 + y);
      ctx.closePath();

			ctx.beginPath();
			ctx.setFontSize(22 * r);
			ctx.setFillStyle('#9b9b9b');
			ctx.fillText('# 全球潮牌 免费申请 #', 103 * r * 2 + x, h / 2 + 40);
			ctx.closePath();

			ctx.beginPath();
			ctx.setFontSize(56 * r);
			ctx.font = 'bold';
			ctx.setFillStyle('#000000');
			ctx.fillText('免费的', 113 * r * 2 + x, h / 2 + 120);
			ctx.closePath();

			ctx.beginPath();
			ctx.setFontSize(56 * r);
			ctx.setFillStyle('#FF5850');
			ctx.fillText('了解一下', 97 * r * 2 + x, h / 2 + 200);
			ctx.closePath();

      ctx.beginPath();
      ctx.drawImage(code, (w - 160 * r) / 2, h / 2 + 320, 160 * r, 160 * r);
      ctx.closePath();

      ctx.beginPath();
      ctx.setFontSize(22 * r);
      ctx.setFillStyle('#9b9b9b');
			ctx.fillText('长按扫码免费领潮牌', 106 * r * 2 + x, h - 80 - y);
      ctx.closePath();

      ctx.draw(true, setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'cv',
          x: 0,
          y: 0,
          width: w,
          height: h,
          destWidth: 1260,
          destHeight: 2400,
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
	navToDetail: function() {
		if (this.data.isApply) {
			wx.redirectTo({
				url: '/pages/applySuccess/applySuccess?id='+ this.data.id + '&apply=1'
			})
		} else {
			wx.redirectTo({
				url: '/pages/productDetail/productDetail?id='+ this.data.id
			})
		}
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
		if (uid) {
			query += '&userId=' + uid;
		}
		if (isSelf) {
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
			title: '拜托帮我点一下，马上可以免费得【' + dd.proName + '】了',
			path: 'pages/applySuccess/applySuccess' + query,
      imageUrl: dd.coverImg
    }
  },
	onPullDownRefresh: function () {
		wx.stopPullDownRefresh();
		this.getUserYup();
		this.getUserYupList();
		this.getUserProStatus();
	},
  showToast: function(txt) {
    const that = this;
    let obj = {};
    obj.show = true;
    obj.title = txt;
    this.setData({ toast: obj });
    setTimeout(function() {
      obj.show = false;
      obj.title = '';
      that.setData({ toast: obj });
    }, 2000);
  }
})