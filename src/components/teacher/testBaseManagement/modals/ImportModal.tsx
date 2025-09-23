import React, { useState, useRef } from "react";
import { ImportModalProps } from "../../../../interface/testBaseManagement";
import * as XLSX from "xlsx";
import {
  ParsedQuestion,
  ImportConfig,
  ImportProgress,
} from "../../../../interface/modalsFace";
import type { UploadProps } from "antd";
import excelJson from "../../../../template/excelJson.json";
import mammoth from "mammoth";
import { generateDocx } from "../../../../template/wordJs";
import { message, Upload, Select, Input, Modal } from "antd";
import { isWordFile } from "../../../../utils";
import "./ImportModal.css";

const { Dragger } = Upload;

function ImportModal(props: ImportModalProps) {
  const [importData, setImportData] = useState<ParsedQuestion[]>([]);
  const [importConfig, setImportConfig] = useState<ImportConfig>({
    importMode: "skip",
    defaultSubjectId: 1,
    defaultDifficulty: "medium",
    defaultTags: "",
  });
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    errors: [],
  });
  const [excelData, setExcelData] = useState<any>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isParsing, setIsParsing] = useState(false); // 添加解析状态
  const [showPreview, setShowPreview] = useState(false);
  const [parseErrors, setParseErrors] = useState<
    Array<{
      questionNumber: number;
      type: string;
      error: string;
      details?: any;
    }>
  >([]);
  const fileInputRef = useRef<any>(null);

  // 验证题目完整性和选项正确性
  const validateQuestionOptions = (
    question: any
  ): Array<{ type: string; error: string; details?: any }> => {
    const errors: Array<{ type: string; error: string; details?: any }> = [];

    // 1. 检查题目基本信息
    if (!question.content || question.content.trim() === "") {
      errors.push({
        type: "content_missing",
        error: "题目内容为空",
        details: { question: question },
      });
    }

    // 2. 检查题目类型
    if (!question.type) {
      errors.push({
        type: "type_missing",
        error: "题目类型未设置",
        details: { question: question },
      });
    }

      // 3. 对于选择题，检查选项
      if (
        question.type === "single_choice" ||
        question.type === "multiple_choice"
      ) {
        if (!question.options || question.options.length === 0) {
          errors.push({
            type: "options_missing",
            error: "选择题缺少选项",
            details: { question: question },
        });
        return errors; // 没有选项就不继续检查选项内容
      }

      // 检查选项数量
      if (question.type === "true_false" && question.options && question.options.length > 0) {
        // 判断题如果有选项，必须有2个选项
        if (question.options.length !== 2) {
          errors.push({
            type: "insufficient_options",
            error: `判断题选项数量错误（应该是2个，当前${question.options.length}个）`,
            details: {
              question: question,
              optionCount: question.options.length,
            },
          });
        }
        
        // 检查是否有T和F选项
        const hasT = question.options.some((opt: any) => opt.key === "T");
        const hasF = question.options.some((opt: any) => opt.key === "F");
        if (!hasT || !hasF) {
          errors.push({
            type: "invalid_option_keys",
            error: "判断题必须包含正确(T)和错误(F)两个选项",
            details: {
              question: question,
              existingKeys: question.options.map((opt: any) => opt.key)
            },
          });
        }
      } else if ((question.type === "single_choice" || question.type === "multiple_choice") && question.options.length < 2) {
        errors.push({
          type: "insufficient_options",
          error: "选择题选项数量不足（少于2个）",
          details: {
            question: question,
            optionCount: question.options.length,
          },
        });
      }

      // 检查是否有重复的选项键
      const optionKeys = question.options.map((opt: any) => opt.key);
      const duplicateKeys = optionKeys.filter(
        (key: string, index: number) => optionKeys.indexOf(key) !== index
      );
      if (duplicateKeys.length > 0) {
        errors.push({
          type: "duplicate_option_keys",
          error: `发现重复的选项标识: ${duplicateKeys.join(", ")}`,
          details: {
            question: question,
            duplicateKeys: duplicateKeys,
          },
        });
      }

      // 4. 检查答案设置（可选验证，不再强制要求答案）
      if (question.answer && question.answer.toString().trim() !== "") {
        // 如果有答案，验证格式是否正确
        if (question.type === "true_false") {
          const answerStr = question.answer.toString().trim();
          const validAnswers = ["正确", "错误", "对", "错", "T", "F", "True", "False", "true", "false", "1", "0", "√", "×"];
          if (!validAnswers.includes(answerStr)) {
            errors.push({
              type: "invalid_answer_format",
              error: `判断题答案格式不正确: "${answerStr}"`,
              details: {
                question: question,
                answer: answerStr,
                validAnswers: validAnswers
              }
            });
          }
        }
      }
      
      // 注意：根据用户要求，不再强制检查答案缺失，允许无答案的题目

      // 逐个检查选项内容
      question.options.forEach((option: any, index: number) => {
        const optionValue = option.value || "";

        // 检查选项值是否为空
        if (!optionValue.trim()) {
          errors.push({
            type: "empty_option",
            error: `选项${option.key}内容为空`,
            details: {
              optionKey: option.key,
              optionIndex: index,
            },
          });
        }

        // 检测是否包含其他选项字母（选项合并错误）
        const otherOptionMatches = optionValue.match(/[A-F]\./g);
        if (otherOptionMatches && otherOptionMatches.length > 0) {
          errors.push({
            type: "option_merging",
            error: `选项${option.key}包含其他选项标识`,
            details: {
              optionKey: option.key,
              optionValue: optionValue,
              foundOptions: otherOptionMatches,
            },
          });
        }

        // 检查选项值是否过长（可能合并了多个选项）
        if (optionValue.length > 80) {
          errors.push({
            type: "option_too_long",
            error: `选项${option.key}内容过长，可能包含多个选项`,
            details: {
              optionKey: option.key,
              optionValue: optionValue,
              length: optionValue.length,
            },
          });
        }

        // 检查是否包含大量空格（格式错误）
        if (optionValue.includes("                ")) {
          errors.push({
            type: "excessive_whitespace",
            error: `选项${option.key}包含异常空格，可能解析错误`,
            details: {
              optionKey: option.key,
              optionValue: optionValue,
            },
          });
        }

        // 检查选项是否包含换行符或特殊字符
        if (optionValue.includes("\n") || optionValue.includes("\r")) {
          errors.push({
            type: "option_line_break",
            error: `选项${option.key}包含换行符`,
            details: {
              optionKey: option.key,
              optionValue: optionValue,
            },
          });
        }
      });
    }

    // 5. 检查难度设置
    const validDifficulties = ["easy", "medium", "hard"];
    if (
      question.difficulty &&
      !validDifficulties.includes(question.difficulty)
    ) {
      errors.push({
        type: "invalid_difficulty",
        error: `题目难度设置无效: ${question.difficulty}`,
        details: {
          question: question,
          difficulty: question.difficulty,
          validOptions: validDifficulties,
        },
      });
    }

    // 6. 检查分值
    if (question.score && (isNaN(question.score) || question.score <= 0)) {
      errors.push({
        type: "invalid_score",
        error: `题目分值无效: ${question.score}`,
        details: {
          question: question,
          score: question.score,
        },
      });
    }

    return errors;
  };

  const parseQuestionRow = (
    rowData: any,
    rowNumber: number
  ): ParsedQuestion | null => {
    try {
      if (!rowData["题目内容"] && !rowData["content"]) {
        throw new Error("题目内容不能为空");
      }

      const content = rowData["题目内容"] || rowData["content"] || "";
      const typeMap: { [key: string]: any } = {
        单选题: "single_choice",
        单选: "single_choice",
        single: "single_choice",
        多选题: "multiple_choice",
        多选: "multiple_choice",
        multiple: "multiple_choice",
        判断题: "true_false",
        判断: "true_false",
        对错题: "true_false",
        是非题: "true_false",
        true_false: "true_false",
        judge: "true_false",
        填空题: "fill_blank",
        填空: "fill_blank",
        blank: "fill_blank",
        简答题: "essay",
        简答: "essay",
        essay: "essay",
      };

      const typeStr = rowData["题型"] || rowData["type"] || "单选题";
      const type = typeMap[typeStr] || "single_choice";

      let options: Array<{ key: string; value: string; isCorrect: boolean }> =
        [];
      if (type === "single_choice" || type === "multiple_choice") {
        const optionKeys = ["A", "B", "C", "D", "E", "F"];
        optionKeys.forEach((key) => {
          const optionValue =
            rowData[`选项${key}`] || rowData[`option_${key}`] || rowData[key];
          if (optionValue) {
            options.push({
              key,
              value: optionValue.toString(),
              isCorrect: false,
            });
          }
        });
      } else if (type === "true_false") {
        // 判断题的选项处理
        const trueOption = rowData["正确选项"] || rowData["true_option"] || "正确";
        const falseOption = rowData["错误选项"] || rowData["false_option"] || "错误";
        
        options = [
          { key: "T", value: trueOption.toString(), isCorrect: false },
          { key: "F", value: falseOption.toString(), isCorrect: false }
        ];
      }

      const answer = rowData["答案"] || rowData["answer"] || "";
      // 修改：不强制要求答案，如果有答案才处理
      if (options.length > 0 && answer && answer.toString().trim() !== "") {
        if (type === "true_false") {
          // 判断题答案处理
          const answerStr = answer.toString().trim();
          const isTrueAnswer = 
            answerStr === "正确" || answerStr === "对" || answerStr === "是" || 
            answerStr === "T" || answerStr === "True" || answerStr === "true" || 
            answerStr === "1" || answerStr === "√";
          
          options.forEach((option) => {
            if (option.key === "T") {
              option.isCorrect = isTrueAnswer;
            } else if (option.key === "F") {
              option.isCorrect = !isTrueAnswer;
            }
          });
        } else {
          // 选择题答案处理
          const correctAnswers = answer
            .toString()
            .toUpperCase()
            .split(",")
            .map((a: string) => a.trim());
          options.forEach((option) => {
            option.isCorrect = correctAnswers.includes(option.key);
          });
        }
      }

      const difficultyMap: { [key: string]: any } = {
        简单: "easy",
        容易: "easy",
        easy: "easy",
        中等: "medium",
        普通: "medium",
        中: "medium",
        medium: "medium",
        困难: "hard",
        难: "hard",
        hard: "hard",
      };

      const difficultyStr =
        rowData["难度"] ||
        rowData["difficulty"] ||
        importConfig.defaultDifficulty;
      const difficulty =
        difficultyMap[difficultyStr] || importConfig.defaultDifficulty;

      return {
        content,
        type,
        options,
        answer,
        difficulty,
        score: parseFloat(rowData["分值"] || rowData["score"]) || 2.0,
        explanation: rowData["解析"] || rowData["explanation"] || "",
        subjectName: rowData["学科"] || rowData["subject"] || "",
        tags: (rowData["标签"] || rowData["tags"] || "")
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
        rawData: rowData,
        rowNumber,
      };
    } catch (error) {
      console.error(`第${rowNumber}行解析错误:`, error);
      return null;
    }
  };

  // Word文档解析函数
  const parseWordDocument = async (
    wordFile: File
  ): Promise<{
    validQuestions: ParsedQuestion[];
    invalidQuestions: any[];
    parseErrors: any[];
  }> => {
    try {
      // 使用mammoth转换Word为HTML
      const result = await mammoth.convertToHtml({
        arrayBuffer: await wordFile.arrayBuffer(),
      });
      const htmlContent = result.value;
      console.log("Word HTML内容:", htmlContent);

      // 解析HTML内容提取题目
      return parseWordContent(htmlContent);
    } catch (error) {
      console.error("Word文档解析失败:", error);
      throw new Error("Word文档解析失败，请检查文件格式");
    }
  };

  // 根据实际解析的选项重新确定题型
  const adjustQuestionType = (question: any) => {
    // 如果没有选项，根据题目内容重新智能识别题型
    if (!question.options || question.options.length === 0) {
      const content = question.content || "";
      
      // 判断题识别：明确的判断题标识
      if (
        content.includes("判断") ||
        content.includes("对错") ||
        content.includes("是否") ||
        content.includes("（    ）") ||
        content.includes("(    )") ||
        content.includes("（　　）") ||
        content.includes("（ ）") ||
        content.match(/.*[（(]\s*[）)]\s*$/)  // 题目以空括号结尾
      ) {
        question.type = "true_false";
        console.log(`✓ 无选项题目识别为判断题: ${content}`);
        return question;
      }
      
      // 简答题识别：明确的简答题标识
      if (
        content.includes("简答") ||
        content.includes("论述") ||
        content.includes("分析") ||
        content.includes("说明") ||
        content.includes("阐述") ||
        content.includes("举例") ||
        content.includes("谈谈") ||
        content.includes("如何") ||
        content.includes("为什么") ||
        content.includes("怎样") ||
        content.match(/.*[？?]\s*$/)  // 题目以问号结尾
      ) {
        question.type = "essay";
        console.log(`✓ 无选项题目识别为简答题: ${content}`);
        return question;
      }
      
      // 如果无明确标识，保持原类型或设为单选题
      console.log(`⚠️ 无选项题目类型不明确，保持为: ${question.type}`);
      return question;
    }

    const optionKeys = question.options.map((opt: any) => opt.key);
    const hasChoiceOptions = optionKeys.some((key: string) => ['A', 'B', 'C', 'D', 'E', 'F'].includes(key));
    const hasTrueFalseOptions = optionKeys.some((key: string) => ['T', 'F'].includes(key));
    
    // 如果同时有选择题选项和判断题选项，需要智能判断保留哪种类型
    if (hasChoiceOptions && hasTrueFalseOptions) {
      // 根据原始题目类型和内容来判断
      const content = question.content || "";
      const originalType = question.type;
      
      // 如果原始类型是判断题，或者题目内容明确指向判断题，保留判断题选项
      if (originalType === "true_false" || 
          content.includes("判断") || 
          content.includes("对错") || 
          content.includes("是否") ||
          content.match(/.*[（(]\s*[）)]\s*$/)) {
        console.log(`✓ 题目${question.number}混合选项中保留判断题类型`);
        question.options = question.options.filter((opt: any) => ['T', 'F'].includes(opt.key));
        question.type = "true_false";
      } else {
        // 否则保留选择题选项
        console.warn(`题目${question.number}混合了选择题和判断题选项，根据内容判断保留选择题选项`);
        question.options = question.options.filter((opt: any) => !['T', 'F'].includes(opt.key));
        question.type = "single_choice";
      }
    } else if (hasChoiceOptions) {
      // 有A/B/C/D选项，确认为选择题
      question.type = "single_choice";
      console.log(`✓ 题目${question.number}根据A/B/C/D选项识别为选择题`);
    } else if (hasTrueFalseOptions && optionKeys.length === 2) {
      // 只有T/F选项，确认为判断题
      question.type = "true_false";
      console.log(`✓ 题目${question.number}根据T/F选项识别为判断题`);
    }

    return question;
  };

  // 解析Word内容为题目格式
  const parseWordContent = (
    htmlContent: string
  ): {
    validQuestions: ParsedQuestion[];
    invalidQuestions: any[];
    parseErrors: any[];
  } => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const validQuestions: ParsedQuestion[] = [];
    const invalidQuestions: any[] = [];
    const currentParseErrors: Array<{
      questionNumber: number;
      type: string;
      error: string;
      details?: any;
    }> = [];

    // 获取所有元素（包括h1-h6, p等）
    const allElements = doc.querySelectorAll("h1, h2, h3, h4, h5, h6, p");
    let currentQuestion: any = null;
    let questionNumber = 0;

    console.log("开始解析Word HTML内容，共找到", allElements.length, "个元素");

    allElements.forEach((element, index) => {
      const text = element.textContent?.trim() || "";

      // 跳过空内容
      if (!text) return;

      console.log(`处理第${index + 1}个元素 (${element.tagName}):`, text);

      // 匹配题目开头（支持多种格式，扩展到h标签）
      const questionMatch =
        text.match(/^(\d+)[\.、\s]+(.+)/) ||
        text.match(/^[（(]?\s*(\d+)\s*[）)]\s*(.+)/) ||
        text.match(/^第(\d+)题[：:\s]*(.+)/);

      if (questionMatch) {
        console.log("✓ 识别为题目:", questionMatch[1], questionMatch[2]);
        // 保存上一道题
        if (currentQuestion) {
          // 根据实际解析的选项重新确定题型
          currentQuestion = adjustQuestionType(currentQuestion);
          
          // 对判断题进行特殊处理
          if (currentQuestion.type === "true_false") {
            // 如果判断题没有选项，添加默认选项
            if (!currentQuestion.options || currentQuestion.options.length === 0) {
              console.warn(`题目${currentQuestion.number}判断题缺少选项，添加默认选项`);
              currentQuestion.options = [
                { key: "T", value: "正确", isCorrect: false },
                { key: "F", value: "错误", isCorrect: false }
              ];
            }
          }

          // 验证题目选项是否正确解析
          const optionErrors = validateQuestionOptions(currentQuestion);
          if (optionErrors.length > 0) {
            // 有错误的题目放入invalidQuestions
            optionErrors.forEach((error) => {
              currentParseErrors.push({
                questionNumber: currentQuestion.number,
                type: error.type,
                error: error.error,
                details: error.details,
              });
            });
            console.error(
              `题目${currentQuestion.number}解析失败，发现 ${optionErrors.length} 个错误:`
            );
            optionErrors.forEach((error, index) => {
              console.error(`   ${index + 1}. [${error.type}] ${error.error}`);
              if (error.details?.optionKey) {
                console.error(`      相关选项: ${error.details.optionKey}`);
              }
              if (
                error.details?.optionValue &&
                error.details.optionValue.length > 50
              ) {
                console.error(
                  `      选项内容: "${error.details.optionValue.substring(
                    0,
                    100
                  )}..."`
                );
              }
            });

            invalidQuestions.push({
              ...currentQuestion,
              errors: optionErrors,
            });
          } else {
            console.log(`题目${currentQuestion.number}解析成功`);
            validQuestions.push(
              formatWordQuestion(currentQuestion, questionNumber)
            );
          }
        }

        // 开始新题目
        questionNumber = parseInt(questionMatch[1]);
        currentQuestion = {
          number: questionNumber,
          content: questionMatch[2],
          options: [],
          type: "single_choice", // 默认单选
          answer: "",
          difficulty: importConfig.defaultDifficulty,
          score: 2.0,
          explanation: "",
          subjectName: "",
          tags: importConfig.defaultTags ? [importConfig.defaultTags] : [],
          rowNumber: questionNumber,
        };

        // 检测题型
        if (
          currentQuestion.content.includes("多选") ||
          currentQuestion.content.includes("（多选）") ||
          currentQuestion.content.includes("(多选)")
        ) {
          currentQuestion.type = "multiple_choice";
        } else if (
          currentQuestion.content.includes("填空") ||
          currentQuestion.content.includes("_____")
        ) {
          currentQuestion.type = "fill_blank";
        } else {
          // 对于其他类型，设置为临时类型，等待后续精确识别
          currentQuestion.type = "single_choice";  // 临时默认类型
        }

        return;
      }

      // 解析选项（重新设计的逻辑）
      if (currentQuestion) {
        // 首先检查这一行是否包含多个选项
        const hasMultipleOptions = (text.match(/[A-F]\./g) || []).length > 1;

        if (hasMultipleOptions) {
          console.log("✓ 检测到多选项行:", text);

          // 使用更精确的正则表达式分割多个选项
          // 改进的正则：匹配 字母. 后面跟内容，直到遇到大量空格+字母. 或者行尾
          const multiOptionsRegex = /([A-F])\.\s*(.+?)(?=\s{8,}[A-F]\.|$)/g;
          let match;
          let foundOptions = 0;

          while ((match = multiOptionsRegex.exec(text)) !== null) {
            const optionKey = match[1].toUpperCase();
            const optionValue = match[2].trim();

            console.log(`  → 解析选项 ${optionKey}: ${optionValue}`);

            currentQuestion.options.push({
              key: optionKey,
              value: optionValue,
              isCorrect: false,
            });
            foundOptions++;
          }

          if (foundOptions > 0) {
            return;
          }

          // 如果上面的正则没匹配到，尝试多种分割方式
          console.log("尝试替代分割方式...");

          // 方法1: 用大量空格分割
          let parts = text.split(/\s{8,}/);
          if (parts.length < 2) {
            // 方法2: 用中等空格分割
            parts = text.split(/\s{4,}/);
          }
          if (parts.length < 2) {
            // 方法3: 寻找选项字母间的最大空格间隔
            const optionPositions = [];
            let match;
            const regex = /([A-F])\./g;
            while ((match = regex.exec(text)) !== null) {
              optionPositions.push({
                letter: match[1],
                position: match.index,
              });
            }

            if (optionPositions.length >= 2) {
              // 手动分割选项
              for (let i = 0; i < optionPositions.length; i++) {
                const start = optionPositions[i].position;
                const end =
                  i < optionPositions.length - 1
                    ? optionPositions[i + 1].position
                    : text.length;
                const optionText = text.substring(start, end).trim();

                const optionMatch = optionText.match(
                  /^([A-F])\.\s*(.+?)(\s{4,}.*)?$/
                );
                if (optionMatch) {
                  const cleanValue = optionMatch[2]
                    .replace(/\s{4,}.*$/, "")
                    .trim(); // 移除尾部的其他选项
                  console.log(
                    `  → 位置分割选项 ${optionMatch[1]}: ${cleanValue}`
                  );
                  currentQuestion.options.push({
                    key: optionMatch[1].toUpperCase(),
                    value: cleanValue,
                    isCorrect: false,
                  });
                }
              }
              return;
            }
          }

          // 最后的兜底方案
          parts.forEach((part) => {
            const optionMatch = part.trim().match(/^([A-F])\.\s*(.+)/);
            if (optionMatch) {
              console.log(
                `  → 分割解析选项 ${optionMatch[1]}: ${optionMatch[2]}`
              );
              currentQuestion.options.push({
                key: optionMatch[1].toUpperCase(),
                value: optionMatch[2].trim(),
                isCorrect: false,
              });
            }
          });
          return;
        }

        // 判断题选项处理
        if (currentQuestion.type === "true_false") {
          // 识别判断题的选项格式
          const trueFalseMatch = text.match(/^(正确|错误|对|错|T|F|True|False)\s*$/i);
          if (trueFalseMatch) {
            const optionText = trueFalseMatch[1];
            const isTrue = optionText === "正确" || optionText === "对" || 
                          optionText.toLowerCase() === "t" || optionText.toLowerCase() === "true";
            
            console.log(`✓ 判断题选项: ${optionText} (${isTrue ? 'T' : 'F'})`);
            
            // 更新现有选项或添加新选项
            const key = isTrue ? "T" : "F";
            const existingOption = currentQuestion.options.find((opt: any) => opt.key === key);
            if (existingOption) {
              existingOption.value = optionText;
            } else {
              currentQuestion.options.push({
                key: key,
                value: optionText,
                isCorrect: false,
              });
            }
            return;
          }
          
          // 识别"正确/错误"这种格式
          const bothOptionsMatch = text.match(/^(正确|对|T|True)\s*[\/、]\s*(错误|错|F|False)\s*$/i);
          if (bothOptionsMatch) {
            console.log(`✓ 判断题双选项: ${bothOptionsMatch[1]} / ${bothOptionsMatch[2]}`);
            currentQuestion.options = [
              { key: "T", value: bothOptionsMatch[1], isCorrect: false },
              { key: "F", value: bothOptionsMatch[2], isCorrect: false }
            ];
            return;
          }
        }

        // 单个选项的处理
        const singleOptionMatch = text.match(/^([A-F])[\.、\s]+(.+)$/);
        if (singleOptionMatch) {
          console.log(
            `✓ 单个选项: ${singleOptionMatch[1]} = ${singleOptionMatch[2]}`
          );
          currentQuestion.options.push({
            key: singleOptionMatch[1].toUpperCase(),
            value: singleOptionMatch[2].trim(),
            isCorrect: false,
          });
          return;
        }

        // 如果都没匹配到，输出调试信息
        if (currentQuestion && text.includes("A.")) {
          console.log("⚠️ 可能的选项但未匹配:", text);
        }
      }

      // 匹配答案
      const answerMatch =
        text.match(/^答案[：:\s]*(.+)/) ||
        text.match(/^正确答案[：:\s]*(.+)/) ||
        text.match(/^参考答案[：:\s]*(.+)/);

      if (answerMatch && currentQuestion) {
        const answerText = answerMatch[1].trim();
        console.log(`✓ 解析答案: ${answerText}`);

        if (currentQuestion.type === "true_false") {
          // 判断题答案处理
          const isTrueAnswer = 
            answerText === "正确" || answerText === "对" || answerText === "是" || 
            answerText === "T" || answerText === "True" || answerText === "true" || 
            answerText === "1" || answerText === "√";
          
          currentQuestion.answer = isTrueAnswer ? "T" : "F";
          
          // 标记正确选项
          if (currentQuestion.options.length > 0) {
            currentQuestion.options.forEach((option: any) => {
              if (option.key === "T") {
                option.isCorrect = isTrueAnswer;
              } else if (option.key === "F") {
                option.isCorrect = !isTrueAnswer;
              }
            });
          }
          console.log(`✓ 判断题答案设置: ${isTrueAnswer ? '正确(T)' : '错误(F)'}`);
        } else {
          // 选择题答案处理
          currentQuestion.answer = answerText
            .replace(/[，、]/g, ",")
            .toUpperCase();

          // 标记正确选项
          if (currentQuestion.options.length > 0) {
            const correctAnswers = currentQuestion.answer
              .split(",")
              .map((a: string) => a.trim());
            currentQuestion.options.forEach((option: any) => {
              option.isCorrect = correctAnswers.includes(option.key);
            });
          }
        }
        return;
      }

      // 匹配解析
      const explanationMatch =
        text.match(/^解析[：:\s]*(.+)/) ||
        text.match(/^答案解析[：:\s]*(.+)/) ||
        text.match(/^解答[：:\s]*(.+)/);

      if (explanationMatch && currentQuestion) {
        currentQuestion.explanation = explanationMatch[1];
        return;
      }

      // 匹配难度
      const difficultyMatch = text.match(
        /^难度[：:\s]*(简单|中等|困难|easy|medium|hard)/
      );
      if (difficultyMatch && currentQuestion) {
        const difficultyMap: any = {
          简单: "easy",
          easy: "easy",
          中等: "medium",
          medium: "medium",
          困难: "hard",
          hard: "hard",
        };
        currentQuestion.difficulty =
          difficultyMap[difficultyMatch[1]] || "medium";
        return;
      }

      // 匹配分值
      const scoreMatch = text.match(/^分值[：:\s]*(\d+(\.\d+)?)/);
      if (scoreMatch && currentQuestion) {
        currentQuestion.score = parseFloat(scoreMatch[1]);
        return;
      }
    });

    // 处理最后一道题
    if (currentQuestion) {
      // 根据实际解析的选项重新确定题型
      currentQuestion = adjustQuestionType(currentQuestion);
      
      // 对判断题进行特殊处理
      if (currentQuestion.type === "true_false") {
        // 如果判断题没有选项，添加默认选项
        if (!currentQuestion.options || currentQuestion.options.length === 0) {
          console.warn(`题目${currentQuestion.number}判断题缺少选项，添加默认选项`);
          currentQuestion.options = [
            { key: "T", value: "正确", isCorrect: false },
            { key: "F", value: "错误", isCorrect: false }
          ];
        }
      }

      // 验证题目选项是否正确解析
      const optionErrors = validateQuestionOptions(currentQuestion);
      if (optionErrors.length > 0) {
        // 有错误的题目放入invalidQuestions
        optionErrors.forEach((error) => {
          currentParseErrors.push({
            questionNumber: currentQuestion.number,
            type: error.type,
            error: error.error,
            details: error.details,
          });
        });
        optionErrors.forEach((error, index) => {
          console.error(`   ${index + 1}. [${error.type}] ${error.error}`);
          if (error.details?.optionKey) {
            console.error(`      相关选项: ${error.details.optionKey}`);
          }
          if (
            error.details?.optionValue &&
            error.details.optionValue.length > 50
          ) {
            console.error(
              `      选项内容: "${error.details.optionValue.substring(
                0,
                100
              )}..."`
            );
          }
        });

        // 添加到无效题目列表
        invalidQuestions.push({
          ...currentQuestion,
          errors: optionErrors,
        });
      } else {
        // 没有错误的题目放入validQuestions
        validQuestions.push(
          formatWordQuestion(currentQuestion, questionNumber)
        );
      }
    }

    // 最终验证所有有效题目（双重检查）
    const finalValidQuestions: ParsedQuestion[] = [];
    validQuestions.forEach((question, index) => {
      const optionErrors = validateQuestionOptions(question);
      if (optionErrors.length > 0) {
        // 发现遗漏的错误，移到无效列表
        optionErrors.forEach((error) => {
          currentParseErrors.push({
            questionNumber: question.rowNumber || index + 1,
            type: error.type,
            error: error.error,
            details: error.details,
          });
        });
        console.warn(
          `⚠️ 题目${question.rowNumber || index + 1}二次验证发现错误，已过滤`
        );

        invalidQuestions.push({
          ...question,
          errors: optionErrors,
        });
      } else {
        finalValidQuestions.push(question);
      }
    });

    if (currentParseErrors.length > 0) {
      console.error("📋 详细错误报告:");

      // 按题目编号分组显示错误
      const errorsByQuestion = currentParseErrors.reduce((acc, error) => {
        if (!acc[error.questionNumber]) {
          acc[error.questionNumber] = [];
        }
        acc[error.questionNumber].push(error);
        return acc;
      }, {} as Record<number, any[]>);

      Object.entries(errorsByQuestion).forEach(([qNum, errors]) => {
        console.error(`\n  📋 题目${qNum} (${errors.length}个错误):`);
        errors.forEach((error, index) => {
          console.error(`     ${index + 1}. [${error.type}] ${error.error}`);
          if (error.details?.optionKey) {
            console.error(`        → 相关选项: ${error.details.optionKey}`);
          }
          if (error.details?.duplicateKeys?.length > 0) {
            console.error(
              `        → 重复的选项: ${error.details.duplicateKeys.join(", ")}`
            );
          }
          if (
            error.details?.optionValue &&
            error.details.optionValue.length > 50
          ) {
            console.error(
              `        → 选项内容: "${error.details.optionValue.substring(
                0,
                80
              )}..."`
            );
          }
        });
      });

      console.error(`\n📊 错误类型统计:`);
      const errorTypeCounts = currentParseErrors.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(errorTypeCounts).forEach(([type, count]) => {
        console.error(`  • ${type}: ${count} 次`);
      });
    }

    return {
      validQuestions: finalValidQuestions,
      invalidQuestions,
      parseErrors: currentParseErrors,
    };
  };

  // 格式化Word题目为标准格式
  const formatWordQuestion = (
    wordQuestion: any,
    questionNumber: number
  ): ParsedQuestion => {
    return {
      content: wordQuestion.content.trim(),
      type: wordQuestion.type,
      options: wordQuestion.options,
      answer: wordQuestion.answer,
      difficulty: wordQuestion.difficulty,
      score: wordQuestion.score,
      explanation: wordQuestion.explanation,
      subjectName: wordQuestion.subjectName,
      tags: wordQuestion.tags.filter(Boolean),
      rawData: wordQuestion,
      rowNumber: questionNumber,
    };
  };

  const convertWordToJson = async (wordFile: File) => {
    // 防止重复调用
    if (isParsing) {
      return;
    }

    try {
      console.log("开始解析Word文档...");
      setIsParsing(true);

      // 链式调用：确保所有解析完成后再处理结果
      const parseResult = await parseWordDocument(wordFile);

      // 直接处理解析完成的结果
      handleParseComplete(parseResult);
    } catch (error: any) {
      console.error("Word处理失败:", error);
      message.error("Word文档处理失败: " + error.message);
    } finally {
      setIsParsing(false);
    }
  };

  // 处理解析完成后的结果
  const handleParseComplete = (parseResult: {
    validQuestions: ParsedQuestion[];
    invalidQuestions: any[];
    parseErrors: any[];
  }) => {
    const {
      validQuestions,
      invalidQuestions,
      parseErrors: currentParseErrors,
    } = parseResult;
    const totalQuestions = validQuestions.length + invalidQuestions.length;

    // 检查是否有解析结果
    if (totalQuestions === 0) {
      message.warning(
        "未能解析出题目，请检查Word文档格式。详细信息请查看控制台。"
      );
      return;
    }

    setParseErrors(currentParseErrors);
    setImportData(validQuestions);
    setShowPreview(true);
    showParseResults(validQuestions, invalidQuestions, currentParseErrors);
  };

  // 显示解析结果的独立函数
  const showParseResults = (
    validQuestions: ParsedQuestion[],
    invalidQuestions: any[],
    currentParseErrors: any[]
  ) => {
    console.log("📋 显示最终解析结果...");
    console.log(
      `📊 准备显示结果: 有效${validQuestions.length}道, 无效${invalidQuestions.length}道, 错误${currentParseErrors.length}条`
    );

    if (invalidQuestions.length > 0) {
      // 有无效题目时显示警告
      const errorSummary = currentParseErrors.reduce((acc, error) => {
        if (!acc[error.questionNumber]) {
          acc[error.questionNumber] = [];
        }
        acc[error.questionNumber].push(error.error);
        return acc;
      }, {} as Record<number, string[]>);

      const errorMessage = Object.entries(errorSummary)
        .map(
          ([qNum, errors]) => `题目${qNum}: ${(errors as string[]).join(", ")}`
        )
        .join("\n");

      message.warning(
        `解析完成！有效题目: ${validQuestions.length} 道，过滤无效题目: ${invalidQuestions.length} 道`,
        8
      );

      // 显示详细错误对话框
      Modal.warning({
        title: "📊 Word解析结果",
        content: (
          <div>
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#f0f9ff",
                borderRadius: "6px",
                border: "1px solid #bae6fd",
              }}
            >
              <h4 style={{ margin: "0 0 8px 0", color: "#0369a1" }}>
                📈 解析统计
              </h4>
              <p style={{ margin: "4px 0", fontSize: "14px" }}>
                <span style={{ color: "#059669", fontWeight: "bold" }}>
                  ✅ 成功解析: {validQuestions.length} 道题目
                </span>
              </p>
              <p style={{ margin: "4px 0", fontSize: "14px" }}>
                <span style={{ color: "#dc2626", fontWeight: "bold" }}>
                  ❌ 解析失败: {invalidQuestions.length} 道题目 (已过滤)
                </span>
              </p>
            </div>

            {invalidQuestions.length > 0 && (
              <div>
                <h4 style={{ color: "#dc2626", margin: "0 0 12px 0" }}>
                  ❌ 无效题目详情：
                </h4>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {Object.entries(errorSummary).map(([qNum, errors]) => {
                    // 获取该题目的所有错误详情
                    const questionErrors = currentParseErrors.filter(
                      (e) => e.questionNumber === parseInt(qNum)
                    );

                    // 按错误类型分组
                    const errorsByType = questionErrors.reduce((acc, error) => {
                      if (!acc[error.type]) {
                        acc[error.type] = [];
                      }
                      acc[error.type].push(error);
                      return acc;
                    }, {} as Record<string, any[]>);

                    // 错误类型显示名称映射
                    const errorTypeNames: Record<string, string> = {
                      content_missing: "📝 内容缺失",
                      type_missing: "🏷️ 类型缺失",
                      options_missing: "🔘 选项缺失",
                      insufficient_options: "⚠️ 选项不足",
                      invalid_option_keys: "🔑 选项键无效",
                      duplicate_option_keys: "🔄 选项重复",
                      empty_option: "💭 空选项",
                      option_merging: "🔗 选项合并错误",
                      option_too_long: "📏 选项过长",
                      excessive_whitespace: "⬜ 空格异常",
                      option_line_break: "↩️ 换行符错误",
                      invalid_answer_format: "❓ 答案格式错误",
                      invalid_difficulty: "🎯 难度无效",
                      invalid_score: "💯 分值无效",
                    };

                    return (
                      <div
                        key={qNum}
                        style={{
                          marginBottom: "12px",
                          padding: "12px",
                          backgroundColor: "#fef2f2",
                          borderRadius: "6px",
                          border: "1px solid #fca5a5",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <strong
                            style={{ color: "#dc2626", fontSize: "16px" }}
                          >
                            📋 题目 {qNum}
                          </strong>
                          <span
                            style={{
                              fontSize: "12px",
                              backgroundColor: "#dc2626",
                              color: "white",
                              padding: "2px 6px",
                              borderRadius: "10px",
                            }}
                          >
                            {questionErrors.length} 个错误
                          </span>
                        </div>

                        {/* 分类显示错误 */}
                        {Object.entries(errorsByType).map(
                          ([errorType, typeErrors]) => (
                            <div
                              key={errorType}
                              style={{ marginBottom: "8px" }}
                            >
                              <div
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  color: "#991b1b",
                                  marginBottom: "4px",
                                }}
                              >
                                {errorTypeNames[errorType] || `🚨 ${errorType}`}
                              </div>
                              <ul style={{ margin: "0", paddingLeft: "20px" }}>
                                {(typeErrors as any[]).map(
                                  (error: any, index: number) => (
                                    <li
                                      key={index}
                                      style={{
                                        fontSize: "13px",
                                        color: "#7f1d1d",
                                        marginBottom: "2px",
                                      }}
                                    >
                                      {error.error}
                                      {/* 显示关键详情 */}
                                      {error.details?.optionKey && (
                                        <span
                                          style={{
                                            fontSize: "11px",
                                            color: "#999",
                                            marginLeft: "8px",
                                          }}
                                        >
                                          [选项: {error.details.optionKey}]
                                        </span>
                                      )}
                                      {error.details?.optionValue &&
                                        error.details.optionValue.length >
                                          30 && (
                                          <div
                                            style={{
                                              fontSize: "11px",
                                              color: "#666",
                                              marginTop: "2px",
                                              padding: "4px",
                                              backgroundColor: "#f9fafb",
                                              borderRadius: "2px",
                                              fontFamily: "monospace",
                                            }}
                                          >
                                            内容: "
                                            {error.details.optionValue.substring(
                                              0,
                                              50
                                            )}
                                            ..."
                                          </div>
                                        )}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )
                        )}

                        {/* 详细技术信息（可折叠） */}
                        <details
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginTop: "8px",
                            cursor: "pointer",
                          }}
                        >
                          <summary style={{ fontSize: "12px", color: "#666" }}>
                            查看技术详情 ({questionErrors.length} 条错误记录)
                          </summary>
                          <div style={{ marginTop: "8px" }}>
                            {questionErrors.map((error, index) => (
                              <div
                                key={index}
                                style={{
                                  marginBottom: "8px",
                                  padding: "6px",
                                  backgroundColor: "#f8fafc",
                                  borderRadius: "3px",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    color: "#374151",
                                    marginBottom: "2px",
                                  }}
                                >
                                  错误类型: {error.type}
                                </div>
                                <pre
                                  style={{
                                    fontSize: "10px",
                                    background: "#f1f5f9",
                                    padding: "4px",
                                    borderRadius: "2px",
                                    margin: "0",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-all",
                                  }}
                                >
                                  {JSON.stringify(error.details, null, 2)}
                                </pre>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              style={{
                marginTop: "16px",
                padding: "10px",
                backgroundColor: "#f8fafc",
                borderRadius: "4px",
                fontSize: "14px",
                color: "#475569",
              }}
            >
              💡 <strong>说明:</strong>
              <br />• 只有解析正确的题目会被导入到系统中
              <br />• 解析失败的题目已自动过滤，不影响正常题目的导入
              <br />• 建议检查Word文档格式，修复后重新导入失败的题目
            </div>
          </div>
        ),
        width: 700,
        maskClosable: true,
      });
    } else {
      // 没有错误时显示成功消息
      message.success(
        `🎉 成功解析 ${validQuestions.length} 道题目，所有题目格式正确！`
      );
    }
  };

  // API调用和导入相关函数
  const saveQuestionToAPI = async (
    questionData: ParsedQuestion
  ): Promise<any> => {
    try {
      // 处理学科ID
      let subjectId = importConfig.defaultSubjectId;
      if (questionData.subjectName) {
        // 这里模拟API调用，实际使用时需要替换为真实的API端点
        console.log(`查找学科: ${questionData.subjectName}`);
        // const subjectResponse = await fetch('/api/subjects/find-or-create', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ name: questionData.subjectName })
        // });
      }

      // 准备题目数据
      const questionPayload = {
        content: questionData.content,
        type: questionData.type,
        answer: JSON.stringify(
          questionData.type === "single_choice" ||
            questionData.type === "multiple_choice"
            ? { correct: questionData.answer }
            : { answer: questionData.answer }
        ),
        difficulty: questionData.difficulty,
        score: questionData.score,
        explanation: questionData.explanation,
        subject_id: subjectId,
        status: "published",
        created_by: 1,
      };

      console.log("准备保存题目:", questionPayload);

      // 实际API调用（示例）
      // const questionResponse = await fetch('/api/questions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(questionPayload)
      // });

      // 模拟保存成功
      const savedQuestion = { id: Date.now(), ...questionPayload };

      // 保存选项
      if (questionData.options && questionData.options.length > 0) {
        console.log("保存选项:", questionData.options);
      }

      // 处理标签
      if (questionData.tags && questionData.tags.length > 0) {
        console.log("处理标签:", questionData.tags);
      }

      return savedQuestion;
    } catch (error) {
      console.error("API调用失败:", error);
      throw error;
    }
  };

  const updateProgressUI = (progress: ImportProgress) => {
    const progressPercent = (progress.processed / progress.total) * 100;

    // 更新进度条
    const progressFill = document.querySelector(
      ".progress-fill"
    ) as HTMLElement;
    if (progressFill) {
      progressFill.style.width = `${progressPercent}%`;
    }

    // 更新数字显示
    const processedEl = document.getElementById("processed");
    const totalEl = document.getElementById("total");
    const successEl = document.getElementById("success");
    const failedEl = document.getElementById("failed");

    if (processedEl) processedEl.textContent = progress.processed.toString();
    if (totalEl) totalEl.textContent = progress.total.toString();
    if (successEl) successEl.textContent = progress.success.toString();
    if (failedEl) failedEl.textContent = progress.failed.toString();
  };

  const showImportResults = (
    success: number,
    failed: number,
    errors: Array<{ row: number; error: string }>
  ) => {
    if (failed === 0) {
      message.success(`导入完成！成功导入 ${success} 道题目`);
    } else {
      message.warning(`导入完成！成功 ${success} 道，失败 ${failed} 道`);

      if (errors.length > 0) {
        Modal.info({
          title: "导入报告",
          content: (
            <div>
              <p>总计：{success + failed} 道题目</p>
              <p style={{ color: "#52c41a" }}>成功：{success} 道</p>
              <p style={{ color: "#ff4d4f" }}>失败：{failed} 道</p>
              <div>
                <h4>错误详情：</h4>
                {errors.slice(0, 5).map((error) => (
                  <p key={error.row}>
                    第{error.row}行：{error.error}
                  </p>
                ))}
                {errors.length > 5 && <p>...还有{errors.length - 5}个错误</p>}
              </div>
            </div>
          ),
          width: 600,
        });
      }
    }
  };

  const startImport = async () => {
    if (!importData || importData.length === 0) {
      message.error("请先上传并解析文件");
      return;
    }

    setIsImporting(true);
    setImportProgress({
      total: importData.length,
      processed: 0,
      success: 0,
      failed: 0,
      errors: [],
    });

    try {
      let successCount = 0;
      let failedCount = 0;
      const errors: Array<{ row: number; error: string }> = [];

      console.log(`开始导入 ${importData.length} 道题目`);
      console.log("导入配置:", importConfig);

      // 逐个处理题目
      for (let i = 0; i < importData.length; i++) {
        const questionData = importData[i];
        console.log("questionData =====>", questionData);
        try {
          // 检查重复题目（这里简化处理）
          if (importConfig.importMode === "skip") {
            console.log(
              `检查重复题目: ${questionData.content.substring(0, 50)}...`
            );
          }

          // 保存题目
          await saveQuestionToAPI(questionData);
          successCount++;
        } catch (error: any) {
          failedCount++;
          errors.push({
            row: questionData.rowNumber || i + 1,
            error: error.message || "未知错误",
          });
        }

        // 更新进度
        const progress = {
          total: importData.length,
          processed: i + 1,
          success: successCount,
          failed: failedCount,
          errors,
        };
        setImportProgress(progress);
        updateProgressUI(progress);

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      showImportResults(successCount, failedCount, errors);

      setShowPreview(false);
    } catch (error: any) {
      console.error("导入过程出错:", error);
      message.error("导入过程中发生错误：" + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const onChange = async (info: any) => {
    const { fileList } = info;
    if (fileList.length === 0) return;
    
    const file = fileList[0].originFileObj;
    if (!file) return;

    // 防止在解析或导入过程中重复处理文件
    if (isParsing || isImporting) {
      console.log("⚠️ 正在处理中，跳过文件上传");
      return;
    }

    console.log(
      "📁 处理上传文件:",
      file.name,
      "Word文档:",
      isWordFile(file.name)
    );

    // 检查文件类型并分别处理
    if (isWordFile(file.name)) {
      // 处理Word文档
      await convertWordToJson(file);
      return;
    }

    // 处理Excel文件
    console.log("📊 开始解析Excel文件...");
    setIsParsing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const workSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        const xlsxJson = XLSX.utils.sheet_to_json(workSheet, {
          header: 1,
        }) as any[][];
        
        console.log( "=======", xlsxJson)
        if (xlsxJson.length > 0) {
          console.log("Excel解析结果:", xlsxJson);
          setExcelData(xlsxJson);

          const headers = xlsxJson[0] as string[];
          const result: ParsedQuestion[] = [];
          xlsxJson.slice(1).forEach((item: any[], rowIndex) => {
            if (!item || item.length === 0) return;

            try {
              // 将行数据转换为对象
              const rowData: any = {};
              headers.forEach((key: string, index: number) => {
                rowData[key] = item[index] || "";
              });

              // 解析和验证题目数据
              const parsedQuestion = parseQuestionRow(rowData, rowIndex + 2);
              if (parsedQuestion) {
                result.push(parsedQuestion);
              }
            } catch (error) {
              console.error(`第${rowIndex + 2}行数据解析错误:`, error);
            }
          });

          console.log("Excel解析结果:", result);
          setImportData(result);
          setShowPreview(true);
          message.success(`成功解析 ${result.length} 道题目`);
        }
      } catch (error) {
        console.error("读取Excel文件失败:", error);
        message.error("文件读取失败，请检查文件格式");
      } finally {
        setIsParsing(false);
      }
    };
    
    reader.onerror = () => {
      console.error("文件读取错误");
      message.error("文件读取错误");
      setIsParsing(false);
    };
    
    // 使用 readAsArrayBuffer 而不是 readAsDataURL
    reader.readAsArrayBuffer(file);
  };

  const uploadProps: UploadProps = {
    name: "file",
    accept: ".xlsx,.csv,.json,.docx",
    multiple: true,
    onChange: (info) => onChange(info),
    showUploadList: false,
  };

  const downloadTemplate = () => {
    try {
      const worksheet = XLSX.utils.aoa_to_sheet(excelJson);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, "template.xlsx");
    } catch (error) {
      console.error("下载模板失败:", error);
      message.error("下载模板失败");
    }
  };

  const downloadDocxTemplate = () => {
    generateDocx();
  }

  return (
    <div className="import-modal">
      <div className="import-body">
        <Dragger {...uploadProps} disabled={isParsing || isImporting}>
          <div className="ant-upload-drag-icon">
            <div className="upload-icon">
              {isParsing ? "🔄" : isImporting ? "⬆️" : "📁"}
            </div>
          </div>
          <div className="ant-upload-text">
            <div className="upload-text">
              {isParsing
                ? "正在解析文档..."
                : isImporting
                ? "正在导入数据..."
                : "拖拽文件到此处或点击上传"}
            </div>
          </div>
          <div className="ant-upload-hint">
            {isParsing || isImporting
              ? "请等待处理完成..."
              : "支持 .xlsx, .csv, .json, .docx 格式，最大 10MB"}
          </div>
        </Dragger>

        <div className="template-section">
          <div className="template-title">📋 下载导入模板</div>
          <div className="template-desc">
            请先下载标准模板，按照规定格式填写题目信息。模板包含题目内容、选项、答案、难度、标签等必填字段。
          </div>
          <div className="template-links">
            <button className="btn btn-secondary" onClick={downloadTemplate}>
              Excel模板
            </button>
            <button className="btn btn-secondary" onClick={downloadDocxTemplate}>docx模板</button>
          </div>
        </div>

        <div className="import-options">
          <div className="option-group">
            <label className="option-label">导入模式</label>
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="请选择导入模式"
              optionFilterProp="label"
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? "")
                  .toLowerCase()
                  .localeCompare((optionB?.label ?? "").toLowerCase())
              }
              value={importConfig.importMode}
              onChange={(value) => {
                console.log("导入模式 =====>", value);
                setImportConfig({ ...importConfig, importMode: value });
              }}
              options={[
                {
                  value: "overwrite",
                  label: "覆盖重复题目",
                },
                {
                  value: "skip",
                  label: "跳过重复题目",
                },
                {
                  value: "rename",
                  label: "自动重命名",
                },
              ]}
            />
          </div>
          <div className="option-group">
            <label className="option-label">默认学科</label>
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="请选择默认学科"
              value={importConfig.defaultSubjectId}
              optionFilterProp="label"
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? "")
                  .toLowerCase()
                  .localeCompare((optionB?.label ?? "").toLowerCase())
              }
              onChange={(value) => {
                console.log("默认学科 =====>", value);
                setImportConfig({ ...importConfig, defaultSubjectId: value });
              }}
              options={[
                {
                  value: 1,
                  label: "计算机科学",
                },
                {
                  value: 2,
                  label: "数学",
                },
                {
                  value: 3,
                  label: "英语",
                },
                {
                  value: 4,
                  label: "程序设计",
                },
                {
                  value: 5,
                  label: "数据结构",
                },
                {
                  value: 7,
                  label: "计算机网络",
                },
                {
                  value: 8,
                  label: "操作系统",
                },
                {
                  value: 6,
                  label: "数据库原理",
                },
                {
                  value: 9,
                  label: "Web开发",
                },
                {
                  value: 10,
                  label: "软件工程",
                },
              ]}
            />
          </div>
          <div className="option-group">
            <label className="option-label">默认难度</label>
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="请选择默认难度"
              optionFilterProp="label"
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? "")
                  .toLowerCase()
                  .localeCompare((optionB?.label ?? "").toLowerCase())
              }
              value={importConfig.defaultDifficulty}
              onChange={(value) => {
                console.log("默认难度 =====>", value);
                setImportConfig({ ...importConfig, defaultDifficulty: value });
              }}
              options={[
                {
                  value: "easy",
                  label: "简单",
                },
                {
                  value: "medium",
                  label: "中等",
                },
                {
                  value: "hard",
                  label: "困难",
                },
              ]}
            />
            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              💡 用于无难度信息或格式错误的题目
            </div>
          </div>
          <div className="option-group">
            <label className="option-label">默认标签</label>
            <Input
              style={{ height: "30px" }}
              value={importConfig.defaultTags}
              onChange={(e) => {
                console.log("默认标签 =====>", e.target.value);
                setImportConfig({
                  ...importConfig,
                  defaultTags: e.target.value,
                });
              }}
              type="text"
              placeholder="输入标签，用逗号分隔"
            />
          </div>
        </div>

        {/* <!-- 进度显示区域 --> */}
        <div className="progress-section" id="progressSection">
          <div className="template-title">📈 导入进度</div>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px",
              color: "#7f8c8d",
              marginTop: "10px",
            }}
          >
            <span>
              已处理: <span id="processed">0</span>/<span id="total">0</span>
            </span>
            <span>
              成功: <span id="success">0</span> | 失败:{" "}
              <span id="failed">0</span>
            </span>
          </div>
        </div>

        <div className="import-actions">
          <button className="btn btn-primary" onClick={startImport}>
            开始导入
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportModal;
