//app.js
App({
	onLaunch: function () {
		//判断运行环境
		{
			if (!wx.getStorageSync('prod001')) {
				wx.clearStorageSync();
				wx.setStorageSync('prod001', '1');
			}
		}
		// 获取用户信息
		wx.getSetting({
			success: res => {
				if (res.authSetting['scope.userInfo']) {
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
					wx.getUserInfo({
						success: res => {
							// 可以将 res 发送给后台解码出 unionId
							this.globalData.userInfo = res.userInfo
							wx.setStorageSync("userInfo", res.userInfo)
							// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
							// 所以此处加入 callback 以防止这种情况
							if (this.userInfoReadyCallback) {
								this.userInfoReadyCallback(res)
							}
						}
					})
				}
			}
		})
		
		if (wx.canIUse('button.open-type.openSetting')) {
			this.globalData.canIUse = true;
		} else {
			let arr = wx.getSystemInfoSync().SDKVersion.split('.');
			if (arr[0] >= 2 && arr[1] == 0 && arr[2] >= 7) {
				this.globalData.canIUse = true;
			} else {
				this.globalData.canIUse = false;
			}
		}

		if (wx.getUpdateManager) {
			const updateManager = wx.getUpdateManager();
			updateManager.onCheckForUpdate(res => {
				if (res.hasUpdate) {
					updateManager.onUpdateReady(() => {
						wx.showModal({
							title: '更新提示',
							content: '新版本已经准备好，是否重启应用？',
							success: res => {
								if (res.confirm) {
									// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
									updateManager.applyUpdate()
								}
							}
						})
					})
					updateManager.onUpdateFailed(() => {
						// 新的版本下载失败
						wx.showModal({
							title: '提示',
							content: '下载失败！',
							showCancel: false
						})
					})
				}
			})
		}
	},
	globalData: {
		userInfo: null,
		baseUrl: 'https://api.yupfashion.cn',
		// baseUrl: 'http://apidev.yupfashion.cn',
		header: {
			'content-type': 'application/json',
		},
		imgHost: 'https://pic.yupfashion.cn',			//小程序码
		imgHost2: 'https://propic.yupfashion.cn',	//封面图
		env: 'dev'
	}
})