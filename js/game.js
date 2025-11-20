// ==================== 游戏主引擎 ====================
class GameEngine {
    constructor() {
        // 初始化游戏组件 - 修改顺序，先初始化音频管理器
        this.state = new GameState();
        this.ui = new UIManager();
        this.audioManager = new AudioManager();
        this.reelManager = new ReelManager(document.querySelectorAll('.reel'), this.audioManager);
        this.rtpManager = new RTPManager(RTP_CONFIG);
        
        // 初始化游戏
        this.initializeGame();
        this.initializeEventListeners();
        this.startJackpotGrowth();
        
        console.log('老虎机游戏已启动！');
        console.log('💡 提示：点击任意位置启用背景音乐');
    }

    // 初始化游戏
    initializeGame() {
        // 更新初始显示
        this.ui.updateDisplay(this.state);
        this.ui.updatePaytable(this.state.lines);
        this.ui.updateWinHistory(this.state.winHistory);
        
        // 初始化统计显示
        this.updateStatsDisplay();
    }

    // 初始化事件监听器
    initializeEventListeners() {
        // 背景音乐已在 AudioManager 中自动处理

        // 押注控制
        this.ui.elements.btnBetUp.addEventListener('click', () => {
            if (!this.state.isSpinning) {
                this.state.increaseBet();
                this.ui.updateDisplay(this.state);
            }
        });

        this.ui.elements.btnBetDown.addEventListener('click', () => {
            if (!this.state.isSpinning) {
                this.state.decreaseBet();
                this.ui.updateDisplay(this.state);
            }
        });

        this.ui.elements.btnMaxBet.addEventListener('click', () => {
            if (!this.state.isSpinning) {
                this.state.setMaxBet();
                this.ui.updateDisplay(this.state);
            }
        });

        // 线数切换
        this.ui.elements.btnSwitchLines.addEventListener('click', () => {
            if (!this.state.isSpinning) {
                this.state.toggleLines();
                this.ui.updateDisplay(this.state);
                this.ui.updatePaytable(this.state.lines);
                this.ui.addAnnouncement(`切换到 ${this.state.lines} 线模式`);
            }
        });

        // 旋转按钮
        this.ui.elements.btnSpin.addEventListener('click', () => {
            this.spin();
        });

        // 自动旋转
        this.ui.elements.btnAutoplay.addEventListener('click', () => {
            this.ui.showModal('autoplay-overlay');
        });

        this.ui.elements.btnStopAutoplay.addEventListener('click', () => {
            this.stopAutoplay();
        });

        // 赔付表
        this.ui.elements.btnPaytable.addEventListener('click', () => {
            this.ui.showModal('paytable-overlay');
        });

        // 弹窗按钮
        document.getElementById('btn-start-free-spins').addEventListener('click', () => {
            this.ui.hideModal('free-spins-overlay');
            this.audioManager.playFreeSpinsSound();
            this.startFreeSpins();
        });

        document.getElementById('btn-cancel-autoplay').addEventListener('click', () => {
            this.ui.hideModal('autoplay-overlay');
        });

        document.getElementById('btn-close-paytable').addEventListener('click', () => {
            this.ui.hideModal('paytable-overlay');
        });

        document.getElementById('btn-close-jackpot').addEventListener('click', () => {
            this.ui.hideModal('jackpot-overlay');
        });

        document.getElementById('btn-close-stats').addEventListener('click', () => {
            this.ui.hideModal('stats-overlay');
        });

        // 自动旋转选项
        document.querySelectorAll('.autoplay-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const count = parseInt(e.target.dataset.count);
                this.startAutoplay(count);
                this.ui.hideModal('autoplay-overlay');
            });
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.state.isSpinning) {
                e.preventDefault();
                this.spin();
            }
            
            // 调试快捷键
            if (e.code === 'KeyD' && e.ctrlKey) {
                e.preventDefault();
                this.showDebugInfo();
            }
            
            // 统计信息快捷键
            if (e.code === 'KeyS' && e.ctrlKey) {
                e.preventDefault();
                this.showStats();
            }
            
            // 静音快捷键
            if (e.code === 'KeyM' && e.ctrlKey) {
                e.preventDefault();
                const isMuted = this.audioManager.toggleMute();
                this.ui.addAnnouncement(isMuted ? '已静音' : '已取消静音', 'info');
            }
        });

        // 自定义事件监听
        this.ui.on('autoplaySelected', (e) => {
            this.startAutoplay(e.detail);
            this.ui.hideModal('autoplay-overlay');
        });

        // 防止触摸滚动
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('#paytable-content, .scrollable-content')) {
                return;
            }
            e.preventDefault();
        }, { passive: false });
    }

    // 开始旋转
    async spin() {
        if (this.state.isSpinning) return;
        
        // 检查是否可以旋转
        if (!this.state.canSpin()) {
            if (!this.state.isFreeSpinsActive) {
                this.ui.addAnnouncement('余额不足！', 'error');
            }
            return;
        }

        try {
            this.state.isSpinning = true;
            this.state.win = 0;
            this.ui.clearWinLines();
            this.ui.updateDisplay(this.state);

            // 播放旋转音效
            this.audioManager.playSpinSound();

            // 免费旋转不需要下注
            if (!this.state.isFreeSpinsActive) {
                this.state.placeBet();
            }

            // 生成最终结果
            const finalReels = this.generateRandomReels();

            // 开始旋转动画
            await this.reelManager.spinAllReels(finalReels);

            // 获取最终可见符号
            this.state.reels = this.reelManager.getVisibleSymbols();

            // 计算结果
            await this.calculateWin(this.state.reels);

        } catch (error) {
            console.error('旋转过程中出错:', error);
            this.ui.addAnnouncement('游戏出错，请刷新页面', 'error');
        } finally {
            this.state.isSpinning = false;
            this.ui.updateDisplay(this.state);

            // 继续自动旋转
            if (this.state.isAutoplay && this.state.autoplayCount > 0) {
                this.continueAutoplay();
            }
        }
    }

    // 生成随机卷轴结果
    generateRandomReels() {
        return Array(GAME_CONFIG.reelCount).fill(null).map(() =>
            Array(GAME_CONFIG.visibleSymbols).fill(null).map(() => {
                // 使用RTP管理器的加权随机
                return this.rtpManager.getWeightedSymbol();
            })
        );
    }

    // 计算赢取金额
    async calculateWin(reels) {
        let totalWin = 0;
        const winningLines = [];
        const highlightPositions = [];

        // 获取当前赔率表
        const currentPaytable = PAYTABLES[this.state.lines];

        // 只检查已启用的中奖线
        const activeLines = WIN_LINES.slice(0, this.state.lines);

        // 检查每条中奖线
        activeLines.forEach(line => {
            const symbols = line.positions.map((pos, reelIndex) => reels[reelIndex][pos]);
            const result = this.calculateLineWin(symbols, line, currentPaytable);
            
            if (result.win > 0) {
                totalWin += result.win * this.state.bet;
                winningLines.push(line);
                
                // 记录高亮位置
                for (let i = 0; i < result.matchCount; i++) {
                    highlightPositions.push([i, line.positions[i]]);
                }
            }
        });

        // 检查Scatter符号
        const scatterCount = reels.flat().filter(s => s === GAME_CONFIG.scatterSymbol).length;
        if (scatterCount >= 3) {
            await this.handleScatterWin(scatterCount);
        }

        // 免费旋转倍数
        if (this.state.isFreeSpinsActive) {
            totalWin *= GAME_CONFIG.freeSpinsMultiplier;
            this.state.useFreeSpin();
            
            if (this.state.freeSpins <= 0) {
                this.ui.addAnnouncement('免费旋转结束！', 'info');
            }
        }

        // 记录到RTP管理器
        const totalBet = this.state.getTotalBet();
        this.rtpManager.recordSpin(totalBet, totalWin, 
            scatterCount >= 3 ? 'freeSpins' : null
        );

        // 添加赢取金额
        this.state.addWin(totalWin);

        // Jackpot检测
        if (Math.random() < this.rtpManager.calculateJackpotProbability()) {
            await this.awardJackpot();
        }

        // 显示结果
        if (totalWin > 0) {
            // 播放中奖音效
            this.audioManager.playWinSound(totalWin);
            
            await this.showWinResults(totalWin, winningLines, highlightPositions);
            this.state.addToHistory('中奖', totalWin);
        } else {
            this.state.addToHistory('未中奖', 0);
            this.ui.addAnnouncement('未中奖', 'info');
        }

        // 更新UI
        this.ui.updateDisplay(this.state);
        this.ui.updateWinHistory(this.state.winHistory);
        this.updateStatsDisplay();
    }

    // 计算单线赢取
    calculateLineWin(symbols, line, paytable) {
        const firstSymbol = symbols[0];
        if (SPECIAL_SYMBOLS.has(firstSymbol)) return { win: 0, matchCount: 0 };
        
        let matchCount = 1;
        for (let i = 1; i < symbols.length; i++) {
            const currentSymbol = symbols[i];
            // Wild符号可以替代任何普通符号
            if (currentSymbol === firstSymbol || currentSymbol === GAME_CONFIG.wildSymbol) {
                matchCount++;
            } else {
                break;
            }
        }
        
        if (matchCount >= 3 && paytable[firstSymbol] && !paytable[firstSymbol].special) {
            const payout = paytable[firstSymbol][matchCount] || 0;
            return { win: payout, matchCount };
        }
        
        return { win: 0, matchCount: 0 };
    }

    // 处理Scatter中奖
    async handleScatterWin(scatterCount) {
        if (this.state.freeSpins === 0 && !this.state.isFreeSpinsActive) {
            // 新的免费旋转
            const freeSpinsCount = this.getFreeSpinsCount(scatterCount);
            this.state.freeSpins = freeSpinsCount;
            this.ui.setFreeSpinsCount(freeSpinsCount);
            this.ui.showModal('free-spins-overlay');
            this.ui.addAnnouncement(`触发 ${freeSpinsCount} 次免费旋转！`, 'success');
        } else {
            // 在免费旋转中再次触发，增加次数
            const additionalSpins = this.getFreeSpinsCount(scatterCount);
            this.state.freeSpins += additionalSpins;
            this.ui.addAnnouncement(`额外获得 ${additionalSpins} 次免费旋转！`, 'success');
        }
    }

    // 获取免费旋转次数
    getFreeSpinsCount(scatterCount) {
        const baseCounts = { 3: 10, 4: 15, 5: 20 };
        return baseCounts[scatterCount] || 10;
    }

    // 显示赢取结果
    async showWinResults(totalWin, winningLines, highlightPositions) {
        this.ui.drawWinLines(winningLines);
        this.ui.highlightSymbols(highlightPositions);
        this.ui.addAnnouncement(`中奖 ${totalWin.toFixed(2)}！`, 'success');

        // 显示Big Win动画
        if (totalWin >= GAME_CONFIG.bigWinThreshold * this.state.bet) {
            await this.ui.showBigWin(totalWin);
        }

        // 清除高亮和中奖线
        setTimeout(() => {
            this.ui.clearWinLines();
            this.ui.highlightSymbols([]);
        }, 3000);
    }

    // 奖励Jackpot
    async awardJackpot() {
        const jackpotWin = this.state.jackpot;
        this.state.winJackpot(jackpotWin);
        this.ui.setJackpotWinAmount(jackpotWin);
        this.ui.showModal('jackpot-overlay');
        this.ui.addAnnouncement(`Jackpot: ${jackpotWin.toFixed(2)}！`, 'success');
        
        // 更新RTP统计
        this.rtpManager.recordSpin(0, jackpotWin, 'jackpot');
    }

    // 开始免费旋转
    async startFreeSpins() {
        this.state.isFreeSpinsActive = true;
        this.ui.updateDisplay(this.state);
        this.ui.addAnnouncement('免费旋转开始！', 'success');
        
        // 自动开始免费旋转
        while (this.state.freeSpins > 0 && !this.state.isSpinning) {
            await this.spin();
            // 添加延迟，让玩家看到结果
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        this.state.isFreeSpinsActive = false;
        this.ui.updateDisplay(this.state);
    }

    // 开始自动旋转
    startAutoplay(count) {
        this.state.startAutoplay(count);
        this.ui.updateDisplay(this.state);
        this.ui.addAnnouncement(`自动旋转 ${count} 次`, 'info');
        this.spin();
    }

    // 继续自动旋转
    continueAutoplay() {
        if (this.state.autoplayCount > 0 && this.state.balance >= this.state.getTotalBet()) {
            this.state.useAutoplay();
            this.ui.updateDisplay(this.state);
            
            // 添加延迟，让玩家看到结果
            setTimeout(() => {
                if (!this.state.isSpinning) {
                    this.spin();
                }
            }, 1000);
        } else {
            this.stopAutoplay();
        }
    }

    // 停止自动旋转
    stopAutoplay() {
        this.state.stopAutoplay();
        this.ui.updateDisplay(this.state);
        this.ui.addAnnouncement('自动旋转已停止', 'info');
    }

    // 开始Jackpot增长
    startJackpotGrowth() {
        setInterval(() => {
            this.state.jackpot += Math.random() * 0.5;
            this.ui.updateDisplay(this.state);
        }, 1000);
    }

    // 更新统计显示
    updateStatsDisplay() {
        const stats = this.rtpManager.getCurrentStats();
        const gameStats = this.state.getStats();
        
        // 更新统计弹窗内容
        document.getElementById('stat-total-spins').textContent = stats.totalSpins;
        document.getElementById('stat-total-wagered').textContent = stats.totalWagered.toFixed(2);
        document.getElementById('stat-total-won').textContent = stats.totalPaid.toFixed(2);
        document.getElementById('stat-current-rtp').textContent = stats.currentRTP.toFixed(2) + '%';
        document.getElementById('stat-free-spins-triggered').textContent = this.state.stats.freeSpinsTriggered;
        document.getElementById('stat-jackpots-won').textContent = this.state.stats.jackpotsWon;
        document.getElementById('stat-biggest-win').textContent = this.state.stats.biggestWin.toFixed(2);
        document.getElementById('stat-hit-rate').textContent = stats.hitRate.toFixed(2) + '%';
    }

    // 显示统计信息
    showStats() {
        this.updateStatsDisplay();
        this.ui.showModal('stats-overlay');
    }

    // 显示调试信息
    showDebugInfo() {
        const debugInfo = {
            gameState: {
                balance: this.state.balance,
                bet: this.state.bet,
                lines: this.state.lines,
                freeSpins: this.state.freeSpins,
                isSpinning: this.state.isSpinning,
                isAutoplay: this.state.isAutoplay
            },
            rtpStats: this.rtpManager.getDetailedReport(),
            reelStatus: this.reelManager.getReelStatus(),
            audioStatus: this.audioManager.getAudioStatus()
        };
        
        console.log('调试信息:', debugInfo);
        this.ui.addAnnouncement('调试信息已输出到控制台', 'info');
    }

    // 重置游戏
    resetGame() {
        if (this.state.isSpinning) {
            this.ui.addAnnouncement('请等待旋转结束', 'warning');
            return;
        }
        
        this.state.reset();
        this.rtpManager.resetStats();
        this.reelManager.resetAllReels();
        this.ui.updateDisplay(this.state);
        this.ui.updateWinHistory(this.state.winHistory);
        this.updateStatsDisplay();
        
        this.ui.addAnnouncement('游戏已重置', 'info');
    }

    // 保存游戏数据
    saveGame() {
        const gameData = {
            state: this.state.exportData(),
            rtp: this.rtpManager.exportData(),
            timestamp: Date.now()
        };
        
        localStorage.setItem('slotGameSave', JSON.stringify(gameData));
        this.ui.addAnnouncement('游戏已保存', 'success');
    }

    // 加载游戏数据
    loadGame() {
        const savedData = localStorage.getItem('slotGameSave');
        if (savedData) {
            try {
                const gameData = JSON.parse(savedData);
                this.state.importData(gameData.state);
                this.rtpManager.importData(gameData.rtp);
                this.ui.updateDisplay(this.state);
                this.ui.updateWinHistory(this.state.winHistory);
                this.updateStatsDisplay();
                
                this.ui.addAnnouncement('游戏已加载', 'success');
            } catch (error) {
                this.ui.addAnnouncement('加载游戏数据失败', 'error');
            }
        } else {
            this.ui.addAnnouncement('没有找到保存的游戏数据', 'warning');
        }
    }

    // 导出游戏数据
    exportGameData() {
        const gameData = {
            state: this.state.exportData(),
            rtp: this.rtpManager.exportData(),
            config: {
                game: GAME_CONFIG,
                rtp: RTP_CONFIG
            },
            timestamp: Date.now(),
            version: '1.0.0'
        };
        
        const dataStr = JSON.stringify(gameData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // 创建下载链接
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `slot-game-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.ui.addAnnouncement('游戏数据已导出', 'success');
    }

    // 销毁游戏（清理资源）
    destroy() {
        this.reelManager.destroy();
        this.audioManager.destroy();
        this.stopAutoplay();
        
        console.log('游戏已销毁');
    }
}

// ==================== 游戏初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    // 防止页面滚动
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    let game;
    
    try {
        // 初始化游戏
        game = new GameEngine();
        
        // 窗口关闭前保存游戏
        window.addEventListener('beforeunload', () => {
            game.saveGame();
        });
        
        // 将游戏实例暴露给全局，便于调试
        window.slotGame = game;
        
    } catch (error) {
        console.error('游戏初始化失败:', error);
        alert('游戏初始化失败，请刷新页面重试。错误信息: ' + error.message);
    }
    
    // 开发工具：在控制台输入 slotGame 来访问游戏实例
    if (typeof console !== 'undefined') {
        console.log('输入 slotGame 来访问游戏实例进行调试');
        console.log('快捷键: Ctrl+M(静音) Ctrl+D(调试) Ctrl+S(统计) Space(旋转)');
    }
});

// 错误处理
window.addEventListener('error', (event) => {
    console.error('游戏运行时错误:', event.error);
    
    // 显示友好的错误信息
    const errorMessage = document.createElement('div');
    errorMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 10000;
        text-align: center;
        max-width: 80%;
    `;
    errorMessage.innerHTML = `
        <h3>游戏出现错误</h3>
        <p>请刷新页面重试</p>
        <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 5px 10px;">关闭</button>
    `;
    
    document.body.appendChild(errorMessage);
});

// 导出游戏引擎（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}