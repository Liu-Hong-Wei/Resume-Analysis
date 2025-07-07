import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试配置
const API_BASE_URL = "http://localhost:3001";
const TEST_PDF_PATH = path.join(__dirname, "test-resume.pdf");

// 创建测试PDF文件
function createTestPDF() {
  const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(测试简历内容) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF
  `;

  fs.writeFileSync(TEST_PDF_PATH, pdfContent);
  console.log("测试PDF文件已创建:", TEST_PDF_PATH);
}

// 测试健康检查
async function testHealthCheck() {
  try {
    console.log("\n=== 测试健康检查 ===");
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log("健康检查结果:", data);
    return response.ok;
  } catch (error) {
    console.error("健康检查失败:", error.message);
    return false;
  }
}

// 测试简历分析API
async function testResumeAnalysis() {
  try {
    console.log("\n=== 测试简历分析API ===");

    // 检查测试文件是否存在
    if (!fs.existsSync(TEST_PDF_PATH)) {
      console.log("创建测试PDF文件...");
      createTestPDF();
    }

    const formData = new FormData();
    const fileBuffer = fs.readFileSync(TEST_PDF_PATH);
    const file = new File([fileBuffer], "test-resume.pdf", {
      type: "application/pdf",
    });
    formData.append("resume", file);

    const response = await fetch(`${API_BASE_URL}/api/analyze-resume`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("API响应状态:", response.status);
    console.log("API响应数据:", JSON.stringify(data, null, 2));

    return response.ok;
  } catch (error) {
    console.error("简历分析测试失败:", error.message);
    return false;
  }
}

// 测试错误情况
async function testErrorCases() {
  try {
    console.log("\n=== 测试错误情况 ===");

    // 测试上传非PDF文件
    console.log("1. 测试上传非PDF文件...");
    const formData = new FormData();
    const textFile = new File(["测试文本"], "test.txt", { type: "text/plain" });
    formData.append("resume", textFile);

    const response1 = await fetch(`${API_BASE_URL}/api/analyze-resume`, {
      method: "POST",
      body: formData,
    });

    const data1 = await response1.json();
    console.log("非PDF文件响应:", data1);

    // 测试不传文件
    console.log("2. 测试不传文件...");
    const response2 = await fetch(`${API_BASE_URL}/api/analyze-resume`, {
      method: "POST",
    });

    const data2 = await response2.json();
    console.log("不传文件响应:", data2);

    return true;
  } catch (error) {
    console.error("错误情况测试失败:", error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log("开始API测试...\n");

  const healthCheckPassed = await testHealthCheck();
  const resumeAnalysisPassed = await testResumeAnalysis();
  const errorCasesPassed = await testErrorCases();

  console.log("\n=== 测试总结 ===");
  console.log("健康检查:", healthCheckPassed ? "✅ 通过" : "❌ 失败");
  console.log("简历分析:", resumeAnalysisPassed ? "✅ 通过" : "❌ 失败");
  console.log("错误处理:", errorCasesPassed ? "✅ 通过" : "❌ 失败");

  // 清理测试文件
  if (fs.existsSync(TEST_PDF_PATH)) {
    fs.unlinkSync(TEST_PDF_PATH);
    console.log("测试文件已清理");
  }

  console.log("\n测试完成！");
}

// 运行测试
runTests().catch(console.error);
