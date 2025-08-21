/**
 * 测试右键菜单功能的脚本
 * 用于验证 FormStateManager 和 ContextMenuService 的集成
 */

// 等待插件加载完成
setTimeout(async () => {
	console.log('[测试] 开始测试右键菜单功能');
    
	try {
		// 获取插件实例
		const plugin = app.plugins.plugins['form-flow'];
		if (!plugin) {
			console.error('[测试] 插件未找到或未启用');
			return;
		}
        
		console.log('[测试] 插件已找到，开始测试流程');
        
		// 1. 读取测试表单配置
		const testFormPath = 'test-form-config-fixed.json';
		const file = app.vault.getAbstractFileByPath(testFormPath);
        
		if (!file) {
			console.error(`[测试] 测试表单文件未找到: ${testFormPath}`);
			return;
		}
        
		console.log('[测试] 测试表单文件已找到');
        
		// 2. 读取表单配置
		const formConfig = await app.vault.readJson(file.path);
		console.log('[测试] 表单配置已读取:', formConfig);
        
		// 3. 使用 FormService 打开表单
		const FormService = plugin.constructor.FormService || window.FormService;
		if (!FormService) {
			console.error('[测试] FormService 未找到');
			return;
		}
        
		const formService = new FormService();
		console.log('[测试] 正在打开表单...');
        
		// 打开表单
		await formService.openForm(formConfig, app);
		console.log('[测试] 表单已打开');
        
		// 4. 等待表单状态设置完成
		setTimeout(() => {
			console.log('[测试] 开始检查表单状态');
            
			// 获取 FormStateManager 实例
			const FormStateManager = plugin.constructor.FormStateManager || window.FormStateManager;
			if (!FormStateManager) {
				console.error('[测试] FormStateManager 未找到');
				return;
			}
            
			const stateManager = FormStateManager.getInstance();
            
			// 检查是否有活动表单
			const hasActiveForm = stateManager.hasActiveForm();
			console.log('[测试] 是否有活动表单:', hasActiveForm);
            
			if (hasActiveForm) {
				// 获取当前表单信息
				const formInfo = stateManager.getCurrentFormInfo();
				console.log('[测试] 当前表单信息:', formInfo);
                
				// 获取支持右键提交的字段
				const rightClickFields = stateManager.getRightClickSubmitFields();
				console.log('[测试] 支持右键提交的字段:', rightClickFields);
                
				if (rightClickFields.length > 0) {
					console.log('[测试] ✅ 成功检测到支持右键提交的字段');
					rightClickFields.forEach(field => {
						console.log(`[测试] - 字段: ${field.label} (${field.type})`);
					});
				} else {
					console.log('[测试] ❌ 没有检测到支持右键提交的字段');
				}
                
				// 5. 测试 ContextMenuService
				const ContextMenuService = plugin.constructor.ContextMenuService || window.ContextMenuService;
				if (ContextMenuService) {
					const contextMenuService = new ContextMenuService(app, plugin.settings);
					const menuFields = contextMenuService.getRightClickSubmitFields();
					console.log('[测试] ContextMenuService 获取的字段:', menuFields);
				} else {
					console.log('[测试] ContextMenuService 未找到');
				}
			} else {
				console.log('[测试] ❌ 没有检测到活动表单');
			}
		}, 2000); // 等待2秒让表单完全加载
        
	} catch (error) {
		console.error('[测试] 测试过程中发生错误:', error);
	}
}, 3000); // 等待3秒让插件完全加载

console.log('[测试] 测试脚本已加载，将在3秒后开始测试');