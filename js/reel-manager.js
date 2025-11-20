// ==================== 卷轴管理器 ====================
class ReelManager {
    constructor(reelElements, audioManager = null) {
        this.reels = Array.from(reelElements).map((reelEl, index) => ({
            element: reelEl,
            strip: reelEl.querySelector('.reel-strip'),
            index: index,
            symbols: [],
            currentPosition: 0,
            isSpinning: false,
            isStopping: false
        }));
        
        // 音频管理器引用
        this.audioManager = audioManager;
        
        // 从 CSS 动态读取符号高度，确保 JS 与 CSS 完全同步
        const rootStyle = getComputedStyle(document.documentElement);
        this.symbolHeight = parseFloat(rootStyle.getPropertyValue('--symbol-height')) || 100;
        
        this.visibleCount = GAME_CONFIG.visibleSymbols; // 一般 = 3
        this.bufferTop = 3; // 顶部缓冲行数
        this.bufferBottom = 3; // 底部缓冲行数
        
        this.initializeReels();
    }
    
    // 设置音频管理器
    setAudioManager(audioManager) {
        this.audioManager = audioManager;
    }
    
    // 初始化卷轴
    initializeReels() {
        this.reels.forEach(reel => {
            this.generateReelStrip(reel);
        });
    }
    
    // 生成卷轴条
    generateReelStrip(reel) {
        reel.symbols = [];
        reel.strip.innerHTML = '';
        
        // 生成长卷轴
        for (let i = 0; i < GAME_CONFIG.symbolsPerReel; i++) {
            const symbol = this.getWeightedSymbol();
            reel.symbols.push(symbol);
            this.appendSymbol(reel, symbol);
        }
        
        // 设置初始位置
        this.setReelPosition(reel, 0);
    }
    
    // DOM: 添加一个符号元素
    appendSymbol(reel, symbol) {
        const symbolEl = document.createElement('div');
        symbolEl.className = 'symbol';
        
        const img = document.createElement('img');
        img.src = symbol;
        img.alt = '符号';
        img.className = 'symbol-img';
        
        symbolEl.appendChild(img);
        symbolEl.setAttribute('data-symbol', symbol);
        reel.strip.appendChild(symbolEl);
    }
    
    // 获取加权随机符号（结合 RTP 配置）
    getWeightedSymbol() {
        const frequencies = RTP_CONFIG?.symbolFrequencies || {
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
        
        const weightedSymbols = [];
        Object.entries(frequencies).forEach(([symbol, freq]) => {
            weightedSymbols.push(...Array(Math.round(freq * 10)).fill(symbol));
        });
        
        return weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
    }
    
    // 设置卷轴位置（核心：严格按整格高度移动）
    setReelPosition(reel, position) {
        const total = GAME_CONFIG.symbolsPerReel;
        let pos = position % total;
        if (pos < 0) pos += total;
        
        reel.currentPosition = pos;
        reel.strip.style.transform = `translateY(${-pos * this.symbolHeight}px)`;
    }
    
    // 旋转单个卷轴
    async spinReel(reel, finalSymbols, delay = 0) {
        return new Promise(resolve => {
            setTimeout(async () => {
                // 开始旋转
                reel.isSpinning = true;
                reel.element.classList.add('spinning');
                
                // 每个卷轴按索引叠加停轮时间
                const spinTime = GAME_CONFIG.spinDuration - (reel.index * GAME_CONFIG.reelStopDelay);
                
                // 旋转动画
                await this.animateSpin(reel, spinTime);
                
                // 停止卷轴（平滑贴到最终符号）
                await this.stopReel(reel, finalSymbols);
                
                // ========== 新增：播放停止音效 ==========
                if (this.audioManager) {
                    this.audioManager.playStopSound();
                }
                // ======================================
                
                resolve();
            }, delay);
        });
    }
    
    // 旋转动画：控制位置，不再用 CSS keyframes 控制 Y 轴
    async animateSpin(reel, duration) {
        const startTime = Date.now();
        const startPosition = reel.currentPosition;
        const steps = 20; // 旋转的大致格数（可调）
        
        return new Promise(resolve => {
            const animate = () => {
                if (!reel.isSpinning) {
                    resolve();
                    return;
                }
                
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = this.easeInOutCubic(progress);
                
                const newPosition = startPosition + (easeProgress * steps);
                const total = GAME_CONFIG.symbolsPerReel;
                let pos = Math.floor(newPosition) % total;
                if (pos < 0) pos += total;
                
                this.setReelPosition(reel, pos);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    // 停止卷轴：生成最终 strip + 平滑移动到最终格
    async stopReel(reel, finalSymbols) {
        reel.isSpinning = false;
        reel.isStopping = true;
        reel.element.classList.remove('spinning');
        reel.element.classList.add('stopping');
        
        // 重新生成卷轴并让 finalSymbols 出现在可视顶部 buffer 后
        const finalIndex = this.setFinalSymbols(reel, finalSymbols);
        
        // 按整格高度平滑移动
        const targetY = -finalIndex * this.symbolHeight;
        reel.strip.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.25, 1.25)';
        reel.strip.style.transform = `translateY(${targetY}px)`;
        
        await new Promise(resolve => setTimeout(resolve, 450));
        
        reel.element.classList.remove('stopping');
        reel.isStopping = false;
    }
    
    // 设置最终符号结构：bufferTop + finalSymbols + bufferBottom
    setFinalSymbols(reel, finalSymbols) {
        reel.symbols = [];
        reel.strip.innerHTML = '';
        
        // 顶部缓冲
        for (let i = 0; i < this.bufferTop; i++) {
            const symbol = this.getWeightedSymbol();
            reel.symbols.push(symbol);
            this.appendSymbol(reel, symbol);
        }
        
        // 中间真实结果（最终要显示的行）
        finalSymbols.forEach(s => {
            reel.symbols.push(s);
            this.appendSymbol(reel, s);
        });
        
        // 底部缓冲
        for (let i = 0; i < this.bufferBottom; i++) {
            const symbol = this.getWeightedSymbol();
            reel.symbols.push(symbol);
            this.appendSymbol(reel, symbol);
        }
        
        const targetIndex = this.bufferTop;
        reel.currentPosition = targetIndex;
        
        return targetIndex;
    }
    
    // 缓动函数
    easeInOutCubic(t) {
        return t < 0.5 ?
            4 * t * t * t :
            1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    // 获取当前可见符号（与画面严格对齐）
    getVisibleSymbols() {
        return this.reels.map(reel => {
            const startIndex = reel.currentPosition;
            return reel.symbols.slice(startIndex, startIndex + this.visibleCount);
        });
    }
    
    // 批量旋转所有卷轴
    async spinAllReels(finalReels) {
        const spinPromises = this.reels.map((reel, index) =>
            this.spinReel(reel, finalReels[index], 0)
        );
        
        await Promise.all(spinPromises);
        return this.getVisibleSymbols();
    }
    
    // 重置所有卷轴
    resetAllReels() {
        this.reels.forEach(reel => {
            this.generateReelStrip(reel);
        });
    }
    
    // 检查是否所有卷轴都停止
    allReelsStopped() {
        return this.reels.every(reel => !reel.isSpinning && !reel.isStopping);
    }
    
    // 获取卷轴状态（用于调试）
    getReelStatus() {
        return this.reels.map(reel => ({
            index: reel.index,
            isSpinning: reel.isSpinning,
            isStopping: reel.isStopping,
            symbolCount: reel.symbols.length
        }));
    }
    
    // 强制停止所有卷轴
    forceStopAllReels() {
        this.reels.forEach(reel => {
            reel.isSpinning = false;
            reel.isStopping = false;
            reel.element.classList.remove('spinning', 'stopping');
        });
    }
    
    // 预加载符号（预留，暂不实现）
    preloadSymbols() {
        // 可在此预创建符号 DOM 用于复用
    }
    
    // 更新符号样式
    updateSymbolStyles(styles) {
        this.reels.forEach(reel => {
            const symbols = reel.strip.querySelectorAll('.symbol');
            symbols.forEach(symbol => {
                Object.assign(symbol.style, styles);
            });
        });
    }
    
    // 销毁清理
    destroy() {
        this.forceStopAllReels();
        this.reels.forEach(reel => {
            reel.strip.innerHTML = '';
        });
        this.reels = [];
        this.audioManager = null;
    }
}