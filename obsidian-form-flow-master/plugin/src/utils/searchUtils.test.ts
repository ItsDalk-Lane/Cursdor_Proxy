/**
 * 搜索工具函数的测试文件
 * 用于验证模糊搜索、首字母匹配和排序功能
 */
import { advancedSearch, MatchType } from './searchUtils';

// 测试数据
const testFiles = [
    { path: 'folder/document.md' },
    { path: 'notes/daily/2024-01-01.md' },
    { path: 'projects/web-development/readme.md' },
    { path: 'archive/old-notes.md' },
    { path: 'templates/form-template.md' },
    { path: 'docs/api-documentation.md' },
    { path: 'personal/diary.md' },
    { path: 'work/meeting-notes.md' },
    { path: 'research/machine-learning.md' },
    { path: 'tutorials/javascript-basics.md' }
];

/**
 * 测试精确匹配
 */
function testExactMatch() {
    console.log('=== 测试精确匹配 ===');
    const results = advancedSearch(testFiles, 'document', (f) => f.path, 10);
    console.log('搜索 "document":', results.map(r => ({ path: r.item.path, type: r.matchType, score: r.score })));
}

/**
 * 测试模糊匹配
 */
function testFuzzyMatch() {
    console.log('\n=== 测试模糊匹配 ===');
    const results = advancedSearch(testFiles, 'doc', (f) => f.path, 10);
    console.log('搜索 "doc":', results.map(r => ({ path: r.item.path, type: r.matchType, score: r.score })));
}

/**
 * 测试首字母匹配
 */
function testAcronymMatch() {
    console.log('\n=== 测试首字母匹配 ===');
    const results = advancedSearch(testFiles, 'wd', (f) => f.path, 10);
    console.log('搜索 "wd" (web-development):', results.map(r => ({ path: r.item.path, type: r.matchType, score: r.score })));
    
    const results2 = advancedSearch(testFiles, 'ml', (f) => f.path, 10);
    console.log('搜索 "ml" (machine-learning):', results2.map(r => ({ path: r.item.path, type: r.matchType, score: r.score })));
}

/**
 * 测试复杂搜索
 */
function testComplexSearch() {
    console.log('\n=== 测试复杂搜索 ===');
    const results = advancedSearch(testFiles, 'note', (f) => f.path, 10);
    console.log('搜索 "note":', results.map(r => ({ path: r.item.path, type: r.matchType, score: r.score })));
}

/**
 * 运行所有测试
 */
function runTests() {
    console.log('开始测试搜索功能...');
    testExactMatch();
    testFuzzyMatch();
    testAcronymMatch();
    testComplexSearch();
    console.log('\n测试完成！');
}

// 如果在 Node.js 环境中运行
if (typeof window === 'undefined') {
    runTests();
}

export { runTests };