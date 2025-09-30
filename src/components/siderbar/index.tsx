import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { menuListMap } from "../../constants";
import { setMenuList } from "../../store/menuStore";
import Meun from "../meun";
import "./index.css";

function Siderbar(props: any) {
  const { menuList } = useSelector((state: any) => state.menu);
  const { userInfo } = useSelector((state: any) => state.login);
  const [items, setItems] = useState<any>(menuList || []);
  const dispatch = useDispatch();
  const { theme = {} } = props || {};

  useEffect(() => {
    if ((userInfo && userInfo.identity) || (menuList && !menuList.length)) {
      const identityKey = (userInfo?.identity ||
        "teacher") as keyof typeof menuListMap;
      setItems(menuListMap[identityKey]);
      dispatch(setMenuList({ menuList: menuListMap[identityKey] }));
    }
  }, [userInfo, menuList]);


  return (
    <div className="siderbar-container" style={theme.containerStyle}>
      <div className="user-profile">
        <div>
          {/* <img src="" alt="" className="profile-avatar" /> */}
          <div className="profile-avatar">{userInfo?.identity.slice(0, 1)}</div>
        </div>
        <div>
          <div className="user-name" style={theme.sideBarStyle}>{userInfo?.identity}</div>
          <div className="user-college" style={theme.sideBarStyle}>计算机学院</div>
          <div className="user-college" style={theme.sideBarStyle}>计科21-1班</div>
        </div>
      </div>
      {userInfo?.identity === "student" && (
        <div className="user-stats">
          <div className="stat-item">
            <span className="sider-number">15</span>
            <span className="sider-label">已考试</span>
          </div>
          <div className="stat-item">
            <span className="sider-number">82.3</span>
            <span className="sider-label">平均分</span>
          </div>
          <div className="stat-item">
            <span className="sider-number">8</span>
            <span className="sider-label">排名</span>
          </div>
        </div>
      )}

      <div className="divider"></div>

      <div className="siderbar-menu">
        <Meun
          openKeys={
            userInfo?.identity === "student" ? ["workspace"] : ["workbench"]
          }
          selectedKey={
            userInfo?.identity === "student" ? ["workspace"] : ["workbench"]
          }
          items={items}
          theme={userInfo?.identity !== "student" ? "light" : "dark"}
          style={{
            color: userInfo?.identity === "student" ? "#666" : "#fff",
          }}
        />
      </div>
    </div>
  );
}

export default Siderbar;
