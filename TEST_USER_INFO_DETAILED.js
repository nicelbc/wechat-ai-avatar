// TEST_USER_INFO_DETAILED.js
// 详细测试用户信息处理逻辑

console.log('=== 详细测试用户信息处理逻辑 ===');
console.log('');

// 模拟真实的 wx.getUserProfile() 返回数据
const realWeChatUserInfo = {
  nickName: '张三',
  avatarUrl: 'https://wx.qlogo.cn/mmopen/vi_32/abc123def456',
  gender: 1,
  city: '北京',
  province: '北京',
  country: '中国'
};

// 模拟 mockWxRequest 中的用户信息处理逻辑
function processUserInfo(data) {
  const userId = Date.now().toString(36) + Math.random().toString(36).substr(2);

  // 检查是否有用户信息，并且有昵称
  if (data && data.userInfo && data.userInfo.nickName) {
    console.log('✅ 检测到真实微信用户信息');
    console.log('   昵称:', data.userInfo.nickName);
    console.log('   头像:', data.userInfo.avatarUrl);
    console.log('   性别:', data.userInfo.gender);
    console.log('   城市:', data.userInfo.city);

    // 使用真实的微信用户信息
    return {
      openId: userId,
      nickName: data.userInfo.nickName,
      avatarUrl: data.userInfo.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userId,
      gender: data.userInfo.gender || 0,
      city: data.userInfo.city || '未知',
      province: data.userInfo.province || '未知',
      country: data.userInfo.country || '未知'
    };
  } else {
    console.log('⚠️  没有检测到真实微信用户信息，使用默认信息');
    return {
      openId: userId,
      nickName: '用户' + userId.substr(-4),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userId,
      gender: Math.random() > 0.5 ? 1 : 2,
      city: '北京',
      province: '北京',
      country: '中国'
    };
  }
}

// 测试场景1：完整的微信用户信息
console.log('测试场景1：完整的微信用户信息');
console.log('输入数据：{ code: "xxx", userInfo: { ... } }');
const result1 = processUserInfo({
  code: 'wx_code_123',
  userInfo: realWeChatUserInfo
});
console.log('输出结果：', result1);
console.log('');

// 测试场景2：只有code，没有userInfo
console.log('测试场景2：只有code，没有userInfo');
console.log('输入数据：{ code: "xxx" }');
const result2 = processUserInfo({
  code: 'wx_code_456'
});
console.log('输出结果：', result2);
console.log('');

// 测试场景3：userInfo为空对象
console.log('测试场景3：userInfo为空对象');
console.log('输入数据：{ code: "xxx", userInfo: {} }');
const result3 = processUserInfo({
  code: 'wx_code_789',
  userInfo: {}
});
console.log('输出结果：', result3);
console.log('');

// 测试场景4：userInfo为null
console.log('测试场景4：userInfo为null');
console.log('输入数据：{ code: "xxx", userInfo: null }');
const result4 = processUserInfo({
  code: 'wx_code_000',
  userInfo: null
});
console.log('输出结果：', result4);
console.log('');

// 测试场景5：部分微信用户信息（只有昵称）
console.log('测试场景5：部分微信用户信息（只有昵称）');
console.log('输入数据：{ code: "xxx", userInfo: { nickName: "李四" } }');
const result5 = processUserInfo({
  code: 'wx_code_111',
  userInfo: { nickName: '李四' }
});
console.log('输出结果：', result5);
console.log('');

console.log('=== 测试总结 ===');
console.log('');
console.log('关键点：');
console.log('1. ✅ 如果 wx.getUserProfile() 成功，会返回真实用户信息');
console.log('2. ✅ 真实用户信息包含：nickName, avatarUrl, gender, city, province, country');
console.log('3. ✅ 我们的逻辑：只要 userInfo.nickName 存在，就使用真实信息');
console.log('4. ⚠️  如果授权失败，才使用默认用户信息');
console.log('');
console.log('预期行为：');
console.log('- 用户点击"微信登录"按钮');
console.log('- 弹出授权提示框');
console.log('- 用户点击"允许"授权');
console.log('- 获取到真实微信用户信息');
console.log('- 显示真实的头像和昵称');
