// pages/vip/vip.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isVip: false,
    vipInfo: {
      expireDate: null,
      startDate: null
    },
    vipPlans: [
      {
        id: 'month',
        name: '月度会员',
        price: 9.9,
        originalPrice: 19.9,
        period: '月',
        features: [
          '无限生成次数',
          '高清下载',
          '专属风格',
          '优先生成队列',
          '去广告'
        ],
        popular: false
      },
      {
        id: 'year',
        name: '年度会员',
        price: 88.8,
        originalPrice: 199.9,
        period: '年',
        features: [
          '无限生成次数',
          '高清下载',
          '专属风格',
          '优先生成队列',
          '去广告',
          '额外赠送2个月'
        ],
        popular: true
      },
      {
        id: 'forever',
        name: '永久会员',
        price: 288.8,
        originalPrice: 588.8,
        period: '永久',
        features: [
          '无限生成次数',
          '高清下载',
          '专属风格',
          '优先生成队列',
          '去广告',
          '终身免费更新',
          '专属客服'
        ],
        popular: false
      }
    ],
    selectedPlan: 'month',
    showPayModal: false,
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

    this.setData({
      userInfo,
      isVip
    });

    // 如果已登录，获取VIP信息
    if (userInfo && app.globalData.token) {
      this.getVipInfo();
    }
  },

  // 刷新数据
  refreshData() {
    // 检查VIP状态
    app.checkVipStatus().then(isVip => {
      this.setData({ isVip });
    });
  },

  // 获取VIP信息
  async getVipInfo() {
    try {
      const res = await wx.request({
        url: 'https://your-api.com/user/vip-info',
        method: 'GET',
        header: { 'Authorization': `Bearer ${app.globalData.token}` }
      });

      if (res.statusCode === 200) {
        this.setData({ vipInfo: res.data });
      }
    } catch (error) {
      console.error('获取VIP信息失败', error);
    }
  },

  // 选择套餐
  selectPlan(e) {
    const { plan } = e.currentTarget.dataset;
    this.setData({ selectedPlan: plan });
  },

  // 购买VIP
  async purchaseVip() {
    if (!app.globalData.token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (!this.data.userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    this.setData({ showPayModal: true });
  },

  // 确认支付
  async confirmPayment() {
    this.setData({ isLoading: true });

    try {
      const plan = this.data.vipPlans.find(p => p.id === this.data.selectedPlan);

      // 调用微信支付
      const res = await wx.request({
        url: 'https://your-api.com/payment/create',
        method: 'POST',
        header: { 'Authorization': `Bearer ${app.globalData.token}` },
        data: {
          planId: plan.id,
          planName: plan.name,
          amount: plan.price * 100, // 转换为分
          userId: app.globalData.userInfo.openId
        }
      });

      if (res.statusCode === 200) {
        const { prepayId, nonceStr, paySign, signType, timeStamp } = res.data;

        // 发起支付
        wx.requestPayment({
          timeStamp,
          nonceStr,
          package: `prepay_id=${prepayId}`,
          signType,
          paySign,
          success: (payRes) => {
            this.setData({ isLoading: false, showPayModal: false });
            wx.showToast({ title: '支付成功' });

            // 更新VIP状态
            app.globalData.isVip = true;
            this.setData({ isVip: true });

            // 刷新VIP信息
            this.getVipInfo();
          },
          fail: (payErr) => {
            this.setData({ isLoading: false });
            if (payErr.errMsg !== 'requestPayment:fail cancel') {
              wx.showToast({ title: '支付失败', icon: 'error' });
            }
          }
        });
      } else {
        throw new Error(res.data.message || '创建订单失败');
      }
    } catch (error) {
      this.setData({ isLoading: false });
      wx.showToast({ title: error.message, icon: 'error' });
    }
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
        // 观看完成，获得体验VIP
        const quota = wx.getStorageSync('quota') || app.globalData.quota;
        quota.remaining = 9999; // 体验VIP无限生成
        wx.setStorageSync('quota', quota);

        wx.showToast({ title: '获得1天VIP体验' });

        // 更新状态
        app.globalData.isVip = true;
        this.setData({ isVip: true });
      } else {
        wx.showToast({ title: '请完整观看广告', icon: 'none' });
      }
    });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showPayModal: false });
  },

  // 跳转到生成页面
  goToGenerate() {
    wx.navigateTo({ url: '/pages/generate/generate?style=avatar' });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: 'AI头像生成器VIP - 无限生成，高清下载',
      path: '/pages/vip/vip',
      imageUrl: '/images/share-vip.png'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'AI头像生成器VIP会员'
    };
  }
});