// ==================== RTP 基础配置 (用于初始化 RTPManager) ====================
// 注意：如果您的 RTPManager 需要更详细的配置，请根据您的 RTPManager.js 文件补充
const RTP_CONFIG = {
    targetRTP: 95, // 默认目标回报率 95%
    volatility: 'medium',
    volatilityProfiles: {
        low: { symbolFrequencyMultiplier: 1.2, hitRateMultiplier: 1.5, maxPayoutMultiplier: 0.5 },
        medium: { symbolFrequencyMultiplier: 1.0, hitRateMultiplier: 1.0, maxPayoutMultiplier: 1.0 },
        high: { symbolFrequencyMultiplier: 0.8, hitRateMultiplier: 0.5, maxPayoutMultiplier: 2.0 }
    },
    adjustment: {
        minRTP: 85,
        maxRTP: 105,
        adjustmentRate: 0.01 
    },
    symbolFrequencies: { 
        'symbols/01.png': 15, 'symbols/02.png': 14, 'symbols/03.png': 13, 
        'symbols/04.png': 12, 'symbols/05.png': 10, 'symbols/06.png': 8,
        'symbols/07.png': 7, 'symbols/08.png': 6, 'symbols/09.png': 5, 
        'symbols/10.png': 4, 'symbols/11.png': 3, 'symbols/12.png': 2, 
        'symbols/13.png': 1
    }
};
