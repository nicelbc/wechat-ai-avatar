// AUTH_FIX_SIMPLE.js
// 简单的授权修复脚本 - 直接复制到微信小程序控制台运行

console.log('=== 简单授权修复脚本 ===');
console.log('这个脚本会测试并修复微信授权功能');
console.log('');

// 步骤1：检查当前页面
console.log('步骤1：检查当前页面...');
const pages = getCurrentPages();
if (pages && pages.length > 0) {
  const currentPage = pages[pages.length - 1];
  console.log('✅ 当前页面:', currentPage.route);

  // 步骤2：检查是否在index页面
  if (currentPage.route === 'pages/index/index') {
    console.log('✅ 在index页面中运行');

    // 步骤3：检查handleLogin函数是否存在
    if (typeof currentPage.handleLogin === 'function') {
      console.log('✅ handleLogin函数存在');

      // 步骤4：测试授权功能
      console.log('');
      console.log('步骤4：测试授权功能...');

      // 保存原始的handleLogin函数
      const originalHandleLogin = currentPage.handleLogin;

      // 创建新的handleLogin函数
      currentPage.handleLogin = async function() {
        console.log('');
        console.log('=== 开始登录流程 ===');

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
            const app = getApp();
            if (app) {
              app.globalData.token = token;
              app.globalData.userInfo = userInfo;
              console.log('✅ 全局数据更新成功');
            }

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
      };

      console.log('✅ handleLogin函数已修复');
      console.log('');
      console.log('🎉 授权功能已经修复！');
      console.log('现在可以点击"微信登录"按钮测试授权功能');
      console.log('');
      console.log('预期行为：');
      console.log('1. 点击"微信登录"按钮');
      console.log('2. 弹出授权提示框');
      console.log('3. 点击"允许"授权');
      console.log('4. 显示"登录成功"提示');
      console.log('5. 用户头像和昵称显示在首页');

    } else {
      console.log('❌ handleLogin函数不存在');
      console.log('请确保在index页面中运行此脚本');
    }
  } else {
    console.log('❌ 不在index页面中');
    console.log('请导航到首页（index页面）再运行此脚本');
  }
} else {
  console.log('❌ 没有页面实例');
  console.log('请确保在微信小程序中运行此脚本');
}

console.log('');
console.log('=== 修复完成 ===');
console.log('如果仍然没有弹出授权提示框，请尝试：');
console.log('1. 重新编译项目（Ctrl+R）');
console.log('2. 清空缓存并重新编译');
console.log('3. 检查控制台是否有其他错误信息');
console.log('4. 运行 TEST_AUTH_FLOW.js 进行详细测试');
