export interface MenuProps {
  key: string;
  label: string;
  icon?: string;
  children?: MenuProps[];
  foldIcon?: string;
  unFoldIcon?: string;
  hasSubMenu?: boolean;
  path?: string;
}

export interface MenuListProps {
  teacher: MenuProps[];
  student: MenuProps[];
  manager: MenuProps[];
}

