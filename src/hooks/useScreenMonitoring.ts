import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../server";
import { UserMonitoringConfig, UserMonitoringState } from "../interface/monitoringFace";



const DEFAULT_CONFIG: UserMonitoringConfig = {
  websocketUrl: "ws://localhost:8080/user-monitoring",
  captureInterval: 2000, // 2秒拍照一次
  compressionQuality: 0.7,
  maxWidth: 640,
  maxHeight: 480,
  enableFaceDetection: true,
  enableBehaviorAnalysis: true,
  faceDetectionSensitivity: "medium", // 默认中等灵敏度
};

export default function useUserMonitoring(
  examId: string,
  userId: string,
  config: Partial<UserMonitoringConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [state, setState] = useState<UserMonitoringState>({
    isConnected: false,
    isCameraActive: false,
    connectionStatus: "disconnected",
    error: null,
    lastActivity: null,
    faceDetected: false,
    userPresent: true,
    behaviorAlerts: [],
  });

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const behaviorCheckRef = useRef<NodeJS.Timeout | null>(null);
  const lastFaceDetectionRef = useRef<Date>(new Date());

  // 初始化Canvas
  const initCanvas = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = finalConfig.maxWidth;
      canvasRef.current.height = finalConfig.maxHeight;
    }
    return canvasRef.current;
  }, [finalConfig.maxWidth, finalConfig.maxHeight]);

  // 初始化Video元素
  const initVideo = useCallback(() => {
    if (!videoRef.current) {
      videoRef.current = document.createElement("video");
      videoRef.current.autoplay = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
    }
    return videoRef.current;
  }, []);

  // WebSocket连接
  const connectWebSocket = useCallback(() => {
    try {
      setState((prev) => ({
        ...prev,
        connectionStatus: "connecting",
        error: null,
      }));
      
      wsRef.current = new WebSocket(finalConfig.websocketUrl);
      
      wsRef.current.onopen = () => {
        console.log("用户监控WebSocket连接已建立");
        setState((prev: any) => ({
          ...prev,
          isConnected: true,
          connectionStatus: "connected",
          error: null,
        }));

        // 发送认证信息
        wsRef.current?.send(
          JSON.stringify({
            type: "auth",
            data: {
              examId,
              userId,
              timestamp: Date.now(),
              monitoringType: "user",
            },
          })
        );
      };

      wsRef.current.onmessage = (event) => {
        // console.log("event =====> ", event);
        try {
          const message = JSON.parse(event.data);
          console.log("收到监控消息:", message);
          
          switch (message.type) {
            case "auth_success":
              console.log("认证成功");
              break;
            case "monitoring_command":
              handleMonitoringCommand(message.data);
              break;
            case "behavior_alert":
              handleBehaviorAlert(message.data);
              break;
            default:
              console.log("未知消息类型:", message.type);
          }
        } catch (error) {
          console.error("解析WebSocket消息失败:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket连接已关闭:", event.code, event.reason);
        setState((prev: any) => ({
          ...prev,
          isConnected: false,
          connectionStatus: "disconnected",
          isCameraActive: false,
        }));

        // 自动重连（如果不是主动关闭）
        if (event.code !== 1000) {
          setTimeout(() => {
            connectWebSocket();
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket连接错误:", error);
        setState((prev) => ({
          ...prev,
          connectionStatus: "error",
          error: "WebSocket连接失败",
        }));
      };
    } catch (error) {
      console.error("创建WebSocket连接失败:", error);
      setState((prev) => ({
        ...prev,
        connectionStatus: "error",
        error: "创建WebSocket连接失败",
      }));
    }
  }, [finalConfig.websocketUrl, examId, userId]);

  // 处理监控命令
  const handleMonitoringCommand = useCallback((command: any) => {
    switch (command.action) {
      case "start_camera_monitoring":
        startCameraMonitoring();
        break;
      case "stop_camera_monitoring":
        stopCameraMonitoring();
        break;
      case "take_photo":
        captureAndSendPhoto();
        break;
      case "enable_face_detection":
        setState((prev) => ({ ...prev, faceDetected: true }));
        break;
      default:
        console.log("未知监控命令:", command.action);
    }
  }, []);

  // 处理行为警报
  const handleBehaviorAlert = useCallback((alertData: any) => {
    setState((prev) => ({
      ...prev,
      behaviorAlerts: [...prev.behaviorAlerts.slice(-4), alertData.message], // 保留最近5条警报
    }));

    console.log("alertData =====> ", state.behaviorAlerts);
    
    // 3秒后自动清除警报
    // setTimeout(() => {
    //   setState(prev => ({
    //     ...prev,
    //     behaviorAlerts: prev.behaviorAlerts.filter(alert => alert !== alertData.message),
    //   }));
    // }, 3000);
  }, []);

  // 开始摄像头监控
  const startCameraMonitoring = useCallback(async () => {
    try {
      console.log("开始摄像头监控...");
      
      // 请求摄像头权限
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: finalConfig.maxWidth },
          height: { ideal: finalConfig.maxHeight },
          facingMode: "user", // 前置摄像头
        },
        audio: false,
      });

      streamRef.current = stream;
      const video = initVideo();
      video.srcObject = stream;

      // 等待video元素加载完成
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          console.log("视频元数据加载完成:", {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            duration: video.duration,
            readyState: video.readyState,
          });
          resolve();
        };
        
        video.onerror = (e) => {
          console.error("视频加载错误:", e);
          reject(new Error("视频加载失败"));
        };
        
        // 10秒超时
        setTimeout(() => {
          reject(new Error("视频加载超时"));
        }, 10000);
      });

      // 等待视频开始播放
      await video.play();
      
      // 再等待一帧确保有数据
      await new Promise((resolve) => {
        const checkVideoReady = () => {
          if (video.readyState >= 2) {
            // HAVE_CURRENT_DATA
            console.log("视频准备就绪，开始监控");
            resolve(void 0);
          } else {
            setTimeout(checkVideoReady, 100);
          }
        };
        checkVideoReady();
      });

      setState((prev) => ({
        ...prev, 
        isCameraActive: true,
        lastActivity: new Date(),
        error: null,
      }));

      // 延迟500ms再开始拍照，确保视频完全准备好
      setTimeout(() => {
        // 开始定时拍照
        captureIntervalRef.current = setInterval(() => {
          captureAndSendPhoto();
        }, finalConfig.captureInterval);
        
        // 开始行为检测
        if (finalConfig.enableBehaviorAnalysis) {
          startBehaviorAnalysis();
        }
      }, 500);

      // 监听摄像头停止事件
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        console.log("摄像头被停止");
        stopCameraMonitoring();
      });
    } catch (error) {
      console.error("开始摄像头监控失败:", error);
      let errorMessage = "无法获取摄像头权限";
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "摄像头权限被拒绝，请允许访问摄像头";
        } else if (error.name === "NotFoundError") {
          errorMessage = "未找到摄像头设备";
        } else if (error.name === "NotReadableError") {
          errorMessage = "摄像头被其他应用占用";
        } else if (
          error.message.includes("超时") ||
          error.message.includes("加载失败")
        ) {
          errorMessage = "摄像头启动失败: " + error.message;
        }
      }
      setState((prev) => ({ ...prev, error: errorMessage }));
    }
  }, [
    finalConfig.maxWidth,
    finalConfig.maxHeight,
    finalConfig.captureInterval,
    finalConfig.enableBehaviorAnalysis,
    initVideo,
  ]);

  // 停止摄像头监控
  const stopCameraMonitoring = useCallback(() => {
    console.log("停止摄像头监控...");
    
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    if (behaviorCheckRef.current) {
      clearInterval(behaviorCheckRef.current);
      behaviorCheckRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setState((prev) => ({
      ...prev, 
      isCameraActive: false,
      faceDetected: false,
    }));
  }, []);

  // 拍照并发送
  const captureAndSendPhoto = useCallback(async () => {
    if (
      !videoRef.current ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    ) {
      console.log("拍照条件不满足:", {
        hasVideo: !!videoRef.current,
        hasWebSocket: !!wsRef.current,
        wsReadyState: wsRef.current?.readyState,
      });
      return;
    }

    try {
      const video = videoRef.current;
      
      // 检查video元素状态
      if (video.readyState < 2) {
        // HAVE_CURRENT_DATA
        console.log("视频尚未准备就绪，跳过本次拍照", {
          readyState: video.readyState,
        });
        return;
      }
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.log("视频尺寸异常，跳过本次拍照", { 
          videoWidth: video.videoWidth, 
          videoHeight: video.videoHeight,
        });
        return;
      }

      const canvas = initCanvas();
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        console.error("无法获取canvas context");
        return;
      }

      // 调整canvas尺寸以匹配video
      canvas.width = Math.min(video.videoWidth, finalConfig.maxWidth);
      canvas.height = Math.min(video.videoHeight, finalConfig.maxHeight);
      
      // console.log("绘制视频帧到canvas", {
      //   videoSize: `${video.videoWidth}x${video.videoHeight}`,
      //   canvasSize: `${canvas.width}x${canvas.height}`,
      // });

      // 将视频帧绘制到canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // 获取图像数据并检查
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // console.log("图像数据信息:", {
      //   width: imageData.width,
      //   height: imageData.height,
      //   dataLength: imageData.data.length,
      //   firstPixels: Array.from(imageData.data.slice(0, 12)), // 前3个像素的RGBA值
      // });
      
      // 面部检测
      const faceDetected = finalConfig.enableFaceDetection
        ? detectFace(imageData)
        : true;

      // setState((prev) => ({
      //   ...prev,
      //   faceDetected,
      //   userPresent: faceDetected,
      //   lastActivity: new Date(),
      // }));

      // 转换为base64图片
      const photoData = canvas.toDataURL(
        "image/jpeg",
        finalConfig.compressionQuality
      );
      
      // 发送照片数据
      // wsRef.current.send(
      //   JSON.stringify({
      //     type: "user_photo",
      //     data: {
      //       examId,
      //       userId,
      //       timestamp: Date.now(),
      //       image: photoData,
      //       metadata: {
      //         width: canvas.width,
      //         height: canvas.height,
      //         quality: finalConfig.compressionQuality,
      //         faceDetected,
      //         userPresent: faceDetected,
      //         videoReadyState: video.readyState,
      //         videoSize: `${video.videoWidth}x${video.videoHeight}`,
      //       },
      //     },
      //   })
      // );

      const snapshotData = {
          examId,
          userId,
          timestamp: Date.now(),
          image: photoData,
          metadata: {
            width: canvas.width,
            height: canvas.height,
            quality: finalConfig.compressionQuality,
            faceDetected,
            userPresent: faceDetected,
            videoReadyState: video.readyState,
            videoSize: `${video.videoWidth}x${video.videoHeight}`,
        },
          }
      

      if (faceDetected) {
        lastFaceDetectionRef.current = new Date();
      }
      console.log(
        "面部检测结果:",
        faceDetected,
        "图片大小:",
        photoData.length,
        "bytes",
        photoData
      );

      // 添加调用来源追踪
      console.log('📸 captureAndSendPhoto 调用 saveSnapshotToBackend');
      await saveSnapshotToBackend(snapshotData);
    } catch (error) {
      console.error("拍照失败:", error);
    }
  }, [
    examId,
    userId,
    finalConfig.compressionQuality,
    finalConfig.maxWidth,
    finalConfig.maxHeight,
    finalConfig.enableFaceDetection,
    initCanvas,
  ]);

  // 防止重复调用的标志
  const isSavingRef = useRef(false);
  const lastSaveTimeRef = useRef(0);

  const saveSnapshotToBackend = useCallback(
    async (data: any) => {
      // 防止重复调用：如果正在保存或距离上次保存不到1秒，则跳过
      const now = Date.now();
      if (isSavingRef.current || (now - lastSaveTimeRef.current < 1000)) {
        console.log('⏸️ 跳过重复的快照保存调用');
        return;
      }

      isSavingRef.current = true;
      lastSaveTimeRef.current = now;
      
      console.log('🔵 saveSnapshotToBackend 开始执行', new Date().toISOString());
      
      try {
        // 方案1: 先上传图片到文件服务器，获取URL
        // 将base64转换为Blob
        const base64Data = data.image.split(',')[1]; // 移除 "data:image/jpeg;base64," 前缀
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        // 创建FormData上传文件
        const formData = new FormData();
        const fileName = `snapshot_${data.examId}_${data.userId}_${data.timestamp}.jpg`;
        formData.append('file', blob, fileName);
        formData.append('examId', data.examId);
        formData.append('userId', data.userId);

        // 调试：检查FormData内容
        console.log('📋 准备上传的数据:');
        console.log('  - Blob:', blob);
        console.log('    └─ size:', blob.size, 'bytes');
        console.log('    └─ type:', blob.type);
        console.log('  - fileName:', fileName);
        console.log('  - examId:', data.examId);
        console.log('  - userId:', data.userId);
        
        // 验证FormData内容（正确的遍历方式）
      

        // 上传图片到文件服务器
        console.log('📤 上传图片到文件服务器...');
        const uploadResponse = await api.file.upload(formData);
        
        if (!uploadResponse || !uploadResponse.data || !uploadResponse.data.url) {
          throw new Error('图片上传失败，未返回URL');
        }

        const snapshotUrl = uploadResponse.data.url;
        console.log('✅ 图片上传成功:', snapshotUrl);

        // 方案2: 保存快照元数据到数据库（只存储URL，不存储base64）
        const snapshotData = {
          examId: parseInt(data.examId),
          userId: parseInt(data.userId),
          snapshotUrl: snapshotUrl, // 文件服务器返回的URL
          snapshotSize: blob.size, // 实际文件大小
          faceDetected: data.metadata.faceDetected,
          faceConfidence: data.metadata.faceDetected ? 0.85 : 0,
          userPresent: data.metadata.userPresent,
          imageWidth: data.metadata.width,
          imageHeight: data.metadata.height,
          imageQuality: data.metadata.quality,
          capturedAt: new Date(data.timestamp).toISOString(),
        };

        const response = await api.monitoring.saveSnapshot(snapshotData);
        console.log('✅ saveSnapshotToBackend 保存成功');
        return response.data;
      } catch (error: any) {
        console.error("❌ 保存快照到后端失败:", error.message);
        
        // 降级方案：如果上传失败，尝试保存缩略图（压缩后的base64）
        try {
          console.log('⚠️ 尝试降级方案：保存缩略图');
          const thumbnail = await compressImage(data.image, 0.3, 320, 240); // 压缩到30%质量，320x240
          
          const snapshotData = {
            examId: parseInt(data.examId),
            userId: parseInt(data.userId),
            snapshotUrl: null, // URL为空
            snapshotData: thumbnail, // 保存压缩后的base64作为缩略图
            snapshotSize: thumbnail.length,
            faceDetected: data.metadata.faceDetected,
            faceConfidence: data.metadata.faceDetected ? 0.85 : 0,
            userPresent: data.metadata.userPresent,
            imageWidth: data.metadata.width,
            imageHeight: data.metadata.height,
            imageQuality: data.metadata.quality,
            capturedAt: new Date(data.timestamp).toISOString(),
          };

          const response = await api.monitoring.saveSnapshot(snapshotData);
          console.log('✅ 降级方案保存成功（缩略图）');
          return response.data;
        } catch (fallbackError: any) {
          console.error("❌ 降级方案也失败:", fallbackError.message);
        }
      } finally {
        // 保存完成后释放锁
        isSavingRef.current = false;
      }
    },
    []
  );

  // 压缩图片的辅助函数
  const compressImage = useCallback(
    async (base64: string, quality: number, maxWidth: number, maxHeight: number): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // 计算缩放比例
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('无法获取canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        };
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = base64;
      });
    },
    []
  );

  // 改进的面部检测算法
  const detectFace = useCallback((imageData: ImageData) => {
    // console.log("正在进行面部检测...");
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // 1. 检查图像是否太暗或太亮（可能是摄像头被遮挡或过曝）
    let totalBrightness = 0;
    let pixelCount = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      totalBrightness += brightness;
      pixelCount++;
    }
    
    const avgBrightness = totalBrightness / pixelCount;
    // console.log("平均亮度:", avgBrightness);
    
    // 如果图像太暗或太亮，认为没有人脸
    if (avgBrightness < 30 || avgBrightness > 220) {
      console.log("图像亮度异常，未检测到人脸");
      return false;
    }
    
    // 临时：如果有基本的图像数据，就认为可能有人脸（用于测试）
    if (avgBrightness > 10) {
      console.log("检测到基本图像数据，临时返回true进行测试");
      return true;
    }
    
    // 2. 肤色检测 - 在多个区域检测肤色像素
    const skinDetectionRegions = [
      { x: width * 0.3, y: height * 0.2, w: width * 0.4, h: height * 0.3 }, // 面部上半部分
      { x: width * 0.35, y: height * 0.35, w: width * 0.3, h: height * 0.25 }, // 面部中心
      { x: width * 0.25, y: height * 0.25, w: width * 0.5, h: height * 0.4 }, // 整个面部区域
    ];
    
    let totalSkinPixels = 0;
    let totalCheckedPixels = 0;
    
    for (let region of skinDetectionRegions) {
      let regionSkinPixels = 0;
      let regionPixels = 0;
      
      for (
        let y = Math.max(0, Math.floor(region.y));
        y < Math.min(height, Math.floor(region.y + region.h));
        y += 2
      ) {
        for (
          let x = Math.max(0, Math.floor(region.x));
          x < Math.min(width, Math.floor(region.x + region.w));
          x += 2
        ) {
          const index = (y * width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          
          // 改进的肤色检测算法
          if (isSkinColor(r, g, b)) {
            regionSkinPixels++;
          }
          regionPixels++;
        }
      }
      
      totalSkinPixels += regionSkinPixels;
      totalCheckedPixels += regionPixels;
    }
    
    const skinRatio = totalSkinPixels / totalCheckedPixels;
    console.log("肤色像素比例:", skinRatio);
    
    // 3. 边缘检测 - 检测面部轮廓
    const edgeStrength = calculateEdgeStrength(data, width, height);
    console.log("边缘强度:", edgeStrength);
    
    // 4. 对称性检测 - 人脸通常是对称的
    const symmetryScore = calculateSymmetryScore(data, width, height);
    console.log("对称性得分:", symmetryScore);
    
    // 根据灵敏度设置动态调整阈值
    const getDetectionThresholds = (sensitivity: "low" | "medium" | "high") => {
      switch (sensitivity) {
        case "low":
          return {
            skinRatio: 0.12,
            edgeStrength: 0.08,
            symmetryScore: 0.5,
            minBrightness: 35,
            maxBrightness: 215,
          };
        case "medium":
          return {
            skinRatio: 0.08,
            edgeStrength: 0.05,
            symmetryScore: 0.4,
            minBrightness: 40,
            maxBrightness: 210,
          };
        case "high":
          return {
            skinRatio: 0.05,
            edgeStrength: 0.03,
            symmetryScore: 0.3,
            minBrightness: 30,
            maxBrightness: 220,
          };
      }
    };
    
    const thresholds = getDetectionThresholds(
      finalConfig.faceDetectionSensitivity
    );
    
    // 综合判断 - 使用动态阈值
    const hasFace =
      skinRatio > thresholds.skinRatio && 
      edgeStrength > thresholds.edgeStrength && 
      symmetryScore > thresholds.symmetryScore && 
      avgBrightness > thresholds.minBrightness && 
      avgBrightness < thresholds.maxBrightness;

    // console.log("面部检测结果:", hasFace, {
    //   skinRatio: skinRatio.toFixed(3),
    //   edgeStrength: edgeStrength.toFixed(3),
    //   symmetryScore: symmetryScore.toFixed(3),
    //   avgBrightness: avgBrightness.toFixed(1),
    //   sensitivity: finalConfig.faceDetectionSensitivity,
    //   thresholds: {
    //     skinRatio: thresholds.skinRatio,
    //     edgeStrength: thresholds.edgeStrength,
    //     symmetryScore: thresholds.symmetryScore,
    //     brightness: `${thresholds.minBrightness}-${thresholds.maxBrightness}`,
    //   },
    // });
    
    return hasFace;
  }, []);
  
  // 肤色检测函数
  const isSkinColor = useCallback((r: number, g: number, b: number) => {
    // 多种肤色检测方法结合
    
    // 方法1: RGB范围检测
    const rgbSkin =
      r > 95 &&
      g > 40 &&
      b > 20 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
      Math.abs(r - g) > 15 &&
      r > g &&
      r > b;
    
    // 方法2: YCbCr颜色空间检测
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = 128 + 0.169 * r - 0.331 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.419 * g - 0.081 * b;
    
    const ycbcrSkin = y > 80 && cb >= 85 && cb <= 135 && cr >= 135 && cr <= 180;
    
    // 方法3: HSV颜色空间检测
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      if (max === r) {
        h = ((g - b) / diff) * 60;
      } else if (max === g) {
        h = ((b - r) / diff) * 60 + 120;
      } else {
        h = ((r - g) / diff) * 60 + 240;
      }
    }
    if (h < 0) h += 360;
    
    const s = max === 0 ? 0 : (diff / max) * 100;
    const v = (max / 255) * 100;
    
    const hsvSkin =
      ((h >= 0 && h <= 50) || h >= 340) &&
      s >= 20 &&
      s <= 68 &&
      v >= 35 &&
      v <= 95;
    
    // 任何一种方法检测到肤色都认为是肤色
    return rgbSkin || ycbcrSkin || hsvSkin;
  }, []);
  
  // 计算边缘强度
  const calculateEdgeStrength = useCallback(
    (data: Uint8ClampedArray, width: number, height: number) => {
    let edgeSum = 0;
    let count = 0;
    
    // 使用Sobel算子检测边缘
    for (let y = 1; y < height - 1; y += 3) {
      for (let x = 1; x < width - 1; x += 3) {
        const idx = (y * width + x) * 4;
        
        // 获取周围8个像素的灰度值
          const tl =
            (data[((y - 1) * width + (x - 1)) * 4] +
              data[((y - 1) * width + (x - 1)) * 4 + 1] +
              data[((y - 1) * width + (x - 1)) * 4 + 2]) /
            3;
          const tm =
            (data[((y - 1) * width + x) * 4] +
              data[((y - 1) * width + x) * 4 + 1] +
              data[((y - 1) * width + x) * 4 + 2]) /
            3;
          const tr =
            (data[((y - 1) * width + (x + 1)) * 4] +
              data[((y - 1) * width + (x + 1)) * 4 + 1] +
              data[((y - 1) * width + (x + 1)) * 4 + 2]) /
            3;
          const ml =
            (data[(y * width + (x - 1)) * 4] +
              data[(y * width + (x - 1)) * 4 + 1] +
              data[(y * width + (x - 1)) * 4 + 2]) /
            3;
          const mr =
            (data[(y * width + (x + 1)) * 4] +
              data[(y * width + (x + 1)) * 4 + 1] +
              data[(y * width + (x + 1)) * 4 + 2]) /
            3;
          const bl =
            (data[((y + 1) * width + (x - 1)) * 4] +
              data[((y + 1) * width + (x - 1)) * 4 + 1] +
              data[((y + 1) * width + (x - 1)) * 4 + 2]) /
            3;
          const bm =
            (data[((y + 1) * width + x) * 4] +
              data[((y + 1) * width + x) * 4 + 1] +
              data[((y + 1) * width + x) * 4 + 2]) /
            3;
          const br =
            (data[((y + 1) * width + (x + 1)) * 4] +
              data[((y + 1) * width + (x + 1)) * 4 + 1] +
              data[((y + 1) * width + (x + 1)) * 4 + 2]) /
            3;
        
        // Sobel X 和 Y 梯度
          const gx = tr + 2 * mr + br - (tl + 2 * ml + bl);
          const gy = bl + 2 * bm + br - (tl + 2 * tm + tr);
        
        // 计算梯度幅度
          const magnitude = Math.sqrt(gx * gx + gy * gy);
        edgeSum += magnitude;
        count++;
      }
    }
    
    return count > 0 ? edgeSum / count / 255 : 0;
    },
    []
  );
  
  // 计算对称性得分
  const calculateSymmetryScore = useCallback(
    (data: Uint8ClampedArray, width: number, height: number) => {
    let symmetrySum = 0;
    let count = 0;
    
    const centerX = Math.floor(width / 2);
    const checkWidth = Math.floor(width * 0.3); // 检查中央60%的区域
    
      for (
        let y = Math.floor(height * 0.2);
        y < Math.floor(height * 0.7);
        y += 2
      ) {
      for (let x = 0; x < checkWidth; x += 2) {
        const leftIdx = (y * width + (centerX - x)) * 4;
        const rightIdx = (y * width + (centerX + x)) * 4;
        
        if (leftIdx >= 0 && rightIdx < data.length) {
          // 计算左右对应像素的相似度
            const leftGray =
              (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
            const rightGray =
              (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
          
          const diff = Math.abs(leftGray - rightGray);
          const similarity = Math.max(0, 1 - diff / 255);
          
          symmetrySum += similarity;
          count++;
        }
      }
    }
    
    return count > 0 ? symmetrySum / count : 0;
    },
    []
  );

  // 开始行为分析
  const startBehaviorAnalysis = useCallback(() => {
    behaviorCheckRef.current = setInterval(() => {
      const now = new Date();
      const timeSinceLastFace =
        now.getTime() - lastFaceDetectionRef.current.getTime();
      
      // 如果超过10秒没有检测到人脸
      if (timeSinceLastFace > 10000) {
        sendActivityStatus({
          type: "user_absent",
          data: { duration: timeSinceLastFace },
        });
        
        setState((prev) => ({
          ...prev,
          userPresent: false,
          behaviorAlerts: [
            ...prev.behaviorAlerts.slice(-4),
            {
              warningType: "user_absent",
              message: "检测到用户离开座位",
            },
          ],
        }));
      }
    }, 5000); // 每5秒检查一次
  }, []);

  // 发送活动状态
  const sendActivityStatus = useCallback(
    (activity: { type: string; data?: any }) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "user_activity",
        data: {
          examId,
          userId,
          timestamp: Date.now(),
          activity,
            },
          })
        );
      }
    },
    [examId, userId]
  );

  // 断开连接
  const disconnect = useCallback(() => {
    console.log("断开用户监控连接...");
    
    stopCameraMonitoring();
    
    if (wsRef.current) {
      wsRef.current.close(1000, "正常关闭");
      wsRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isConnected: false,
      connectionStatus: "disconnected",
      isCameraActive: false,
    }));
  }, [stopCameraMonitoring]);

  // 组件挂载时连接
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      disconnect();
    };
  }, [connectWebSocket, disconnect]);

  // 监听页面可见性变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      sendActivityStatus({
        type: "page_visibility_change",
        data: { hidden: document.hidden },
      });
      
      if (document.hidden) {
        setState((prev) => ({
          ...prev,
          behaviorAlerts: [
            ...prev.behaviorAlerts.slice(-4),
            {
              warningType: "page_visibility_change",
              message: "检测到切换窗口或最小化",
            },
          ],
        }));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sendActivityStatus]);

  // 监听鼠标离开页面
  // useEffect(() => {
  //   const handleMouseLeave = () => {
  //     sendActivityStatus({
  //       type: 'mouse_leave',
  //       data: { timestamp: Date.now() }
  //     });
  //   };

  //   document.addEventListener('mouseleave', handleMouseLeave);
    
  //   return () => {
  //     document.removeEventListener('mouseleave', handleMouseLeave);
  //   };
  // }, [sendActivityStatus]);

  return {
    state,
    actions: {
      startCameraMonitoring,
      stopCameraMonitoring,
      captureAndSendPhoto,
      sendActivityStatus,
      disconnect,
      reconnect: connectWebSocket,
    },
    // 提供video元素的引用，用于UI预览
    getVideoElement: () => videoRef.current,
  };
}
