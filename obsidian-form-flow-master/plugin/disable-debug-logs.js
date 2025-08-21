const fs = require('fs');
const path = require('path');

/**
 * 递归遍历目录，找到所有TypeScript和JavaScript文件
 */
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const files = [];
    
    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // 跳过node_modules等目录
                if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
                    traverse(fullPath);
                }
            } else if (stat.isFile()) {
                const ext = path.extname(item);
                if (extensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    }
    
    traverse(dir);
    return files;
}

/**
 * 注释掉文件中的console.log语句
 */
function disableConsoleLogs(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // 匹配console.log语句的正则表达式
        const consoleLogRegex = /^(\s*)(console\.log\([^;]*;?)$/gm;
        
        content = content.replace(consoleLogRegex, (match, indent, logStatement) => {
            modified = true;
            return `${indent}// DEBUG_DISABLED: ${logStatement}`;
        });
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`已处理文件: ${filePath}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`处理文件失败 ${filePath}:`, error.message);
        return false;
    }
}

/**
 * 主函数
 */
function main() {
    const srcDir = path.join(__dirname, 'src');
    
    if (!fs.existsSync(srcDir)) {
        console.error('src目录不存在');
        return;
    }
    
    console.log('开始关闭调试日志...');
    
    const files = findFiles(srcDir);
    let processedCount = 0;
    
    for (const file of files) {
        if (disableConsoleLogs(file)) {
            processedCount++;
        }
    }
    
    console.log(`\n处理完成！共处理了 ${processedCount} 个文件中的调试日志。`);
    console.log('所有console.log语句已被注释为 // DEBUG_DISABLED:');
}

if (require.main === module) {
    main();
}

module.exports = { disableConsoleLogs, findFiles };