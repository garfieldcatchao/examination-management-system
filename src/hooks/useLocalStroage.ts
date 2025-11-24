import { useState, useEffect } from 'react';

interface StorageItem<T> {
  value: T;
  expiry?: number;
}

/**
 * 本地存储钩子函数，提供获取、设置和删除本地缓存的功能
 * @returns 返回操作本地存储的方法集合
 */
function useLocalStorage() {
  /**
   * 从本地存储中获取数据
   * @param key 存储键名
   * @param initialValue 如果键不存在时的默认值
   * @returns 存储的值或默认值
   */
  const getItem = <T>(key: string) => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const item = window.localStorage.getItem(key);
      
      if (!item) {
        return null;
      }

      const storageItem: StorageItem<T> = JSON.parse(item);
      
      // 检查项目是否已过期
      if (storageItem.expiry && Date.now() > storageItem.expiry) {
        window.localStorage.removeItem(key);
        return null;
      }

      return storageItem.value;
    } catch (error) {
      console.warn(`读取本地存储键 "${key}" 时出错:`, error);
      return null;
    }
  };

  /**
   * 设置数据到本地存储
   * @param key 存储键名
   * @param value 要存储的值
   * @param expiryTime 过期时间（毫秒），默认为一周
   */
  const setItem = <T>(key: string, value: T, expiryTime?: number): void => {
    try {
      if (typeof window !== 'undefined') {
        const expiry = expiryTime || 7 * 24 * 60 * 60 * 1000; // 默认一周
        
        const item: StorageItem<T> = {
          value,
          expiry: Date.now() + expiry
        };

        window.localStorage.setItem(key, JSON.stringify(item));
      }
    } catch (error) {
      console.warn(`设置本地存储键 "${key}" 时出错:`, error);
    }
  };

  /**
   * 从本地存储中移除数据
   * @param key 要移除的存储键名
   */
  const removeItem = (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`移除本地存储键 "${key}" 时出错:`, error);
    }
  };

  /**
   * 检查本地存储中是否存在指定键
   * @param key 要检查的存储键名
   * @returns 是否存在该键
   */
  const hasItem = (key: string): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const item = window.localStorage.getItem(key);
      
      if (!item) {
        return false;
      }

      const storageItem = JSON.parse(item);
      
      // 检查项目是否已过期
      if (storageItem.expiry && Date.now() > storageItem.expiry) {
        window.localStorage.removeItem(key);
        return false;
      }

      return true;
    } catch (error) {
      console.warn(`检查本地存储键 "${key}" 时出错:`, error);
      return false;
    }
  };

  /**
   * 清除所有本地存储数据
   */
  const clearAll = (): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
      }
    } catch (error) {
      console.warn('清除本地存储时出错:', error);
    }
  };

  return {
    getItem,
    setItem,
    removeItem,
    hasItem,
    clearAll
  };
}

export default useLocalStorage;