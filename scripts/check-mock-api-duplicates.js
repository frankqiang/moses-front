#!/usr/bin/env node

/**
 * 检查Mock服务中的API路径重复问题
 * 
 * 使用方法：node scripts/check-mock-api-duplicates.js
 * 
 * 功能：
 * 1. 扫描所有mock文件
 * 2. 提取定义的API路径
 * 3. 检查是否有重复定义
 * 4. 输出检查结果
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 获取所有mock文件
const mockFiles = glob.sync('mock/**/*.js', { ignore: ['mock/utils.js', 'mock/index.js'] });

// 存储API路径和对应的文件
const apiPaths = {};
const duplicates = [];

// 解析单个mock文件
function parseMockFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 使用简单的正则表达式查找API路径
    // 注意：这种方法可能不完美，但对大多数简单情况已足够
    const urlRegexString = 'url:\\s*[\'"](.*?)[\'"]';
    const urlRegexPattern = 'url:\\s*/(.*?)/';
    
    // 匹配字符串形式的URL
    const urlMatches = content.match(new RegExp(urlRegexString, 'g')) || [];
    
    // 匹配正则表达式形式的URL
    const patternMatches = content.match(new RegExp(urlRegexPattern, 'g')) || [];
    
    // 处理字符串形式的URL
    for (const match of urlMatches) {
      const urlMatch = match.match(new RegExp(urlRegexString));
      if (urlMatch && urlMatch[1]) {
        const apiPath = urlMatch[1];
        if (!apiPaths[apiPath]) {
          apiPaths[apiPath] = [filePath];
        } else {
          apiPaths[apiPath].push(filePath);
          if (!duplicates.includes(apiPath)) {
            duplicates.push(apiPath);
          }
        }
      }
    }
    
    // 处理正则表达式形式的URL（简单处理，可能不完全准确）
    for (const match of patternMatches) {
      const patternMatch = match.match(new RegExp(urlRegexPattern));
      if (patternMatch && patternMatch[1]) {
        const apiPath = `REGEX:/${patternMatch[1]}/`;
        console.log(`Found regex pattern: ${apiPath} in ${filePath}`);
      }
    }
    
  } catch (error) {
    console.error(`解析文件 ${filePath} 时出错:`, error.message);
  }
}

// 主函数
function main() {
  console.log('开始检查Mock API重复...');
  
  // 解析所有mock文件
  mockFiles.forEach(parseMockFile);
  
  // 输出检查结果
  if (duplicates.length > 0) {
    console.error('\n⚠️ 发现重复的API路径:');
    duplicates.forEach(apiPath => {
      console.error(`\n  ${apiPath} 在以下文件中重复定义:`);
      apiPaths[apiPath].forEach(file => {
        console.error(`    - ${file}`);
      });
    });
    console.error('\n请修复上述重复定义问题，遵循"每个API路径只在一个文件中定义"的原则。');
    process.exit(1);
  } else {
    console.log('\n✅ 没有发现重复的API路径，很好!');
  }
}

main(); 