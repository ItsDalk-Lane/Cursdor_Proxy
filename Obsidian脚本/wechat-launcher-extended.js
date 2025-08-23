/**
 * 生成微信启动命令
 * @param {number} instanceCount - 要启动的微信实例数量
 * @param {string} wechatPath - 微信程序路径
 */
async function generateWeChatCommands(instanceCount = 3, wechatPath = "C:\\Program Files\\Tencent\\WeChat\\WeChat.exe") {
  try {
      if (!wechatPath || wechatPath.trim() === "") {
          new Notice("微信路径不能为空！");
          return;
      }

      // 生成批处理命令
      let commands = [];
      for (let i = 0; i < instanceCount; i++) {
          commands.push(`start "" "${wechatPath}"`);
      }
      
      const batchContent = `@echo off
echo 正在启动 ${instanceCount} 个微信实例...
${commands.join('\n')}
echo 启动完成！
pause`;

      const cmdCommand = `cmd /c "${commands.join(' && ')}"`;
      const powershellCommand = commands.map(cmd => `Start-Process "${wechatPath}"`).join('; ');

      // 创建模态框显示所有选项
      const modal = new Modal(app);
      modal.titleEl.setText(`启动 ${instanceCount} 个微信实例`);
      
      const content = modal.contentEl;
      
      // 方法1：直接命令
      content.createEl("h3", { text: "方法1：Windows运行(Win+R)" });
      content.createEl("p", { text: "复制以下命令到运行对话框：" });
      const cmdBlock = content.createEl("pre");
      cmdBlock.style.cssText = "background:#f5f5f5;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:12px;";
      cmdBlock.textContent = cmdCommand;
      
      const copyCmd = content.createEl("button", { text: "复制CMD命令" });
      copyCmd.onclick = () => {
          navigator.clipboard.writeText(cmdCommand);
          new Notice("CMD命令已复制！");
      };

      // 方法2：PowerShell
      content.createEl("h3", { text: "方法2：PowerShell" });
      const psBlock = content.createEl("pre");
      psBlock.style.cssText = "background:#f5f5f5;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:12px;";
      psBlock.textContent = powershellCommand;
      
      const copyPS = content.createEl("button", { text: "复制PowerShell命令" });
      copyPS.onclick = () => {
          navigator.clipboard.writeText(powershellCommand);
          new Notice("PowerShell命令已复制！");
      };

      // 方法3：批处理文件
      content.createEl("h3", { text: "方法3：创建批处理文件" });
      content.createEl("p", { text: "创建 .bat 文件并运行：" });
      const batBlock = content.createEl("pre");
      batBlock.style.cssText = "background:#f5f5f5;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:12px;";
      batBlock.textContent = batchContent;
      
      const copyBat = content.createEl("button", { text: "复制批处理内容" });
      copyBat.onclick = () => {
          navigator.clipboard.writeText(batchContent);
          new Notice("批处理内容已复制！请保存为 .bat 文件");
      };

      modal.open();
      
  } catch (err) {
      console.error("生成命令错误：", err);
      new Notice(`生成命令错误: ${err.message}`);
  }
}

// 快速启动函数
function createCommandGenerator(count) {
  return function(wechatPath) {
      return generateWeChatCommands(count, wechatPath);
  };
}

// Obsidian插件标准导出
exports.default = {
  entry: generateWeChatCommands,
  name: "wechatLauncher",
  description: `微信多实例启动器

使用方法：
\`wechatLauncher(3)\` - 生成启动3个微信实例的命令
\`wechatLauncher(5, "D:\\\\WeChat\\\\WeChat.exe")\` - 指定路径启动5个实例

快捷函数：
\`launch1WeChat()\` 到 \`launch9WeChat()\` - 生成对应数量的启动命令

由于浏览器安全限制，此脚本生成启动命令供您手动执行。
  `,
  launch1WeChat: createCommandGenerator(1),
  launch2WeChat: createCommandGenerator(2),
  launch3WeChat: createCommandGenerator(3),
  launch4WeChat: createCommandGenerator(4),
  launch5WeChat: createCommandGenerator(5),
  launch6WeChat: createCommandGenerator(6),
  launch7WeChat: createCommandGenerator(7),
  launch8WeChat: createCommandGenerator(8),
  launch9WeChat: createCommandGenerator(9)
};