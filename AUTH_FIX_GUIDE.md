# 微信小程序授权问题解决指南

## 🎯 问题分析

### 当前问题
**点击登录按钮没有提示授权**

### 根本原因
微信小程序的登录流程需要两个步骤：
1. **wx.login()** - 获取临时code（不需要用户授权）
2. **wx.getUserProfile()** - 获取用户信息（需要用户授权）

**当前代码缺少了第二步！**

## ✅ 解决方案

### 方案1：使用修复后的文件（推荐）

**步骤1：下载修复文件**
```bash
# 下载修复后的index.js文件（包含授权功能）
cp pages/index/index-with-auth.js pages/index/index.js
```

**步骤2：重新编译项目**
1. 在微信开发者工具中点击"编译"
2. 或者按 `Ctrl + R` (Windows) / `Cmd + R` (Mac)

**步骤3：测试登录**
1. 点击"微信登录"按钮
2. 应该弹出授权提示框
3. 点击"允许"后完成登录

### 方案2：手动修复

**步骤1：修改 `pages/index/index.js`**

**在handleLogin函数中添加用户授权：**

```javascript
// 修改前的handleLogin函数：
async handleLogin() {
  this.setData({ isLoading: true });
  try {
    // 模拟微信登录
    const loginRes = await new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res);
          } else {
            reject(new Error('获取code失败'));
          }
        },
        fail: reject
      });
    });

    // 调用模拟登录API
    const res = await mockWxRequest({
      url: 'https://mock-api.local/auth/login',
      method: 'POST',
      data: { code: loginRes.code }
    });
    // ... 其余代码
  }
}
```

**修改后的handleLogin函数：**
```javascript
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
    // 请求用户授权获取用户信息
    const userProfileRes = await new Promise((resolve, reject) => {
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

    console.log('步骤3: 调用模拟登录API...');
    // 调用模拟登录API
    const res = await mockWxRequest({
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
    console.log('❌ 登录流程失败:', error.message);
    this.setData({ isLoading: false });

    // 根据错误类型显示不同提示
    if (error.message.includes('授权')) {
      wx.showToast({ title: '需要授权才能登录', icon: 'none' });
    } else {
      wx.showToast({ title: '登录失败', icon: 'error' });
    }
  }
}
```

**步骤2：修改mockWxRequest函数**

确保mockWxRequest函数能够处理用户信息：

```javascript
// 在mockWxRequest函数中，修改登录路由：
if (path === '/auth/login' && method === 'POST') {
  // 模拟登录
  response = new Promise((resolve) => {
    setTimeout(() => {
      const userId = Date.now().toString(36) + Math.random().toString(36).substr(2);

      // 使用传入的用户信息，或者生成默认信息
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
}
```

## 🧪 测试授权流程

### 使用测试脚本

**步骤1：运行授权测试脚本**
```javascript
// 在微信小程序控制台中运行
// 复制 TEST_AUTH_FLOW.js 的全部内容并粘贴到控制台
```

**步骤2：查看测试结果**
脚本会测试以下内容：
1. wx.getUserProfile是否可用
2. wx.getUserInfo是否可用
3. 完整的授权流程
4. 已存储的token
5. 全局数据

### 手动测试步骤

**步骤1：检查控制台**
1. 打开微信开发者工具的控制台
2. 点击"微信登录"按钮
3. 查看控制台输出的步骤信息

**步骤2：检查授权弹窗**
1. 点击"微信登录"按钮
2. 应该弹出授权提示框
3. 提示内容："用于完善用户资料"
4. 有两个按钮："拒绝"和"允许"

**步骤3：测试授权结果**
1. 点击"允许"按钮
2. 应该显示"登录成功"提示
3. 用户头像和昵称应该显示在首页

## 🔧 常见问题和解决方案

### 问题1：没有弹出授权提示框

**可能原因：**
1. 微信版本过低
2. 用户已经授权过
3. 代码中没有调用wx.getUserProfile

**解决方案：**
1. 确保使用修复后的index.js文件
2. 检查控制台是否有"请求用户授权"的日志
3. 如果用户已经授权，可能不会再次弹出提示

### 问题2：授权失败

**可能原因：**
1. 用户点击"拒绝"
2. 微信版本不支持getUserProfile
3. 不在微信小程序环境中

**解决方案：**
1. 提示用户点击"允许"授权
2. 如果getUserProfile不支持，使用wx.getUserInfo作为备用
3. 确保在微信小程序开发者工具中运行

### 问题3：授权后仍然显示"登录失败"

**可能原因：**
1. mockWxRequest函数没有正确处理用户信息
2. URL路径不正确
3. 网络连接问题

**解决方案：**
1. 检查mockWxRequest函数是否接收并使用data.userInfo
2. 确保URL为：`https://mock-api.local/auth/login`
3. 检查控制台的错误信息

### 问题4：用户信息显示不正确

**可能原因：**
1. 没有正确传递用户信息
2. mock-api.js没有使用传入的用户信息

**解决方案：**
1. 确保在调用mockWxRequest时传递data.userInfo
2. 修改mockWxRequest函数，使用传入的用户信息

## 📋 授权流程说明

### 正确的微信小程序登录流程

```
1. 用户点击"微信登录"按钮
   ↓
2. 调用wx.login()获取临时code
   ↓
3. 调用wx.getUserProfile()请求用户授权
   ↓
4. 用户点击"允许"授权
   ↓
5. 获取用户信息（头像、昵称等）
   ↓
6. 发送code和用户信息到后端
   ↓
7. 后端生成token并返回
   ↓
8. 保存token到本地存储
   ↓
9. 更新全局数据和页面数据
   ↓
10. 显示"登录成功"提示
```

### 授权提示框内容

**标题：** 微信登录
**内容：** 用于完善用户资料
**按钮：** 拒绝 / 允许

## 🎯 预期结果

如果授权功能正常工作，你应该能够：

1. ✅ 点击"微信登录"按钮
2. ✅ 弹出授权提示框
3. ✅ 点击"允许"授权
4. ✅ 显示"登录成功"提示
5. ✅ 用户头像和昵称显示在首页
6. ✅ 配额信息正确显示

## 📝 总结

微信小程序的登录需要两个步骤：
1. **wx.login()** - 获取code（不需要授权）
2. **wx.getUserProfile()** - 获取用户信息（需要授权）

当前代码缺少了第二步，所以没有弹出授权提示框。使用修复后的文件或手动添加授权代码即可解决问题。

---

**最后更新时间：** 2026-03-01
**版本：** 2.0
