// ==================== 游戏状态管理 ====================
class GameState {
    constructor() {
        // 基础游戏状态
        this.balance = GAME_CONFIG.initialBalance;
        this.bet = GAME_CONFIG.minBet;
        this.lines = 25; // 默认25条线
        this.win = 0;
        this.modified = 0;
        this.jackpot = GAME_CONFIG.initialJackpot || 5000;
        this.freeSpins = 0;
        this.isSpinning = false;
        this.autoplayCount = 0;
        this.isAutoplay = false;
        this.isFreeSpinsActive = false;
        
        // 游戏数据
        this.reels = this.initializeReels();
        this.winHistory = [];
        this.roundNumber = 0;
        
        // 统计信息
        this.stats = {
            totalSpins: 0,
            totalWagered: 0,
            totalWon: 0,
            biggestWin: 0,
            freeSpinsTriggered: 0,
            jackpotsWon: 0
        };
    }

    // 初始化卷轴
    initializeReels() {
        return Array(GAME_CONFIG.reelCount).fill(null).map(() =>
            Array(GAME_CONFIG.visibleSymbols).fill(null).map(() =>
                GAME_CONFIG.symbols[Math.floor(Math.random() * GAME_CONFIG.symbols.length)]
            )
        );
    }

    // 下注
    placeBet() {
        const totalBet = this.getTotalBet();
        if (this.balance >= totalBet) {
            this.balance -= totalBet;
            this.stats.totalWagered += totalBet;
            this.stats.totalSpins++;
            return true;
        }
        return false;
    }

    // 添加赢取金额
    addWin(amount) {
        this.win = amount;
        this.balance += amount;
        const totalBet = this.getTotalBet();
        this.modified += amount - totalBet;
        this.stats.totalWon += amount;
        
        // 更新最大赢取金额
        if (amount > this.stats.biggestWin) {
            this.stats.biggestWin = amount;
        }
    }

    // 增加押注
    increaseBet() {
        const newBet = this.bet + GAME_CONFIG.betStep;
        if (newBet <= Math.min(GAME_CONFIG.maxBet, this.balance / this.lines)) {
            this.bet = newBet;
        }
    }

    // 减少押注
    decreaseBet() {
        if (this.bet > GAME_CONFIG.minBet) {
            this.bet -= GAME_CONFIG.betStep;
        }
    }

    // 设置最大押注
    setMaxBet() {
        this.bet = Math.min(GAME_CONFIG.maxBet, Math.floor(this.balance / this.lines));
    }

    // 切换线数 (25 <-> 40)
    toggleLines() {
        if (this.lines === 25) {
            this.lines = 40;
        } else {
            this.lines = 25;
        }
        // 确保切换后总赌注不超过余额
        if (this.getTotalBet() > this.balance) {
            this.bet = Math.max(GAME_CONFIG.minBet, Math.floor(this.balance / this.lines));
        }
    }

    // 获取总押注
    getTotalBet() {
        return this.bet * this.lines;
    }

    // 添加历史记录
    addToHistory(result, amount) {
        this.roundNumber++;
        this.winHistory.unshift({
            round: this.roundNumber,
            result: result,
            amount: amount,
            timestamp: new Date().toLocaleTimeString()
        });
        
        // 只保留最近10条记录
        if (this.winHistory.length > 10) {
            this.winHistory.pop();
        }
    }

    // 开始免费旋转
    startFreeSpins(count) {
        this.freeSpins = count;
        this.isFreeSpinsActive = true;
        this.stats.freeSpinsTriggered++;
    }

    // 使用一次免费旋转
    useFreeSpin() {
        if (this.freeSpins > 0) {
            this.freeSpins--;
        }
        if (this.freeSpins <= 0) {
            this.isFreeSpinsActive = false;
        }
    }

    // 开始自动旋转
    startAutoplay(count) {
        this.autoplayCount = count;
        this.isAutoplay = true;
    }

    // 使用一次自动旋转
    useAutoplay() {
        if (this.autoplayCount > 0) {
            this.autoplayCount--;
        }
        if (this.autoplayCount <= 0) {
            this.stopAutoplay();
        }
    }

    // 停止自动旋转
    stopAutoplay() {
        this.isAutoplay = false;
        this.autoplayCount = 0;
    }

    // 赢得Jackpot
    winJackpot(amount) {
        this.jackpot = GAME_CONFIG.initialJackpot || 5000; // 重置Jackpot
        this.stats.jackpotsWon++;
        this.addWin(amount);
    }

    // 获取游戏统计
    getStats() {
        return {
            ...this.stats,
            currentRTP: this.stats.totalWagered > 0 ? 
                (this.stats.totalWon / this.stats.totalWagered) * 100 : 0,
            averageBet: this.stats.totalSpins > 0 ? 
                this.stats.totalWagered / this.stats.totalSpins : 0
        };
    }

    // 重置游戏
    reset() {
        this.balance = GAME_CONFIG.initialBalance;
        this.bet = GAME_CONFIG.minBet;
        this.lines = 25;
        this.win = 0;
        this.modified = 0;
        this.jackpot = GAME_CONFIG.initialJackpot || 5000;
        this.freeSpins = 0;
        this.isSpinning = false;
        this.autoplayCount = 0;
        this.isAutoplay = false;
        this.isFreeSpinsActive = false;
        this.reels = this.initializeReels();
        this.winHistory = [];
        this.roundNumber = 0;
        
        // 重置统计
        this.stats = {
            totalSpins: 0,
            totalWagered: 0,
            totalWon: 0,
            biggestWin: 0,
            freeSpinsTriggered: 0,
            jackpotsWon: 0
        };
    }

    // 检查是否可以旋转
    canSpin() {
        if (this.isSpinning) return false;
        if (this.isFreeSpinsActive) return true;
        return this.balance >= this.getTotalBet();
    }

    // 导出游戏数据（用于保存）
    exportData() {
        return {
            balance: this.balance,
            bet: this.bet,
            lines: this.lines,
            stats: this.stats,
            winHistory: this.winHistory,
            timestamp: Date.now()
        };
    }

    // 导入游戏数据
    importData(data) {
        if (data.balance) this.balance = data.balance;
        if (data.bet) this.bet = data.bet;
        if (data.lines) this.lines = data.lines;
        if (data.stats) this.stats = { ...this.stats, ...data.stats };
        if (data.winHistory) this.winHistory = data.winHistory;
    }
}
