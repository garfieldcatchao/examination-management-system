const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 后端API地址
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api';

// 创建WebSocket服务器
const wss = new WebSocket.Server({ 
  port: 8080,
  path: '/user-monitoring'  // 添加路径支持
});

// 存储连接的客户端
const clients = new Map();

// 监控数据存储目录
const monitoringDir = path.join(__dirname, 'user-monitoring-data');
if (!fs.existsSync(monitoringDir)) {
  fs.mkdirSync(monitoringDir, { recursive: true });
}

// 失败快照存储目录
const failedSnapshotsDir = path.join(__dirname, 'failed-snapshots');
if (!fs.existsSync(failedSnapshotsDir)) {
  fs.mkdirSync(failedSnapshotsDir, { recursive: true });
}

console.log('用户监控WebSocket服务器启动在端口 8080');

wss.on('connection', (ws, request) => {
  console.log('新的客户端连接:', request.url);
  
  const clientId = generateClientId();
  let clientInfo = null;

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('收到消息类型:', message.type);

      switch (message.type) {
        case 'auth':
          // 客户端认证
          clientInfo = {
            id: clientId,
            examId: message.data.examId,
            userId: message.data.userId,
            monitoringType: message.data.monitoringType || 'user',
            connectedAt: new Date(),
            lastActivity: new Date(),
            faceDetected: false,
            userPresent: true,
            behaviorAlerts: [],
          };
          clients.set(clientId, { ws, info: clientInfo });
          
          // 发送认证成功消息
          ws.send(JSON.stringify({
            type: 'auth_success',
            data: { clientId, timestamp: Date.now() }
          }));

          // 发送开始用户监控命令
          setTimeout(() => {
            ws.send(JSON.stringify({
              type: 'monitoring_command',
              data: { action: 'start_camera_monitoring' }
            }));
          }, 1000);
          
          console.log(`客户端认证成功: ${clientInfo.userId} (考试: ${clientInfo.examId}) [监控类型: ${clientInfo.monitoringType}]`);
          break;

        case 'user_photo':
          // 处理用户照片数据
          if (clientInfo) {
            await handleUserPhoto(clientInfo, message.data);
          }
          break;

        case 'user_activity':
          // 处理用户活动状态
          if (clientInfo) {
            handleUserActivity(clientInfo, message.data);
            clientInfo.lastActivity = new Date();
            
            // 检查异常行为
            checkBehaviorAlerts(clientInfo, message.data.activity);
          }
          break;

        default:
          console.log('未知消息类型:', message.type);
      }
    } catch (error) {
      console.error('处理消息失败:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: '消息格式错误' }
      }));
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`客户端断开连接: ${clientId}, 代码: ${code}, 原因: ${reason}`);
    if (clientInfo) {
      console.log(`用户 ${clientInfo.userId} 的监控会话结束`);
    }
    clients.delete(clientId);
  });

  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
    clients.delete(clientId);
  });

  // 定期发送心跳和行为检测
  const heartbeat = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
      
      // 定期检查用户状态
      if (clientInfo) {
        performBehaviorCheck(clientInfo, ws);
      }
    } else {
      clearInterval(heartbeat);
    }
  }, 30000);
});

// 处理用户照片数据
async function handleUserPhoto(clientInfo, data) {
  // 防止重复调用
  if (clientInfo.isProcessingPhoto) {
    console.log(`⏸️ 正在处理快照，跳过重复调用: 用户${clientInfo.userId}`);
    return;
  }
  
  clientInfo.isProcessingPhoto = true;
  
  try {
    const timestamp = new Date().getTime();
    
    console.log(`📸 收到用户 ${clientInfo.userId} 的快照数据`);
    
    // 1. 更新客户端信息
    clientInfo.faceDetected = data.metadata?.faceDetected || false;
    clientInfo.userPresent = data.metadata?.userPresent || false;
    clientInfo.lastActivity = new Date();
    
    // 2. 检查异常行为
    if (!data.metadata?.faceDetected) {
      const alertMessage = {
        warningType: 'face_lost',
        message: '检测到人脸消失',
      };
      clientInfo.behaviorAlerts.push(alertMessage);
      sendBehaviorAlert(clientInfo, alertMessage);
      console.log(`⚠️ 警告: ${clientInfo.userId} - 人脸消失`);
    }
    
    // 3. 决定是否保存到数据库
    const shouldSave = decideSaveSnapshot(clientInfo, data);
    
    if (shouldSave) {
      console.log(`💾 准备保存快照到数据库: 用户${clientInfo.userId}`);
      // 4. 调用后端API保存快照
      await saveSnapshotToBackend(data);
    } else {
      console.log(`⏭️ 跳过保存快照: 用户${clientInfo.userId} (策略过滤)`);
    }
    
    // 5. 保存元数据到本地文件（用于调试）
    const filename = `user_photo_${clientInfo.examId}_${clientInfo.userId}_${timestamp}.json`;
    const filepath = path.join(monitoringDir, filename);
    const photoData = {
      examId: data.examId,
      userId: data.userId,
      timestamp: data.timestamp,
      metadata: data.metadata,
      imageSize: data.image ? data.image.length : 0,
      receivedAt: timestamp,
      faceDetected: data.metadata?.faceDetected || false,
      userPresent: data.metadata?.userPresent || false,
    };
    fs.writeFileSync(filepath, JSON.stringify(photoData, null, 2));
    
  } catch (error) {
    console.error('❌ 处理用户照片数据失败:', error);
  } finally {
    // 处理完成，释放锁
    clientInfo.isProcessingPhoto = false;
  }
}

// 决定是否保存快照（存储策略）
function decideSaveSnapshot(clientInfo, data) {
  // 初始化计数器
  if (!clientInfo.snapshotCount) {
    clientInfo.snapshotCount = 0;
  }
  clientInfo.snapshotCount++;
  
  // 策略1：检测到异常时必须保存
  if (!data.metadata?.faceDetected || !data.metadata?.userPresent) {
    console.log(`✅ 保存原因: 检测到异常 (人脸:${data.metadata?.faceDetected}, 在座:${data.metadata?.userPresent})`);
    return true;
  }
  
  // 策略2：定期保存（每10次保存一次）
  // 如果快照间隔是2秒，则每20秒保存一次
  if (clientInfo.snapshotCount % 10 === 0) {
    console.log(`✅ 保存原因: 定期保存 (第${clientInfo.snapshotCount}次)`);
    return true;
  }
  
  // 其他情况不保存
  return false;
}

// 保存快照到后端API
async function saveSnapshotToBackend(data) {
  // 生成唯一ID用于追踪
  const callId = `${data.userId}-${Date.now()}`;
  console.log(`🔵 [${callId}] saveSnapshotToBackend 开始执行`);
  
  try {
    // 准备请求数据
    const snapshotData = {
      examId: parseInt(data.examId),
      userId: parseInt(data.userId),
      snapshotData: data.image,  // base64数据
      snapshotSize: data.image ? data.image.length : 0,
      faceDetected: data.metadata?.faceDetected || false,
      faceConfidence: (data.metadata?.faceDetected ? 0.85 : 0.0),
      userPresent: data.metadata?.userPresent || false,
      imageWidth: data.metadata?.width || 0,
      imageHeight: data.metadata?.height || 0,
      imageQuality: data.metadata?.quality || 0.7,
      capturedAt: new Date(data.timestamp).toISOString(),
    };
    
    console.log(`📤 [${callId}] 发送快照到后端: ${BACKEND_API_URL}/monitoring/saveSnapshots`);
    console.log(`   - 用户: ${snapshotData.userId}, 考试: ${snapshotData.examId}`);
    console.log(`   - 大小: ${(snapshotData.snapshotSize / 1024).toFixed(2)} KB`);
    console.log(`   - 人脸: ${snapshotData.faceDetected ? '✅' : '❌'}`);
    
    // 调用后端API
    const response = await axios.post(
      `${BACKEND_API_URL}/monitoring/saveSnapshots`,
      snapshotData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15秒超时
        maxContentLength: 50 * 1024 * 1024, // 50MB最大内容
      }
    );
    
    console.log(`✅ [${callId}] 快照保存成功: ${response.data.message || 'OK'}`);
    return response.data;
    
  } catch (error) {
    console.error(`❌ [${callId}] 保存快照到后端失败:`, error.message);
    
    if (error.response) {
      console.error('   - 状态码:', error.response.status);
      console.error('   - 响应数据:', error.response.data);
    } else if (error.request) {
      console.error('   - 无响应，可能是网络问题或后端未启动');
    }
    
    // 失败时保存到本地文件，后续可以重试
    saveFailedSnapshot(data);
  }
}

// 保存失败的快照到本地（用于重试）
function saveFailedSnapshot(data) {
  try {
    const filename = `failed_${data.userId}_${Date.now()}.json`;
    const filepath = path.join(failedSnapshotsDir, filename);
    
    // 不保存base64图片数据，只保存元数据
    const metadataOnly = {
      examId: data.examId,
      userId: data.userId,
      timestamp: data.timestamp,
      metadata: data.metadata,
      imageSize: data.image ? data.image.length : 0,
      failedAt: new Date().toISOString(),
    };
    
    fs.writeFileSync(filepath, JSON.stringify(metadataOnly, null, 2));
    console.log(`💾 失败的快照元数据已保存到本地: ${filename}`);
  } catch (error) {
    console.error('保存失败快照到本地也失败了:', error);
  }
}

// 处理用户活动状态
function handleUserActivity(clientInfo, data) {
  try {
    const logData = {
      examId: data.examId,
      userId: data.userId,
      timestamp: data.timestamp,
      activity: data.activity,
      receivedAt: Date.now(),
    };
    
    console.log(`用户活动: ${clientInfo.userId} - ${data.activity.type}`);
    
    // 记录特殊活动
    if (data.activity.type === 'page_visibility_change' && data.activity.data.hidden) {
      const alertMessage = '检测到窗口切换或最小化';
      sendBehaviorAlert(clientInfo, alertMessage);
    }
    
    console.log("data.activity.type =====> ", data.activity);
    if (data.activity.type === 'user_absent') {
      const duration = Math.floor(data.activity.data.duration / 1000);
      const alertMessage = `用户离开座位 ${duration} 秒`;
      sendBehaviorAlert(clientInfo, alertMessage);
    }
    
  } catch (error) {
    console.error('处理用户活动状态失败:', error);
  }
}

// 发送行为警报
function sendBehaviorAlert(clientInfo, message) {
  const client = clients.get(clientInfo.id);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify({
      type: 'behavior_alert',
      data: {
        message,
        timestamp: Date.now(),
        severity: 'warning'
      }
    }));
    
    console.log(`发送行为警报给 ${clientInfo.userId}: ${message}`);
  }
}

// 检查行为警报
function checkBehaviorAlerts(clientInfo, activity) {
  const alerts = [];
  
  if (activity.type === 'page_visibility_change' && activity.data.hidden) {
    alerts.push({
      warningType: 'page_visibility_change',
      message: '检测到窗口切换或最小化',
    });
  }
  
  // 发送警报
  alerts.forEach(alert => {
    sendBehaviorAlert(clientInfo, alert);
  });
}

// 定期行为检查
function performBehaviorCheck(clientInfo, ws) {
  const now = Date.now();
  const timeSinceLastActivity = now - clientInfo.lastActivity.getTime();
  
  // 如果超过60秒没有活动
  // if (timeSinceLastActivity > 60000) {
  //   sendBehaviorAlert(clientInfo, '长时间无活动，请确认用户状态');
  // }
  
  // 如果没有检测到人脸超过30秒
  if (!clientInfo.faceDetected && timeSinceLastActivity > 10000) {
    sendBehaviorAlert(clientInfo, {
      warningType: 'face_detection',
      message: '长时间未检测到用户面部',
    });
  }
}

// 生成客户端ID
function generateClientId() {
  return 'user_client_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// 获取所有连接的客户端状态
function getClientsStatus() {
  const status = [];
  clients.forEach((client, clientId) => {
    status.push({
      clientId,
      examId: client.info.examId,
      userId: client.info.userId,
      monitoringType: client.info.monitoringType,
      connectedAt: client.info.connectedAt,
      lastActivity: client.info.lastActivity,
      faceDetected: client.info.faceDetected,
      userPresent: client.info.userPresent,
      behaviorAlerts: client.info.behaviorAlerts,
      isConnected: client.ws.readyState === WebSocket.OPEN,
    });
  });
  return status;
}

// 管理员查看监控状态的API（简单实现）
function getMonitoringDashboard() {
  const clients = getClientsStatus();
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.isConnected).length;
  const alertClients = clients.filter(c => c.behaviorAlerts.length > 0).length;
  
  return {
    summary: {
      totalClients,
      activeClients,
      alertClients,
      timestamp: Date.now(),
    },
    clients,
  };
}

// 定期清理过期数据
setInterval(() => {
  const now = Date.now();
  const files = fs.readdirSync(monitoringDir);
  
  files.forEach(file => {
    const filepath = path.join(monitoringDir, file);
    const stats = fs.statSync(filepath);
    
    // 删除7天前的数据
    if (now - stats.mtime.getTime() > 7 * 24 * 60 * 60 * 1000) {
      fs.unlinkSync(filepath);
      console.log(`清理过期文件: ${file}`);
    }
  });
}, 24 * 60 * 60 * 1000); // 每天清理一次

// 定期生成监控报告
setInterval(() => {
  const dashboard = getMonitoringDashboard();
  const reportPath = path.join(monitoringDir, `monitoring_report_${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(dashboard, null, 2));
  console.log(`生成监控报告: ${reportPath}`);
}, 5 * 60 * 1000); // 每5分钟生成一次报告

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭用户监控服务器...');
  
  clients.forEach((client, clientId) => {
    client.ws.close(1000, '服务器关闭');
  });
  
  wss.close(() => {
    console.log('用户监控WebSocket服务器已关闭');
    process.exit(0);
  });
});

// 导出用于测试
module.exports = { 
  wss, 
  getClientsStatus, 
  getMonitoringDashboard 
};
