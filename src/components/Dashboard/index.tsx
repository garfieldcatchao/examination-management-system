import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Teacher from '../teacher';
import Student from '../student';

// 统一的Dashboard组件，根据用户身份显示不同界面
const Dashboard: React.FC = () => {
  const { userInfo } = useSelector((state: any) => state.login);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 如果访问的是/dashboard根路径，根据用户身份自动跳转到对应的默认页面
    if (location.pathname === '/dashboard') {
      switch (userInfo?.identity) {
        case 'teacher':
          navigate('/dashboard/workbench', { replace: true });
          break;
        case 'student':
          navigate('/dashboard/workspace', { replace: true });
          break;
        case 'admin':
          navigate('/dashboard/workbench', { replace: true }); // 管理员暂时使用教师界面
          break;
        default:
          break;
      }
    }
  }, [userInfo?.identity, location.pathname, navigate]);

  // 根据用户身份渲染对应的界面
  switch (userInfo?.identity) {
    case 'teacher':
      return <Teacher />;
    case 'student':
      return <Student />;
    case 'admin':
      // 如果有管理员界面，可以在这里添加
      return <Teacher />; // 暂时使用教师界面
    default:
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div>
            <h2>用户身份异常</h2>
            <p>无法识别用户身份，请重新登录</p>
          </div>
        </div>
      );
  }
};

export default Dashboard;
