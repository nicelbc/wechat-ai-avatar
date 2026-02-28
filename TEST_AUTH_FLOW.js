// TEST_AUTH_FLOW.js
// 测试微信授权流程

console.log('=== 测试微信授权流程 ===');

// 测试1：检查wx.getUserProfile是否可用
console.log('\n🧪 测试1：检查wx.getUserProfile是否可用...');
if (typeof wx.getUserProfile === 'function') {
  console.log('✅ wx.getUserProfile函数存在');
} else {
  console.log('❌ wx.getUserProfile函数不存在');
  console.log('   可能原因：');
  console.log('   1. 微信版本过低');
  console.log('   2. 不在微信小程序环境中');
  console.log('   3. 需要使用wx.getUserInfo作为备用');
}

// 测试2：检查wx.getUserInfo是否可用
console.log('\n🧪 测试2：检查wx.getUserInfo是否可用...');
if (typeof wx.getUserInfo === 'function') {
  console.log('✅ wx.getUserInfo函数存在');
} else {
  console.log('❌ wx.getUserInfo函数不存在');
}

// 测试3：测试完整的授权流程
console.log('\n🧪 测试3：测试完整的授权流程...');

async function testAuthFlow() {
  try {
    console.log('   步骤1: 调用wx.login...');
    const loginRes = await new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            console.log('   ✅ wx.login成功，code:', res.code);
            resolve(res);
          } else {
            console.log('   ❌ wx.login失败，没有code');
            reject(new Error('获取code失败'));
          }
        },
        fail: (err) => {
          console.log('   ❌ wx.login失败:', err);
          reject(err);
        }
      });
    });

    console.log('   步骤2: 请求用户授权...');
    // 尝试使用wx.getUserProfile（推荐）
    try {
      const userProfileRes = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '用于完善用户资料',
          success: (res) => {
            console.log('   ✅ 用户授权成功');
            console.log('   用户信息:', res.userInfo);
            resolve(res);
          },
          fail: (err) => {
            console.log('   ❌ wx.getUserProfile失败:', err);
            reject(err);
          }
        });
      });

      console.log('   ✅ 授权流程完成');
      return { success: true, userInfo: userProfileRes.userInfo };

    } catch (error) {
      console.log('   ❌ wx.getUserProfile失败，尝试使用wx.getUserInfo...');

      // 尝试使用wx.getUserInfo作为备用
      const userInfoRes = await new Promise((resolve, reject) => {
        wx.getUserInfo({
          success: (res) => {
            console.log('   ✅ wx.getUserInfo成功');
            console.log('   用户信息:', res.userInfo);
            resolve(res);
          },
          fail: (err) => {
            console.log('   ❌ wx.getUserInfo失败:', err);
            reject(err);
          }
        });
      });

      console.log('   ✅ 授权流程完成（使用备用方案）');
      return { success: true, userInfo: userInfoRes.userInfo };
    }

  } catch (error) {
    console.log('   ❌ 授权流程失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 执行测试
testAuthFlow().then(result => {
  console.log('\n========================================');
  if (result.success) {
    console.log('🎉 授权测试成功！');
    console.log('========================================');
    console.log('用户信息:', result.userInfo);
    console.log('\n授权流程应该可以正常工作了！');
    console.log('\n下一步操作：');
    console.log('1. 修改 pages/index/index.js 文件');
    console.log('2. 在handleLogin函数中添加wx.getUserProfile调用');
    console.log('3. 重新编译项目');
    console.log('4. 点击登录按钮测试授权');
  } else {
    console.log('❌ 授权测试失败');
    console.log('========================================');
    console.log('错误原因:', result.error);
    console.log('\n可能的解决方案：');
    console.log('1. 确保在微信小程序环境中运行');
    console.log('2. 检查微信版本是否支持getUserProfile');
    console.log('3. 尝试使用wx.getUserInfo作为备用');
    console.log('4. 检查是否在正确的页面中运行');
  }
});

// 测试4：检查是否有已存储的token
console.log('\n🧪 测试4：检查已存储的token...');
const token = wx.getStorageSync('token');
if (token) {
  console.log('✅ 已存储token:', token);
  console.log('   用户可能已经登录');
} else {
  console.log('❌ 没有存储的token');
  console.log('   用户未登录');
}

// 测试5：检查全局数据
console.log('\n🧪 测试5：检查全局数据...');
const app = getApp();
if (app && app.globalData) {
  console.log('✅ 全局数据存在');
  console.log('   userInfo:', app.globalData.userInfo);
  console.log('   token:', app.globalData.token);
} else {
  console.log('❌ 全局数据不存在');
}

console.log('\n=== 测试完成 ===');
