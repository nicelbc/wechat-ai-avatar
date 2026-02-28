// pages/user/user.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isVip: false,
    quota: {
      remaining: 3,
      adCount: 0
    },
    stats: {
      totalGenerated: 0,
      avatarCount: 0,
      wallpaperCount: 0,
      coupleCount: 0,
      artCount: 0
    },
    showLogoutModal: false,
    isLoading: false
  },

  onLoad() {
    this.initData();
  },

  onShow() {
    this.refreshData();
  },

  // 初始化数据
  initData() {
    const userInfo = app.globalData.userInfo;
    const isVip = app.globalData.isVip;
    const quota = wx.getStorageSync('quota') || app.globalData.quota;

    // 计算统计数据
    const history = wx.getStorageSync('imageHistory') || [];
    const stats = {
      totalGenerated: history.length,
      avatarCount: history.filter(img => img.style === 'avatar').length,
      wallpaperCount: history.filter(img => img.style === 'wallpaper').length,
      coupleCount: history.filter(img => img.style === 'couple').length,
      artCount: history.filter(img => img.style === 'art').length
    };

    this.setData({
      userInfo,
      isVip,
      quota,
      stats
    });
  },

  // 刷新数据
  refreshData() {
    // 检查VIP状态
    app.checkVipStatus().then(isVip => {
      this.setData({ isVip });
    });

    // 更新配额
    const quota = wx.getStorageSync('quota');
    if (quota) {
      this.setData({ quota });
    }

    // 重新计算统计数据
    const history = wx.getStorageSync('imageHistory') || [];
    const stats = {
      totalGenerated: history.length,
      avatarCount: history.filter(img => img.style === 'avatar').length,
      wallpaperCount: history.filter(img => img.style === 'wallpaper').length,
      coupleCount: history.filter(img => img.style === 'couple').length,
      artCount: history.filter(img => img.style === 'art').length
    };

    this.setData({ stats });
  },

  // 处理登录
  async handleLogin() {
    this.setData({ isLoading: true });

    try {
      await app.wxLogin();
      const userInfo = await app.getUserInfo();

      this.setData({
        userInfo,
        isLoading: false
      });

      wx.showToast({ title: '登录成功' });
    } catch (error) {
      this.setData({ isLoading: false });
      wx.showToast({ title: '登录失败', icon: 'error' });
    }
  },

  // 退出登录
  async handleLogout() {
    this.setData({ showLogoutModal: true });
  },

  // 确认退出
  confirmLogout() {
    // 清除登录信息
    wx.removeStorageSync('token');
    app.globalData.token = null;
    app.globalData.userInfo = null;
    app.globalData.isVip = false;

    this.setData({
      userInfo: null,
      isVip: false,
      showLogoutModal: false
    });

    wx.showToast({ title: '已退出登录' });

    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  // 跳转到VIP页面
  goToVip() {
    wx.navigateTo({ url: '/pages/vip/vip' });
  },

  // 跳转到画廊
  goToGallery() {
    wx.navigateTo({ url: '/pages/gallery/gallery' });
  },

  // 跳转到生成页面
  goToGenerate() {
    wx.navigateTo({ url: '/pages/generate/generate?style=avatar' });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showLogoutModal: false });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: 'AI头像生成器 - 一键生成个性化头像',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'AI头像生成器'
    };
  }
});