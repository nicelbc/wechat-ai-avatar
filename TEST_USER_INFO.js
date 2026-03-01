// TEST_USER_INFO.js
// 测试用户信息获取功能

console.log('=== 测试用户信息获取功能 ===');
console.log('');

// 模拟 wx.getUserProfile 返回的真实微信用户信息
const mockRealUserInfo = {
  nickName: '张三',
  avatarUrl: 'https://wx.qlogo.cn/mmopen/vi_32/abc123',
  gender: 1,
  city: '北京',
  province: '北京',
  country: '中国'
};

// 模拟 mockWxRequest 处理用户信息的逻辑
function testUserInfoProcessing(userInfo) {
  const userId = Date.now().toString(36) + Math.random().toString(36).substr(2);

  let processedUserInfo;
  if (userInfo && userInfo.nickName) {
    // 使用真实的微信用户信息
    processedUserInfo = {
      openId: userId,
      nickName: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userId,
      gender: userInfo.gender || 0,
      city: userInfo.city || '未知',
      province: userInfo.province || '未知',
      country: userInfo.country || '未知'
    };
  } else {
    // 使用默认用户信息
    processedUserInfo = {
      openId: userId,
      nickName: '用户' + userId.substr(-4),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userId,
      gender: Math.random() > 0.5 ? 1 : 2,
      city: '北京',
      province: '北京',
      country: '中国'
    };
  }

  return processedUserInfo;
}

// 测试1：真实微信用户信息
console.log('测试1：真实微信用户信息');
const realUserInfo = testUserInfoProcessing(mockRealUserInfo);
console.log('输入:', mockRealUserInfo);
console.log('输出:', realUserInfo);
console.log('✅ 昵称:', realUserInfo.nickName);
console.log('✅ 头像:', realUserInfo.avatarUrl);
console.log('');

// 测试2：空用户信息
console.log('测试2：空用户信息');
const emptyUserInfo = testUserInfoProcessing({});
console.log('输入: {}');
console.log('输出:', emptyUserInfo);
console.log('⚠️  使用默认用户信息');
console.log('昵称:', emptyUserInfo.nickName);
console.log('头像:', emptyUserInfo.avatarUrl);
console.log('');

// 测试3：null 用户信息
console.log('测试3：null 用户信息');
const nullUserInfo = testUserInfoProcessing(null);
console.log('输入: null');
console.log('输出:', nullUserInfo);
console.log('⚠️  使用默认用户信息');
console.log('昵称:', nullUserInfo.nickName);
console.log('头像:', nullUserInfo.avatarUrl);
console.log('');

// 测试4：部分用户信息（只有昵称）
console.log('测试4：部分用户信息（只有昵称）');
const partialUserInfo = testUserInfoProcessing({ nickName: '李四' });
console.log('输入: { nickName: "李四" }');
console.log('输出:', partialUserInfo);
console.log('✅ 昵称:', partialUserInfo.nickName);
console.log('⚠️  头像使用默认:', partialUserInfo.avatarUrl);
console.log('');

console.log('=== 测试完成 ===');
console.log('');
console.log('预期行为：');
console.log('1. 如果 wx.getUserProfile() 返回真实用户信息，应该显示真实昵称和头像');
console.log('2. 如果授权失败或没有用户信息，应该显示默认用户信息');
console.log('3. 现在的逻辑是：只要 userInfo.nickName 存在，就使用真实信息');
