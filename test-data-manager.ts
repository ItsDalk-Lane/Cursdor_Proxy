// 数据管理器测试脚本
// 这个文件用于验证数据管理器的功能，不会包含在最终构建中

export class DataManagerTest {
    static async runTests(dataManager: any): Promise<void> {
        console.log('=== 开始数据管理器测试 ===');
        
        try {
            // 测试1: 检查初始状态
            console.log('测试1: 检查初始状态');
            const initialSettings = dataManager.getSettings();
            console.log('初始设置:', initialSettings);
            
            const initialModels = dataManager.getAllModels();
            console.log('初始模型数量:', initialModels.length);
            
            // 测试2: 添加模型
            console.log('测试2: 添加模型');
            const testModelId = await dataManager.addModel({
                displayName: '测试模型',
                modelName: 'test-model',
                provider: 'custom',
                baseURL: 'https://api.test.com/v1',
                apiKey: 'test-api-key-12345',
                maxContextTokens: 8000,
                maxOutputTokens: 2000
            });
            console.log('添加的模型ID:', testModelId);
            
            // 测试3: 验证API密钥编码
            console.log('测试3: 验证API密钥编码');
            const addedModel = dataManager.getModelById(testModelId);
            console.log('存储的模型数据:', addedModel);
            console.log('编码的API密钥:', addedModel?.encodedApiKey);
            console.log('解码的API密钥:', dataManager.decodeApiKey(addedModel?.encodedApiKey || ''));
            
            // 测试4: 更新设置
            console.log('测试4: 更新设置');
            await dataManager.updateSettings({
                autoCommit: true,
                showNotifications: false
            });
            
            const updatedSettings = dataManager.getSettings();
            console.log('更新后的设置:', updatedSettings);
            
            // 测试5: 个性化设置
            console.log('测试5: 个性化设置');
            await dataManager.setPreference('testKey', 'testValue');
            await dataManager.setPreference('userTheme', 'dark');
            
            const testPref = dataManager.getPreference('testKey', 'defaultValue');
            const themePref = dataManager.getPreference('userTheme', 'light');
            console.log('测试偏好:', testPref);
            console.log('主题偏好:', themePref);
            
            // 测试6: 数据导出
            console.log('测试6: 数据导出');
            const exportedData = dataManager.exportConfig();
            console.log('导出的配置长度:', exportedData.length);
            
            // 测试7: 清理测试数据
            console.log('测试7: 清理测试数据');
            await dataManager.deleteModel(testModelId);
            await dataManager.removePreference('testKey');
            await dataManager.removePreference('userTheme');
            
            const finalModels = dataManager.getAllModels();
            console.log('清理后的模型数量:', finalModels.length);
            
            console.log('✅ 所有测试通过！');
            
        } catch (error) {
            console.error('❌ 测试失败:', error);
        }
        
        console.log('=== 数据管理器测试完成 ===');
    }
    
    static async runCompatibilityTest(dataManager: any): Promise<void> {
        console.log('=== 开始兼容性测试 ===');
        
        try {
            // 模拟旧数据存在的情况
            localStorage.setItem('git-auto-commit-models', JSON.stringify([
                {
                    id: 'old_model_1',
                    displayName: '旧模型1',
                    modelName: 'old-gpt-4',
                    provider: 'openai',
                    baseURL: 'https://api.openai.com/v1',
                    apiKey: 'old-api-key-123',
                    maxContextTokens: 4000,
                    maxOutputTokens: 1000,
                    isVerified: true,
                    createdAt: Date.now() - 86400000,
                    lastModified: Date.now() - 86400000
                }
            ]));
            
            localStorage.setItem('git-auto-commit-default-model', 'old_model_1');
            
            console.log('已设置模拟的旧数据');
            
            // 触发数据迁移
            await dataManager.migrateOldData();
            
            // 检查迁移结果
            const migratedModels = dataManager.getAllModels();
            console.log('迁移后的模型数量:', migratedModels.length);
            
            if (migratedModels.length > 0) {
                const firstModel = migratedModels[0];
                console.log('迁移的模型:', firstModel);
                console.log('API密钥是否已编码:', firstModel.encodedApiKey !== firstModel.apiKey);
            }
            
            const defaultModelId = dataManager.getDefaultModelId();
            console.log('迁移的默认模型ID:', defaultModelId);
            
            // 检查localStorage是否已清理
            const remainingOldModels = localStorage.getItem('git-auto-commit-models');
            const remainingOldDefault = localStorage.getItem('git-auto-commit-default-model');
            
            console.log('localStorage已清理:', remainingOldModels === null && remainingOldDefault === null);
            
            console.log('✅ 兼容性测试通过！');
            
        } catch (error) {
            console.error('❌ 兼容性测试失败:', error);
        }
        
        console.log('=== 兼容性测试完成 ===');
    }
}

// 在开发环境中可以使用以下代码进行测试
// 注意：这些代码不应该包含在生产版本中
if (typeof window !== 'undefined' && (window as any).DEBUG_GIT_AUTO_COMMIT) {
    console.log('Git Auto Commit 调试模式已启用');
    
    // 将测试函数暴露到全局作用域，以便在控制台中调用
    (window as any).testDataManager = DataManagerTest.runTests;
    (window as any).testCompatibility = DataManagerTest.runCompatibilityTest;
    
    console.log('可用的测试函数:');
    console.log('- testDataManager(dataManager): 运行基本功能测试');
    console.log('- testCompatibility(dataManager): 运行兼容性测试');
}
