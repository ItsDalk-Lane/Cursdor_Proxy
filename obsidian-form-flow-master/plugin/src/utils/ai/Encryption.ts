// 浏览器环境下的加密服务
export class EncryptionService {
    /**
     * 简单的XOR加密（适用于浏览器环境）
     */
    static encryptApiKey(apiKey: string, masterPassword: string): string {
        try {
            console.log('开始加密API密钥, 密钥长度:', apiKey.length);
            
            // 使用简单的XOR加密，适用于浏览器环境
            const key = this.generateKey(masterPassword);
            let encrypted = '';
            
            for (let i = 0; i < apiKey.length; i++) {
                const charCode = apiKey.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                encrypted += String.fromCharCode(charCode);
            }
            
            const result = btoa(encrypted); // Base64编码
            console.log('API密钥加密成功');
            return result;
        } catch (error) {
            console.error('API密钥加密失败:', error);
            // 如果加密失败，返回原始值（开发时）
            return apiKey;
        }
    }

    /**
     * 解密API密钥
     */
    static decryptApiKey(encryptedApiKey: string, masterPassword: string): string {
        try {
            console.log('开始解密API密钥');
            
            // 如果是空值或者明显不是加密数据，直接返回
            if (!encryptedApiKey || encryptedApiKey.length < 10) {
                console.log('API密钥为空或太短，直接返回');
                return encryptedApiKey || '';
            }

            // 检查是否为有效的Base64字符串
            const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
            if (!base64Regex.test(encryptedApiKey)) {
                console.log('不是有效的Base64字符串，直接返回原始值');
                return encryptedApiKey;
            }
            
            // 尝试解密
            const key = this.generateKey(masterPassword);
            const encrypted = atob(encryptedApiKey); // Base64解码
            let decrypted = '';
            
            for (let i = 0; i < encrypted.length; i++) {
                const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                decrypted += String.fromCharCode(charCode);
            }
            
            console.log('API密钥解密成功');
            return decrypted;
        } catch (error) {
            console.error('API密钥解密失败:', error);
            // 如果解密失败，返回原始值
            console.log('解密失败，返回原始值');
            return encryptedApiKey || '';
        }
    }

    /**
     * 生成加密密钥
     */
    private static generateKey(masterPassword: string): string {
        // 使用设备信息和主密码生成密钥
        const deviceInfo = [
            navigator.userAgent,
            navigator.language,
            masterPassword
        ].join('|');
        
        // 简单的哈希函数
        let hash = 0;
        for (let i = 0; i < deviceInfo.length; i++) {
            const char = deviceInfo.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        
        return Math.abs(hash).toString(36);
    }

    /**
     * 生成设备唯一标识作为主密码
     */
    static generateMasterPassword(): string {
        // 使用多种设备信息生成稳定的主密码
        const deviceInfo = [
            navigator.userAgent,
            navigator.language,
            navigator.platform,
            screen.width.toString(),
            screen.height.toString(),
            new Date().getTimezoneOffset().toString()
        ].join('|');
        
        // 简单的哈希函数
        let hash = 0;
        for (let i = 0; i < deviceInfo.length; i++) {
            const char = deviceInfo.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return Math.abs(hash).toString(36);
    }
}
