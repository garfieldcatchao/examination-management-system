import { Document, Paragraph, Packer } from "docx";
import { saveAs } from "file-saver";

const doc = new Document({
  sections: [
    {
      children: [
        // 标题
        new Paragraph({ text: "选择题", style: "Heading1" }),

        // 选择题1
        new Paragraph("1. TCP协议和UDP协议的主要区别是什么？"),
        new Paragraph("A. 可靠性不同\t\t\t\t\tB. 连接性不同"),
        new Paragraph("C. 传输效率不同\t\t\t\tD. 以上都是"),

        // 选择题2（空一行分隔）
        new Paragraph(""),
        new Paragraph("2. TCP协议和UDP协议的主要区别是什么？"),
        new Paragraph("A. 可靠性不同\t\t\t\t\tB. 连接性不同"),
        new Paragraph("C. 传输效率不同\t\t\t\tD. 以上都是"),

        // 判断题标题
        new Paragraph({ text: "判断题", style: "Heading1" }),

        // 判断题3
        new Paragraph("3. 判断题1 TCP协议和UDP协议的主要区别 (  );"),

        // 判断题4
        new Paragraph("4. 判断题2 TCP协议和UDP协议的主要区别 (  );"),

        // 简答题标题
        new Paragraph({ text: "简答题", style: "Heading1" }),

        // 简答题5
        new Paragraph("5. 简答题 TCP协议和UDP协议的主要区别是什么？"),
      ],
    },
  ],
});

export async function generateDocx() {

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "example.docx");
}
