import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { message } from "antd";

// 定义响应数据结构
export interface ApiResponse<T = any> {
  totalCount: number | undefined;
  code: number;
  message: string;
  data: T;
  success?: boolean;
}

// 定义请求配置扩展
export interface RequestConfig extends AxiosRequestConfig {
  showError?: boolean; // 是否显示错误消息
  showLoading?: boolean; // 是否显示loading
}

class HttpRequest {
  private instance: AxiosInstance;

  constructor(config: AxiosRequestConfig = {}) {
    // 创建axios实例
    this.instance = axios.create({
      baseURL: "/api", // 直接使用相对路径，避免环境变量问题
      timeout: 30000, // 增加超时时间
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache", // 防止缓存
        "Pragma": "no-cache"
      },
      // 确保不会因为网络错误而中断
      validateStatus: function (status) {
        return true; // 接受所有状态码，在拦截器中处理
      },
      withCredentials: true,
      ...config,
    });

    // 初始化拦截器
    this.initInterceptors();
  }

  /**
   * 初始化拦截器
   */
  private initInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加token
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 添加时间戳防止缓存
        if (config.method?.toLowerCase() === "get") {
          config.params = {
            ...config.params,
            _t: Date.now(),
          };
        }
        console.log("请求拦截器 Request config:", config);

        return config;
      },
      (error) => {
        console.log("请求拦截器 Request error:", error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: any) => {
        const { data } = response;
        console.log("Response data:", data, response);
        // 统一处理响应
        if (data.code === 200 || data.success) {
          return data;
        } else if (data.code === 401) {
          // token过期或未授权
          this.handleTokenExpired();
          return Promise.reject(data.message || "登录状态已过期");
        } else {
          message.error(data.message || "请求失败");
          return Promise.reject(data.message || "请求失败");
        }
      },
      (error: AxiosError) => {
        console.log("Request error:", error);
        // return this.handleError(error);
      }
    );
  }

  /**
   * 处理token过期
   */
  private handleTokenExpired() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    sessionStorage.removeItem("userInfo");

    // 跳转到登录页
    window.location.href = "/login";
    message.error("登录状态已过期，请重新登录");
  }

  /**
   * 统一错误处理
   */
  private handleError(error: AxiosError) {
    let errorMessage = "网络请求失败";

    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 400:
          errorMessage = "请求参数错误";
          break;
        case 401:
          errorMessage = "未授权，请重新登录";
          this.handleTokenExpired();
          break;
        case 403:
          errorMessage = "权限不足";
          break;
        case 404:
          errorMessage = "请求资源不存在";
          break;
        case 500:
          errorMessage = "服务器内部错误";
          break;
        default:
          errorMessage = `请求失败：${status}`;
      }
    } else if (error.request) {
      errorMessage = "网络连接失败，请检查网络";
      console.error("网络连接失败，请检查网络", error.request);
    } else {
      errorMessage = error.message || "请求失败";
    }

    console.error("请求错误:", errorMessage);
    message.error(errorMessage);
    return Promise.reject(errorMessage);
  }

  /**
   * GET请求
   */
  get<T = any>(
    url: string,
    params?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.get(url, { params, ...config });
  }

  /**
   * POST请求
   */
  post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config);
  }

  /**
   * PUT请求
   */
  put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config);
  }

  /**
   * DELETE请求
   */
  delete<T = any>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config);
  }

  /**
   * PATCH请求
   */
  patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.patch(url, data, config);
  }

  /**
   * 文件上传
   * @param url - 上传地址
   * @param fileOrFormData - File对象或FormData对象
   * @param config - 请求配置
   * @param onUploadProgress - 上传进度回调
   */
  upload<T = any>(
    url: string,
    fileOrFormData: File | FormData,
    config?: RequestConfig,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<ApiResponse<T>> {
    let formData: FormData;
    
    // 如果传入的已经是 FormData，直接使用
    if (fileOrFormData instanceof FormData) {
      formData = fileOrFormData;
    } else {
      // 如果是 File 对象，创建 FormData 并添加文件
      formData = new FormData();
      formData.append("file", fileOrFormData);
    }

    return this.instance.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
      ...config,
    });
  }

  /**
   * 下载文件
   */
  download(
    url: string,
    params?: any,
    filename?: string,
    config?: RequestConfig
  ): Promise<void> {
    return this.instance
      .get(url, {
        params,
        responseType: "blob",
        ...config,
      })
      .then((response) => {
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename || "下载文件";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      });
  }
}

// 创建默认实例
const http = new HttpRequest();

// 导出默认实例和类
export default http;
export { HttpRequest };

// 便捷的HTTP方法导出 - 兼容旧的使用方式
export const get = http.get.bind(http);
export const post = http.post.bind(http);
export const put = http.put.bind(http);
export const delete_ = http.delete.bind(http);
export { delete_ as delete };
export const patch = http.patch.bind(http);
export const upload = http.upload.bind(http);
export const download = http.download.bind(http);
