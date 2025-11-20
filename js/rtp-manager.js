// ==================== RTP 管理器 ====================
class RTPManager {
    constructor(config = RTP_CONFIG) {
        this.config = config;
        this.volatilityProfile = config.volatilityProfiles[config.volatility] || config.volatilityProfiles.medium;
        
        // 统计信息
        this.stats = {
            totalSpins: 0,
            totalWagered: 0,
            totalPaid: 0,
            currentRTP: 100,
            hitRate: 0,
            wins: 0,
            bigWins: 0,
            freeSpinsTriggered: 0,
            jackpotsWon: 0,
            lastAdjustment: 0
        };
        
        // 会话统计
        this.sessionStats = {
            startTime: Date.now(),
            spins: [],
            features: []
        };
        
        // 符号权重数组
        this.symbolWeights = [];
        this.initializeSymbolWeights();
        
        console.log(`RTP管理器已初始化 - 目标RTP: ${this.config.targetRTP}%, 波动率: ${this.config.volatility}`);
    }

    // 初始化符号权重
    initializeSymbolWeights() {
        this.symbolWeights = [];
        Object.entries(this.config.symbolFrequencies).forEach(([symbol, freq]) => {
            // 应用波动率乘数
            const adjustedFreq = freq * this.volatilityProfile.symbolFrequencyMultiplier;
            const count = Math.max(1, Math.round(adjustedFreq * 10));
            this.symbolWeights.push(...Array(count).fill(symbol));
        });
        
        console.log('符号权重已初始化:', this.getSymbolDistribution());
    }

    // 获取符号分布统计
    getSymbolDistribution() {
        const distribution = {};
        this.symbolWeights.forEach(symbol => {
            distribution[symbol] = (distribution[symbol] || 0) + 1;
        });
        
        // 转换为百分比
        Object.keys(distribution).forEach(symbol => {
            distribution[symbol] = (distribution[symbol] / this.symbolWeights.length * 100).toFixed(2) + '%';
        });
        
        return distribution;
    }

    // 获取基于RTP的加权随机符号
    getWeightedSymbol() {
        if (this.symbolWeights.length === 0) {
            this.initializeSymbolWeights();
        }
        
        const randIndex = Math.floor(Math.random() * this.symbolWeights.length);
        return this.symbolWeights[randIndex];
    }

    // 记录旋转
    recordSpin(betAmount, winAmount, feature = null) {
        this.stats.totalSpins++;
        this.stats.totalWagered += betAmount;
        this.stats.totalPaid += winAmount;
        
        if (winAmount > 0) {
            this.stats.wins++;
            
            // 记录大奖
            if (winAmount >= betAmount * this.volatilityProfile.bigWinMultiplier) {
                this.stats.bigWins++;
            }
        }
        
        // 记录特色游戏
        if (feature) {
            this.stats[`${feature}Triggered`]++;
        }
        
        // 更新RTP和命中率
        this.updateRTP();
        
        // 记录会话数据
        this.recordSessionData(betAmount, winAmount, feature);
        
        // 动态调整
        if (this.config.adjustment.enabled) {
            this.adjustIfNeeded();
        }
        
        return this.getCurrentStats();
    }

    // 更新RTP统计
    updateRTP() {
        if (this.stats.totalWagered > 0) {
            this.stats.currentRTP = (this.stats.totalPaid / this.stats.totalWagered) * 100;
            this.stats.hitRate = (this.stats.wins / this.stats.totalSpins) * 100;
        }
    }

    // 记录会话数据
    recordSessionData(betAmount, winAmount, feature) {
        const spinData = {
            timestamp: Date.now(),
            bet: betAmount,
            win: winAmount,
            rtp: this.stats.currentRTP,
            feature: feature
        };
        
        this.sessionStats.spins.push(spinData);
        
        if (feature) {
            this.sessionStats.features.push(spinData);
        }
        
        // 清理旧数据
        if (this.sessionStats.spins.length > 1000) {
            this.sessionStats.spins = this.sessionStats.spins.slice(-500);
        }
    }

    // 动态调整符号频率
    adjustIfNeeded() {
        if (this.stats.totalSpins - this.stats.lastAdjustment < this.config.adjustment.checkInterval) {
            return;
        }
        
        const rtpDiff = this.config.targetRTP - this.stats.currentRTP;
        const absDiff = Math.abs(rtpDiff);
        
        // 只有当RTP差异较大时才调整
        if (absDiff > 2) {
            this.adjustSymbolFrequencies(rtpDiff);
            this.stats.lastAdjustment = this.stats.totalSpins;
            
            console.log(`RTP调整: 当前 ${this.stats.currentRTP.toFixed(2)}%, 目标 ${this.config.targetRTP}%, 调整幅度: ${rtpDiff > 0 ? '+' : ''}${rtpDiff.toFixed(2)}%`);
        }
    }

    // 调整符号频率
    adjustSymbolFrequencies(rtpDiff) {
        const adjustmentFactor = Math.min(Math.abs(rtpDiff) / 10, this.config.adjustment.maxAdjustment / 100);
        const adjustment = (rtpDiff > 0) ? adjustmentFactor : -adjustmentFactor;
        
        // 调整高价值符号频率
        HIGH_VALUE_SYMBOLS.forEach(symbol => {
            if (this.config.symbolFrequencies[symbol]) {
                this.config.symbolFrequencies[symbol] += adjustment;
                this.config.symbolFrequencies[symbol] = Math.max(0.5, this.config.symbolFrequencies[symbol]);
            }
        });
        
        // 调整低价值符号频率（反向）
        LOW_VALUE_SYMBOLS.forEach(symbol => {
            if (this.config.symbolFrequencies[symbol]) {
                this.config.symbolFrequencies[symbol] -= adjustment * 0.5;
                this.config.symbolFrequencies[symbol] = Math.max(1.0, this.config.symbolFrequencies[symbol]);
            }
        });
        
        // 重新初始化权重
        this.initializeSymbolWeights();
    }

    // 检查是否应该中奖（基于命中率控制）
    shouldAwardWin() {
        const targetHitRate = this.volatilityProfile.baseHitRate;
        const currentHitRate = this.stats.hitRate;
        const hitRateDiff = targetHitRate - currentHitRate;
        
        let winProbability = targetHitRate / 100;
        
        // 根据命中率差异调整概率
        if (Math.abs(hitRateDiff) > 5) {
            const adjustment = hitRateDiff * 0.02; // 每5%差异调整2%概率
            winProbability = Math.max(0.1, Math.min(0.5, winProbability + adjustment));
        }
        
        // 检查连续未中奖局数
        const recentSpins = this.sessionStats.spins.slice(-this.volatilityProfile.drySpellMax);
        const recentWins = recentSpins.filter(spin => spin.win > 0).length;
        
        // 如果最近一直没中奖，增加中奖概率
        if (recentWins === 0) {
            winProbability = Math.min(0.8, winProbability * 1.5);
        }
        
        return Math.random() < winProbability;
    }

    // 计算免费旋转触发概率
    calculateFreeSpinsProbability(scatterCount) {
        const baseProbability = {
            3: 0.01,  // 1%概率
            4: 0.02,  // 2%概率
            5: 0.05   // 5%概率
        };
        
        let probability = baseProbability[scatterCount] || 0;
        
        // 根据RTP调整概率
        const rtpDiff = this.config.targetRTP - this.stats.currentRTP;
        if (rtpDiff > 2) {
            probability *= 1.5; // RTP偏低时增加概率
        } else if (rtpDiff < -2) {
            probability *= 0.7; // RTP偏高时减少概率
        }
        
        // 根据免费旋转触发频率调整
        const freeSpinRate = this.stats.freeSpinsTriggered / Math.max(1, this.stats.totalSpins);
        if (freeSpinRate < 0.005) { // 低于0.5%触发率
            probability *= 1.3;
        } else if (freeSpinRate > 0.015) { // 高于1.5%触发率
            probability *= 0.7;
        }
        
        return Math.min(0.1, probability); // 最大10%概率
    }

    // 计算Jackpot概率
    calculateJackpotProbability() {
        let probability = GAME_CONFIG.jackpotProbability || 0.02;
        
        // 根据RTP调整
        const rtpDiff = this.config.targetRTP - this.stats.currentRTP;
        if (rtpDiff > 3) {
            probability *= 1.5;
        } else if (rtpDiff < -3) {
            probability *= 0.5;
        }
        
        // 根据总下注金额调整（鼓励持续游戏）
        const wageredPerJackpot = this.stats.totalWagered / Math.max(1, this.stats.jackpotsWon);
        if (wageredPerJackpot > 50000) { // 如果平均5万才中一次Jackpot
            probability *= 1.5;
        }
        
        return Math.min(0.05, probability); // 最大5%概率
    }

    // 获取当前统计信息
    getCurrentStats() {
        return {
            ...this.stats,
            volatility: this.config.volatility,
            targetRTP: this.config.targetRTP,
            sessionDuration: Date.now() - this.sessionStats.startTime
        };
    }

    // 获取会话统计
    getSessionStats() {
        const spins = this.sessionStats.spins;
        if (spins.length === 0) return null;
        
        const sessionWagered = spins.reduce((sum, spin) => sum + spin.bet, 0);
        const sessionWon = spins.reduce((sum, spin) => sum + spin.win, 0);
        const sessionRTP = sessionWagered > 0 ? (sessionWon / sessionWagered) * 100 : 0;
        
        return {
            sessionSpins: spins.length,
            sessionWagered,
            sessionWon,
            sessionRTP,
            sessionDuration: Date.now() - this.sessionStats.startTime,
            featuresTriggered: this.sessionStats.features.length,
            averageBet: sessionWagered / spins.length
        };
    }

    // 获取详细报告
    getDetailedReport() {
        const currentStats = this.getCurrentStats();
        const sessionStats = this.getSessionStats();
        const symbolDistribution = this.getSymbolDistribution();
        
        return {
            rtp: {
                current: currentStats.currentRTP,
                target: currentStats.targetRTP,
                difference: (currentStats.currentRTP - currentStats.targetRTP).toFixed(2)
            },
            performance: {
                hitRate: currentStats.hitRate,
                bigWinRate: (currentStats.bigWins / currentStats.totalSpins * 100).toFixed(2),
                freeSpinRate: (currentStats.freeSpinsTriggered / currentStats.totalSpins * 100).toFixed(2)
            },
            financial: {
                totalWagered: currentStats.totalWagered,
                totalPaid: currentStats.totalPaid,
                profit: (currentStats.totalWagered - currentStats.totalPaid).toFixed(2)
            },
            session: sessionStats,
            symbols: symbolDistribution
        };
    }

    // 重置统计（保留配置）
    resetStats() {
        this.stats = {
            totalSpins: 0,
            totalWagered: 0,
            totalPaid: 0,
            currentRTP: 100,
            hitRate: 0,
            wins: 0,
            bigWins: 0,
            freeSpinsTriggered: 0,
            jackpotsWon: 0,
            lastAdjustment: 0
        };
        
        this.sessionStats = {
            startTime: Date.now(),
            spins: [],
            features: []
        };
        
        console.log('RTP统计已重置');
    }

    // 更新配置
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.volatilityProfile = this.config.volatilityProfiles[this.config.volatility] || this.config.volatilityProfiles.medium;
        this.initializeSymbolWeights();
        
        console.log('RTP配置已更新:', this.config);
    }

    // 导出数据（用于保存）
    exportData() {
        return {
            config: this.config,
            stats: this.stats,
            sessionStats: this.sessionStats,
            timestamp: Date.now()
        };
    }

    // 导入数据
    importData(data) {
        if (data.config) this.config = { ...this.config, ...data.config };
        if (data.stats) this.stats = { ...this.stats, ...data.stats };
        if (data.sessionStats) this.sessionStats = { ...this.sessionStats, ...data.sessionStats };
        
        this.volatilityProfile = this.config.volatilityProfiles[this.config.volatility] || this.config.volatilityProfiles.medium;
        this.initializeSymbolWeights();
        
        console.log('RTP数据已导入');
    }

    // 验证RTP配置
    validateRTP() {
        const totalFrequency = Object.values(this.config.symbolFrequencies).reduce((sum, freq) => sum + freq, 0);
        
        if (Math.abs(totalFrequency - 100) > 1) {
            console.warn(`符号频率总和为 ${totalFrequency}%，应该接近100%`);
            return false;
        }
        
        if (this.config.targetRTP < this.config.adjustment.minRTP || this.config.targetRTP > this.config.adjustment.maxRTP) {
            console.warn(`目标RTP ${this.config.targetRTP}% 超出允许范围`);
            return false;
        }
        
        return true;
    }
}

// 导出RTP管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RTPManager;
}