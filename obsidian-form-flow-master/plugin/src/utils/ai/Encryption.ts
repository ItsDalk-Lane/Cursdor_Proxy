// 浏览器环境下的加密服务
export class EncryptionService {
    /**
     * 改进的API密钥加密（使用更安全的方法）
     */
    static encryptApiKey(apiKey: string, masterPassword: string): string {
        try {

            
            // 首先将API key转换为UTF-8字节数组
            const encoder = new TextEncoder();
            const apiKeyBytes = encoder.encode(apiKey);
            
            // 生成加密密钥
            const key = this.generateKey(masterPassword);
            const keyBytes = encoder.encode(key);
            
            // 使用XOR加密字节数组
            const encrypted = new Uint8Array(apiKeyBytes.length);
            for (let i = 0; i < apiKeyBytes.length; i++) {
                encrypted[i] = apiKeyBytes[i] ^ keyBytes[i % keyBytes.length];
            }
            
            // 将加密后的字节数组转换为十六进制字符串，避免Base64编码问题
            const hexString = Array.from(encrypted, byte => byte.toString(16).padStart(2, '0')).join('');
            

            return hexString;
        } catch (error) {
            console.error('API密钥加密失败:', error);
            // 如果加密失败，使用简单的Base64编码作为后备
            try {
                return btoa(unescape(encodeURIComponent(apiKey)));
            } catch (fallbackError) {
                console.error('后备加密也失败:', fallbackError);
                return apiKey;
            }
        }
    }

    /**
     * 改进的API密钥解密（兼容新旧格式）
     */
    static decryptApiKey(encryptedApiKey: string, masterPassword: string): string {
        try {
            // 如果是空值或者明显不是加密数据，直接返回
            if (!encryptedApiKey || encryptedApiKey.length < 10) {
                return encryptedApiKey || '';
            }

            // 检查是否为十六进制字符串（新格式）
            const hexRegex = /^[0-9a-fA-F]+$/;
            if (hexRegex.test(encryptedApiKey) && encryptedApiKey.length % 2 === 0) {
                try {
                    // 新格式：十六进制字符串解密
                    const key = this.generateKey(masterPassword);
                    const encoder = new TextEncoder();
                    const decoder = new TextDecoder();
                    const keyBytes = encoder.encode(key);
                    
                    // 将十六进制字符串转换为字节数组
                    const encryptedBytes = new Uint8Array(encryptedApiKey.length / 2);
                    for (let i = 0; i < encryptedBytes.length; i++) {
                        encryptedBytes[i] = parseInt(encryptedApiKey.substr(i * 2, 2), 16);
                    }
                    
                    // 解密字节数组
                    const decryptedBytes = new Uint8Array(encryptedBytes.length);
                    for (let i = 0; i < encryptedBytes.length; i++) {
                        decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
                    }
                    
                    // 将解密后的字节数组转换为字符串
                    const decrypted = decoder.decode(decryptedBytes);
                    
                    // 验证解密结果是否合理
                    if (this.isValidApiKey(decrypted)) {

                        return decrypted;
                    }
                } catch (hexError) {

                }
            }

            // 检查是否为有效的Base64字符串（旧格式）
            const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
            if (base64Regex.test(encryptedApiKey)) {
                // 尝试Base64解密方法
                try {
                    const key = this.generateKey(masterPassword);
                    const binaryString = atob(encryptedApiKey);
                    
                    // 将二进制字符串转换为字节数组
                    const encryptedBytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        encryptedBytes[i] = binaryString.charCodeAt(i);
                    }
                    
                    // 生成密钥字节数组
                    const encoder = new TextEncoder();
                    const decoder = new TextDecoder();
                    const keyBytes = encoder.encode(key);
                    
                    // 解密字节数组
                    const decryptedBytes = new Uint8Array(encryptedBytes.length);
                    for (let i = 0; i < encryptedBytes.length; i++) {
                        decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
                    }
                    
                    // 将解密后的字节数组转换为字符串
                    const decrypted = decoder.decode(decryptedBytes);
                    
                    // 验证解密结果是否合理
                    if (this.isValidApiKey(decrypted)) {

                        return decrypted;
                    }
                } catch (base64Error) {

                }
                
                // 尝试简单的Base64解码
                try {
                    const decoded = decodeURIComponent(escape(atob(encryptedApiKey)));
                    if (this.isValidApiKey(decoded)) {

                        return decoded;
                    }
                } catch (simpleBase64Error) {

                }
            }
            
            // 如果不是加密格式，可能是明文，直接返回
            if (this.isValidApiKey(encryptedApiKey)) {

                return encryptedApiKey;
            }
            

            return '';
        } catch (error) {
            console.error('API密钥解密失败:', error);
            return '';
        }
    }

    /**
     * 验证API key是否有效
     */
    private static isValidApiKey(apiKey: string): boolean {
        if (!apiKey || apiKey.length < 10) {
            return false;
        }
        
        // 检查是否包含过多的控制字符或不可打印字符
        const controlCharCount = (apiKey.match(/[\x00-\x1F\x7F-\x9F]/g) || []).length;
        const controlCharRatio = controlCharCount / apiKey.length;
        
        // 如果控制字符比例超过20%，可能是解密失败
        if (controlCharRatio > 0.2) {
            return false;
        }
        
        // 检查是否包含合理的字符（字母、数字、常见符号）
        const validCharPattern = /^[A-Za-z0-9\-_=+/\.]+$/;
        return validCharPattern.test(apiKey);
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
