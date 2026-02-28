// backend/utils.js
// 工具函数集合

// 格式化日期
function formatDate(date, format = 'yyyy-MM-dd HH:mm:ss') {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 深度拷贝对象
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 节流函数
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 验证邮箱格式
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// 验证手机号格式
function validatePhone(phone) {
  const re = /^1[3-9]\d{9}$/;
  return re.test(phone);
}

// 验证URL格式
function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 字符串截断
function truncate(str, maxLength, suffix = '...') {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

// 数字格式化
function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined) return '0';
  return Number(num).toFixed(decimals);
}

// 价格格式化
function formatPrice(price, currency = '¥') {
  return `${currency}${formatNumber(price, 2)}`;
}

// 文件大小格式化
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 生成随机颜色
function generateRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// 生成随机字符串
function generateRandomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 检查是否是VIP
function isVip(vipInfo) {
  if (!vipInfo || !vipInfo.expireDate) return false;
  const expireDate = new Date(vipInfo.expireDate);
  const now = new Date();
  return expireDate > now;
}

// 计算剩余天数
function getRemainingDays(expireDate) {
  if (!expireDate) return 0;
  const expire = new Date(expireDate);
  const now = new Date();
  const diffTime = expire - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// 生成分享图片路径
function generateShareImagePath() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `share_${timestamp}_${random}.png`;
}

// 导出工具函数
module.exports = {
  formatDate,
  generateId,
  deepClone,
  debounce,
  throttle,
  validateEmail,
  validatePhone,
  validateUrl,
  truncate,
  formatNumber,
  formatPrice,
  formatFileSize,
  generateRandomColor,
  generateRandomString,
  isVip,
  getRemainingDays,
  generateShareImagePath
};
