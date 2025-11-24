import React, { useEffect, useRef, useState } from 'react';
import { Badge, Button, Spin } from 'antd';
import { 
  VideoCameraOutlined, 
  ReloadOutlined, 
  FullscreenOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined 
} from '@ant-design/icons';
import './monitorExam.css';

interface LiveCameraPreviewProps {
  studentId: string;
  userId: string;
  snapshot?: string; // base64快照
  videoStream?: MediaStream; // 实时视频流
  faceDetected: boolean;
  userPresent: boolean;
  onRequestStream?: () => void;
  onStopStream?: () => void;
}

const LiveCameraPreview: React.FC<LiveCameraPreviewProps> = ({
  studentId,
  userId,
  snapshot,
  videoStream,
  faceDetected,
  userPresent,
  onRequestStream,
  onStopStream,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<'snapshot' | 'stream'>('snapshot');

  // 处理视频流
  useEffect(() => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play().catch(console.error);
      setMode('stream');
      setIsLoading(false);
    }
  }, [videoStream]);

  // 渲染快照到canvas
  useEffect(() => {
    if (snapshot && canvasRef.current && mode === 'snapshot') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
        img.src = snapshot;
      }
    }
  }, [snapshot, mode]);

  // 请求实时视频流
  const handleRequestStream = () => {
    setIsLoading(true);
    onRequestStream?.();
  };

  // 停止视频流
  const handleStopStream = () => {
    onStopStream?.();
    setMode('snapshot');
  };

  // 切换暂停/播放
  const handleTogglePause = () => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  // 全屏显示
  const handleFullscreen = () => {
    const element = mode === 'stream' ? videoRef.current : canvasRef.current;
    if (element) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    }
  };

  return (
    <div className="monitor-live-camera">
      <div className="monitor-live-camera-container">
        {mode === 'stream' ? (
          // 实时视频流
          <video
            ref={videoRef}
            className="monitor-live-video"
            autoPlay
            playsInline
            muted
          />
        ) : (
          // 快照模式
          <canvas
            ref={canvasRef}
            className="monitor-live-canvas"
          />
        )}

        {/* 加载指示器 */}
        {isLoading && (
          <div className="monitor-live-loading">
            <Spin size="large" tip="正在连接视频流..." />
          </div>
        )}

        {/* 状态覆盖层 */}
        <div className="monitor-live-overlay">
          <div className="monitor-live-status">
            <Badge
              status={faceDetected ? "success" : "error"}
              text={
                <span className="monitor-live-status-text">
                  {faceDetected ? "人脸已检测" : "未检测到人脸"}
                </span>
              }
            />
            <Badge
              status={userPresent ? "success" : "error"}
              text={
                <span className="monitor-live-status-text">
                  {userPresent ? "在座" : "离座"}
                </span>
              }
            />
          </div>

          {/* 控制按钮 */}
          <div className="monitor-live-controls">
            <div className="monitor-live-controls-left">
              <span className="monitor-live-student-id">学号: {studentId}</span>
              <Badge
                status={mode === 'stream' ? "processing" : "default"}
                text={mode === 'stream' ? "实时" : "快照"}
              />
            </div>
            <div className="monitor-live-controls-right">
              {mode === 'stream' ? (
                <>
                  <Button
                    type="text"
                    size="small"
                    icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                    onClick={handleTogglePause}
                    className="monitor-live-control-btn"
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<FullscreenOutlined />}
                    onClick={handleFullscreen}
                    className="monitor-live-control-btn"
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    onClick={handleStopStream}
                    className="monitor-live-control-btn"
                  >
                    停止
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="text"
                    size="small"
                    icon={<FullscreenOutlined />}
                    onClick={handleFullscreen}
                    className="monitor-live-control-btn"
                  />
                  <Button
                    type="primary"
                    size="small"
                    icon={<VideoCameraOutlined />}
                    onClick={handleRequestStream}
                    loading={isLoading}
                    className="monitor-live-control-btn"
                  >
                    实时监控
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCameraPreview;

