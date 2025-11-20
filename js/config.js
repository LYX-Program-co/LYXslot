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
    // 基础RTP设置 - 修改为90%
    targetRTP: 90.0,                    // 目标RTP百分比
    volatility: 'medium',               // 波动率: low/medium/high
    hitFrequency: 18,                   // 中奖频率(%) - 降低
    
    // RTP分配比例 - 修改分配
    rtpDistribution: {
        baseGame: 79.0,                 // 基础游戏RTP
        freeSpins: 8.0,                 // 免费旋转RTP  
        jackpot: 2.0,                   // Jackpot RTP
        bonus: 1.0                      // 奖金游戏RTP
    },
    
    // 符号出现频率调整 (基于90% RTP)
    symbolFrequencies: {
        'symbols/10.png': 16.5,    // 增加低价值符号频率
        'symbols/07.png': 13.5,    
        'symbols/09.png': 9.2,     
        'symbols/08.png': 3.1,     // 减少高价值符号频率
        'symbols/01.png': 1.6,     
        'symbols/02.png': 1.5,     
        'symbols/03.png': 1.5,     
        'symbols/04.png': 7.0,     
        'symbols/05.png': 7.0,     
        'symbols/06.png': 7.0,     
        'symbols/11.png': 1.5,     
        'symbols/12.png': 1.5,     
        'symbols/13.png': 0.8      
    },
    
    // 动态调整参数
    adjustment: {
        enabled: true,
        checkInterval: 100,             // 每100局检查一次
        maxAdjustment: 5.0,             // 最大调整幅度%
        minRTP: 88.0,                   // 调整最低RTP
        maxRTP: 92.0                    // 调整最高RTP
    },
    
    // 波动率配置
    volatilityProfiles: {
        low: {
            baseHitRate: 25,
            bigWinMultiplier: 50,
            drySpellMax: 10,
            symbolFrequencyMultiplier: 1.3
        },
        medium: {
            baseHitRate: 18,            // 降低命中率
            bigWinMultiplier: 80,
            drySpellMax: 15,
            symbolFrequencyMultiplier: 1.0
        },
        high: {
            baseHitRate: 12,
            bigWinMultiplier: 150,
            drySpellMax: 25,
            symbolFrequencyMultiplier: 0.7
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

// ==================== 虚拟玩家系统配置 ====================
const VIRTUAL_PLAYER_CONFIG = {
    enabled: true,
    announcementInterval: { min: 30000, max: 180000 }, // 30秒-3分钟
    jackpotTrigger: 100000, // Jackpot在10万后才开始掉落
    virtualPlayerRTP: 90, // 虚拟玩家RTP 90%
    
    // 马来西亚风格名字组件
    nameComponents: {
        // 马来人名字
        malayFirst: [
            "Ahmad", "Mohd", "Muhammad", "Abdul", "Ali", "Hassan", "Ismail", "Osman", 
            "Rahman", "Ibrahim", "Salleh", "Halim", "Zainal", "Kamal", "Rosli", "Yusof",
            "Zulkifli", "Shamsudin", "Firdaus", "Hakim", "Razak", "Najib", "Mahathir",
            "Anwar", "Wan", "Nik", "Megat", "Tengku", "Raja", "Syed"
        ],
        malayLast: [
            "bin Abdullah", "bin Ismail", "bin Hassan", "bin Ahmad", "bin Mohamed", 
            "bin Ali", "bin Omar", "bin Ibrahim", "bin Yusof", "bin Rahman",
            "binti Abdullah", "binti Ahmad", "binti Hassan", "binti Ismail", "binti Omar"
        ],
        
        // 华人名字（马来西亚风格）
        chineseFirst: [
            "Lim", "Tan", "Lee", "Chan", "Wong", "Ng", "Teh", "Ooi", "Yap", "Chong",
            "Goh", "Khoo", "Lau", "Cheah", "Foo", "Khaw", "Loh", "Pang", "Quek", "Sim",
            "Tee", "Yong", "Zain", "Rizal", "Hakim", "Farid", "Amir", "Zul", "Shah"
        ],
        chineseLast: [
            "Seng", "Heng", "Kong", "Leong", "Peng", "Soon", "Wai", "Chuan", "Kiat",
            "Hock", "Keong", "Chin", "Meng", "Wei", "Jing", "Ling", "Ying", "Mei",
            "Hui", "Lian", "Fong", "Sim", "Ling", "Yen", "Li", "Min", "Xin", "Jun"
        ],
        
        // 印度人名字
        indianFirst: [
            "Raj", "Kumar", "Mohan", "Suresh", "Ramesh", "Anand", "Vijay", "Prakash",
            "Santosh", "Dinesh", "Harish", "Murali", "Gopal", "Arjun", "Vikram",
            "Shankar", "Bala", "Krishnan", "Mani", "Selvam", "Nathan", "Kannan"
        ],
        indianLast: [
            "a/l", "a/p", "s/o", "d/o", "Ram", "Krishna", "Sharma", "Patel", "Singh",
            "Kaur", "Devi", "Lingam", "Pillai", "Nair", "Menon", "Nadar", "Reddy"
        ],
        
        // 昵称和称号
        nicknames: [
            "Pro", "Master", "King", "Queen", "Legend", "VIP", "Dragon", "Tiger",
            "Lucky", "Rich", "Gold", "Diamond", "Platinum", "Elite", "Supreme",
            "Millionaire", "Boss", "Captain", "Chief", "Lord", "Sir", "Madam"
        ],
        numbers: ["888", "999", "777", "666", "123", "321", "100", "200", "500", "1000"]
    },
    
    // 已使用的名字集合（确保不重复）
    usedNames: new Set(),
    
    // 中奖金额范围
    winAmounts: {
        small: { min: 50, max: 500 },
        medium: { min: 500, max: 2000 },
        large: { min: 2000, max: 10000 },
        jackpot: { min: 50000, max: 200000 }
    }
};

// ==================== 马来西亚名字生成器 ====================
VIRTUAL_PLAYER_CONFIG.generateMalaysianName = function() {
    const comp = this.nameComponents;
    let name, attempts = 0;
    
    do {
        const race = Math.random();
        if (race < 0.5) {
            // 马来人名字 (50%)
            const first = comp.malayFirst[Math.floor(Math.random() * comp.malayFirst.length)];
            const last = comp.malayLast[Math.floor(Math.random() * comp.malayLast.length)];
            name = `${first} ${last}`;
        } else if (race < 0.8) {
            // 华人名字 (30%)
            const first = comp.chineseFirst[Math.floor(Math.random() * comp.chineseFirst.length)];
            const last = comp.chineseLast[Math.floor(Math.random() * comp.chineseLast.length)];
            name = `${first} ${last}`;
        } else {
            // 印度人名字 (20%)
            const first = comp.indianFirst[Math.floor(Math.random() * comp.indianFirst.length)];
            const last = comp.indianLast[Math.floor(Math.random() * comp.indianLast.length)];
            name = `${first} ${last}`;
        }
        
        // 30%概率添加昵称
        if (Math.random() < 0.3) {
            const nickname = comp.nicknames[Math.floor(Math.random() * comp.nicknames.length)];
            const number = comp.numbers[Math.floor(Math.random() * comp.numbers.length)];
            name = `${nickname}${number}_${name}`;
        }
        
        attempts++;
        if (attempts > 50) {
            // 如果尝试50次还有重复，添加随机后缀
            name = `${name}_${Math.random().toString(36).substr(2, 3)}`;
            break;
        }
    } while (this.usedNames.has(name));
    
    this.usedNames.add(name);
    return name;
};

// ==================== 预生成玩家名字池 ====================
VIRTUAL_PLAYER_CONFIG.initializeNamePool = function(size = 200) {
    this.namePool = [];
    for (let i = 0; i < size; i++) {
        this.namePool.push(this.generateMalaysianName());
    }
    console.log(`已生成 ${size} 个马来西亚风格虚拟玩家名称`);
};

// ==================== 获取随机玩家名字 ====================
VIRTUAL_PLAYER_CONFIG.getRandomPlayerName = function() {
    if (!this.namePool || this.namePool.length === 0) {
        this.initializeNamePool();
    }
    
    if (this.namePool.length > 0) {
        const index = Math.floor(Math.random() * this.namePool.length);
        return this.namePool[index];
    }
    
    // 备用方案
    return this.generateMalaysianName();
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
        PAYTABLES,
        VIRTUAL_PLAYER_CONFIG
    };
}
