// ==================== 游戏基础配置 ====================
const GAME_CONFIG = {
    // 符号配置 - 使用图片路径
    symbols: ['symbols/01.png', 'symbols/02.png', 'symbols/03.png', 'symbols/04.png', 'symbols/05.png', 
              'symbols/06.png', 'symbols/07.png', 'symbols/08.png', 'symbols/09.png', 'symbols/10.png',
              'symbols/11.png', 'symbols/12.png', 'symbols/13.png'],
    
    // 卷轴配置
    reelCount: 5,
    visibleSymbols: 3,
    symbolsPerReel: 20,
    
    // 金额配置
    initialBalance: 1000,
    initialJackpot: 5000,
    minBet: 1,
    maxBet: 100,
    betStep: 1,
    
    // 动画配置
    spinDuration: 3000,
    reelStopDelay: 300,
    spinSpeed: 50,
    
    // 游戏规则
    freeSpinsMultiplier: 3,
    freeSpinsCount: 10,
    jackpotProbability: 0.02,
    bigWinThreshold: 50,
    
    // 特殊符号 - 使用图片路径
    wildSymbol: 'symbols/11.png',
    scatterSymbol: 'symbols/12.png',
    bonusSymbol: 'symbols/13.png',
    
    // ==================== 音乐配置修改处 ====================
    musicPaths: {
        // 修改：根据你的目录结构，背景音乐路径加了 /background/
        background: 'music/background/bg.mp3', 
        
        // 其他音效保持在 music/ 根目录下 (根据你提供的树状图结构)
        spin: 'music/spin.mp3',
        win: 'music/win.mp3',
        bigWin: 'music/bigwin.mp3',
        jackpot: 'music/jackpot.mp3',
        freeSpins: 'music/freespins.mp3'
    }
};

// ==================== RTP配置 ====================
const RTP_CONFIG = {
    // 基础RTP设置
    targetRTP: 96.5,                    // 目标RTP百分比
    volatility: 'medium',               // 波动率: low/medium/high
    hitFrequency: 22,                   // 中奖频率(%)
    
    // RTP分配比例
    rtpDistribution: {
        baseGame: 85.0,                 // 基础游戏RTP
        freeSpins: 8.5,                 // 免费旋转RTP  
        jackpot: 2.0,                   // Jackpot RTP
        bonus: 1.0                      // 奖金游戏RTP
    },
    
    // 符号出现频率 (基于RTP计算)
    symbolFrequencies: {
        'symbols/10.png': 15.5,    // 最低价值符号 - 最高频率
        'symbols/07.png': 12.5,    // 低价值符号
        'symbols/09.png': 8.2,     // 中低价值符号
        'symbols/08.png': 4.1,     // 高价值符号
        'symbols/01.png': 2.1,     // 最高价值符号 - 最低频率
        'symbols/02.png': 2.0,     // 高价值符号
        'symbols/03.png': 2.0,     // 高价值符号
        'symbols/04.png': 8.0,     // 中价值符号
        'symbols/05.png': 8.0,     // 中价值符号
        'symbols/06.png': 8.0,     // 中价值符号
        'symbols/11.png': 1.8,     // Wild符号
        'symbols/12.png': 1.8,     // Scatter符号
        'symbols/13.png': 1.0      // Bonus符号
    },
    
    // 动态调整参数
    adjustment: {
        enabled: true,
        checkInterval: 100,             // 每100局检查一次
        maxAdjustment: 5.0,             // 最大调整幅度%
        minRTP: 94.0,                   // 最低RTP限制
        maxRTP: 98.0                    // 最高RTP限制
    },
    
    // 波动率配置
    volatilityProfiles: {
        low: {
            baseHitRate: 30,
            bigWinMultiplier: 50,
            drySpellMax: 10,
            symbolFrequencyMultiplier: 1.2
        },
        medium: {
            baseHitRate: 22, 
            bigWinMultiplier: 100,
            drySpellMax: 15,
            symbolFrequencyMultiplier: 1.0
        },
        high: {
            baseHitRate: 15,
            bigWinMultiplier: 200,
            drySpellMax: 25,
            symbolFrequencyMultiplier: 0.8
        }
    }
};

// ==================== 赔付表配置 (25线) ====================
const PAYTABLE_25 = {
    'symbols/01.png': { 3: 100, 4: 500, 5: 2000, name: '龙', type: 'high' },
    'symbols/02.png': { 3: 80, 4: 400, 5: 1500, name: '凤凰', type: 'high' },
    'symbols/03.png': { 3: 60, 4: 300, 5: 1000, name: '元宝', type: 'high' },
    'symbols/04.png': { 3: 40, 4: 200, 5: 800, name: '竹节', type: 'medium' },
    'symbols/05.png': { 3: 40, 4: 200, 5: 800, name: '福字', type: 'medium' },
    'symbols/06.png': { 3: 30, 4: 150, 5: 600, name: '锦鲤', type: 'medium' },
    'symbols/07.png': { 3: 20, 4: 100, 5: 400, name: '金币', type: 'low' },
    'symbols/08.png': { 3: 50, 4: 250, 5: 1200, name: '幸运7', type: 'high' },
    'symbols/09.png': { 3: 25, 4: 125, 5: 500, name: '铃铛', type: 'low' },
    'symbols/10.png': { 3: 15, 4: 75, 5: 300, name: '美元', type: 'low' },
    'symbols/11.png': { special: 'Wild - 替代任何符号', name: 'Wild', type: 'special' },
    'symbols/12.png': { special: 'Scatter - 3个触发免费旋转', name: 'Scatter', type: 'special' },
    'symbols/13.png': { special: 'Bonus - 触发奖金游戏', name: 'Bonus', type: 'special' }
};

// ==================== 赔付表配置 (40线) ====================
const PAYTABLE_40 = {
    'symbols/01.png': { 3: 60, 4: 300, 5: 1200, name: '龙', type: 'high' },
    'symbols/02.png': { 3: 50, 4: 250, 5: 1000, name: '凤凰', type: 'high' },
    'symbols/03.png': { 3: 40, 4: 200, 5: 600, name: '元宝', type: 'high' },
    'symbols/04.png': { 3: 25, 4: 120, 5: 500, name: '竹节', type: 'medium' },
    'symbols/05.png': { 3: 25, 4: 120, 5: 500, name: '福字', type: 'medium' },
    'symbols/06.png': { 3: 20, 4: 100, 5: 400, name: '锦鲤', type: 'medium' },
    'symbols/07.png': { 3: 15, 4: 75, 5: 250, name: '金币', type: 'low' },
    'symbols/08.png': { 3: 30, 4: 150, 5: 800, name: '幸运7', type: 'high' },
    'symbols/09.png': { 3: 15, 4: 80, 5: 300, name: '铃铛', type: 'low' },
    'symbols/10.png': { 3: 10, 4: 50, 5: 200, name: '美元', type: 'low' },
    'symbols/11.png': { special: 'Wild - 替代任何符号', name: 'Wild', type: 'special' },
    'symbols/12.png': { special: 'Scatter - 3个触发免费旋转', name: 'Scatter', type: 'special' },
    'symbols/13.png': { special: 'Bonus - 触发奖金游戏', name: 'Bonus', type: 'special' }
};

// ==================== 中奖线配置 (40条) ====================
const WIN_LINES = [
    // 水平线
    { id: 1, positions: [1, 1, 1, 1, 1], name: '线 1', color: '#FFD700' },
    { id: 2, positions: [0, 0, 0, 0, 0], name: '线 2', color: '#FF6B6B' },
    { id: 3, positions: [2, 2, 2, 2, 2], name: '线 3', color: '#4ECDC4' },
    // V型线
    { id: 4, positions: [0, 1, 2, 1, 0], name: '线 4', color: '#45B7D1' },
    { id: 5, positions: [2, 1, 0, 1, 2], name: '线 5', color: '#96CEB4' },
    // 其他形状
    { id: 6, positions: [1, 0, 0, 0, 1], name: '线 6', color: '#E74C3C' },
    { id: 7, positions: [1, 2, 2, 2, 1], name: '线 7', color: '#9B59B6' },
    { id: 8, positions: [0, 0, 1, 2, 2], name: '线 8', color: '#F39C12' },
    { id: 9, positions: [2, 2, 1, 0, 0], name: '线 9', color: '#1ABC9C' },
    { id: 10, positions: [1, 0, 1, 2, 1], name: '线 10', color: '#E67E22' },
    // 更多线 (11-40)
    { id: 11, positions: [0, 1, 0, 1, 0], name: '线 11', color: '#FFD700' },
    { id: 12, positions: [2, 1, 2, 1, 2], name: '线 12', color: '#FF6B6B' },
    { id: 13, positions: [0, 1, 1, 1, 0], name: '线 13', color: '#4ECDC4' },
    { id: 14, positions: [2, 1, 1, 1, 2], name: '线 14', color: '#45B7D1' },
    { id: 15, positions: [0, 0, 1, 0, 0], name: '线 15', color: '#96CEB4' },
    { id: 16, positions: [2, 2, 1, 2, 2], name: '线 16', color: '#E74C3C' },
    { id: 17, positions: [1, 0, 2, 0, 1], name: '线 17', color: '#9B59B6' },
    { id: 18, positions: [1, 2, 0, 2, 1], name: '线 18', color: '#F39C12' },
    { id: 19, positions: [0, 2, 0, 2, 0], name: '线 19', color: '#1ABC9C' },
    { id: 20, positions: [2, 0, 2, 0, 2], name: '线 20', color: '#E67E22' },
    { id: 21, positions: [0, 0, 2, 0, 0], name: '线 21', color: '#FFD700' },
    { id: 22, positions: [2, 2, 0, 2, 2], name: '线 22', color: '#FF6B6B' },
    { id: 23, positions: [1, 1, 0, 1, 1], name: '线 23', color: '#4ECDC4' },
    { id: 24, positions: [1, 1, 2, 1, 1], name: '线 24', color: '#45B7D1' },
    { id: 25, positions: [0, 2, 1, 2, 0], name: '线 25', color: '#96CEB4' },
    { id: 26, positions: [2, 0, 1, 0, 2], name: '线 26', color: '#E74C3C' },
    { id: 27, positions: [0, 1, 2, 2, 2], name: '线 27', color: '#9B59B6' },
    { id: 28, positions: [2, 1, 0, 0, 0], name: '线 28', color: '#F39C12' },
    { id: 29, positions: [0, 2, 1, 0, 0], name: '线 29', color: '#1ABC9C' },
    { id: 30, positions: [2, 0, 1, 2, 2], name: '线 30', color: '#E67E22' },
    { id: 31, positions: [1, 0, 1, 0, 1], name: '线 31', color: '#FFD700' },
    { id: 32, positions: [1, 2, 1, 0, 1], name: '线 32', color: '#FF6B6B' },
    { id: 33, positions: [0, 1, 0, 1, 2], name: '线 33', color: '#4ECDC4' },
    { id: 34, positions: [2, 1, 2, 1, 0], name: '线 34', color: '#45B7D1' },
    { id: 35, positions: [0, 2, 2, 1, 0], name: '线 35', color: '#96CEB4' },
    { id: 36, positions: [2, 0, 0, 1, 2], name: '线 36', color: '#E74C3C' },
    { id: 37, positions: [1, 0, 0, 1, 2], name: '线 37', color: '#9B59B6' },
    { id: 38, positions: [1, 2, 2, 1, 0], name: '线 38', color: '#F39C12' },
    { id: 39, positions: [0, 1, 1, 2, 2], name: '线 39', color: '#1ABC9C' },
    { id: 40, positions: [2, 1, 1, 0, 0], name: '线 40', color: '#E67E22' }
];

// ==================== 全局常量 ====================
const SPECIAL_SYMBOLS = new Set(['symbols/12.png', 'symbols/13.png', 'symbols/11.png']);
const HIGH_VALUE_SYMBOLS = new Set(['symbols/01.png', 'symbols/02.png', 'symbols/03.png', 'symbols/08.png']);
const MEDIUM_VALUE_SYMBOLS = new Set(['symbols/04.png', 'symbols/05.png', 'symbols/06.png']);
const LOW_VALUE_SYMBOLS = new Set(['symbols/07.png', 'symbols/09.png', 'symbols/10.png']);

// 赔付表集合
const PAYTABLES = {
    25: PAYTABLE_25,
    40: PAYTABLE_40
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GAME_CONFIG,
        RTP_CONFIG,
        PAYTABLE_25,
        PAYTABLE_40,
        WIN_LINES,
        SPECIAL_SYMBOLS,
        HIGH_VALUE_SYMBOLS,
        MEDIUM_VALUE_SYMBOLS,
        LOW_VALUE_SYMBOLS,
        PAYTABLES
    };
}