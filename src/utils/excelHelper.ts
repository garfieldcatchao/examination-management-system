import * as XLSX from "xlsx";
import { message } from "antd";

export interface ExcelColumn {
  key: string;
  label: string;
  required?: boolean;
  validator?: (value: any) => string | null; // 返回错误信息或null
  transformer?: (value: any) => any; // 数据转换函数
}

export interface ExcelParseOptions {
  sheetIndex?: number; // 解析哪个sheet，默认0
  startRow?: number; // 从哪一行开始解析数据，默认1（跳过表头）
  maxRows?: number; // 最大行数限制
  skipEmptyRows?: boolean; // 是否跳过空行，默认true
}

export interface ExcelParseResult<T = any> {
  success: boolean;
  data: T[];
  errors: Array<{
    row: number;
    column: string;
    error: string;
  }>;
  warnings: Array<{
    row: number;
    column: string;
    warning: string;
  }>;
  total: number;
  validCount: number;
}

export class ExcelHelper {
  /**
   * 读取Excel/CSV文件并解析为JSON数据
   */
  static async parseExcelFile<T = any>(
    file: File,
    columns: ExcelColumn[],
    options: ExcelParseOptions = {}
  ): Promise<ExcelParseResult<T>> {
    const {
      sheetIndex = 0,
      startRow = 1,
      maxRows = 10000,
      skipEmptyRows = true,
    } = options;

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });

          if (!workbook.SheetNames[sheetIndex]) {
            resolve({
              success: false,
              data: [],
              errors: [
                { row: 0, column: "", error: `工作表索引${sheetIndex}不存在` },
              ],
              warnings: [],
              total: 0,
              validCount: 0,
            });
            return;
          }

          const worksheet = workbook.Sheets[workbook.SheetNames[sheetIndex]];
          const rawData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          }) as any[][];

          const result = this.processExcelData<T>(rawData, columns, {
            startRow,
            maxRows,
            skipEmptyRows,
          });

          resolve(result);
        } catch (error) {
          console.error("文件解析失败:", error);
          resolve({
            success: false,
            data: [],
            errors: [{ row: 0, column: "", error: "文件格式错误或损坏" }],
            warnings: [],
            total: 0,
            validCount: 0,
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          data: [],
          errors: [{ row: 0, column: "", error: "文件读取失败" }],
          warnings: [],
          total: 0,
          validCount: 0,
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 处理Excel原始数据
   */
  private static processExcelData<T>(
    rawData: any[][],
    columns: ExcelColumn[],
    options: { startRow: number; maxRows: number; skipEmptyRows: boolean }
  ): ExcelParseResult<T> {
    const { startRow, maxRows, skipEmptyRows } = options;
    const result: ExcelParseResult<T> = {
      success: true,
      data: [],
      errors: [],
      warnings: [],
      total: 0,
      validCount: 0,
    };

    if (rawData.length <= startRow) {
      result.errors.push({
        row: 0,
        column: "",
        error: "文件中没有数据行",
      });
      result.success = false;
      return result;
    }

    // 获取表头
    const headers = rawData[0] as string[];
    const columnMap = new Map<string, number>();

    // 建立列名到索引的映射
    headers.forEach((header, index) => {
      if (header) {
        columnMap.set(header.trim(), index);
      }
    });

    // 检查必需的列是否存在
    const missingColumns = columns
      .filter((col) => col.required)
      .filter((col) => !columnMap.has(col.label));

    if (missingColumns.length > 0) {
      result.errors.push({
        row: 0,
        column: "",
        error: `缺少必需的列: ${missingColumns
          .map((col) => col.label)
          .join(", ")}`,
      });
      result.success = false;
      return result;
    }

    // 处理数据行
    const dataRows = rawData.slice(startRow, startRow + maxRows);

    dataRows.forEach((row, rowIndex) => {
      const actualRowIndex = startRow + rowIndex + 1; // 实际行号（从1开始）

      // 检查是否为空行
      if (skipEmptyRows && this.isEmptyRow(row)) {
        return;
      }

      result.total++;
      const rowData: any = {};
      let hasError = false;

      // 处理每一列
      columns.forEach((column) => {
        const cellIndex = columnMap.get(column.label);
        const cellValue = cellIndex !== undefined ? row[cellIndex] : undefined;

        // 数据转换
        let processedValue = cellValue;
        if (
          column.transformer &&
          cellValue !== undefined &&
          cellValue !== null
        ) {
          try {
            processedValue = column.transformer(cellValue);
          } catch (error) {
            result.warnings.push({
              row: actualRowIndex,
              column: column.label,
              warning: `数据转换失败: ${error}`,
            });
          }
        }

        // 数据验证
        if (column.validator) {
          const error = column.validator(processedValue);
          if (error) {
            result.errors.push({
              row: actualRowIndex,
              column: column.label,
              error,
            });
            hasError = true;
          }
        }

        // 必需字段检查
        if (
          column.required &&
          (processedValue === undefined ||
            processedValue === null ||
            processedValue === "")
        ) {
          result.errors.push({
            row: actualRowIndex,
            column: column.label,
            error: `${column.label}不能为空`,
          });
          hasError = true;
        }

        rowData[column.key] = processedValue;
      });

      if (!hasError) {
        result.data.push(rowData as T);
        result.validCount++;
      }
      result.data.push(rowData as T);
    });

    result.success =
      result.errors.filter((error) => error.row === 0).length === 0;
    return result;
  }

  /**
   * 导出数据为Excel文件
   */
  static exportToExcel<T = any>(
    data: T[],
    columns: ExcelColumn[],
    fileName: string = "export.xlsx",
    sheetName: string = "Sheet1"
  ): void {
    try {
      // 创建表头
      const headers = columns.map((col) => col.label);

      // 创建数据行
      const rows = data.map((item) => {
        return columns.map((col) => {
          let value = item[col.key as keyof T];
          return value;
        });
      });

      // 合并表头和数据
      const wsData = [headers, ...rows];

      // 创建工作表
      const worksheet = XLSX.utils.aoa_to_sheet(wsData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // 下载文件
      XLSX.writeFile(workbook, fileName);
      message.success("文件导出成功");
    } catch (error) {
      console.error("导出Excel失败:", error);
      message.error("导出Excel失败");
    }
  }

  /**
   * 下载Excel模板
   */
  static downloadTemplate(
    columns: ExcelColumn[],
    templateData: any[][] = [],
    fileName: string = "template.xlsx"
  ): void {
    try {
      const headers = columns.map((col) =>
        col.required ? `${col.label}*` : col.label
      );

      const wsData =
        templateData.length > 0 ? [headers, ...templateData] : [headers];

      const worksheet = XLSX.utils.aoa_to_sheet(wsData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

      XLSX.writeFile(workbook, fileName);
      message.success("模板下载成功");
    } catch (error) {
      console.error("下载模板失败:", error);
      message.error("下载模板失败");
    }
  }

  /**
   * 验证Excel/CSV文件格式
   */
  static validateExcelFile(file: File): string | null {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    const allowedExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      return "不支持的文件格式，请上传 .xlsx、.xls 或 .csv 文件";
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "文件大小不能超过10MB";
    }

    return null;
  }

  /**
   * 判断是否为空行
   */
  private static isEmptyRow(row: any[]): boolean {
    return (
      !row ||
      row.every(
        (cell) =>
          cell === undefined ||
          cell === null ||
          (typeof cell === "string" && cell.trim() === "")
      )
    );
  }

  /**
   * 常用的数据转换器
   */
  static transformers = {
    // 字符串转数字
    toNumber: (value: any) => {
      if (value === undefined || value === null || value === "") return null;
      const num = Number(value);
      if (isNaN(num)) throw new Error(`"${value}"不是有效数字`);
      return num;
    },

    // 字符串转布尔值
    toBoolean: (value: any) => {
      if (value === undefined || value === null || value === "") return null;
      const str = String(value).toLowerCase().trim();
      if (["true", "是", "对", "正确", "1", "yes"].includes(str)) return true;
      if (["false", "否", "错", "错误", "0", "no"].includes(str)) return false;
      throw new Error(`"${value}"不是有效的布尔值`);
    },

    // 日期转换
    toDate: (value: any) => {
      if (value === undefined || value === null || value === "") return null;
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new Error(`"${value}"不是有效日期`);
      return date.toISOString().split("T")[0];
    },

    // 字符串清理（去除多余空格）
    trimString: (value: any) => {
      if (value === undefined || value === null) return "";
      return String(value).trim().replace(/\s+/g, " ");
    },
  };

  /**
   * 常用的验证器
   */
  static validators = {
    // 非空验证
    required: (value: any) => {
      if (value === undefined || value === null || value === "") {
        return "此字段为必填项";
      }
      return null;
    },

    // 邮箱验证
    email: (value: any) => {
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "邮箱格式不正确";
      }
      return null;
    },

    // 手机号验证
    phone: (value: any) => {
      if (!value) return null;
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(value)) {
        return "手机号格式不正确";
      }
      return null;
    },

    // 数字范围验证
    numberRange: (min: number, max: number) => (value: any) => {
      if (value === undefined || value === null) return null;
      const num = Number(value);
      if (isNaN(num)) return "必须是数字";
      if (num < min || num > max) {
        return `数值必须在 ${min} 到 ${max} 之间`;
      }
      return null;
    },

    // 字符串长度验证
    stringLength: (minLength: number, maxLength?: number) => (value: any) => {
      if (!value) return null;
      const str = String(value);
      if (str.length < minLength) {
        return `长度不能少于 ${minLength} 个字符`;
      }
      if (maxLength && str.length > maxLength) {
        return `长度不能超过 ${maxLength} 个字符`;
      }
      return null;
    },
  };
}
