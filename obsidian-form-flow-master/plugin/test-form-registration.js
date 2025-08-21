// 测试表单注册状态的脚本
console.log('[测试] 开始检查表单注册状态');

// 等待插件完全加载
setTimeout(async () => {
	try {
		// 1. 获取插件实例
		const plugin = app.plugins.plugins['form-flow'];
		if (!plugin) {
			console.error('[测试] FormFlow 插件未找到');
			return;
		}
        
		console.log('[测试] 插件实例获取成功');
		console.log('[测试] 插件设置:', plugin.settings);
        
		// 2. 检查表单集成设置
		const formIntegrations = plugin.settings?.formIntegrations || {};
		console.log('[测试] 表单集成设置:', formIntegrations);
        
		// 3. 检查测试表单是否注册为命令
		const testFormPath = 'test-form-config-fixed.json';
		const isRegistered = formIntegrations[testFormPath]?.asCommand || false;
		console.log(`[测试] 测试表单 "${testFormPath}" 是否注册为命令:`, isRegistered);
        
		// 4. 检查ContextMenuService实例
		const contextMenuService = plugin.contextMenuService;
		if (!contextMenuService) {
			console.error('[测试] ContextMenuService 实例不存在');
			return;
		}
        
		console.log('[测试] ContextMenuService 实例存在');
        
		// 5. 检查已注册的右键菜单字段
		const registeredFields = contextMenuService.getRegisteredFields();
		console.log(`[测试] 已注册的右键菜单字段数量: ${registeredFields.length}`);
        
		if (registeredFields.length > 0) {
			console.log('[测试] 已注册的字段详情:');
			registeredFields.forEach((field, _index) => {
				console.log(`[测试] 字段 ${_index + 1}:`, {
                    formId: field.formId,
                    formName: field.formName,
                    fieldId: field.fieldId,
                    fieldLabel: field.fieldLabel,
                    fieldType: field.fieldType
				});
			});
		} else {
			console.log('[测试] ❌ 没有找到已注册的右键菜单字段');
		}
        
		// 6. 如果测试表单没有注册为命令，尝试手动注册
		if (!isRegistered) {
			console.log('[测试] 测试表单未注册为命令，尝试手动注册...');
            
			// 获取FormIntegrationService
			const formIntegrationService = plugin.constructor.formIntegrationService || window.formIntegrationService;
			if (formIntegrationService) {
				try {
					await formIntegrationService.register(testFormPath);
					console.log('[测试] ✅ 测试表单注册成功');
                    
					// 重新检查注册状态
					setTimeout(() => {
						const updatedRegisteredFields = contextMenuService.getRegisteredFields();
						console.log(`[测试] 注册后的右键菜单字段数量: ${updatedRegisteredFields.length}`);
                        
						if (updatedRegisteredFields.length > 0) {
							console.log('[测试] ✅ 右键菜单字段注册成功');
							updatedRegisteredFields.forEach((field, index) => {
								console.log(`[测试] 字段 ${index + 1}:`, {
                                    formId: field.formId,
                                    formName: field.formName,
                                    fieldId: field.fieldId,
                                    fieldLabel: field.fieldLabel,
                                    fieldType: field.fieldType
								});
							});
						} else {
							console.log('[测试] ❌ 右键菜单字段仍未注册');
						}
					}, 1000);
                    
				} catch (error) {
					console.error('[测试] 注册测试表单时发生错误:', error);
				}
			} else {
				console.error('[测试] FormIntegrationService 未找到');
			}
		}
        
		// 7. 检查测试表单文件是否存在
		const testFormFile = app.vault.getAbstractFileByPath(testFormPath);
		if (testFormFile) {
			console.log('[测试] ✅ 测试表单文件存在');
            
			// 读取表单配置
			app.vault.read(testFormFile).then(content => {
				try {
					const formConfig = JSON.parse(content);
					console.log('[测试] 测试表单配置:', formConfig);
                    
					// 检查字段配置
					if (formConfig.fields) {
						console.log(`[测试] 表单共有 ${formConfig.fields.length} 个字段:`);
						formConfig.fields.forEach((field, index) => {
							console.log(`[测试] 字段 ${index + 1}:`, {
                                id: field.id,
                                label: field.label,
                                type: field.type,
                                rightClickSubmit: field.rightClickSubmit
							});
						});
                        
						// 检查支持右键提交的字段
						const rightClickFields = formConfig.fields.filter(field => 
							field.rightClickSubmit === true && 
                            (field.type === 'text' || field.type === 'textarea')
						);
                        
						console.log(`[测试] 支持右键提交的字段数量: ${rightClickFields.length}`);
						if (rightClickFields.length > 0) {
							console.log('[测试] 支持右键提交的字段:');
							rightClickFields.forEach((field, _index) => {
								console.log(`[测试] - ${field.label} (${field.type})`);
							});
						}
					} else {
						console.log('[测试] ❌ 表单没有字段配置');
					}
				} catch (error) {
					console.error('[测试] 解析表单配置时发生错误:', error);
				}
			}).catch(error => {
				console.error('[测试] 读取表单文件时发生错误:', error);
			});
		} else {
			console.error(`[测试] ❌ 测试表单文件 "${testFormPath}" 不存在`);
		}
        
	} catch (error) {
		console.error('[测试] 测试过程中发生错误:', error);
	}
}, 3000); // 等待3秒让插件完全加载

console.log('[测试] 测试脚本已加载，将在3秒后开始测试');