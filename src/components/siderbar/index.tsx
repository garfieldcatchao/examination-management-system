import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { menuListMap } from "../../constants";
import { setMenuList } from "../../store/menuStore";
import Meun from "../meun";
import "./index.css";

function Siderbar() {
  const { menuList } = useSelector((state: any) => state.menu);
  const { loginInfo } = useSelector((state: any) => state.login);
  const [items, setItems] = useState<any>(menuList || []);
  const dispatch = useDispatch();

  useEffect(() => {
    if ((loginInfo && loginInfo.identity) || (menuList && !menuList.length)) {
      const identityKey = loginInfo.identity as keyof typeof menuListMap;
      setItems(menuListMap[identityKey]);
      dispatch(setMenuList({ menuList: menuListMap[identityKey] }));
    }
  }, [loginInfo, menuList]);

  return (
    <div className="siderbar-container">
      <div className="user-profile">
        <div className="user-name">你好，张老师</div>
        <div className="user-college">计算机学院</div>
      </div>

      <div className="siderbar-menu">
        <Meun
          openKeys={["workbench"]}
          selectedKey={["workbench"]}
          items={items}
        />
      </div>
    </div>
  );
}

export default Siderbar;
