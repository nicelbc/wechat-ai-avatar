// pages/generate/generate.js
const app = getApp();

Page({
  data: {
    // 生成参数
    style: 'avatar', // avatar, wallpaper, couple, art
    prompt: '',
    size: '512x512',
    count: 1,
    quality: 'standard',

    // 预设风格
    presetStyles: {
      avatar: {
        name: '头像',
        icon: '👤',
        sizes: ['512x512', '768x768'],
        presets: [
          { name: '二次元', icon: '🎀', prompt: '二次元风格，动漫角色，精致五官' },
          { name: '写实', icon: '👤', prompt: '写实风格，高清人像，自然光影' },
          { name: '卡通', icon: '🐱', prompt: '卡通风格，可爱Q版，圆润线条' },
          { name: '古风', icon: '🏮', prompt: '古风汉服，仙气飘飘，古典美' }
        ]
      },
      wallpaper: {
        name: '壁纸',
        icon: '🖼️',
        sizes: ['1024x768', '1920x1080', '1080x1920'],
        presets: [
          { name: '风景', icon: '🏔️', prompt: '自然风景，山水画，唯美意境' },
          { name: '抽象', icon: '🎨', prompt: '抽象艺术，色彩斑斓，现代感' },
          { name: '科幻', icon: '🚀', prompt: '科幻未来，赛博朋克，霓虹灯' },
          { name: '梦幻', icon: '✨', prompt: '梦幻星空，唯美浪漫，童话世界' }
        ]
      },
      couple: {
        name: '情侣',
        icon: '💑',
        sizes: ['512x512', '768x768'],
        presets: [
          { name: '甜蜜', icon: '💕', prompt: '情侣头像，甜蜜互动，粉色系' },
          { name: '古风', icon: '🏮', prompt: '古风情侣，才子佳人，唯美' },
          { name: '卡通', icon: '🐱', prompt: '卡通情侣，可爱Q版，萌系' },
          { name: '写实', icon: '👤', prompt: '写实情侣，真实感，温馨' }
        ]
      },
      art: {
        name: '艺术',
        icon: '🎨',
        sizes: ['512x512', '768x768', '1024x1024'],
        presets: [
          { name: '梵高', icon: '🌟', prompt: '梵高风格，星空，向日葵' },
          { name: '莫奈', icon: '🌸', prompt: '莫奈风格，睡莲，印象派' },
          { name: '毕加索', icon: '🎭', prompt: '毕加索风格，立体主义，抽象' },
          { name: '浮世绘', icon: '🗻', prompt: '浮世绘风格，日本艺术，传统' }
        ]
      }
    },

    // 生成状态
    isGenerating: false,
    progress: 0,
    estimatedTime: 0,

    // 结果
    images: [],
    currentImage: null,

    // 配额信息
    quota: {
      remaining: 3,
      adCount: 0
    },

    // 显示控制
    showResultModal: false,
    showQuotaModal: false,
    showSizeModal: false,
    showQualityModal: false
  },

  onLoad(options) {
    const style = options.style || 'avatar';
    this.setData({ style });

    // 初始化配额
    const quota = wx.getStorageSync('quota') || app.globalData.quota;
    this.setData({ quota });

    // 设置默认尺寸
    this.setDefaultSize();

    // 更新页面标题
    const styleConfig = this.data.presetStyles[style];
    if (styleConfig) {
      wx.setNavigationBarTitle({
        title: `AI${styleConfig.name}生成`
      });
    }
  },

  onShow() {
    // 检查登录状态
    if (!app.globalData.token) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
    }

    // 检查配额
    const quota = wx.getStorageSync('quota');
    if (quota) {
      this.setData({ quota });
    }
  },

  // 设置默认尺寸
  setDefaultSize() {
    const styleConfig = this.data.presetStyles[this.data.style];
    if (styleConfig && styleConfig.sizes.length > 0) {
      this.setData({ size: styleConfig.sizes[0] });
    }
  },

  // 选择预设风格
  selectPreset(e) {
    const { prompt } = e.currentTarget.dataset;
    this.setData({ prompt });
  },

  // 输入描述词
  onPromptInput(e) {
    this.setData({ prompt: e.detail.value });
  },

  // 选择尺寸
  selectSize(e) {
    const { size } = e.currentTarget.dataset;
    this.setData({ size, showSizeModal: false });
  },

  // 选择质量
  selectQuality(e) {
    const { quality } = e.currentTarget.dataset;
    this.setData({ quality, showQualityModal: false });
  },

  // 选择数量
  selectCount(e) {
    const { count } = e.currentTarget.dataset;
    this.setData({ count: parseInt(count) });
  },

  // 检查配额
  checkQuota() {
    if (!this.data.quota || this.data.quota.remaining <= 0) {
      this.setData({ showQuotaModal: true });
      return false;
    }
    return true;
  },

  // 生成图片
  async generate() {
    if (!this.data.prompt.trim()) {
      wx.showToast({ title: '请输入描述词', icon: 'none' });
      return;
    }

    if (!this.checkQuota()) {
      return;
    }

    if (this.data.quota.adCount >= 3 && this.data.quota.remaining <= 0) {
      this.setData({ showQuotaModal: true });
      return;
    }

    this.setData({ isGenerating: true, progress: 0, estimatedTime: 30 });

    // 模拟进度更新
    const progressInterval = setInterval(() => {
      if (this.data.progress < 90) {
        this.setData({
          progress: this.data.progress + 5,
          estimatedTime: Math.max(0, this.data.estimatedTime - 2)
        });
      }
    }, 500);

    try {
      const token = app.globalData.token;

      // 调用后端API
      const res = await wx.request({
        url: 'https://your-api.com/generate',
        method: 'POST',
        header: { 'Authorization': `Bearer ${token}` },
        data: {
          style: this.data.style,
          prompt: this.data.prompt,
          size: this.data.size,
          count: this.data.count,
          quality: this.data.quality
        }
      });

      clearInterval(progressInterval);

      if (res.statusCode === 200) {
        const { images, remaining } = res.data;

        // 更新配额
        const newQuota = { ...this.data.quota, remaining };
        this.setData({
          images,
          isGenerating: false,
          progress: 100,
          quota: newQuota,
          showResultModal: true
        });

        // 保存到本地存储
        wx.setStorageSync('quota', newQuota);

        // 保存到历史记录
        this.saveToHistory(images);

        wx.showToast({ title: '生成成功' });

        // 显示分享提示
        setTimeout(() => {
          this.showSharePrompt();
        }, 2000);
      } else {
        throw new Error(res.data.message || '生成失败');
      }
    } catch (error) {
      clearInterval(progressInterval);
      this.setData({ isGenerating: false });
      wx.showToast({ title: error.message, icon: 'error' });
    }
  },

  // 保存到历史记录
  saveToHistory(images) {
    const history = wx.getStorageSync('imageHistory') || [];
    const newItems = images.map(img => ({
      ...img,
      style: this.data.style,
      prompt: this.data.prompt,
      size: this.data.size,
      timestamp: Date.now()
    }));

    const updatedHistory = [...newItems, ...history].slice(0, 100); // 保留最近100条
    wx.setStorageSync('imageHistory', updatedHistory);
  },

  // 显示分享提示
  showSharePrompt() {
    wx.showModal({
      title: '🎉 生成成功！',
      content: '分享给好友，让他们也体验AI生成的乐趣吧！',
      confirmText: '分享',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) {
          this.onShareAppMessage();
        }
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const { url } = e.currentTarget.dataset;
    wx.previewImage({
      current: url,
      urls: this.data.images.map(img => img.url)
    });
  },

  // 保存图片
  async saveImage(e) {
    const { url } = e.currentTarget.dataset;

    // 申请保存权限
    const authRes = await wx.authorize({ scope: 'scope.writePhotosAlbum' }).catch(() => null);
    if (!authRes) {
      wx.showToast({ title: '请手动保存图片', icon: 'none' });
      return;
    }

    // 下载图片
    wx.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          // 保存到相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({ title: '保存成功' });
            },
            fail: () => {
              wx.showToast({ title: '保存失败', icon: 'error' });
            }
          });
        }
      },
      fail: () => {
        wx.showToast({ title: '下载失败', icon: 'error' });
      }
    });
  },

  // 分享图片
  shareImage(e) {
    const { url } = e.currentTarget.dataset;
    wx.showActionSheet({
      itemList: ['保存图片', '分享给好友', '分享到朋友圈'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.saveImage(e);
            break;
          case 1:
            this.onShareAppMessage();
            break;
          case 2:
            this.onShareTimeline();
            break;
        }
      }
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
        const newQuota = {
          ...this.data.quota,
          remaining: this.data.quota.remaining + 3,
          adCount: 0
        };
        this.setData({ quota: newQuota, showQuotaModal: false });
        wx.setStorageSync('quota', newQuota);
        wx.showToast({ title: '获得3次免费生成' });
      } else {
        wx.showToast({ title: '请完整观看广告', icon: 'none' });
      }
    });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      showResultModal: false,
      showQuotaModal: false,
      showSizeModal: false,
      showQualityModal: false
    });
  },

  // 显示尺寸选择
  showSizeModal() {
    this.setData({ showSizeModal: true });
  },

  // 显示质量选择
  showQualityModal() {
    this.setData({ showQualityModal: true });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: `AI${this.data.presetStyles[this.data.style].name}生成器 - ${this.data.prompt}`,
      path: `/pages/generate/generate?style=${this.data.style}`,
      imageUrl: this.data.images[0]?.url || '/images/share.png'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: `AI${this.data.presetStyles[this.data.style].name}生成器`
    };
  }
});