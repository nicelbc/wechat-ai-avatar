// pages/gallery/gallery.js
const app = getApp();

Page({
  data: {
    images: [],
    filteredImages: [],
    currentFilter: 'all',
    filters: [
      { key: 'all', name: '全部', count: 0 },
      { key: 'avatar', name: '头像', count: 0 },
      { key: 'wallpaper', name: '壁纸', count: 0 },
      { key: 'couple', name: '情侣', count: 0 },
      { key: 'art', name: '艺术', count: 0 }
    ],
    isLoading: false,
    showEmpty: false,
    showImageModal: false,
    currentImage: null
  },

  onLoad() {
    this.loadImages();
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadImages();
  },

  onPullDownRefresh() {
    this.loadImages().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载图片
  async loadImages() {
    this.setData({ isLoading: true });

    try {
      // 从本地存储读取
      const history = wx.getStorageSync('imageHistory') || [];

      // 更新过滤器计数
      const filters = this.data.filters.map(filter => {
        if (filter.key === 'all') {
          filter.count = history.length;
        } else {
          filter.count = history.filter(img => img.style === filter.key).length;
        }
        return filter;
      });

      // 应用当前过滤器
      let filteredImages = history;
      if (this.data.currentFilter !== 'all') {
        filteredImages = history.filter(img => img.style === this.data.currentFilter);
      }

      // 按时间倒序排序
      filteredImages.sort((a, b) => b.timestamp - a.timestamp);

      this.setData({
        images: history,
        filteredImages,
        filters,
        isLoading: false,
        showEmpty: filteredImages.length === 0
      });
    } catch (error) {
      console.error('加载图片失败', error);
      this.setData({ isLoading: false, showEmpty: true });
    }
  },

  // 选择过滤器
  selectFilter(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ currentFilter: key }, () => {
      this.loadImages();
    });
  },

  // 预览图片
  previewImage(e) {
    const { url } = e.currentTarget.dataset;
    const urls = this.data.filteredImages.map(img => img.url);
    wx.previewImage({
      current: url,
      urls
    });
  },

  // 显示图片详情
  showImageDetail(e) {
    const { index } = e.currentTarget.dataset;
    const image = this.data.filteredImages[index];
    this.setData({
      currentImage: image,
      showImageModal: true
    });
  },

  // 保存图片
  async saveImage(e) {
    const { url } = e.currentTarget.dataset;

    // 申请保存权限
    try {
      const authRes = await wx.authorize({ scope: 'scope.writePhotosAlbum' });
      if (!authRes) {
        wx.showToast({ title: '请手动保存图片', icon: 'none' });
        return;
      }
    } catch (error) {
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

  // 删除图片
  deleteImage(e) {
    const { index } = e.currentTarget.dataset;
    const image = this.data.filteredImages[index];

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          // 从历史记录中删除
          const history = wx.getStorageSync('imageHistory') || [];
          const newHistory = history.filter(img => img.id !== image.id);
          wx.setStorageSync('imageHistory', newHistory);

          // 重新加载
          this.loadImages();
          this.setData({ showImageModal: false });

          wx.showToast({ title: '删除成功' });
        }
      }
    });
  },

  // 清空所有
  clearAll() {
    wx.showModal({
      title: '清空画廊',
      content: '确定要清空所有图片吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('imageHistory');
          this.setData({
            images: [],
            filteredImages: [],
            showEmpty: true,
            showImageModal: false
          });
          wx.showToast({ title: '已清空' });
        }
      }
    });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      showImageModal: false,
      currentImage: null
    });
  },

  // 跳转到生成页面
  goToGenerate() {
    wx.navigateTo({ url: '/pages/generate/generate?style=avatar' });
  },

  // 分享功能
  onShareAppMessage() {
    if (this.data.currentImage) {
      return {
        title: `AI${this.data.currentImage.style}生成器`,
        path: '/pages/gallery/gallery',
        imageUrl: this.data.currentImage.url
      };
    }
    return {
      title: '我的AI画廊',
      path: '/pages/gallery/gallery',
      imageUrl: '/images/share.png'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '我的AI画廊'
    };
  }
});