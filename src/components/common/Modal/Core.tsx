import React, { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './index.less';

export interface ModalProps {
  /** 是否显示Modal */
  visible: boolean;
  /** 关闭Modal的回调 */
  onClose: () => void;
  /** Modal标题 */
  title?: ReactNode;
  /** Modal内容 */
  children: ReactNode;
  /** Modal宽度 */
  width?: number | string;
  /** Modal高度 */
  height?: number | string;
  /** 是否显示关闭按钮 */
  closable?: boolean;
  /** 是否点击遮罩层关闭 */
  maskClosable?: boolean;
  /** 是否显示底部按钮区域 */
  footer?: ReactNode | null;
  /** 确认按钮文字 */
  okText?: string;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 点击确认的回调 */
  onOk?: () => void;
  /** 点击取消的回调 */
  onCancel?: () => void;
  /** 确认按钮loading状态 */
  confirmLoading?: boolean;
  /** Modal层级 */
  zIndex?: number;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 是否居中显示 */
  centered?: boolean;
  /** 是否可拖拽 */
  draggable?: boolean;
  /** 动画类型 */
  animationType?: 'fade' | 'zoom' | 'slide';
  /** 是否销毁子组件 */
  destroyOnClose?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  width = 520,
  height,
  closable = true,
  maskClosable = true,
  footer,
  okText = '确定',
  cancelText = '取消',
  onOk,
  onCancel,
  confirmLoading = false,
  zIndex = 1000,
  className = '',
  style = {},
  centered = true,
  draggable = false,
  animationType = 'zoom',
  destroyOnClose = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // 处理ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleEsc);
      // 禁止body滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [visible, onClose]);

  // 处理遮罩点击
  const handleMaskClick = (e: React.MouseEvent) => {
    if (maskClosable && e.target === e.currentTarget) {
      onClose();
    }
  };

  // 处理取消按钮
  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  // 处理确认按钮
  const handleOk = () => {
    onOk?.();
  };

  // 渲染footer
  const renderFooter = () => {
    if (footer === null) return null;
    
    if (footer) return <div className="modal-footer">{footer}</div>;

    return (
      <div className="modal-footer">
        <button 
          className="modal-btn modal-btn-cancel" 
          onClick={handleCancel}
          disabled={confirmLoading}
        >
          {cancelText}
        </button>
        <button 
          className={`modal-btn modal-btn-primary ${confirmLoading ? 'loading' : ''}`}
          onClick={handleOk}
          disabled={confirmLoading}
        >
          {confirmLoading && <span className="loading-icon"></span>}
          {okText}
        </button>
      </div>
    );
  };

  if (!visible && destroyOnClose) {
    return null;
  }

  const modalContent = (
    <div 
      className={`modal-mask ${visible ? 'visible' : ''} ${animationType}`}
      style={{ zIndex }}
      onClick={handleMaskClick}
    >
      <div 
        ref={modalRef}
        className={`modal-container ${visible ? 'visible' : ''} ${centered ? 'centered' : ''} ${className}`}
        style={{
          width,
          height,
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || closable) && (
          <div className="modal-header">
            {title && <div className="modal-title">{title}</div>}
            {closable && (
              <button className="modal-close" onClick={onClose}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M8.41 7l2.83-2.83c.39-.39.39-1.02 0-1.41s-1.02-.39-1.41 0L7 5.59 4.17 2.76c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41L5.59 7 2.76 9.83c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L7 8.41l2.83 2.83c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L8.41 7z"/>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="modal-body">
          {(!destroyOnClose || visible) && children}
        </div>

        {/* Footer */}
        {renderFooter()}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
