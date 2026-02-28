# AI头像生成器微信小程序

一个基于微信小程序的AI头像和壁纸生成器，支持多种风格选择，包括头像、壁纸、情侣照和艺术作品。

## 功能特性

### 🎨 AI生成
- **头像生成**：生成个性化AI头像
- **壁纸生成**：创建精美壁纸
- **情侣照**：生成情侣风格图片
- **艺术作品**：创作艺术风格图片

### 💎 VIP会员
- 无限生成次数
- 高清下载
- 专属风格
- 优先生成队列
- 去广告体验

### 📊 用户管理
- 微信登录
- 生成历史记录
- 配额管理
- 统计数据

### 🎁 免费体验
- 观看激励视频广告获得免费配额
- 每日免费生成次数

## 项目结构

```
wechat-ai-avatar/
├── app.json                    # 应用配置
├── app.js                      # 应用逻辑
├── app.wxss                    # 全局样式
├── project.config.json         # 项目配置
├── sitemap.json                # 搜索配置
├── README.md                   # 项目说明
├── backend/                    # 后端服务
│   ├── api.js                  # API接口
│   ├── config.js               # 配置文件
│   └── utils.js                # 工具函数
├── images/                     # 图片资源
└── pages/                      # 页面
    ├── index/                  # 首页
    ├── generate/               # 生成页
    ├── gallery/                # 画廊页
    ├── user/                   # 用户页
    └── vip/                    # VIP页
```

## 页面说明

### 首页 (index)
- 用户信息展示
- 快捷操作入口
- 热门风格推荐

### 生成页 (generate)
- 选择生成风格
- 输入描述词
- 生成进度显示
- 保存到画廊

### 画廊页 (gallery)
- 历史生成记录
- 图片筛选
- 图片预览和下载

### 用户页 (user)
- 个人资料
- 生成统计
- 配额信息
- 快捷操作

### VIP页 (vip)
- VIP套餐选择
- 支付流程
- 特权介绍
- 免费体验

## 技术栈

- **前端**：微信小程序原生开发
- **样式**：WXSS + CSS Grid
- **状态管理**：App.globalData + Page.data
- **存储**：wx.setStorageSync
- **网络请求**：wx.request
- **广告**：wx.createRewardedVideoAd
- **支付**：wx.requestPayment

## API接口

### 用户相关
- `POST /user/login` - 用户登录
- `GET /user/info` - 获取用户信息
- `GET /user/vip-info` - 获取VIP信息
- `GET /user/quota` - 获取配额信息

### 生成相关
- `POST /generate/image` - 生成图片
- `GET /generate/history` - 获取历史记录
- `DELETE /generate/history/:id` - 删除历史记录
- `GET /generate/hot-styles` - 获取热门风格

### 支付相关
- `POST /payment/create` - 创建支付订单
- `GET /payment/order/:id` - 查询订单状态
- `GET /payment/plans` - 获取VIP套餐

### 广告相关
- `POST /ad/verify` - 验证广告
- `POST /ad/reward` - 领取奖励

## 配置说明

### 环境配置
在 `backend/config.js` 中配置不同环境的API地址：
- 开发环境：`http://localhost:3000/api/v1`
- 测试环境：`https://test-api.yourdomain.com/api/v1`
- 生产环境：`https://api.yourdomain.com/api/v1`

### 广告配置
在 `backend/config.js` 中配置广告单元ID：
```javascript
AD_CONFIG: {
  REWARDED_VIDEO: 'your-ad-unit-id',
  BANNER: 'your-banner-ad-unit-id',
  INTERSTITIAL: 'your-interstitial-ad-unit-id'
}
```

### 配额配置
```javascript
QUOTA_CONFIG: {
  DAILY_FREE: 3,    // 每日免费次数
  AD_REWARD: 1,     // 广告奖励次数
  MAX_DAILY: 10     // 每日最大次数（VIP无限）
}
```

## 开发指南

### 本地开发
1. 克隆仓库
```bash
git clone git@github.com:nicelbc/wechat-ai-avatar.git
cd wechat-ai-avatar
```

2. 安装依赖（如果有）
```bash
npm install
```

3. 在微信开发者工具中导入项目
   - 选择项目目录：`wechat-ai-avatar`
   - AppID：替换为你的小程序AppID

4. 配置后端API
   - 修改 `backend/config.js` 中的API地址
   - 配置广告单元ID

5. 启动开发服务器
   - 在微信开发者工具中点击“编译”
   - 使用模拟器或真机调试

### 构建发布
1. 在微信开发者工具中点击“上传”
2. 填写版本号和更新日志
3. 在微信小程序后台提交审核

## 注意事项

1. **API配置**：需要配置后端API服务才能正常使用
2. **广告单元**：需要在微信小程序后台申请激励视频广告单元
3. **支付配置**：需要开通微信支付功能
4. **图片存储**：生成的图片会保存到本地存储，注意存储空间限制
5. **网络请求**：确保小程序已配置合法域名

## 开发计划

- [ ] 完善后端API服务
- [ ] 添加更多AI风格模板
- [ ] 优化生成速度
- [ ] 添加分享功能
- [ ] 添加用户反馈系统
- [ ] 添加数据统计分析

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过GitHub Issues反馈。