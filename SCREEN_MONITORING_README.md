# 用户监控功能使用说明

## 功能概述

该用户监控功能基于 React + WebSocket 实现，用于考试过程中的实时用户行为监控。功能包括：

- 实时摄像头监控用户
- 人脸检测和用户在座状态
- 行为异常检测和警报
- 页面活动状态监控
- WebSocket 连接管理
- 断线重连机制
- 错误处理和状态管理

## 文件结构

```
src/
├── hooks/
│   └── useScreenMonitoring.ts     # 用户监控Hook (重命名但保持兼容)
├── components/
│   └── OnlineExamination/
│       ├── index.tsx              # 主组件 
│       └── ScreenMonitoring.css   # 监控组件样式
└── websocket-server.js            # WebSocket服务器
```

## 核心组件

### 1. useUserMonitoring Hook

**功能**：管理用户监控的所有逻辑
- WebSocket 连接管理
- 摄像头控制和人脸检测
- 用户行为分析
- 异常警报处理
- 状态管理

**配置参数**：
```typescript
interface UserMonitoringConfig {
  websocketUrl: string;              // WebSocket服务器地址
  captureInterval: number;           // 拍照间隔（毫秒）
  compressionQuality: number;        // 图片压缩质量 0-1
  maxWidth: number;                  // 最大宽度
  maxHeight: number;                 // 最大高度
  enableFaceDetection: boolean;      // 是否启用面部检测
  enableBehaviorAnalysis: boolean;   // 是否启用行为分析
}
```

**返回值**：
```typescript
{
  state: {
    isConnected: boolean;           // 连接状态
    isCameraActive: boolean;        // 摄像头激活状态
    connectionStatus: string;       // 连接状态详情
    error: string | null;           // 错误信息
    lastActivity: Date | null;      // 最后活动时间
    faceDetected: boolean;          // 是否检测到人脸
    userPresent: boolean;           // 用户是否在座
    behaviorAlerts: string[];       // 行为警报列表
  },
  actions: {
    startCameraMonitoring: () => void;      // 开始摄像头监控
    stopCameraMonitoring: () => void;       // 停止摄像头监控
    captureAndSendPhoto: () => void;        // 立即拍照
    sendActivityStatus: (activity) => void; // 发送活动状态
    disconnect: () => void;                 // 断开连接
    reconnect: () => void;                  // 重新连接
  },
  getVideoElement: () => HTMLVideoElement | null; // 获取视频元素
}
```

### 2. rendereRealTimeMonitoring 组件

**尺寸**：280x270 像素
**功能**：
- 显示用户监控状态
- 控制摄像头监控
- 人脸检测状态显示
- 行为警报展示
- 错误信息处理

**UI元素**：
- 连接状态指示器
- 开始/停止监控按钮
- 立即拍照按钮
- 监控信息面板（摄像头、人脸检测、用户状态）
- 摄像头预览区域
- 行为警报列表
- 错误处理界面

## 监控功能

### 1. 人脸检测
- 基于图像亮度分析的简单人脸检测
- 检测用户是否在摄像头前
- 实时更新人脸检测状态

### 2. 行为分析
- 检测用户离开座位（超过10秒未检测到人脸）
- 监控页面可见性变化（切换窗口、最小化）
- 检测鼠标离开页面
- 长时间无活动警报

### 3. 异常警报
- 用户离开座位警报
- 切换窗口或最小化警报
- 鼠标离开页面警报
- 长时间无活动警报
- 摄像头权限问题警报

## 启动方式

### 1. 安装依赖
```bash
npm install ws concurrently
```

### 2. 启动WebSocket服务器
```bash
npm run ws-server
```

### 3. 启动React应用
```bash
npm start
```

### 4. 同时启动（推荐）
```bash
npm run dev
```

## WebSocket服务器

**端口**：8080
**支持消息类型**：

1. **认证消息**
```json
{
  "type": "auth",
  "data": {
    "examId": "考试ID",
    "userId": "用户ID",
    "timestamp": 1234567890,
    "monitoringType": "user"
  }
}
```

2. **用户照片数据**
```json
{
  "type": "user_photo",
  "data": {
    "examId": "考试ID",
    "userId": "用户ID",
    "timestamp": 1234567890,
    "image": "base64图片数据",
    "metadata": {
      "width": 640,
      "height": 480,
      "quality": 0.7,
      "faceDetected": true,
      "userPresent": true
    }
  }
}
```

3. **用户活动状态**
```json
{
  "type": "user_activity",
  "data": {
    "examId": "考试ID",
    "userId": "用户ID",
    "timestamp": 1234567890,
    "activity": {
      "type": "page_visibility_change",
      "data": { "hidden": false }
    }
  }
}
```

4. **行为警报**
```json
{
  "type": "behavior_alert",
  "data": {
    "message": "检测到用户离开座位",
    "timestamp": 1234567890,
    "severity": "warning"
  }
}
```

## 浏览器权限

使用用户监控功能需要用户授权：
1. 摄像头权限（`getUserMedia`）
2. 支持现代浏览器（Chrome 53+, Firefox 36+, Safari 11+）
3. 必须在HTTPS环境下使用（本地开发可使用HTTP）

## 隐私和安全

### 1. 隐私保护
- 摄像头预览仅显示状态，不显示实际画面
- 图片数据仅用于检测，服务器端只保存元数据
- 用户明确知晓监控功能并同意使用

### 2. 数据安全
- WebSocket 安全连接（生产环境使用WSS）
- 服务器端验证考试ID和用户ID
- 照片数据定期清理（7天后自动删除）
- 访问控制和权限验证

### 3. 合规性
- 仅用于合法的考试监控场景
- 遵守相关法律法规和隐私政策
- 用户明确授权和知情同意

## 错误处理

### 1. 摄像头权限问题
- `NotAllowedError`: 权限被拒绝
- `NotFoundError`: 未找到摄像头设备
- `NotReadableError`: 摄像头被占用

### 2. 连接问题
- 自动重连机制（3秒后重试）
- 连接状态实时显示
- 错误信息详细提示

### 3. 行为检测
- 人脸检测失败时的备用方案
- 异常行为的多重验证
- 警报去重和频率控制

## 性能优化

### 1. 图片处理
- 可调节摄像头分辨率（默认640x480）
- 图片压缩质量配置（默认0.7）
- 拍照频率控制（默认2秒一次）

### 2. 内存管理
- 及时释放MediaStream资源
- Canvas复用和优化
- 定时器清理机制

### 3. 网络优化
- WebSocket连接复用
- 数据压缩传输
- 心跳机制维持连接

## 高级功能

### 1. 人脸检测算法
- 当前使用简单的亮度检测算法
- 可扩展为更精确的人脸识别
- 支持第三方人脸检测库集成

### 2. 行为分析
- 多维度行为检测
- 异常行为模式识别
- 可配置的检测阈值

### 3. 监控报告
- 每5分钟生成监控报告
- 客户端状态统计
- 异常行为汇总

## 故障排除

### 1. 摄像头无法启动
- 检查浏览器权限设置
- 确认摄像头硬件正常
- 关闭其他占用摄像头的应用

### 2. 人脸检测不准确
- 调整光线环境
- 确保用户正对摄像头
- 检查摄像头清洁度

### 3. 连接频繁断开
- 检查网络稳定性
- 确认服务器运行状态
- 查看控制台错误日志

## 开发扩展

### 1. 人脸识别升级
```typescript
// 集成更先进的人脸检测库
import * as faceapi from 'face-api.js';

const detectFaceAdvanced = async (imageData) => {
  const detections = await faceapi.detectAllFaces(imageData);
  return detections.length > 0;
};
```

### 2. 情绪分析
```typescript
// 添加情绪检测功能
const analyzeEmotion = (faceData) => {
  // 集成情绪分析API
  return {
    emotion: 'neutral',
    confidence: 0.85
  };
};
```

### 3. 注意力检测
```typescript
// 检测用户注意力状态
const detectAttention = (eyeData) => {
  return {
    isLookingAtScreen: true,
    attentionLevel: 0.9
  };
};
```

## 注意事项

1. **法律合规**：确保在法律允许的范围内使用监控功能
2. **用户同意**：必须获得用户明确同意才能启用监控
3. **数据保护**：妥善处理和保护用户监控数据
4. **技术限制**：人脸检测准确性受环境光线影响
5. **性能影响**：长时间监控可能影响设备性能
6. **网络要求**：需要稳定的网络连接支持实时数据传输

## 更新日志

- v1.1.0: 从屏幕监控改为用户监控
- v1.1.1: 添加人脸检测功能
- v1.1.2: 增强行为分析能力
- v1.1.3: 优化隐私保护措施
