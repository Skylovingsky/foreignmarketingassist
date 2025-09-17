const XLSX = require('xlsx');
const fs = require('fs');

// 读取Excel文件
const workbook = XLSX.readFile('./customer_data.xlsx');
console.log('工作表名称:', workbook.SheetNames);

// 获取第一个工作表
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

console.log('\n=== 工作表范围 ===');
console.log('范围:', worksheet['!ref']);

// 转换为JSON查看数据结构
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
console.log('\n=== 前10行数据 (作为数组) ===');
jsonData.slice(0, 10).forEach((row, index) => {
  console.log(`行 ${index + 1}:`, row);
});

// 转换为对象数组 (自动检测表头)
const objData = XLSX.utils.sheet_to_json(worksheet);
console.log('\n=== 数据总数 ===');
console.log('总行数:', objData.length);

if (objData.length > 0) {
  console.log('\n=== 第一行数据结构 ===');
  console.log('字段名:', Object.keys(objData[0]));
  console.log('第一行数据:', objData[0]);
  
  console.log('\n=== 前5行数据 ===');
  objData.slice(0, 5).forEach((row, index) => {
    console.log(`客户 ${index + 1}:`, row);
  });
}

// 检查数据类型和清洁度
console.log('\n=== 数据质量检查 ===');
let companiesWithName = 0;
let companiesWithLocation = 0;
let uniqueCountries = new Set();

objData.forEach(row => {
  // 检查公司名称字段 (可能的字段名)
  const companyName = row['公司名称'] || row['Company Name'] || row['companyName'] || row['名称'] || row['Name'];
  if (companyName && companyName.toString().trim() !== '') {
    companiesWithName++;
  }
  
  // 检查地区字段 (可能的字段名)
  const location = row['地区'] || row['Location'] || row['Country'] || row['country'] || row['国家'];
  if (location && location.toString().trim() !== '') {
    companiesWithLocation++;
    uniqueCountries.add(location.toString().trim());
  }
});

console.log(`有公司名称的记录: ${companiesWithName}`);
console.log(`有地区信息的记录: ${companiesWithLocation}`);
console.log(`唯一国家/地区数量: ${uniqueCountries.size}`);
console.log('国家/地区列表:', Array.from(uniqueCountries).slice(0, 10), '...');