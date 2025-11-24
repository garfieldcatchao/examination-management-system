/**
 * 快照API测试脚本
 * 用于测试完整的快照保存链路
 */

const axios = require('axios');

// 配置
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api';

// 生成测试用的base64图片数据（1x1像素的红色图片）
const TEST_IMAGE_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

// 测试数据
const testSnapshot = {
  examId: 1001,
  userId: 2022001,
  snapshotData: TEST_IMAGE_BASE64,
  snapshotSize: TEST_IMAGE_BASE64.length,
  faceDetected: true,
  faceConfidence: 0.85,
  userPresent: true,
  imageWidth: 640,
  imageHeight: 480,
  imageQuality: 0.7,
  capturedAt: new Date().toISOString(),
};

console.log('='.repeat(60));
console.log('快照API测试脚本');
console.log('='.repeat(60));
console.log(`后端API地址: ${BACKEND_API_URL}`);
console.log('');

// 测试1：保存单个快照
async function testSaveSnapshot() {
  console.log('📝 测试1: 保存单个快照');
  console.log('-'.repeat(60));
  
  try {
    console.log('发送请求...');
    console.log(`POST ${BACKEND_API_URL}/monitoring/saveSnapshots`);
    console.log('请求数据:', {
      examId: testSnapshot.examId,
      userId: testSnapshot.userId,
      snapshotSize: `${(testSnapshot.snapshotSize / 1024).toFixed(2)} KB`,
      faceDetected: testSnapshot.faceDetected,
      imageWidth: testSnapshot.imageWidth,
      imageHeight: testSnapshot.imageHeight,
    });
    
    const response = await axios.post(
      `${BACKEND_API_URL}/monitoring/saveSnapshots`,
      testSnapshot,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    
    console.log('✅ 测试通过!');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    console.log('');
    
    return response.data;
    
  } catch (error) {
    console.error('❌ 测试失败!');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('无响应 - 后端服务器可能未启动');
      console.error('请确保后端服务器运行在:', BACKEND_API_URL);
    } else {
      console.error('错误:', error.message);
    }
    console.log('');
    throw error;
  }
}

// 测试2：批量保存快照
async function testBatchSaveSnapshots() {
  console.log('📝 测试2: 批量保存快照');
  console.log('-'.repeat(60));
  
  try {
    // 生成3个测试快照
    const snapshots = [1, 2, 3].map(i => ({
      ...testSnapshot,
      userId: 2022000 + i,
      capturedAt: new Date(Date.now() + i * 1000).toISOString(),
    }));
    
    console.log('发送请求...');
    console.log(`POST ${BACKEND_API_URL}/monitoring/snapshots/batch`);
    console.log(`批量保存 ${snapshots.length} 个快照`);
    
    const response = await axios.post(
      `${BACKEND_API_URL}/monitoring/snapshots/batch`,
      { snapshots },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    
    console.log('✅ 测试通过!');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    console.log('');
    
    return response.data;
    
  } catch (error) {
    console.error('❌ 测试失败!');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('无响应 - 后端服务器可能未启动');
    } else {
      console.error('错误:', error.message);
    }
    console.log('');
    // 不抛出错误，继续下一个测试
  }
}

// 测试3：获取快照列表
async function testGetSnapshots() {
  console.log('📝 测试3: 获取快照列表');
  console.log('-'.repeat(60));
  
  try {
    console.log('发送请求...');
    console.log(`GET ${BACKEND_API_URL}/monitoring/snapshots?examId=1001&userId=2022001`);
    
    const response = await axios.get(
      `${BACKEND_API_URL}/monitoring/snapshots`,
      {
        params: {
          examId: 1001,
          userId: 2022001,
        },
        timeout: 10000,
      }
    );
    
    console.log('✅ 测试通过!');
    console.log('响应状态:', response.status);
    console.log('快照数量:', response.data.data?.length || 0);
    if (response.data.data && response.data.data.length > 0) {
      console.log('最新快照:', JSON.stringify(response.data.data[0], null, 2));
    }
    console.log('');
    
    return response.data;
    
  } catch (error) {
    console.error('❌ 测试失败!');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('无响应 - 后端服务器可能未启动');
    } else {
      console.error('错误:', error.message);
    }
    console.log('');
  }
}

// 测试4：压力测试（可选）
async function testStressTest() {
  console.log('📝 测试4: 压力测试（10个并发请求）');
  console.log('-'.repeat(60));
  
  try {
    console.log('发送10个并发请求...');
    
    const promises = [];
    for (let i = 0; i < 10; i++) {
      const snapshot = {
        ...testSnapshot,
        userId: 2022000 + (i % 3), // 3个不同的用户
        capturedAt: new Date(Date.now() + i * 100).toISOString(),
      };
      
      promises.push(
        axios.post(
          `${BACKEND_API_URL}/monitoring/saveSnapshots`,
          snapshot,
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000,
          }
        )
      );
    }
    
    const startTime = Date.now();
    const results = await Promise.allSettled(promises);
    const endTime = Date.now();
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failCount = results.filter(r => r.status === 'rejected').length;
    
    console.log('✅ 压力测试完成!');
    console.log(`总请求数: 10`);
    console.log(`成功: ${successCount}`);
    console.log(`失败: ${failCount}`);
    console.log(`总耗时: ${endTime - startTime}ms`);
    console.log(`平均耗时: ${((endTime - startTime) / 10).toFixed(2)}ms/请求`);
    console.log('');
    
  } catch (error) {
    console.error('❌ 压力测试失败!');
    console.error('错误:', error.message);
    console.log('');
  }
}

// 主测试函数
async function runAllTests() {
  console.log('开始测试...\n');
  
  const results = {
    test1: false,
    test2: false,
    test3: false,
    test4: false,
  };
  
  try {
    // 测试1：保存单个快照
    await testSaveSnapshot();
    results.test1 = true;
  } catch (error) {
    console.log('⚠️ 测试1失败，跳过后续测试');
    printSummary(results);
    return;
  }
  
  // 等待1秒
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试2：批量保存
  try {
    await testBatchSaveSnapshots();
    results.test2 = true;
  } catch (error) {
    // 继续
  }
  
  // 等待1秒
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试3：获取列表
  try {
    await testGetSnapshots();
    results.test3 = true;
  } catch (error) {
    // 继续
  }
  
  // 等待1秒
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试4：压力测试（可选）
  if (process.argv.includes('--stress')) {
    try {
      await testStressTest();
      results.test4 = true;
    } catch (error) {
      // 继续
    }
  }
  
  printSummary(results);
}

// 打印测试摘要
function printSummary(results) {
  console.log('='.repeat(60));
  console.log('测试摘要');
  console.log('='.repeat(60));
  console.log(`测试1 - 保存单个快照: ${results.test1 ? '✅ 通过' : '❌ 失败'}`);
  console.log(`测试2 - 批量保存快照: ${results.test2 ? '✅ 通过' : '⏭️ 跳过'}`);
  console.log(`测试3 - 获取快照列表: ${results.test3 ? '✅ 通过' : '⏭️ 跳过'}`);
  if (process.argv.includes('--stress')) {
    console.log(`测试4 - 压力测试:     ${results.test4 ? '✅ 通过' : '⏭️ 跳过'}`);
  }
  console.log('='.repeat(60));
  
  const passCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  if (passCount === totalCount) {
    console.log('🎉 所有测试通过!');
  } else if (passCount > 0) {
    console.log(`⚠️ 部分测试通过 (${passCount}/${totalCount})`);
  } else {
    console.log('❌ 所有测试失败');
    console.log('\n请检查:');
    console.log('1. 后端服务器是否启动');
    console.log('2. 后端API地址是否正确:', BACKEND_API_URL);
    console.log('3. 数据库是否正常连接');
    console.log('4. 表结构是否已创建');
  }
  console.log('');
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  testSaveSnapshot,
  testBatchSaveSnapshots,
  testGetSnapshots,
  testStressTest,
};

