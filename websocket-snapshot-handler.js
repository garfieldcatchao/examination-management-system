/**
 * WebSocket 快照处理模块
 * 用于处理学生端发送的快照数据并保存到后端
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 后端API地址
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api';

// 失败快照存储目录
const FAILED_SNAPSHOTS_DIR = path.join(__dirname, 'failed-snapshots');

// 确保失败快照目录存在
if (!fs.existsSync(FAILED_SNAPSHOTS_DIR)) {
  fs.mkdirSync(FAILED_SNAPSHOTS_DIR, { recursive: true });
}

/**
 * 处理用户照片数据（主函数）
 * 在 websocket-server.js 中调用
 */
async function handleUserPhoto(clientInfo, data) {
  try {
    console.log(`收到用户 ${clientInfo.userId} 的快照数据`);
    
    // 1. 更新客户端信息
    clientInfo.faceDetected = data.metadata.faceDetected;
    clientInfo.userPresent = data.metadata.userPresent;
    clientInfo.lastActivity = new Date();
    
    // 2. 检查异常行为
    if (!data.metadata.faceDetected) {
      const alertMessage = '检测到人脸消失';
      clientInfo.behaviorAlerts = clientInfo.behaviorAlerts || [];
      clientInfo.behaviorAlerts.push({
        warningType: 'face_lost',
        message: alertMessage,
        timestamp: Date.now(),
      });
      console.log(`⚠️ 警告: ${clientInfo.userId} - ${alertMessage}`);
    }
    
    // 3. 决定是否保存到数据库
    const shouldSave = decideSaveSnapshot(clientInfo, data);
    
    if (shouldSave) {
      console.log(`📸 准备保存快照: 用户${clientInfo.userId}`);
      // 4. 调用后端API保存快照
      await saveSnapshotToBackend(data);
    } else {
      console.log(`⏭️ 跳过保存快照: 用户${clientInfo.userId} (策略过滤)`);
    }
    
  } catch (error) {
    console.error('处理用户照片数据失败:', error);
  }
}

/**
 * 决定是否保存快照（存储策略）
 */
function decideSaveSnapshot(clientInfo, data) {
  // 初始化计数器
  if (!clientInfo.snapshotCount) {
    clientInfo.snapshotCount = 0;
  }
  clientInfo.snapshotCount++;
  
  // 策略1：检测到异常时必须保存
  if (!data.metadata.faceDetected || !data.metadata.userPresent) {
    console.log(`✅ 保存原因: 检测到异常 (人脸:${data.metadata.faceDetected}, 在座:${data.metadata.userPresent})`);
    return true;
  }
  
  // 策略2：定期保存（每10次保存一次）
  // 如果快照间隔是2秒，则每20秒保存一次
  if (clientInfo.snapshotCount % 10 === 0) {
    console.log(`✅ 保存原因: 定期保存 (第${clientInfo.snapshotCount}次)`);
    return true;
  }
  
  // 策略3：考试开始和结束时保存
  if (data.metadata.isExamStart || data.metadata.isExamEnd) {
    console.log(`✅ 保存原因: 考试关键时刻`);
    return true;
  }
  
  // 其他情况不保存
  return false;
}

/**
 * 保存快照到后端API
 */
async function saveSnapshotToBackend(data) {
  try {
    // 准备请求数据
    const snapshotData = {
      examId: parseInt(data.examId),
      userId: parseInt(data.userId),
      snapshotData: data.image,  // base64数据
      snapshotSize: data.image ? data.image.length : 0,
      faceDetected: data.metadata.faceDetected,
      faceConfidence: data.metadata.faceDetected ? 0.85 : 0.0, // 简化处理
      userPresent: data.metadata.userPresent,
      imageWidth: data.metadata.width,
      imageHeight: data.metadata.height,
      imageQuality: data.metadata.quality,
      capturedAt: new Date(data.timestamp).toISOString(),
    };
    
    console.log(`📤 发送快照到后端: ${BACKEND_API_URL}/monitoring/snapshots`);
    console.log(`   - 用户: ${snapshotData.userId}`);
    console.log(`   - 考试: ${snapshotData.examId}`);
    console.log(`   - 大小: ${(snapshotData.snapshotSize / 1024).toFixed(2)} KB`);
    console.log(`   - 人脸: ${snapshotData.faceDetected ? '✅' : '❌'}`);
    
    // 调用后端API
    const response = await axios.post(
      `${BACKEND_API_URL}/monitoring/snapshots`,
      snapshotData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15秒超时
        maxContentLength: 50 * 1024 * 1024, // 50MB最大内容
      }
    );
    
    console.log(`✅ 快照保存成功: ID=${response.data.id || 'unknown'}`);
    return response.data;
    
  } catch (error) {
    console.error('❌ 保存快照到后端失败:', error.message);
    
    if (error.response) {
      console.error('   - 状态码:', error.response.status);
      console.error('   - 响应数据:', error.response.data);
    } else if (error.request) {
      console.error('   - 无响应，可能是网络问题或后端未启动');
    }
    
    // 失败时保存到本地文件，后续可以重试
    saveFailedSnapshot(data);
    
    throw error;
  }
}

/**
 * 保存失败的快照到本地（用于重试）
 */
function saveFailedSnapshot(data) {
  try {
    const filename = `failed_${data.userId}_${Date.now()}.json`;
    const filepath = path.join(FAILED_SNAPSHOTS_DIR, filename);
    
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

/**
 * 重试失败的快照（可选功能）
 */
async function retryFailedSnapshots() {
  try {
    const files = fs.readdirSync(FAILED_SNAPSHOTS_DIR);
    const failedFiles = files.filter(f => f.startsWith('failed_') && f.endsWith('.json'));
    
    if (failedFiles.length === 0) {
      console.log('没有失败的快照需要重试');
      return;
    }
    
    console.log(`发现 ${failedFiles.length} 个失败的快照，准备重试...`);
    
    for (const file of failedFiles) {
      const filepath = path.join(FAILED_SNAPSHOTS_DIR, file);
      const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      
      try {
        // 注意：这里只有元数据，没有图片数据
        // 实际重试时需要考虑是否还需要图片
        console.log(`重试快照: ${file}`);
        // await saveSnapshotToBackend(data);
        
        // 如果成功，删除文件
        // fs.unlinkSync(filepath);
        // console.log(`✅ 重试成功，已删除: ${file}`);
      } catch (error) {
        console.error(`❌ 重试失败: ${file}`, error.message);
      }
    }
  } catch (error) {
    console.error('重试失败的快照时出错:', error);
  }
}

/**
 * 可选：上传图片到OSS
 * 需要安装 ali-oss: npm install ali-oss
 */
async function uploadToOSS(base64Data, examId, userId, timestamp) {
  try {
    // 检查是否配置了OSS
    if (!process.env.OSS_REGION || !process.env.OSS_ACCESS_KEY_ID) {
      console.log('OSS未配置，跳过上传');
      return null;
    }
    
    const OSS = require('ali-oss');
    const client = new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
    });
    
    // 将base64转换为Buffer
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');
    
    // 生成文件路径: exam-snapshots/考试ID/用户ID/时间戳.jpg
    const date = new Date(timestamp);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `exam-snapshots/${examId}/${userId}/${dateStr}/${timestamp}.jpg`;
    
    // 上传到OSS
    const result = await client.put(filename, buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
    
    console.log(`✅ 图片已上传到OSS: ${result.url}`);
    return result.url;
    
  } catch (error) {
    console.error('❌ 上传到OSS失败:', error);
    return null;
  }
}

/**
 * 使用OSS的完整处理流程
 */
async function handleUserPhotoWithOSS(clientInfo, data) {
  try {
    console.log(`收到用户 ${clientInfo.userId} 的快照数据（OSS模式）`);
    
    // 1. 上传到OSS
    const snapshotUrl = await uploadToOSS(
      data.image, 
      data.examId, 
      data.userId, 
      data.timestamp
    );
    
    // 2. 准备保存数据
    const snapshotData = {
      examId: parseInt(data.examId),
      userId: parseInt(data.userId),
      snapshotUrl: snapshotUrl,  // OSS URL
      snapshotData: snapshotUrl ? null : data.image, // 如果有URL就不存base64
      snapshotSize: data.image ? data.image.length : 0,
      faceDetected: data.metadata.faceDetected,
      faceConfidence: data.metadata.faceDetected ? 0.85 : 0.0,
      userPresent: data.metadata.userPresent,
      imageWidth: data.metadata.width,
      imageHeight: data.metadata.height,
      imageQuality: data.metadata.quality,
      capturedAt: new Date(data.timestamp).toISOString(),
    };
    
    // 3. 保存到数据库
    const response = await axios.post(
      `${BACKEND_API_URL}/monitoring/snapshots`,
      snapshotData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    
    console.log(`✅ 快照保存成功（OSS模式）: ID=${response.data.id}`);
    return response.data;
    
  } catch (error) {
    console.error('❌ 处理快照失败（OSS模式）:', error);
    saveFailedSnapshot(data);
  }
}

// 导出函数
module.exports = {
  handleUserPhoto,
  handleUserPhotoWithOSS,
  saveSnapshotToBackend,
  decideSaveSnapshot,
  retryFailedSnapshots,
  uploadToOSS,
};

// 如果直接运行此文件，执行重试逻辑
if (require.main === module) {
  console.log('执行失败快照重试...');
  retryFailedSnapshots()
    .then(() => {
      console.log('重试完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('重试失败:', error);
      process.exit(1);
    });
}

