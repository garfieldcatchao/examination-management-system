const axios = require('axios');
const http = require('http');
const https = require('https');

// 创建一个不使用代理的axios实例
const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // 配置自定义http/https代理
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
});

// 测试直接连接到模拟服务器
async function testDirectConnection() {
  try {
    console.log('测试直接连接到模拟服务器...');
    const response = await axiosInstance.post('http://localhost:8083/auth/login', {
      studentId: '004',
      password: '1234',
      remember: true,
      role: 'teacher'
    });
    console.log('直接连接成功!');
    console.log('响应状态:', response.status);
    console.log('响应数据:', response.data);
    return true;
  } catch (error) {
    console.error('直接连接失败:', error.message);
    if (error.response) {
      console.log('错误状态码:', error.response.status);
      console.log('错误数据:', error.response.data);
    }
    return false;
  }
}

// 测试通过代理连接
async function testProxyConnection() {
  try {
    console.log('测试通过代理连接...');
    const response = await axiosInstance.post('http://localhost:3000/api/auth/login', {
      studentId: '004',
      password: '1234',
      remember: true,
      role: 'teacher'
    });
    console.log('代理连接成功!');
    console.log('响应状态:', response.status);
    console.log('响应数据:', response.data);
    return true;
  } catch (error) {
    console.error('代理连接失败:', error.message);
    if (error.response) {
      console.log('错误状态码:', error.response.status);
      console.log('错误数据:', error.response.data);
    }
    return false;
  }
}

// 运行测试
async function runTests() {
  const directResult = await testDirectConnection();
  console.log('\n----------------------------\n');
  const proxyResult = await testProxyConnection();
  
  console.log('\n----------------------------\n');
  console.log('测试结果汇总:');
  console.log('直接连接:', directResult ? '成功' : '失败');
  console.log('代理连接:', proxyResult ? '成功' : '失败');
  
  if (!directResult && !proxyResult) {
    console.log('\n建议检查:');
    console.log('1. 模拟服务器是否正在运行');
    console.log('2. 端口8083是否被占用或被防火墙阻止');
    console.log('3. 代理服务器配置是否正确');
  } else if (!proxyResult && directResult) {
    console.log('\n建议检查:');
    console.log('1. 代理配置是否正确');
    console.log('2. 前端开发服务器是否正在运行');
    console.log('3. setupProxy.js配置是否正确');
  }
}

runTests();
