// app.js
App({
  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus();

    // 初始化全局数据
    this.globalData = {
      userInfo: null,
      isVip: false,
      quota: {
        remaining: 3,
        adCount: 0,
        lastReset: Date.now()
      },
      token: wx.getStorageSync('token') || null
    };

    // 每日重置配额
    this.resetDailyQuota();
  },

  onShow() {
    // 每次显示时检查配额
    this.checkQuota();
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (token) {
      // 验证token有效性
      this.validateToken(token).then(valid => {
        if (!valid) {
          wx.removeStorageSync('token');
          this.globalData.token = null;
        }
      });
    }
  },

  // 验证token
  async validateToken(token) {
    try {
      const res = await wx.request({
        url: 'https://your-api.com/auth/validate',
        method: 'POST',
        header: { 'Authorization': `Bearer ${token}` }
      });
      return res.statusCode === 200;
    } catch (error) {
      return false;
    }
  },

  // 检查配额
  checkQuota() {
    const quota = wx.getStorageSync('quota');
    if (!quota) {
      this.resetDailyQuota();
      return;
    }

    const now = Date.now();
    const lastReset = quota.lastReset || now;
    const oneDay = 24 * 60 * 60 * 1000;

    // 如果超过一天，重置配额
    if (now - lastReset > oneDay) {
      this.resetDailyQuota();
    }
  },

  // 重置每日配额
  resetDailyQuota() {
    const quota = {
      remaining: 3,
      adCount: 0,
      lastReset: Date.now()
    };
    wx.setStorageSync('quota', quota);
    this.globalData.quota = quota;
  },

  // 微信登录
  async wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: async (res) => {
          if (res.code) {
            try {
              // 发送code到后端获取token
              const result = await wx.request({
                url: 'https://your-api.com/auth/login',
                method: 'POST',
                data: { code: res.code }
              });

              if (result.statusCode === 200) {
                const { token, userInfo } = result.data;
                wx.setStorageSync('token', token);
                this.globalData.token = token;
                this.globalData.userInfo = userInfo;
                resolve({ success: true, userInfo });
              } else {
                reject(new Error('登录失败'));
              }
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('获取code失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 获取用户信息
  async getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: async (res) => {
          const userInfo = res.userInfo;
          this.globalData.userInfo = userInfo;

          // 更新用户信息到后端
          if (this.globalData.token) {
            try {
              await wx.request({
                url: 'https://your-api.com/user/update',
                method: 'POST',
                header: { 'Authorization': `Bearer ${this.globalData.token}` },
                data: { userInfo }
              });
            } catch (error) {
              console.error('更新用户信息失败', error);
            }
          }

          resolve(userInfo);
        },
        fail: reject
      });
    });
  },

  // 检查VIP状态
  async checkVipStatus() {
    if (!this.globalData.token) return false;

    try {
      const res = await wx.request({
        url: 'https://your-api.com/user/vip',
        method: 'GET',
        header: { 'Authorization': `Bearer ${this.globalData.token}` }
      });

      if (res.statusCode === 200) {
        this.globalData.isVip = res.data.isVip;
        return res.data.isVip;
      }
    } catch (error) {
      console.error('检查VIP状态失败', error);
    }

    return false;
  },

  // 全局数据
  globalData: {
    userInfo: null,
    isVip: false,
    quota: {
      remaining: 3,
      adCount: 0,
      lastReset: Date.now()
    },
    token: null
  }
});