// backend/config.js
// 应用配置文件

// 环境配置
const ENV = {
  // 开发环境
  DEV: {
    API_BASE_URL: 'http://localhost:3000/api/v1',
    AD_UNIT_ID: 'your-ad-unit-id-dev',
    DEBUG: true
  },

  // 测试环境
  TEST: {
    API_BASE_URL: 'https://test-api.yourdomain.com/api/v1',
    AD_UNIT_ID: 'your-ad-unit-id-test',
    DEBUG: true
  },

  // 生产环境
  PROD: {
    API_BASE_URL: 'https://api.yourdomain.com/api/v1',
    AD_UNIT_ID: 'your-ad-unit-id-prod',
    DEBUG: false
  }
};

// 当前环境（根据小程序版本自动判断）
function getCurrentEnv() {
  // 在小程序中，可以通过版本号或域名判断环境
  const version = wx.getAccountInfoSync().miniProgram.version;
  const envVersion = wx.getAccountInfoSync().miniProgram.envVersion;

  if (envVersion === 'develop' || version.includes('dev')) {
    return ENV.DEV;
  } else if (envVersion === 'trial' || version.includes('test')) {
    return ENV.TEST;
  } else {
    return ENV.PROD;
  }
}

// 应用配置
const APP_CONFIG = {
  // 应用信息
  APP_NAME: 'AI头像生成器',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: '一键生成个性化AI头像和壁纸',

  // 配额配置
  QUOTA_CONFIG: {
    DAILY_FREE: 3, // 每日免费次数
    AD_REWARD: 1,  // 广告奖励次数
    MAX_DAILY: 10 // 每日最大次数（VIP无限）
  },

  // VIP配置
  VIP_CONFIG: {
    MONTHLY_PRICE: 9.9,
    YEARLY_PRICE: 88.8,
    FOREVER_PRICE: 288.8
  },

  // 生成配置
  GENERATE_CONFIG: {
    MAX_PROMPT_LENGTH: 200,
    TIMEOUT: 60000, // 60秒超时
    MAX_RETRIES: 3
  },

  // 存储配置
  STORAGE_KEYS: {
    TOKEN: 'token',
    USER_INFO: 'userInfo',
    QUOTA: 'quota',
    HISTORY: 'imageHistory',
    HIGH_SCORES: 'highScores',
    VIP_INFO: 'vipInfo',
    SETTINGS: 'settings'
  },

  // 广告配置
  AD_CONFIG: {
    REWARDED_VIDEO: 'your-ad-unit-id',
    BANNER: 'your-banner-ad-unit-id',
    INTERSTITIAL: 'your-interstitial-ad-unit-id'
  },

  // 样式配置
  STYLE_CONFIG: {
    COLORS: {
      PRIMARY: '#07C160',
      SECONDARY: '#ff9800',
      DANGER: '#f44336',
      SUCCESS: '#4CAF50',
      WARNING: '#FFC107',
      INFO: '#2196F3'
    },
    GRADIENTS: {
      VIP: 'linear-gradient(135deg, #ff9800, #ff5722)',
      PRIMARY: 'linear-gradient(135deg, #07C160, #05a050)',
      DARK: 'linear-gradient(135deg, #333, #555)'
    }
  }
};

// 导出配置
module.exports = {
  ENV,
  getCurrentEnv,
  APP_CONFIG
};
