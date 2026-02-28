// backend/api.js
// API服务配置和基础请求方法

const API_BASE_URL = 'https://your-api-domain.com/api/v1';

// 请求拦截器
function requestInterceptor(options) {
  const token = wx.getStorageSync('token') || '';
  const defaultHeader = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };

  return {
    ...options,
    header: { ...defaultHeader, ...options.header }
  };
}

// 基础请求方法
function request(options) {
  return new Promise((resolve, reject) => {
    const finalOptions = requestInterceptor(options);

    wx.request({
      url: `${API_BASE_URL}${finalOptions.url}`,
      method: finalOptions.method || 'GET',
      header: finalOptions.header,
      data: finalOptions.data || {},
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (err) => {
        reject(new Error('网络请求失败'));
      }
    });
  });
}

// 用户相关API
const userApi = {
  // 登录
  login: (code) => request({
    url: '/user/login',
    method: 'POST',
    data: { code }
  }),

  // 获取用户信息
  getUserInfo: () => request({
    url: '/user/info',
    method: 'GET'
  }),

  // 更新用户信息
  updateUserInfo: (userInfo) => request({
    url: '/user/info',
    method: 'PUT',
    data: userInfo
  }),

  // 获取VIP信息
  getVipInfo: () => request({
    url: '/user/vip-info',
    method: 'GET'
  }),

  // 获取配额信息
  getQuota: () => request({
    url: '/user/quota',
    method: 'GET'
  }),

  // 更新配额
  updateQuota: (quota) => request({
    url: '/user/quota',
    method: 'PUT',
    data: quota
  })
};

// 生成相关API
const generateApi = {
  // 生成图片
  generateImage: (params) => request({
    url: '/generate/image',
    method: 'POST',
    data: params
  }),

  // 获取生成历史
  getHistory: (params = {}) => request({
    url: '/generate/history',
    method: 'GET',
    data: params
  }),

  // 删除历史记录
  deleteHistory: (id) => request({
    url: `/generate/history/${id}`,
    method: 'DELETE'
  }),

  // 获取热门风格
  getHotStyles: () => request({
    url: '/generate/hot-styles',
    method: 'GET'
  })
};

// 支付相关API
const paymentApi = {
  // 创建支付订单
  createOrder: (params) => request({
    url: '/payment/create',
    method: 'POST',
    data: params
  }),

  // 查询订单状态
  getOrderStatus: (orderId) => request({
    url: `/payment/order/${orderId}`,
    method: 'GET'
  }),

  // 获取VIP套餐列表
  getVipPlans: () => request({
    url: '/payment/plans',
    method: 'GET'
  })
};

// 广告相关API
const adApi = {
  // 验证激励视频广告
  verifyAd: (adUnitId, transactionId) => request({
    url: '/ad/verify',
    method: 'POST',
    data: { adUnitId, transactionId }
  }),

  // 领取广告奖励
  claimReward: (rewardType) => request({
    url: '/ad/reward',
    method: 'POST',
    data: { rewardType }
  })
};

// 统计相关API
const statsApi = {
  // 获取用户统计
  getUserStats: () => request({
    url: '/stats/user',
    method: 'GET'
  }),

  // 获取应用统计
  getAppStats: () => request({
    url: '/stats/app',
    method: 'GET'
  })
};

// 导出API模块
module.exports = {
  API_BASE_URL,
  request,
  userApi,
  generateApi,
  paymentApi,
  adApi,
  statsApi
};
