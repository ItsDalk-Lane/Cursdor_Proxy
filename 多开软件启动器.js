const { exec } = require('child_process');
const path = require('path');

/**
 * 多开软件函数
 * @param {string} exePath - 软件exe文件的完整路径
 * @param {number} count - 需要打开的软件实例数量
 */
async function multiLaunchApp(exePath, count) {
    // 参数验证
    if (!exePath) {
        new Notice("错误：请提供软件的exe文件路径");
        return;
    }
    
    if (!count || count < 1) {
        new Notice("错误：请提供有效的多开数量（至少为1）");
        return;
    }
    
    // 检查是否在桌面端运行
    if (!Platform.isDesktopApp) {
        new Notice("错误：此功能仅在桌面端可用");
        return;
    }
    
    // 检查文件路径是否存在
    try {
        const fs = require('fs');
        if (!fs.existsSync(exePath)) {
            new Notice(`错误：找不到指定的exe文件: ${exePath}`);
            return;
        }
    } catch (error) {
        new Notice(`错误：无法验证文件路径: ${error.message}`);
        return;
    }
    
    // 获取exe文件名用于显示
    const appName = path.basename(exePath);
    
    new Notice(`正在启动 ${count} 个 ${appName} 实例...`);
    
    let successCount = 0;
    let failCount = 0;
    
    // 使用Promise数组来并行启动多个实例
    const launchPromises = [];
    
    for (let i = 0; i < count; i++) {
        const promise = new Promise((resolve) => {
            // 添加延迟，避免同时启动太多进程
            setTimeout(() => {
                // 根据操作系统使用不同的命令
                let command;
                if (Platform.isWin) {
                    // Windows系统使用start命令
                    command = `start "" "${exePath}"`;
                } else if (Platform.isMacOS) {
                    // macOS系统使用open命令
                    command = `open -n "${exePath}"`;
                } else if (Platform.isLinux) {
                    // Linux系统直接执行
                    command = `"${exePath}" &`;
                }
                
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`启动第 ${i + 1} 个实例失败:`, error);
                        failCount++;
                        resolve(false);
                    } else {
                        console.log(`成功启动第 ${i + 1} 个实例`);
                        successCount++;
                        resolve(true);
                    }
                });
            }, i * 500); // 每个实例延迟500毫秒启动
        });
        
        launchPromises.push(promise);
    }
    
    // 等待所有启动任务完成
    await Promise.all(launchPromises);
    
    // 显示最终结果
    if (failCount === 0) {
        new Notice(`✅ 成功启动所有 ${successCount} 个 ${appName} 实例`);
    } else if (successCount === 0) {
        new Notice(`❌ 启动失败：无法启动任何 ${appName} 实例`);
    } else {
        new Notice(`⚠️ 部分成功：${successCount} 个实例启动成功，${failCount} 个失败`);
    }
}

async function safeMultiLaunchApp(args) {
    if (!args || typeof args !== 'object') {
        new Notice("错误：请提供参数对象，格式：{exePath: '路径', count: 数量}");
        return;
    }
    
    const { exePath, count } = args;
    
    // 类型检查
    if (typeof exePath !== 'string') {
        new Notice("错误：exePath 必须是字符串类型");
        return;
    }
    
    if (typeof count !== 'number' || !Number.isInteger(count)) {
        new Notice("错误：count 必须是整数类型");
        return;
    }
    
    // 调用主函数
    await multiLaunchApp(exePath, count);
}

// 导出脚本信息
exports.default = {
    name: "multiLaunchApp",
    description: `## 多开软件启动器
    
此脚本可以同时启动多个相同软件的实例。

### 使用方法：
调用函数时传入两个参数：
- **exePath**: 软件exe文件的完整路径（字符串）
- **count**: 需要打开的实例数量（整数）

### 示例：
\`\`\`
multiLaunchApp("C:\\Program Files\\MyApp\\app.exe", 3)
\`\`\`

### 支持的操作系统：
- Windows
- macOS
- Linux

### 注意事项：
1. 仅在桌面端Obsidian可用
2. 确保提供的exe路径正确且文件存在
3. 某些软件可能有防止多开的机制
4. 建议不要一次启动太多实例，以免系统资源不足`,
    entry: multiLaunchApp
};
