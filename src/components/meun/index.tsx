import React, { ReactNode, useState } from "react";
import { NavLink } from "react-router";
import { MenuProps } from "../../interface/menuFace";
import { isTrue } from "../../utils";
import "./index.css";

function Meun(props: any) {
  const [selectedKey, setSelectedKey] = useState(props.selectedKey || ["workbench"]);
  const [openKeys, setOpenKeys] = useState<string[] | null>(props.openKeys || ["workbench"]);
  const [fold, setFold] = useState(true);

  const handleClickChild = (
    e: React.MouseEvent<HTMLDivElement>,
    item: MenuProps
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedKey([item.key]);
    setOpenKeys(null);
  };

  const createChildMenu = (children: MenuProps[] = []): ReactNode | null => {
    if (!children || !children.length || fold) {
      return null;
    }
    return (
      <div className="menu-item-child">
        {children.map((chil) => {
          return (
            <div
              className={`siderbar-menu-item ${
                selectedKey.includes(chil.key)
                  ? "siderbar-menu-item-active"
                  : ""
              }`}
              key={chil.key}
              onClick={(e) => handleClickChild(e, chil)}
            >
              {chil.icon ? <div className={chil.icon}></div> : null}
              <span className="menu-item-label">{chil.label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement>,
    item: MenuProps
  ) => {
    e.stopPropagation();
    e.preventDefault();

    if (item.children && item.children.length) {
      setFold(!fold);
      return;
    }

    setSelectedKey([item.key]);
    setOpenKeys(null);
  };

  return (
    <div className="menu-container">
      {props.items.map((item: MenuProps) => {
        return (
          <div key={item.key} onClick={(e) => handleClick(e, item)}>
            <NavLink to={item.path as string} className="menu-item-link">
              <div
                className={`siderbar-menu-item ${
                  (openKeys || selectedKey).includes(item.key)
                    ? "siderbar-menu-item-active"
                    : ""
                }`}
              >
                <div className={item.icon}></div>
                <span className="menu-item-label">{item.label}</span>
                <span
                  className={`${
                    isTrue(item.hasSubMenu) ? "menu-item-fold" : ""
                  }`}
                >
                  {isTrue(item.hasSubMenu) ? (
                    <span
                      className={fold ? item.foldIcon : item.unFoldIcon}
                    ></span>
                  ) : null}
                </span>
              </div>
            </NavLink>
            {createChildMenu(item.children)}
          </div>
        );
      })}
    </div>
  );
}

export default Meun;
