/**
 * 搜索工具函数，提供模糊搜索、首字母匹配等功能
 */

/**
 * 搜索匹配类型
 */
export enum MatchType {
    EXACT = 'exact',           // 完全匹配
    PREFIX = 'prefix',         // 前缀匹配
    ACRONYM = 'acronym',       // 首字母匹配
    FUZZY = 'fuzzy',          // 模糊匹配
    CONTAINS = 'contains'      // 包含匹配
}

/**
 * 搜索结果项
 */
export interface SearchResult<T> {
    item: T;
    score: number;
    matchType: MatchType;
    matchedIndices: number[];
}

/**
 * 计算字符串相似度分数
 * @param str1 字符串1
 * @param str2 字符串2
 * @returns 相似度分数 (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
        return 1.0;
    }
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

/**
 * 计算编辑距离
 * @param str1 字符串1
 * @param str2 字符串2
 * @returns 编辑距离
 */
function levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

/**
 * 检查是否为首字母匹配
 * @param text 文本
 * @param query 查询字符串
 * @returns 匹配结果和匹配的索引
 */
function checkAcronymMatch(text: string, query: string): { isMatch: boolean; indices: number[] } {
    const words = text.toLowerCase().split(/[\s\-_\/\\.]/).filter(word => word.length > 0);
    const queryLower = query.toLowerCase();
    const indices: number[] = [];
    
    if (queryLower.length > words.length) {
        return { isMatch: false, indices: [] };
    }
    
    let textIndex = 0;
    for (let i = 0; i < queryLower.length; i++) {
        const queryChar = queryLower[i];
        let found = false;
        
        for (let j = i; j < words.length; j++) {
            if (words[j][0] === queryChar) {
                // 找到对应单词在原文本中的位置
                const wordStart = text.toLowerCase().indexOf(words[j], textIndex);
                if (wordStart !== -1) {
                    indices.push(wordStart);
                    textIndex = wordStart + words[j].length;
                    found = true;
                    break;
                }
            }
        }
        
        if (!found) {
            return { isMatch: false, indices: [] };
        }
    }
    
    return { isMatch: true, indices };
}

/**
 * 检查模糊匹配
 * @param text 文本
 * @param query 查询字符串
 * @returns 匹配结果和匹配的索引
 */
function checkFuzzyMatch(text: string, query: string): { isMatch: boolean; indices: number[]; score: number } {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    const indices: number[] = [];
    
    let textIndex = 0;
    let queryIndex = 0;
    
    while (textIndex < textLower.length && queryIndex < queryLower.length) {
        if (textLower[textIndex] === queryLower[queryIndex]) {
            indices.push(textIndex);
            queryIndex++;
        }
        textIndex++;
    }
    
    const isMatch = queryIndex === queryLower.length;
    const score = isMatch ? indices.length / text.length : 0;
    
    return { isMatch, indices, score };
}

/**
 * 高级搜索函数
 * @param items 要搜索的项目列表
 * @param query 查询字符串
 * @param getSearchText 获取搜索文本的函数
 * @param maxResults 最大结果数量
 * @returns 排序后的搜索结果
 */
export function advancedSearch<T>(
    items: T[],
    query: string,
    getSearchText: (item: T) => string,
    maxResults: number = 100
): SearchResult<T>[] {
    if (!query || query.trim() === '') {
        return items.slice(0, maxResults).map(item => ({
            item,
            score: 1,
            matchType: MatchType.EXACT,
            matchedIndices: []
        }));
    }
    
    const queryTrimmed = query.trim();
    const queryLower = queryTrimmed.toLowerCase();
    const results: SearchResult<T>[] = [];
    
    for (const item of items) {
        const text = getSearchText(item);
        // 安全检查：确保 text 不是 undefined 或 null
        if (!text || typeof text !== 'string') {
            continue;
        }
        const textLower = text.toLowerCase();
        
        let matchType: MatchType;
        let score: number;
        let matchedIndices: number[] = [];
        
        // 1. 完全匹配
        if (textLower === queryLower) {
            matchType = MatchType.EXACT;
            score = 1000;
        }
        // 2. 前缀匹配
        else if (textLower.startsWith(queryLower)) {
            matchType = MatchType.PREFIX;
            score = 900 + (queryLower.length / textLower.length) * 100;
        }
        // 3. 首字母匹配
        else {
            const acronymResult = checkAcronymMatch(text, queryTrimmed);
            if (acronymResult.isMatch) {
                matchType = MatchType.ACRONYM;
                score = 800 + (queryLower.length / text.length) * 100;
                matchedIndices = acronymResult.indices;
            }
            // 4. 模糊匹配
            else {
                const fuzzyResult = checkFuzzyMatch(text, queryTrimmed);
                if (fuzzyResult.isMatch) {
                    matchType = MatchType.FUZZY;
                    score = 700 + fuzzyResult.score * 100;
                    matchedIndices = fuzzyResult.indices;
                }
                // 5. 包含匹配
                else if (textLower.includes(queryLower)) {
                    matchType = MatchType.CONTAINS;
                    const similarity = calculateSimilarity(textLower, queryLower);
                    const position = textLower.indexOf(queryLower);
                    // 越靠前的匹配分数越高
                    const positionScore = (text.length - position) / text.length;
                    score = 600 + similarity * 50 + positionScore * 50;
                    
                    // 记录匹配的字符索引
                    for (let i = 0; i < queryLower.length; i++) {
                        matchedIndices.push(position + i);
                    }
                }
                // 不匹配
                else {
                    continue;
                }
            }
        }
        
        results.push({
            item,
            score,
            matchType,
            matchedIndices
        });
    }
    
    // 按分数降序排序
    results.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        // 分数相同时，按文本长度升序排序（更短的排在前面）
        const aText = getSearchText(a.item);
        const bText = getSearchText(b.item);
        return aText.length - bText.length;
    });
    
    return results.slice(0, maxResults);
}

/**
 * 高亮匹配的文本
 * @param text 原始文本
 * @param matchedIndices 匹配的字符索引
 * @returns 高亮后的 HTML 字符串
 */
export function highlightMatches(text: string, matchedIndices: number[]): string {
    if (matchedIndices.length === 0) {
        return text;
    }
    
    const chars = text.split('');
    const highlighted: string[] = [];
    
    for (let i = 0; i < chars.length; i++) {
        if (matchedIndices.includes(i)) {
            highlighted.push(`<mark>${chars[i]}</mark>`);
        } else {
            highlighted.push(chars[i]);
        }
    }
    
    return highlighted.join('');
}