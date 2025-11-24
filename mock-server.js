const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 8083;

// 创建上传目录
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB限制
});

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
// 静态文件服务 - 用于访问上传的图片
app.use('/uploads', express.static(uploadDir));

// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('请求体:', JSON.stringify(req.body));
  }
  next();
});

// 模拟登录API
app.post('/auth/login', (req, res) => {
  const { studentId, password, role } = req.body;
  
  console.log('登录尝试:', { studentId, password, role });
  
  // 简单验证
  if (studentId && password) {
    // 模拟成功响应
    res.json({
      code: 200,
      success: true,
      message: '登录成功',
      token: 'mock-token-' + Date.now(),
      userInfo: {
        id: studentId,
        username: `用户${studentId}`,
        role: role || 'teacher'
      }
    });
  } else {
    // 模拟失败响应
    res.status(400).json({
      code: 400,
      success: false,
      message: '用户名或密码错误'
    });
  }
});

// 文件上传接口
app.post('/monitoring/snapshots/upload', upload.single('file'), (req, res) => {
  console.log('📤 收到文件上传请求');
  console.log('  - file:', req.file);
  console.log('  - body:', req.body);
  
  if (!req.file) {
    return res.status(400).json({
      code: 400,
      success: false,
      message: '没有收到文件'
    });
  }

  // 生成文件URL
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  
  res.json({
    code: 200,
    success: true,
    message: '文件上传成功',
    data: {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      examId: req.body.examId,
      userId: req.body.userId
    }
  });
});

// 保存快照元数据接口
app.post('/monitoring/saveSnapshots', (req, res) => {
  console.log('💾 收到保存快照元数据请求');
  console.log('  - body:', req.body);
  
  res.json({
    code: 200,
    success: true,
    message: '快照元数据保存成功',
    data: {
      id: Date.now(),
      ...req.body
    }
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    success: false,
    message: '服务器内部错误'
  });
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`Mock API服务器运行在 http://localhost:${PORT}`);
});

// 确保服务器不会因为未捕获的异常而崩溃
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});