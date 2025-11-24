const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // 直接在 setupProxy 中处理登录请求
  app.post('/api/auth/login', (req, res) => {
    console.log('收到登录请求:', req.body);
    
    // 简单验证
    if (req.body && req.body.studentId && req.body.password) {
      // 模拟成功响应
      res.json({
        code: 200,
        success: true,
        message: '登录成功',
        token: 'mock-token-' + Date.now(),
        userInfo: {
          id: req.body.studentId,
          username: `用户${req.body.studentId}`,
          role: req.body.role || 'teacher'
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

  // 其他 API 请求仍然可以代理
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8083",
      changeOrigin: true,
      pathRewrite: {
        "^/api": "", // 移除 /api 前缀
      },
      secure: false,
      logLevel: 'debug',
      // 不要在代理错误时中断请求
      onError: function(err, req, res) {
        console.error('[Proxy Error]', err);
        // 只有在响应尚未发送的情况下才发送错误响应
        if (!res.headersSent) {
          res.writeHead(500, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify({
            error: 'Proxy Error',
            message: err.message,
            code: 500
          }));
        }
      }
    })
  );
};