// pages/index/index.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isVip: false,
    quota: {
      remaining: 3,
      adCount: 0
    },
    features: [
      {
        icon: '✨',
        title: 'AI头像生成',
        desc: '一键生成个性化头像',
        page: '/pages/generate/generate?style=avatar'
      },
      {
        icon: '🎨',
        title: 'AI壁纸生成',
        desc: '海量风格任你选择',
        page: '/pages/generate/generate?style=wallpaper'
      },
      {
        icon: '💝',
        title: '情侣头像',
        desc: '生成专属情侣头像',
        page: '/pages/generate/generate?style=couple'
      },
      {
        icon: '🌈',
        title: '艺术风格',
        desc: '梵高、莫奈等大师风格',
        page: '/pages/generate/generate?style=art'
      }
    ],
    hotStyles: [
      { name: '二次元', icon: '🎀', prompt: '二次元风格，动漫角色' },
      { name: '写实', icon: '👤', prompt: '写实风格，高清人像' },
      { name: '卡通', icon: '🐱', prompt: '卡通风格，可爱Q版' },
      { name: '古风', icon: '🏮', prompt: '古风汉服，仙气飘飘' },
      { name: '科幻', icon: '🚀', prompt: '科幻未来，赛博朋克' },
      { name: '梦幻', icon: '✨', prompt: '梦幻风格，唯美浪漫' }
    ],
    showLoginModal: false,
    showVipModal: false,
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

    this.setData({
      userInfo,
      isVip,
      quota
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
  },

  // 处理登录
  async handleLogin() {
    this.setData({ isLoading: true });

    try {
      await app.wxLogin();
      const userInfo = await app.getUserInfo();

      this.setData({
        userInfo,
        isLoading: false,
        showLoginModal: false
      });

      wx.showToast({ title: '登录成功' });
    } catch (error) {
      this.setData({ isLoading: false });
      wx.showToast({ title: '登录失败', icon: 'error' });
    }
  },

  // 跳转到生成页面
  goToGenerate(e) {
    const { style, page } = e.currentTarget.dataset;

    // 检查登录状态
    if (!app.globalData.token) {
      this.setData({ showLoginModal: true });
      return;
    }

    // 检查配额
    const quota = wx.getStorageSync('quota');
    if (!quota || quota.remaining <= 0) {
      this.showQuotaModal();
      return;
    }

    // 跳转页面
    if (page) {
      wx.navigateTo({ url: page });
    } else if (style) {
      wx.navigateTo({ url: `/pages/generate/generate?style=${style}` });
    }
  },

  // 跳转到VIP页面
  goToVip() {
    wx.navigateTo({ url: '/pages/vip/vip' });
  },

  // 跳转到画廊
  goToGallery() {
    wx.navigateTo({ url: '/pages/gallery/gallery' });
  },

  // 跳转到用户页面
  goToUser() {
    wx.navigateTo({ url: '/pages/user/user' });
  },

  // 显示配额不足弹窗
  showQuotaModal() {
    this.setData({ showQuotaModal: true });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      showLoginModal: false,
      showVipModal: false,
      showQuotaModal: false
    });
  },

  // 使用激励视频广告
  useRewardedVideoAd() {
    const ad = wx.createRewardedVideoAd({
      adUnitId: 'your-ad-unit-id'
    });

    ad.onLoad(() => {
      ad.show().catch(err => {
        console.error('广告显示失败', err);
        wx.showToast({ title: '广告加载失败', icon: 'error' });
      });
    });

    ad.onClose((res) => {
      if (res.isEnded) {
        // 观看完成，增加配额
        const quota = wx.getStorageSync('quota') || app.globalData.quota;
        quota.remaining += 3;
        quota.adCount = 0;
        wx.setStorageSync('quota', quota);
        this.setData({ quota, showQuotaModal: false });
        wx.showToast({ title: '获得3次免费生成' });
      } else {
        wx.showToast({ title: '请完整观看广告', icon: 'none' });
      }
    });
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
      title: 'AI头像生成器 - 一键生成个性化头像'
    };
  }
});