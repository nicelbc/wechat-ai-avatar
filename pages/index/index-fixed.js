// pages/index/index.js
// 修复版本 - 不使用require()

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
  async refreshData() {
    // 检查VIP状态
    try {
      const isVip = await app.checkVipStatus();
      this.setData({ isVip });
    } catch (error) {
      console.error('检查VIP状态失败', error);
    }

    // 更新配额
    const quota = wx.getStorageSync('quota');
    if (quota) {
      this.setData({ quota });
    }
  },

  // ==================== 修复的登录函数 ====================
  // 模拟wx.request函数 - 直接定义在页面中
  mockWxRequest(options) {
    return new Promise((resolve, reject) => {
      const { url, method, data, header } = options;

      // 解析URL - 微信小程序不支持URL构造函数，使用字符串处理
      let path = url;
      // 移除协议和域名，只保留路径
      const protocolIndex = url.indexOf('://');
      if (protocolIndex !== -1) {
        const afterProtocol = url.substring(protocolIndex + 3);
        const slashIndex = afterProtocol.indexOf('/');
        if (slashIndex !== -1) {
          path = afterProtocol.substring(slashIndex);
        } else {
          path = '/';
        }
      }

      const token = header && header.Authorization ? header.Authorization.replace('Bearer ', '') : null;

      // 路由分发
      let response;

      if (path === '/auth/login' && method === 'POST') {
        // 模拟登录
        response = new Promise((resolve) => {
          setTimeout(() => {
            const userId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            const userInfo = data.userInfo || {
              openId: userId,
              nickName: '用户' + userId.substr(-4),
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userId,
              gender: Math.random() > 0.5 ? 1 : 2,
              city: '北京',
              province: '北京',
              country: '中国'
            };
            const token = 'mock_token_' + userId;

            resolve({
              statusCode: 200,
              data: {
                token,
                userInfo
              }
            });
          }, 800);
        });
      } else if (path === '/auth/validate' && method === 'POST') {
        response = Promise.resolve({
          statusCode: 200,
          data: { valid: true }
        });
      } else {
        response = Promise.resolve({
          statusCode: 404,
          data: { message: 'API not found' }
        });
      }

      // 处理响应
      Promise.resolve(response).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  },

  // 处理登录 - 包含用户授权
  // 注意：wx.getUserProfile必须在用户点击事件中直接调用
  async handleLogin() {
    this.setData({ isLoading: true });

    try {
      console.log('步骤1: 调用wx.login获取code...');
      // 模拟微信登录 - 获取code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: (res) => {
            if (res.code) {
              console.log('✅ wx.login成功，code:', res.code);
              resolve(res);
            } else {
              console.log('❌ wx.login失败，没有code');
              reject(new Error('获取code失败'));
            }
          },
          fail: (err) => {
            console.log('❌ wx.login失败:', err);
            reject(err);
          }
        });
      });

      console.log('步骤2: 请求用户授权获取用户信息...');
      // 请求用户授权获取用户信息 - 必须在用户点击事件中直接调用
      let userProfileRes;
      try {
        userProfileRes = await new Promise((resolve, reject) => {
          wx.getUserProfile({
            desc: '用于完善用户资料',
            success: (res) => {
              console.log('✅ 用户授权成功');
              console.log('用户信息:', res.userInfo);
              resolve(res);
            },
            fail: (err) => {
              console.log('❌ 用户授权失败:', err);
              reject(err);
            }
          });
        });
      } catch (authError) {
        console.log('❌ 用户授权失败，使用默认用户信息');
        // 如果授权失败，使用默认用户信息
        const userId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        userProfileRes = {
          userInfo: {
            openId: userId,
            nickName: '用户' + userId.substr(-4),
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userId,
            gender: Math.random() > 0.5 ? 1 : 2,
            city: '北京',
            province: '北京',
            country: '中国'
          }
        };
      }

      console.log('步骤3: 调用模拟登录API...');
      // 调用模拟登录API
      const res = await this.mockWxRequest({
        url: 'https://mock-api.local/auth/login',
        method: 'POST',
        data: {
          code: loginRes.code,
          userInfo: userProfileRes.userInfo  // 传递用户信息
        }
      });

      if (res.statusCode === 200) {
        const { token, userInfo } = res.data;
        console.log('✅ 登录API调用成功');
        console.log('Token:', token);
        console.log('用户信息:', userInfo);

        console.log('步骤4: 存储token...');
        wx.setStorageSync('token', token);
        console.log('✅ Token存储成功');

        console.log('步骤5: 更新全局数据...');
        app.globalData.token = token;
        app.globalData.userInfo = userInfo;
        console.log('✅ 全局数据更新成功');

        console.log('步骤6: 更新页面数据...');
        this.setData({
          userInfo,
          isLoading: false,
          showLoginModal: false
        });
        console.log('✅ 页面数据更新成功');

        console.log('步骤7: 显示成功提示...');
        wx.showToast({ title: '登录成功' });
        console.log('✅ 登录流程完成！');

      } else {
        throw new Error(res.data.message || '登录失败');
      }
    } catch (error) {
      console.log('❌ 登录流程失败:', error);
      this.setData({ isLoading: false });

      // 根据错误类型显示不同提示
      const errorMessage = error && error.message ? error.message : '';
      if (errorMessage.includes('授权')) {
        wx.showToast({ title: '需要授权才能登录', icon: 'none' });
      } else if (errorMessage.includes('用户拒绝')) {
        wx.showToast({ title: '用户拒绝授权', icon: 'none' });
      } else {
        wx.showToast({ title: '登录失败', icon: 'error' });
      }
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

  // 跳转到测试页面
  goToTest() {
    wx.navigateTo({ url: '/pages/test/test' });
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
