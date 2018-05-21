// pages/ucenter/ucenter.js
const app = getApp()
Page({
  data: {
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userAvatar: '',
    nickName: '',
  },
  onLoad: function (options) {
    const user = wx.getStorageSync('userInfo');
    if (user != null && user != '') {
      this.setData({ userAvatar: user.avatarUrl, nickName: user.nickName, hasUserInfo: true });
    } else {
      if (this.data.canIUse) {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.userInfoReadyCallback = res => {
          this.setData({
            userAvatar: res.userInfo.avatarUrl,
            nickName: res.userInfo.nickName,
            hasUserInfo: true
          })
        }
      } else {
        // 在没有 open-type=getUserInfo 版本的兼容处理
        wx.getUserInfo({
          success: res => {
            app.globalData.userInfo = res.userInfo
            wx.setStorageSync("userInfo", res.userInfo)
            this.setData({
              userAvatar: res.userInfo.avatarUrl,
              nickName: res.userInfo.nickName,
              hasUserInfo: true
            })
          }
        })
      }
    }
  },
  getUserInfo: function (e) {
    if (e.detail.userInfo) {
      let user = e.detail.userInfo;
      app.globalData.userInfo = user;
      wx.setStorageSync("userInfo", user);
      this.setData({
        userAvatar: user.avatarUrl,
        nickName: user.nickName,
        hasUserInfo: true
      })
    } else {
      wx.showToast({
        title: '拒绝授权！',
        icon: 'none'
      })
    }
  },
  onShareAppMessage: function () {
    return {
      title: 'YUP新潮',
      path: '/pages/index/index',
      imageUrl: '../../img/logo.jpg'
    }
  }
})