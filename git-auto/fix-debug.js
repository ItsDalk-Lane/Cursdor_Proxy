const fs = require('fs');
const path = require('path');

// 读取 main.ts 文件
const mainTsPath = path.join(__dirname, 'main.ts');
let content = fs.readFileSync(mainTsPath, 'utf8');

console.log('开始替换调试语句...');

// 替换规则 - 更完整的版本
const replacements = [
    // 替换常规的console调用
    {
        from: /console\.log\('开始暂存文件，工作目录:', vaultPath\);/g,
        to: "this.debugLog('开始暂存文件，工作目录:', vaultPath);"
    },
    {
        from: /console\.log\('要暂存的文件列表:', filePaths\);/g,
        to: "this.debugLog('要暂存的文件列表:', filePaths);"
    },
    {
        from: /console\.log\('检测到Unicode转义路径，使用git add \.进行暂存'\);/g,
        to: "this.debugLog('检测到Unicode转义路径，使用git add .进行暂存');"
    },
    {
        from: /console\.log\('使用git add \.成功暂存所有文件'\);/g,
        to: "this.debugLog('使用git add .成功暂存所有文件');"
    },
    {
        from: /console\.log\('处理文件路径:', file, '→', cleanPath\);/g,
        to: "this.debugLog('处理文件路径:', file, '→', cleanPath);"
    },
    {
        from: /console\.log\('成功暂存文件:', cleanPath\);/g,
        to: "this.debugLog('成功暂存文件:', cleanPath);"
    },
    {
        from: /console\.error\('暂存单个文件失败:', file, fileError\);/g,
        to: "this.debugError('暂存单个文件失败:', file, fileError);"
    },
    {
        from: /console\.log\('回退到git add \.进行全部暂存'\);/g,
        to: "this.debugLog('回退到git add .进行全部暂存');"
    },
    {
        from: /console\.log\('使用git add \.作为备用方案成功'\);/g,
        to: "this.debugLog('使用git add .作为备用方案成功');"
    },
    {
        from: /console\.log\(`暂存操作完成，成功处理了 \${successCount}\/\${filePaths\.length} 个文件`\);/g,
        to: "this.debugLog(`暂存操作完成，成功处理了 ${successCount}/${filePaths.length} 个文件`);"
    },
    {
        from: /console\.error\('Git提交失败:', error\);/g,
        to: "this.debugError('Git提交失败:', error);"
    },
    {
        from: /console\.error\('获取Git变更失败:', error\);/g,
        to: "this.debugError('获取Git变更失败:', error);"
    },
    {
        from: /console\.warn\(`获取文件 \${filePath} 的diff失败:`, error\);/g,
        to: "this.debugWarn(`获取文件 ${filePath} 的diff失败:`, error);"
    },
    {
        from: /console\.error\('添加单个文件失败:', file, fileError\);/g,
        to: "this.debugError('添加单个文件失败:', file, fileError);"
    },
    {
        from: /console\.warn\('清理临时文件失败:', cleanupError\);/g,
        to: "this.debugWarn('清理临时文件失败:', cleanupError);"
    },
    {
        from: /console\.error\('使用临时文件提交失败，回退到单行模式:', fileError\);/g,
        to: "this.debugError('使用临时文件提交失败，回退到单行模式:', fileError);"
    },
    // 剩余的特殊情况
    {
        from: /this\.debugLog\('没有检测到文件变更'\);/g,
        to: "this.debugLog('没有检测到文件变更');"
    }
];

// 应用替换
replacements.forEach((rule, index) => {
    const beforeLength = content.length;
    content = content.replace(rule.from, rule.to);
    const afterLength = content.length;
    if (beforeLength !== afterLength) {
        console.log(`规则 ${index + 1}: 处理了替换`);
    }
});

// 写回文件
fs.writeFileSync(mainTsPath, content, 'utf8');
console.log('替换完成！');
