# saveSnapshotToBackend 调用频率分析

## 📊 调用频率总结

### 结论
**`saveSnapshotToBackend` 方法每 20 秒调用一次**（正常情况下）

---

## 🔍 详细分析

### 1. 前端拍照频率

**文件**：`src/hooks/useScreenMonitoring.ts`

```typescript
// 第9行：配置
const DEFAULT_CONFIG: UserMonitoringConfig = {
  captureInterval: 2000, // 2秒拍照一次 ⏱️
  // ...
};

// 第265-267行：定时器
captureIntervalRef.current = setInterval(() => {
  captureAndSendPhoto();
}, finalConfig.captureInterval); // 每2秒执行一次
```

**拍照频率**：**每 2 秒拍照一次** 📸

---

### 2. WebSocket发送频率

每次拍照后立即通过WebSocket发送到服务器：

```typescript
// captureAndSendPhoto 函数中
wsRef.current.send(JSON.stringify({
  type: 'user_photo',
  data: { ... }
}));
```

**发送频率**：**每 2 秒发送一次** 📤

---

### 3. 服务器存储策略

**文件**：`websocket-server.js`

```javascript
// 第196-218行：存储策略
function decideSaveSnapshot(clientInfo, data) {
  // 初始化计数器
  if (!clientInfo.snapshotCount) {
    clientInfo.snapshotCount = 0;
  }
  clientInfo.snapshotCount++; // 每次收到快照，计数+1
  
  // 策略1：检测到异常时必须保存
  if (!data.metadata?.faceDetected || !data.metadata?.userPresent) {
    return true; // 立即保存 ⚠️
  }
  
  // 策略2：定期保存（每10次保存一次）
  if (clientInfo.snapshotCount % 10 === 0) {
    return true; // 每10次保存一次 ✅
  }
  
  return false; // 其他情况不保存 ⏭️
}
```

**保存策略**：
- ✅ **每10次保存1次**（正常情况）
- ⚠️ **异常时立即保存**（人脸消失、用户离座）

---

## 📈 调用频率计算

### 正常情况（无异常）

```
拍照间隔：2秒
保存策略：每10次保存1次

计算：
- 每2秒拍照1次
- 每10次拍照保存1次
- 保存间隔 = 2秒 × 10次 = 20秒

结论：saveSnapshotToBackend 每 20 秒调用一次 ⏱️
```

### 异常情况（检测到人脸消失）

```
拍照间隔：2秒
保存策略：立即保存

计算：
- 每2秒拍照1次
- 检测到异常立即保存
- 保存间隔 = 2秒（每次都保存）

结论：saveSnapshotToBackend 每 2 秒调用一次 ⚠️
```

---

## 🕐 时间线示例

### 场景1：正常考试（60秒）

```
时间  | 动作                    | 是否保存 | 原因
------|------------------------|---------|------------------
0s    | 拍照 #1                | ❌      | 跳过
2s    | 拍照 #2                | ❌      | 跳过
4s    | 拍照 #3                | ❌      | 跳过
6s    | 拍照 #4                | ❌      | 跳过
8s    | 拍照 #5                | ❌      | 跳过
10s   | 拍照 #6                | ❌      | 跳过
12s   | 拍照 #7                | ❌      | 跳过
14s   | 拍照 #8                | ❌      | 跳过
16s   | 拍照 #9                | ❌      | 跳过
18s   | 拍照 #10               | ✅      | 定期保存（第10次）
20s   | 拍照 #11               | ❌      | 跳过
...   | ...                    | ...     | ...
38s   | 拍照 #20               | ✅      | 定期保存（第20次）
...   | ...                    | ...     | ...
58s   | 拍照 #30               | ✅      | 定期保存（第30次）

总结：60秒内拍照30次，保存3次
保存频率：每20秒1次
```

### 场景2：异常情况（人脸消失）

```
时间  | 动作                    | 是否保存 | 原因
------|------------------------|---------|------------------
0s    | 拍照 #1 (正常)         | ❌      | 跳过
2s    | 拍照 #2 (正常)         | ❌      | 跳过
4s    | 拍照 #3 (正常)         | ❌      | 跳过
6s    | 拍照 #4 (人脸消失)     | ✅      | 异常保存 ⚠️
8s    | 拍照 #5 (人脸消失)     | ✅      | 异常保存 ⚠️
10s   | 拍照 #6 (人脸消失)     | ✅      | 异常保存 ⚠️
12s   | 拍照 #7 (恢复正常)     | ❌      | 跳过
14s   | 拍照 #8 (正常)         | ❌      | 跳过
16s   | 拍照 #9 (正常)         | ❌      | 跳过
18s   | 拍照 #10 (正常)        | ✅      | 定期保存（第10次）

总结：异常期间每2秒保存1次，恢复后每20秒保存1次
```

---

## 📊 数据量统计

### 1小时考试（正常情况）

```
拍照次数：60分钟 × 60秒 ÷ 2秒 = 1,800次
保存次数：1,800次 ÷ 10 = 180次
保存频率：每20秒保存1次

数据量：
- 单张快照：~100KB
- 总保存量：180次 × 100KB = 18MB
```

### 1小时考试（异常情况，持续10分钟异常）

```
正常时间：50分钟
异常时间：10分钟

正常保存：50分钟 × 3次/分钟 = 150次
异常保存：10分钟 × 30次/分钟 = 300次
总保存次数：150 + 300 = 450次

数据量：450次 × 100KB = 45MB
```

---

## 🎯 调用频率配置

### 当前配置

```javascript
// 前端拍照间隔
captureInterval: 2000  // 2秒

// 服务器保存策略
snapshotCount % 10 === 0  // 每10次保存1次

// 实际保存频率
2秒 × 10次 = 20秒/次
```

### 修改保存频率

如果想改变 `saveSnapshotToBackend` 的调用频率：

#### 方案1：修改保存策略（推荐）

**文件**：`websocket-server.js`

```javascript
// 修改第211行
// 原来：每10次保存1次（20秒）
if (clientInfo.snapshotCount % 10 === 0) {

// 改为：每5次保存1次（10秒）
if (clientInfo.snapshotCount % 5 === 0) {

// 改为：每20次保存1次（40秒）
if (clientInfo.snapshotCount % 20 === 0) {
```

#### 方案2：修改拍照间隔

**文件**：`src/hooks/useScreenMonitoring.ts`

```typescript
// 修改第9行
// 原来：2秒拍照一次
captureInterval: 2000,

// 改为：5秒拍照一次
captureInterval: 5000,
// 结果：每10次保存 = 5秒 × 10 = 50秒调用一次

// 改为：1秒拍照一次
captureInterval: 1000,
// 结果：每10次保存 = 1秒 × 10 = 10秒调用一次
```

---

## 📝 调用频率对比表

| 拍照间隔 | 保存策略 | saveSnapshotToBackend调用频率 | 1小时保存次数 | 1小时数据量 |
|---------|---------|------------------------------|--------------|------------|
| 2秒 | 每10次 | **20秒/次** ⭐ 当前 | 180次 | 18MB |
| 2秒 | 每5次 | 10秒/次 | 360次 | 36MB |
| 2秒 | 每20次 | 40秒/次 | 90次 | 9MB |
| 5秒 | 每10次 | 50秒/次 | 72次 | 7.2MB |
| 1秒 | 每10次 | 10秒/次 | 360次 | 36MB |

---

## 🔍 验证方法

### 方法1：查看WebSocket日志

```bash
# 启动WebSocket服务器
node websocket-server.js

# 观察日志输出
# 应该看到：
# 📸 收到用户 xxx 的快照数据
# ⏭️ 跳过保存快照 (第1次)
# ⏭️ 跳过保存快照 (第2次)
# ...
# ✅ 保存原因: 定期保存 (第10次)
# 💾 准备保存快照到数据库
# ✅ 快照保存成功
```

### 方法2：添加计时器

在 `websocket-server.js` 中添加：

```javascript
let lastSaveTime = Date.now();

async function saveSnapshotToBackend(data) {
  const now = Date.now();
  const interval = (now - lastSaveTime) / 1000;
  console.log(`⏱️ 距离上次保存: ${interval.toFixed(1)}秒`);
  lastSaveTime = now;
  
  // ... 原有代码
}
```

### 方法3：数据库查询

```sql
-- 查询最近10次保存的时间间隔
SELECT 
    id,
    created_at,
    TIMESTAMPDIFF(SECOND, 
        LAG(created_at) OVER (ORDER BY created_at), 
        created_at
    ) as interval_seconds
FROM exam_monitoring_snapshots
WHERE exam_id = 1001 AND user_id = 2022001
ORDER BY created_at DESC
LIMIT 10;
```

预期结果：
```
id    | created_at          | interval_seconds
------|---------------------|------------------
12345 | 2024-01-10 10:30:40 | 20
12344 | 2024-01-10 10:30:20 | 20
12343 | 2024-01-10 10:30:00 | 20
12342 | 2024-01-10 10:29:40 | 20
...
```

---

## 🎯 总结

### 当前调用频率

```
📸 前端拍照：每 2 秒
📤 WebSocket发送：每 2 秒
💾 saveSnapshotToBackend：每 20 秒（正常情况）
⚠️ saveSnapshotToBackend：每 2 秒（异常情况）
```

### 关键点

1. **前端每2秒拍照一次**
2. **WebSocket每次都发送**
3. **服务器智能过滤，每10次保存1次**
4. **实际保存频率：20秒/次**
5. **异常时立即保存：2秒/次**

### 优势

- ✅ 节省89%存储空间
- ✅ 减少数据库压力
- ✅ 异常时不漏掉关键信息
- ✅ 灵活可配置

**当前配置是最优方案！** 🎉

