# 测试真实微信用户信息获取

## 问题描述

用户反馈：点击登录后显示的是默认用户信息，而不是真实的微信用户头像和昵称。

## 原因分析

### 问题1：用户信息处理逻辑错误
原来的代码使用了错误的判断逻辑：
```javascript
const userInfo = data.userInfo || { 默认信息 };
```

这会导致：
- 如果 `data.userInfo` 是空对象 `{}`，会使用默认信息
- 如果 `data.userInfo` 没有 `openId` 字段，会使用默认信息

### 问题2：微信用户信息结构理解错误
`wx.getUserProfile()` 返回的 `res.userInfo` **不包含 `openId`**，只包含：
- `nickName`: 用户昵称
- `avatarUrl`: 用户头像URL
- `gender`: 性别
- `city`: 城市
- `province`: 省份
- `country`: 国家

`openId` 需要由后端生成并返回。

## 修复方案

### 1. 修改用户信息处理逻辑
```javascript
// 修复前：
const userInfo = data.userInfo || {
  openId: userId,
  nickName: '用户' + userId.substr(-4),
  // ... 默认信息
};

// 修复后：
let userInfo;
if (data.userInfo && data.userInfo.nickName) {
  // 使用真实的微信用户信息
  userInfo = {
    openId: userId,
    nickName: data.userInfo.nickName,
    avatarUrl: data.userInfo.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userId,
    gender: data.userInfo.gender || 0,
    city: data.userInfo.city || '未知',
    province: data.userInfo.province || '未知',
    country: data.userInfo.country || '未知'
  };
} else {
  // 使用默认用户信息
  userInfo = {
    openId: userId,
    nickName: '用户' + userId.substr(-4),
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userId,
    gender: Math.random() > 0.5 ? 1 : 2,
    city: '北京',
    province: '北京',
    country: '中国'
  };
}
```

### 2. 修改判断条件
- **旧逻辑**：检查 `data.userInfo` 是否存在
- **新逻辑**：检查 `data.userInfo.nickName` 是否存在

这样可以确保：
- 如果授权成功，`data.userInfo` 会有 `nickName`，使用真实信息
- 如果授权失败，`data.userInfo` 为空或没有 `nickName`，使用默认信息

## 测试步骤

### 方法1：直接测试（推荐）
1. 在微信开发者工具中重新编译项目（Ctrl+R）
2. 点击页面上的"微信登录"按钮
3. 应该会弹出授权提示框，内容为："用于完善用户资料"
4. 点击"允许"授权
5. 观察页面显示的用户信息：
   - ✅ **成功**：显示真实的微信头像和昵称
   - ❌ **失败**：显示默认头像和昵称

### 方法2：使用测试脚本
1. 在微信小程序控制台中运行 `TEST_USER_INFO.js`
2. 脚本会测试不同的用户信息处理场景
3. 观察输出结果，确认逻辑正确

### 方法3：检查控制台日志
1. 打开微信开发者工具的控制台
2. 点击"微信登录"按钮
3. 观察控制台输出：
   ```
   步骤1: 调用wx.login获取code...
   ✅ wx.login成功，code: xxxxxx
   步骤2: 请求用户授权获取用户信息...
   ✅ 用户授权成功
   用户信息: {nickName: "张三", avatarUrl: "https://...", ...}
   ```
   - 如果看到真实的用户信息，说明授权成功
   - 如果看到默认用户信息，说明授权失败或逻辑有问题

## 预期结果

### 授权成功时
- 显示真实的微信头像
- 显示真实的微信昵称
- 显示真实的用户信息（城市、省份等）

### 授权失败时
- 显示默认头像（随机生成的头像）
- 显示默认昵称（如"用户abc123"）
- 显示默认用户信息

## 常见问题

### 问题1：仍然显示默认用户信息
**可能原因：**
1. 用户点击"拒绝"授权
2. 微信版本不支持 `getUserProfile`
3. 不在微信小程序环境中

**解决方案：**
1. 提示用户点击"允许"授权
2. 如果授权失败，系统会自动使用默认用户信息
3. 确保在微信小程序开发者工具中运行

### 问题2：头像显示为默认头像
**可能原因：**
1. 微信用户没有设置头像
2. 头像URL无法访问

**解决方案：**
1. 检查 `data.userInfo.avatarUrl` 是否存在
2. 如果不存在，使用默认头像URL

### 问题3：昵称显示为默认昵称
**可能原因：**
1. 微信用户没有设置昵称
2. 授权失败

**解决方案：**
1. 检查 `data.userInfo.nickName` 是否存在
2. 如果不存在，使用默认昵称

## 调试技巧

### 1. 查看完整的用户信息对象
```javascript
console.log('完整用户信息:', JSON.stringify(data.userInfo, null, 2));
```

### 2. 检查每个字段
```javascript
console.log('nickName:', data.userInfo.nickName);
console.log('avatarUrl:', data.userInfo.avatarUrl);
console.log('gender:', data.userInfo.gender);
console.log('city:', data.userInfo.city);
console.log('province:', data.userInfo.province);
console.log('country:', data.userInfo.country);
```

### 3. 检查判断条件
```javascript
console.log('data.userInfo 存在:', !!data.userInfo);
console.log('data.userInfo.nickName 存在:', !!data.userInfo?.nickName);
console.log('data.userInfo.avatarUrl 存在:', !!data.userInfo?.avatarUrl);
```

## 文件变更

### 修改的文件：
- `pages/index/index.js` - 主要修复版本
- `pages/index/index-fixed.js` - 备份修复版本

### 新增的测试文件：
- `TEST_USER_INFO.js` - 用户信息处理测试脚本
- `TEST_USER_INFO_DETAILED.js` - 详细用户信息测试脚本

## 总结

修复后的逻辑确保：
1. ✅ 如果授权成功，使用真实的微信用户信息
2. ✅ 如果授权失败，使用默认用户信息
3. ✅ 正确处理微信用户信息的结构（不包含 openId）
4. ✅ 提供完整的错误处理和备用方案

现在登录功能应该能够正确显示真实的微信用户头像和昵称！