// ==================== RTP 快速调整器 ====================
// 将此文件放在 js/ 目录下，在 config.js 之后引入

class RTPAdjuster {
    constructor() {
        this.presets = {
            // 低RTP预设（庄家优势）
            low: {
                targetRTP: 92.0,
                baseGame: 80.0,
                freeSpins: 7.0,
                jackpot: 3.0,
                bonus: 2.0,
                hitFrequency: 18
            },
            // 标准RTP预设
            standard: {
                targetRTP: 96.5,
                baseGame: 85.0,
                freeSpins: 8.5,
                jackpot: 2.0,
                bonus: 1.0,
                hitFrequency: 22
            },
            // 高RTP预设（玩家优势）
            high: {
                targetRTP: 98.0,
                baseGame: 87.0,
                freeSpins: 8.0,
                jackpot: 2.0,
                bonus: 1.0,
                hitFrequency: 25
            },
            // 超高RTP测试模式
            test: {
                targetRTP: 99.5,
                baseGame: 88.0,
                freeSpins: 8.5,
                jackpot: 2.0,
                bonus: 1.0,
                hitFrequency: 30
            }
        };
    }

    // 应用预设
    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) {
            console.error(`预设 ${presetName} 不存在`);
            return false;
        }

        // 更新RTP配置
        RTP_CONFIG.targetRTP = preset.targetRTP;
        RTP_CONFIG.hitFrequency = preset.hitFrequency;
        RTP_CONFIG.rtpDistribution.baseGame = preset.baseGame;
        RTP_CONFIG.rtpDistribution.freeSpins = preset.freeSpins;
        RTP_CONFIG.rtpDistribution.jackpot = preset.jackpot;
        RTP_CONFIG.rtpDistribution.bonus = preset.bonus;

        // 调整符号频率以匹配RTP
        this.adjustSymbolFrequencies(preset.targetRTP);

        console.log(`✅ 已应用 ${presetName} 预设: ${preset.targetRTP}% RTP`);
        return true;
    }

    // 自定义RTP设置
    setCustomRTP(targetRTP, volatility = 'medium') {
        targetRTP = Math.max(85, Math.min(99.9, targetRTP));
        
        RTP_CONFIG.targetRTP = targetRTP;
        RTP_CONFIG.volatility = volatility;
        RTP_CONFIG.volatilityProfile = RTP_CONFIG.volatilityProfiles[volatility];

        // 自动计算分配（可自定义）
        const base = targetRTP - 10;
        RTP_CONFIG.rtpDistribution = {
            baseGame: Math.max(75, base),
            freeSpins: 8,
            jackpot: 2,
            bonus: 1
        };

        this.adjustSymbolFrequencies(targetRTP);
        console.log(`✅ 自定义RTP设置: ${targetRTP}%, 波动率: ${volatility}`);
    }

    // 调整符号频率
    adjustSymbolFrequencies(targetRTP) {
        const baseFrequencies = {
            'symbols/10.png': 15.5,
            'symbols/07.png': 12.5,
            'symbols/09.png': 8.2,
            'symbols/08.png': 4.1,
            'symbols/01.png': 2.1,
            'symbols/02.png': 2.0,
            'symbols/03.png': 2.0,
            'symbols/04.png': 8.0,
            'symbols/05.png': 8.0,
            'symbols/06.png': 8.0,
            'symbols/11.png': 1.8,
            'symbols/12.png': 1.8,
            'symbols/13.png': 1.0
        };

        // 根据目标RTP调整高价值符号频率
        const rtpFactor = (targetRTP - 90) / 10; // 90-100% 之间的系数

        Object.keys(baseFrequencies).forEach(symbol => {
            let frequency = baseFrequencies[symbol];
            
            if (HIGH_VALUE_SYMBOLS.has(symbol)) {
                // 高价值符号：RTP越高，出现越频繁
                frequency *= (0.8 + rtpFactor * 0.4);
            } else if (LOW_VALUE_SYMBOLS.has(symbol)) {
                // 低价值符号：RTP越高，出现越少
                frequency *= (1.2 - rtpFactor * 0.4);
            }
            
            RTP_CONFIG.symbolFrequencies[symbol] = Math.max(0.5, frequency);
        });

        console.log('符号频率已根据RTP调整');
    }

    // 设置波动率
    setVolatility(volatility) {
        const validVolatilities = ['low', 'medium', 'high'];
        if (!validVolatilities.includes(volatility)) {
            console.error('波动率必须是: low, medium, high');
            return false;
        }

        RTP_CONFIG.volatility = volatility;
        RTP_CONFIG.volatilityProfile = RTP_CONFIG.volatilityProfiles[volatility];
        
        console.log(`✅ 波动率设置为: ${volatility}`);
        return true;
    }

    // 获取当前RTP状态
    getCurrentRTP() {
        return {
            targetRTP: RTP_CONFIG.targetRTP,
            currentDistribution: RTP_CONFIG.rtpDistribution,
            volatility: RTP_CONFIG.volatility,
            hitFrequency: RTP_CONFIG.hitFrequency
        };
    }

    // 显示所有预设
    showPresets() {
        console.log('可用RTP预设:');
        Object.entries(this.presets).forEach(([name, preset]) => {
            console.log(`- ${name}: ${preset.targetRTP}% RTP, 命中率: ${preset.hitFrequency}%`);
        });
    }

    // 重置为默认
    resetToDefault() {
        this.applyPreset('standard');
    }
}

// 创建全局实例
const rtpAdjuster = new RTPAdjuster();

// 添加到全局作用域便于调试
window.rtpAdjuster = rtpAdjuster;

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RTPAdjuster;
}
