# 快照功能（captureAndSendPhoto）使用频率指南

## 📸 当前实现

### 默认配置
```typescript
const DEFAULT_CONFIG: UserMonitoringConfig = {
  captureInterval: 2000,  // 每 2 秒拍照一次
  compressionQuality: 0.7, // 70% 压缩质量
  maxWidth: 640,
  maxHeight: 480,
}
```

### 实际执行
```typescript
// 开始定时拍照
captureIntervalRef.current = setInterval(() => {
  captureAndSendPhoto();
}, finalConfig.captureInterval); // 默认 2000ms = 2秒
```

---

## ⏱️ 行业标准使用频率

### 1. 常见的快照间隔设置

| 场景 | 间隔时间 | 频率 | 适用情况 |
|------|---------|------|---------|
| **高频监控** | 1-2秒 | 30-60次/分钟 | 高风险考试、重要认证考试 |
| **标准监控** | 3-5秒 | 12-20次/分钟 | 普通在线考试（**推荐**） |
| **低频监控** | 10-15秒 | 4-6次/分钟 | 低风险测验、练习模式 |
| **极低频** | 30-60秒 | 1-2次/分钟 | 仅用于记录，不做实时监控 |

### 2. 主流平台对比

| 平台 | 快照频率 | 存储策略 |
|------|---------|---------|
| **ProctorU** | 2-3秒 | 全程存储 |
| **Examity** | 3-5秒 | 全程存储 + AI筛选 |
| **Respondus Monitor** | 5秒 | 异常时刻存储 |
| **腾讯会议监考** | 2-3秒 | 云端存储 |
| **钉钉在线监考** | 3-5秒 | 临时存储 |

---

## 📊 数据量分析

### 单个学生的数据量（60分钟考试）

#### 方案1：高频监控（2秒/次）
```
快照次数：60分钟 × 60秒 ÷ 2秒 = 1,800 张
单张大小：约 100KB（640×480，70%质量）
总数据量：1,800 × 100KB = 180MB

存储方式：
- Base64存储：180MB × 1.33 = 240MB（数据库）
- URL存储：1,800 × 200字节 = 360KB（数据库）+ 180MB（OSS）
```

#### 方案2：标准监控（5秒/次）⭐ 推荐
```
快照次数：60分钟 × 60秒 ÷ 5秒 = 720 张
单张大小：约 100KB
总数据量：720 × 100KB = 72MB

存储方式：
- Base64存储：72MB × 1.33 = 96MB（数据库）
- URL存储：720 × 200字节 = 144KB（数据库）+ 72MB（OSS）
```

#### 方案3：低频监控（10秒/次）
```
快照次数：60分钟 × 60秒 ÷ 10秒 = 360 张
单张大小：约 100KB
总数据量：360 × 100KB = 36MB

存储方式：
- Base64存储：36MB × 1.33 = 48MB（数据库）
- URL存储：360 × 200字节 = 72KB（数据库）+ 36MB（OSS）
```

### 100人考试的总数据量

| 方案 | 快照间隔 | 单人数据 | 100人数据 | 存储成本（OSS） |
|------|---------|---------|-----------|----------------|
| 高频 | 2秒 | 180MB | 18GB | ¥0.9/月 |
| 标准 | 5秒 | 72MB | 7.2GB | ¥0.36/月 |
| 低频 | 10秒 | 36MB | 3.6GB | ¥0.18/月 |

*基于阿里云OSS标准存储：¥0.12/GB/月*

---

## 🎯 推荐配置

### 根据考试类型选择

#### 1. 高风险考试（如：资格认证、期末考试）
```typescript
{
  captureInterval: 2000,        // 2秒
  compressionQuality: 0.8,      // 80%质量
  enableFaceDetection: true,    // 启用人脸检测
  enableBehaviorAnalysis: true, // 启用行为分析
  snapshotRetentionDays: 30,    // 保留30天
}
```
**特点**：
- ✅ 高频监控，不易漏掉异常
- ✅ 高质量图片，便于事后审核
- ❌ 数据量大，成本高

#### 2. 普通考试（如：平时测验、作业）⭐ 推荐
```typescript
{
  captureInterval: 5000,        // 5秒
  compressionQuality: 0.7,      // 70%质量
  enableFaceDetection: true,    // 启用人脸检测
  enableBehaviorAnalysis: true, // 启用行为分析
  snapshotRetentionDays: 7,     // 保留7天
}
```
**特点**：
- ✅ 平衡监控效果和成本
- ✅ 数据量适中
- ✅ 满足大多数场景

#### 3. 低风险测验（如：练习、自测）
```typescript
{
  captureInterval: 10000,       // 10秒
  compressionQuality: 0.6,      // 60%质量
  enableFaceDetection: false,   // 不检测人脸
  enableBehaviorAnalysis: true, // 仅行为分析
  snapshotRetentionDays: 3,     // 保留3天
}
```
**特点**：
- ✅ 低成本
- ✅ 减少学生心理压力
- ❌ 监控精度较低

---

## 🔄 动态调整策略

### 智能频率调整

```typescript
// 根据检测结果动态调整拍照频率
function adjustCaptureInterval(state: MonitoringState) {
  let interval = 5000; // 默认5秒
  
  // 检测到异常，提高频率
  if (!state.faceDetected || !state.userPresent) {
    interval = 2000; // 提高到2秒
  }
  
  // 检测到多次警告，进一步提高
  if (state.behaviorAlerts.length > 3) {
    interval = 1000; // 提高到1秒
  }
  
  // 一切正常，降低频率节省资源
  if (state.faceDetected && state.userPresent && state.behaviorAlerts.length === 0) {
    interval = 10000; // 降低到10秒
  }
  
  return interval;
}
```

### 事件触发拍照

除了定时拍照，还可以在特定事件时立即拍照：

```typescript
// 检测到异常行为时立即拍照
function onBehaviorAlert(alertType: string) {
  if (['tab_switch', 'window_blur', 'fullscreen_exit'].includes(alertType)) {
    captureAndSendPhoto(); // 立即拍照
  }
}

// 答题时拍照
function onAnswerSubmit(questionId: number) {
  captureAndSendPhoto(); // 记录答题时刻
}
```

---

## 💾 存储优化策略

### 1. 分级存储

```typescript
interface SnapshotStorageStrategy {
  // 实时传输：仅传输缩略图
  realtime: {
    interval: 2000,
    quality: 0.5,
    maxWidth: 320,
    maxHeight: 240,
    storage: 'memory', // 仅内存，不存储
  },
  
  // 定期存储：存储标准质量
  periodic: {
    interval: 10000,
    quality: 0.7,
    maxWidth: 640,
    maxHeight: 480,
    storage: 'oss', // 存储到OSS
  },
  
  // 异常存储：存储高质量
  onAlert: {
    trigger: 'behavior_alert',
    quality: 0.9,
    maxWidth: 1280,
    maxHeight: 720,
    storage: 'oss_archive', // 存储到归档存储
  }
}
```

### 2. 智能压缩

```typescript
// 根据图片内容动态调整压缩质量
function getOptimalQuality(imageData: ImageData): number {
  const complexity = calculateImageComplexity(imageData);
  
  if (complexity > 0.8) {
    return 0.8; // 复杂图片用高质量
  } else if (complexity > 0.5) {
    return 0.7; // 中等复杂度
  } else {
    return 0.6; // 简单图片用低质量
  }
}
```

### 3. 差异化存储

```typescript
// 只存储有变化的快照
function shouldSaveSnapshot(currentSnapshot: string, lastSnapshot: string): boolean {
  const similarity = calculateImageSimilarity(currentSnapshot, lastSnapshot);
  
  // 如果相似度低于95%，说明有明显变化，需要存储
  return similarity < 0.95;
}
```

---

## 🌐 网络带宽考虑

### 上传速度要求

| 快照间隔 | 单张大小 | 上传速度要求 | 适用网络 |
|---------|---------|-------------|---------|
| 2秒 | 100KB | 50KB/s = 400Kbps | 需要良好网络 |
| 5秒 | 100KB | 20KB/s = 160Kbps | 普通宽带 |
| 10秒 | 100KB | 10KB/s = 80Kbps | 移动网络 |

### 网络自适应

```typescript
// 根据网络状况调整
function adjustForNetwork(networkSpeed: number) {
  if (networkSpeed < 100) { // < 100KB/s
    return {
      captureInterval: 10000,
      compressionQuality: 0.5,
      maxWidth: 480,
      maxHeight: 360,
    };
  } else if (networkSpeed < 500) { // < 500KB/s
    return {
      captureInterval: 5000,
      compressionQuality: 0.7,
      maxWidth: 640,
      maxHeight: 480,
    };
  } else { // > 500KB/s
    return {
      captureInterval: 2000,
      compressionQuality: 0.8,
      maxWidth: 800,
      maxHeight: 600,
    };
  }
}
```

---

## 📈 性能影响

### CPU使用率

| 快照间隔 | CPU占用 | 影响 |
|---------|---------|------|
| 1秒 | 15-20% | 较高，可能影响答题 |
| 2秒 | 8-12% | 中等 |
| 5秒 | 3-5% | 较低 ⭐ |
| 10秒 | 1-2% | 很低 |

### 内存使用

```
单次快照内存：约 2-3MB（临时）
持续监控内存：约 50-100MB
```

---

## 🎓 实际案例

### 案例1：某大学期末考试
```
考试时长：120分钟
学生人数：500人
快照间隔：3秒
总快照数：500人 × (120×60÷3) = 1,200,000 张
总数据量：1,200,000 × 100KB = 120GB
存储成本：120GB × ¥0.12/GB = ¥14.4/月
```

### 案例2：在线培训测验
```
考试时长：30分钟
学生人数：100人
快照间隔：10秒
总快照数：100人 × (30×60÷10) = 18,000 张
总数据量：18,000 × 80KB = 1.44GB
存储成本：1.44GB × ¥0.12/GB = ¥0.17/月
```

---

## 💡 最佳实践建议

### 1. 根据考试重要性分级

```typescript
enum ExamLevel {
  CRITICAL = 'critical',   // 2秒间隔
  IMPORTANT = 'important', // 5秒间隔
  NORMAL = 'normal',       // 10秒间隔
  PRACTICE = 'practice',   // 30秒间隔或不拍照
}

function getConfigByLevel(level: ExamLevel) {
  const configs = {
    critical: { interval: 2000, quality: 0.8 },
    important: { interval: 5000, quality: 0.7 },
    normal: { interval: 10000, quality: 0.6 },
    practice: { interval: 30000, quality: 0.5 },
  };
  return configs[level];
}
```

### 2. 提供用户选择

```typescript
// 让教师在创建考试时选择监控级别
interface ExamMonitoringSettings {
  level: 'strict' | 'normal' | 'relaxed';
  customInterval?: number; // 允许自定义
}
```

### 3. 考虑隐私和体验

- ⚠️ 过于频繁的拍照会让学生感到压力
- ⚠️ 需要在监控效果和用户体验之间平衡
- ✅ 建议提前告知学生监控频率
- ✅ 提供隐私政策说明

---

## 🔧 配置示例

### 修改当前配置

```typescript
// src/hooks/useScreenMonitoring.ts
const DEFAULT_CONFIG: UserMonitoringConfig = {
  websocketUrl: 'ws://localhost:8080/user-monitoring',
  captureInterval: 5000, // 改为5秒（推荐）
  compressionQuality: 0.7,
  maxWidth: 640,
  maxHeight: 480,
  enableFaceDetection: true,
  enableBehaviorAnalysis: true,
};
```

### 动态配置

```typescript
// 从考试设置中获取配置
const examSettings = await getExamMonitoringSettings(examId);
const config = {
  captureInterval: examSettings.snapshotInterval || 5000,
  compressionQuality: examSettings.snapshotQuality || 0.7,
  // ...
};
```

---

## 📊 总结

### 推荐配置表

| 考试类型 | 间隔 | 质量 | 单人/小时 | 100人/小时 |
|---------|------|------|----------|-----------|
| 重要考试 | 2-3秒 | 0.8 | 180MB | 18GB |
| 普通考试 | 5秒 ⭐ | 0.7 | 72MB | 7.2GB |
| 测验练习 | 10秒 | 0.6 | 36MB | 3.6GB |

### 关键要点

1. **默认推荐**：5秒间隔，平衡效果和成本
2. **高风险**：2-3秒间隔，确保不漏掉异常
3. **低风险**：10秒或更长，节省资源
4. **动态调整**：根据检测结果实时调整频率
5. **存储优化**：使用OSS存储，定期清理过期数据
6. **网络自适应**：根据网络状况自动调整参数

**当前实现（2秒）适用于高要求场景，建议根据实际需求调整！**

