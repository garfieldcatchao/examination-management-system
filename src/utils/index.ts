import { message } from "antd";
import {
  TimeCheckResult,
  TimeCheckConfig,
  DateInput,
  TimeProgressResult,
} from "../interface/utils";

export const isTrue = (v: any) => `${v}` === "true";

/**
 * 获取文件扩展名（安全版）
 * @param filename 文件名（如 "test.xlsx"）
 * @returns 返回小写的扩展名（如 "xlsx"），如果无扩展名则返回
 */
export function getFileExtension(filename: string): string | null {
  if (!filename || typeof filename !== "string") {
    return null;
  }

  const parts = filename.split(".");
  // 防止文件名无扩展名（如 "README"）或隐藏文件（如 ".gitignore"）
  return parts.length > 1 ? parts.pop()?.toLowerCase() ?? null : null;
}

/**
 * 判断是否为 Excel 文件
 * @param filename 文件名或完整路径
 * @returns 如果是 .xlsx 或 .xls 则返回 true，否则 false
 */
export function isExcelFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ext === "xlsx" || ext === "xls";
}

/**
 * 判断是否为 Word 文件
 * @param filename 文件名或完整路径
 * @returns 如果是 .docx 或 .doc 则返回 true，否则 false
 */
export function isWordFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ext === "docx" || ext === "doc";
}

export const addURLParams = (url: string, params: any = {}) => {
  if (!params || !Object.keys(params).length) {
    return url;
  }

  return `${url}?${Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&")}`;
};

/**
 * 灵活日期格式化工具
 * @param {Date|string|number} dateInput - Date可识别的日期参数
 * @param {string} format - 自定义格式字符串，支持以下占位符：
 *   YYYY: 四位数年份
 *   MM: 两位数月份 (01-12)
 *   DD: 两位数日期 (01-31)
 *   HH: 24小时制小时 (00-23)
 *   hh: 12小时制小时 (01-12)
 *   mm: 两位数分钟 (00-59)
 *   ss: 两位数秒 (00-59)
 *   A: 大写AM/PM指示符
 *   a: 小写am/pm指示符
 *   /: 直接显示斜杠
 *   -: 直接显示短横线
 *   :: 直接显示冒号
 *   '文本': 单引号内的文本直接输出
 *
 * @returns {string} 格式化后的日期字符串
 * @throws 如果无法解析日期参数
 */
export function formatDateTime(dateInput: any, format = "YYYY-MM-DD HH:mm:ss") {
  // 创建Date对象
  const date = new Date(dateInput);

  // 验证日期有效性
  if (isNaN(date.getTime())) {
    throw new Error(`无法解析的日期参数: ${dateInput}`);
  }

  // 获取各日期部分
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";

  // 格式化各部分（补零）
  const formatted = {
    YYYY: year,
    MM: month.toString().padStart(2, "0"),
    DD: day.toString().padStart(2, "0"),
    HH: hours.toString().padStart(2, "0"),
    hh: (hours % 12 || 12).toString().padStart(2, "0"),
    mm: minutes.toString().padStart(2, "0"),
    ss: seconds.toString().padStart(2, "0"),
    A: ampm,
    a: ampm.toLowerCase(),
    // 特殊符号直接映射
    "/": "/",
    "-": "-",
    ":": ":",
  };

  // 处理格式字符串
  return format.replace(
    /YY(YY)?|MM|DD|HH|hh|mm|ss|A|a|\/|-|:|'.*?'/g,
    (match: string) => {
      // 处理带引号的文本
      if (match.startsWith("'")) {
        return match.slice(1, -1);
      }
      return (formatted[match as keyof typeof formatted] as string) ?? match;
    }
  );
}

/**
 * 判断当前时间是否在指定时间段内或临近开始时间
 * @param config - 时间判断配置
 * @returns 时间判断结果
 */
export function checkTimePeriod(config: TimeCheckConfig): TimeCheckResult {
  const { startTime, endTime, threshold = 30, inclusiveEnd = false } = config;

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date parameter(s). Please provide valid dates.");
  }

  const now = new Date();
  const nowTime = now.getTime();
  const startTimeStamp = start.getTime();
  const endTimeStamp = end.getTime();

  const isWithinPeriod =
    startTimeStamp > endTimeStamp
      ? nowTime >= startTimeStamp ||
        (inclusiveEnd ? nowTime <= endTimeStamp : nowTime < endTimeStamp)
      : inclusiveEnd
      ? nowTime >= startTimeStamp && nowTime <= endTimeStamp
      : nowTime >= startTimeStamp && nowTime < endTimeStamp;

  const timeDifference = startTimeStamp - nowTime;
  const isApproachingStart =
    threshold > 0 &&
    timeDifference > 0 &&
    timeDifference <= threshold * 60 * 1000;

  return {
    isWithinPeriod,
    isApproachingStart,
    startTime: start,
    endTime: end,
  };
}

export function calculateTimeProgress(
  startTime: DateInput,
  endTime: DateInput,
  currentTime?: DateInput
): TimeProgressResult {
  const start = parseTimeInput(startTime);
  const end = parseTimeInput(endTime);
  const now = currentTime ? parseTimeInput(currentTime) : new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || isNaN(now.getTime())) {
    console.error("Invalid date parameter(s): 请提供有效的时间");
    return {
      progress: 0,
      isInPeriod: false,
      start: start,
      end: end,
      current: now,
    };
  }

  if (start > end) {
    console.error("开始时间不能晚于结束时间");
    return {
      progress: 0,
      isInPeriod: false,
      start: start,
      end: end,
      current: now,
    };
  }

  const totalDuration = end.getTime() - start.getTime();

  if (totalDuration <= 0) {
    return {
      progress: 0,
      isInPeriod: false,
      start: start,
      end: end,
      current: now,
    };
  }

  const timeSinceStart = now.getTime() - start.getTime();

  let progress = Math.max(0, Math.min(1, timeSinceStart / totalDuration)) * 100;
  progress = Math.floor(progress);

  // 判断是否在时间段内
  const isInPeriod = now >= start && now <= end;

  return {
    progress: progress,
    isInPeriod: isInPeriod,
    start: start,
    end: end,
    current: now,
  };
}

/**
 * 解析各种格式的时间输入
 * @param timeInput - 时间输入（支持Date对象、时间戳、可解析时间字符串）
 * @returns 解析后的Date对象
 */
function parseTimeInput(timeInput: DateInput): Date {
  if (timeInput instanceof Date) {
    return new Date(timeInput);
  }

  // if (typeof timeInput === "undefined") {
  //   // return null as any;
  // }

  if (
    typeof timeInput === "number" ||
    (typeof timeInput === "string" && !isNaN(Number(timeInput)))
  ) {
    const timestamp =
      typeof timeInput === "string" ? Number(timeInput) : timeInput;

    if (!isNaN(timestamp) && typeof timestamp === "number") {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) return date;
    }
  }

  if (typeof timeInput === "string") {
    const isoDate = new Date(timeInput);
    if (!isNaN(isoDate.getTime())) return isoDate;

    try {
      const parsedDate = new Date(timeInput);
      if (!isNaN(parsedDate.getTime())) return parsedDate;
    } catch (e) {}
  }

  throw new Error(`无法解析的时间格式: ${timeInput}`);
}

export const scrollToTop = () => {
  window.scrollTo(0, 0);
};

export function debounce<T extends any[], U>(
  func: (...args: T) => U,
  wait: number,
  immediate: boolean = false
): (...args: T) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (this: any, ...args: T) {
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout as any);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}
